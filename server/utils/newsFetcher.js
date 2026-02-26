const axios = require("axios");
const Incidents = require("../models/Incidents");
const nlp = require('compromise');



const DISASTER_KEYWORDS = [
  "flood",
  "earthquake",
  "fire",
  "cyclone",
  "storm",
  "landslide",
  "tsunami",
  "wildfire",
  "hurricane",
];

const IGNORE_WORDS = [
  "Man",
  "Report",
  "Fire",
  "Storm",
  "League",
  "UFC",
  "Tonight",
  "Massive",
  "Another",
  "Three",
];

const extractCandidates = (text) => {
  if (!text) return [];

  const candidates = new Set();

  // Regex for capitalized multi-word places
  const regexMatches = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || [];
  for (let m of regexMatches) {
    if (IGNORE_WORDS.includes(m)) continue;
    candidates.add(m.trim());
  }

  // Use compromise to extract proper nouns as additional candidates
  try {
    const doc = nlp(text || "");
    const properNouns = doc.match('#ProperNoun+').out('array') || [];
    for (let p of properNouns) {
      if (IGNORE_WORDS.includes(p)) continue;
      candidates.add(p.trim());
    }
  } catch (e) {
    // non-fatal: continue with regex-only candidates
  }

  return Array.from(candidates);
};

const extractLocationFromTitle = async (text) => {
  const candidates = extractCandidates(text);
  if (!candidates || candidates.length === 0) return null;

  // broaden acceptable Nominatim types for better recall
  const ACCEPTED_TYPES = new Set([
    'city','town','village','state','county','region','administrative','suburb','hamlet','locality'
  ]);

  for (let place of candidates) {
    try {
      const geoResponse = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: place,
            format: "json",
            addressdetails: 1,
            limit: 1,
          },
          headers: {
            "User-Agent": "DisasterResponseSystem/1.0",
          },
        }
      );

      if (geoResponse.data && geoResponse.data.length > 0) {
        const result = geoResponse.data[0];

        // Accept a wider range of place types (city/town/state/county/etc.)
        if (result && (ACCEPTED_TYPES.has(result.type) || result.class === 'place' || result.class === 'boundary')) {
          return {
            lat: result.lat,
            lon: result.lon,
            name: place,
          };
        }
      }

      // rate limit safety
      await new Promise((resolve) => setTimeout(resolve, 1000));

    } catch (err) {
      // try next candidate
      continue;
    }
  }

  return null;
};


const fetchNewsAndCreateIncidents = async (io) => {
  try {
    console.log("🔎 Fetching disaster news...");

  const response = await axios.get(
  "https://gnews.io/api/v4/search",
  {
    params: {
      q: '(flood OR earthquake OR wildfire OR landslide OR cyclone OR hurricane OR tsunami) AND (city OR state OR town OR village)',
      lang: "en",
      max: 10,
      token: process.env.GNEWS_API_KEY,
    },
  }
);

    const articles = response.data.articles;
    // console.log(articles);

    if (!articles || articles.length === 0) {
      console.log("⚠ No articles found");
      return;
    }

    for (let article of articles) {
      try {
        const combinedText = `${article.title} ${article.description || ""}`.toLowerCase();


        // 🔍 Keyword filter check
        const isDisaster = DISASTER_KEYWORDS.some((keyword) =>
          combinedText.includes(keyword)
        );

        if (!isDisaster) continue;

        // 🚫 Prevent duplicate (better than title check)
        const existing = await Incidents.findOne({
          newsUrl: article.url,
        });

        if (existing) {
          console.log("⏩ Skipping duplicate:", article.title);
          continue;
        }

            let location = await extractLocationFromTitle(article.title);
            // console.log(location);
            // try description fallback
            if (!location && article.description) {
              location = await extractLocationFromTitle(article.description);
            }
            // try source name fallback
            if (!location && article.source && article.source.name) {
              location = await extractLocationFromTitle(article.source.name);
            }

            if (!location) {
              console.log("❌ Location not found:", article.title);
              continue;
            }

            const { lat, lon } = location;

        // 🛑 Nominatim rate limit safety (1 request/sec recommended)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const incident = await Incidents.create({
          title: article.title,
          description: article.description || "No description available",
          reportedBy: process.env.SYSTEM_USER_ID,
          severity: "high",
          status: "pending",
          reviewStatus: "pending",
          source: article.source?.name || "Unknown Source",
          newsUrl: article.url,
          images: article.image ? [article.image] : [],
          autoDetected: true,
          location: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
        });

        // 🔥 Real-time notify responders
        io.to("admin").emit("newIncident", incident);

        console.log("✅ Auto incident created:", incident.title);

      } catch (innerError) {
        console.log("⚠ Skipping article due to error:", innerError.message);
        continue;
      }
    }

  } catch (error) {
    console.error("❌ News fetch error:", error.message);
  }
};

module.exports = fetchNewsAndCreateIncidents;