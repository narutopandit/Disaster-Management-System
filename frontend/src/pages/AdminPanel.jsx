import { useEffect, useState } from "react";
import API from "../services/api";
import AdminAlertPanel from "../components/AdminAlertPanel";
import AlertHistory from "../components/AlertHistory";

const AdminPanel = () => {
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState("incidents");

  const fetchPending = async () => {
    try {
      const res = await API.get("/pending-incidents");
      setPending(res.data);
    } catch (error) {
      console.error("Error fetching pending incidents:", error);
      setPending([]);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const review = async (id, action) => {
    try {
      await API.put("/review", {
        incidentId: id,
        action,
      });

      fetchPending();
    } catch (error) {
      console.error("Error reviewing incident:", error);
      alert(`Failed to ${action} incident. Please try again.`);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">Admin Control Panel</h1>
          <p className="text-sm text-gray-500">Manage incidents and broadcast emergency alerts.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("incidents")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "incidents"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📋 Incidents
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "alerts"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🚨 Emergency Alerts
          </button>
        </div>

        {/* Incidents Tab */}
        {activeTab === "incidents" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Auto Detected Incidents</h2>
            <p className="text-gray-600">Review automatically detected incidents and approve or reject them.</p>

            {pending.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">✓ No pending incidents for review</p>
              </div>
            ) : (
              pending.map((incident) => (
                <div
                  key={incident._id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                  <p className="mt-2 text-gray-600">{incident.description}</p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => review(incident._id, "approve")}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                    >
                      ✓ Approve
                    </button>

                    <button
                      onClick={() => review(incident._id, "reject")}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-8">
            {/* Broadcast Alert Section */}
            <section>
              <AdminAlertPanel onAlertCreated={() => {}} />
            </section>

            {/* Alert History Section */}
            <section className="mt-8">
              <AlertHistory />
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;