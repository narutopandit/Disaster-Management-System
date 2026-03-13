import { useEffect, useState } from "react";
import API from "../services/api";

const AdminPanel = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const res = await API.get("/pending-incidents");
    setPending(res.data);
  };

  const review = async (id, action) => {
    await API.put("/review", {
      incidentId: id,
      action,
    });

    fetchPending();
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">Auto Detected Incidents</h1>
          <p className="text-sm text-gray-500">Review automatically detected incidents and approve or reject them.</p>
        </div>

        {pending.map((incident) => (
          <div
            key={incident._id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
            <p className="mt-2 text-gray-600">{incident.description}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => review(incident._id, "approve")}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                Approve
              </button>

              <button
                onClick={() => review(incident._id, "reject")}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;