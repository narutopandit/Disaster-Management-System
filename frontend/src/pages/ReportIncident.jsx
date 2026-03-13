import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import API from "../services/api";

const LocationSelector = ({ setLocation }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      setLocation({
        type: "Point",
        coordinates: [lng, lat],
      });
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ReportIncident = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("low");
  const [location, setLocation] = useState(null);

  const submitIncident = async () => {
    try {
      if (!location) {
        alert("Please select a location on the map");
        return;
      }

      await API.post("/create-incident", {
        title,
        description,
        severity,
        location,
      });

      alert("Incident Reported Successfully");

      setTitle("");
      setDescription("");
      setSeverity("low");
      setLocation(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">Report Disaster Incident</h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-black/5">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">Severity</label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-6">
            <p className="mb-3 text-sm text-gray-600">Click on the map to select a location</p>

            <div className="h-96 w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationSelector setLocation={setLocation} />
              </MapContainer>
            </div>
          </div>

          <button
            onClick={submitIncident}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            Submit Incident
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;