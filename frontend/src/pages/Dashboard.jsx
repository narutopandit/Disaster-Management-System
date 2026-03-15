import React, { useEffect, useState } from 'react'
import API from '../services/api';
import socket from '../services/socket';
import MapView from './MapView';
import Analytics from "../components/Analytics";
import IncidentFilters from '../components/IncidentFilters';
import IncidentCard from '../components/IncidentCard';

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  

  const fetchIncidents = async () => {
    const res = await API.get("/get-all-incidents");
    setIncidents(res.data);
    setFilteredIncidents(res.data);
  };

  useEffect(() => {
    fetchIncidents();

    socket.on("newIncident", (data) => {
      setIncidents((prev) => [data, ...prev]);
    });

    return () => socket.off("newIncident");
  }, []);

  useEffect(() => {

  socket.on("incidentStatusUpdated", (updatedIncident) => {

    setIncidents((prev) =>
      prev.map((incident) =>
        incident._id === updatedIncident._id
          ? updatedIncident
          : incident
      )
    );

    setFilteredIncidents((prev) =>
      prev.map((incident) =>
        incident._id === updatedIncident._id
          ? updatedIncident
          : incident
      )
    );

  });

  return () => {
    socket.off("incidentStatusUpdated");
  };

}, []);

  const handleStatusUpdate = (incidentId, newStatus) => {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident._id === incidentId
          ? { ...incident, status: newStatus }
          : incident
      )
    );

    setFilteredIncidents((prev) =>
      prev.map((incident) =>
        incident._id === incidentId
          ? { ...incident, status: newStatus }
          : incident
      )
    );
  };

  const handleFilter = ({ severity, status, search }) => {
    let filtered = incidents;

    if (severity) {
      filtered = filtered.filter(
        (i) => i.severity === severity
      );
    }

    if (status) {
      filtered = filtered.filter(
        (i) => i.status === status
      );
    }

    if (search) {
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredIncidents(filtered);
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
      <IncidentFilters onFilter={handleFilter}/>
      <MapView incidents={filteredIncidents} />

      {/* Incident Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Incidents</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No incidents found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later for new incidents.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIncidents.map((incident) => (
              <IncidentCard key={incident._id} incident={incident} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>

      <Analytics incidents={filteredIncidents} />
    </div>
  );
};

export default Dashboard;