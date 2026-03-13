import React, { useEffect, useState } from "react";
import API from "../services/api";

const AssignResponder = () => {
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState({});
  const [loadingIncident, setLoadingIncident] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await API.get("/get-all-incidents");
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNearbyResponders = async (incidentId) => {
    try {
      setLoadingIncident(incidentId);

      const res = await API.get(
        `/nearby-responders?incidentId=${incidentId}`
      );

      setResponders((prev) => ({
        ...prev,
        [incidentId]: res.data,
      }));

      setLoadingIncident(null);
    } catch (err) {
      console.error(err);
      setLoadingIncident(null);
    }
  };

  const assignResponder = async (incidentId, responderId) => {
    try {
      await API.put("/assign", {
        incidentId,
        responderId,
      });

      alert("Responder Assigned Successfully");

      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">Assign Responders</h1>
          <p className="text-sm text-gray-500">Locate and assign responders to incidents in need.</p>
        </div>

        {incidents.map((incident) => (
          <div
            key={incident._id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                <p className="text-sm text-gray-600">{incident.description}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Severity: <span className="font-semibold text-gray-800">{incident.severity}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => fetchNearbyResponders(incident._id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  Find Nearby Responders
                </button>

                {loadingIncident === incident._id && (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
              </div>
            </div>

            {responders[incident._id] && (
              <div className="mt-4">
                <select
                  onChange={(e) => assignResponder(incident._id, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select Responder</option>

                  {responders[incident._id].map((responder) => (
                    <option key={responder._id} value={responder._id}>
                      {responder.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignResponder;