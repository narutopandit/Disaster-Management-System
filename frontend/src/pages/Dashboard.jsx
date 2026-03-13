import React, { useEffect, useState } from 'react'
import API from '../services/api';
import socket from '../services/socket';
import MapView from './MapView';
import Analytics from "../components/Analytics";

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetchIncidents();

    socket.on("newIncident", (data) => {
      setIncidents((prev) => [data, ...prev]);
    });

    return () => socket.off("newIncident");
  }, []);

  const fetchIncidents = async () => {
    const res = await API.get("/get-all-incidents");
    setIncidents(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Live Incidents</h1>
        <p className="text-sm text-gray-500">Real-time incident updates based on your submissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Incidents</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{incidents.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">High Severity</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {incidents.filter((i) => i.severity === "high").length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Review</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {incidents.filter((i) => i.reviewStatus === "pending").length}
          </p>
        </div>
      </div>

      <MapView incidents={incidents} />
      <Analytics incidents={incidents} />
    </div>
  );
};

export default Dashboard;