import { useEffect, useState, useContext } from "react";
import { FaTrash, FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import socket from "../services/socket";
import "./AlertHistory.css";

const AlertHistory = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAlerts();

    // Listen for real-time updates
    socket.on("newAlert", (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    socket.on("alertStatusUpdated", (updatedAlert) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert._id === updatedAlert._id ? updatedAlert : alert
        )
      );
    });

    socket.on("alertDeleted", (alertId) => {
      setAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
    });

    return () => {
      socket.off("newAlert");
      socket.off("alertStatusUpdated");
      socket.off("alertDeleted");
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `/alerts?status=${selectedStatus}&page=${page}&limit=${itemsPerPage}`
      );
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = alerts;

    if (selectedType !== "all") {
      filtered = filtered.filter((alert) => alert.type === selectedType);
    }

    setFilteredAlerts(filtered);
  }, [alerts, selectedType]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const getAlertIcon = (type) => {
    const icons = {
      flood_warning: "🌊",
      cyclone_alert: "🌪️",
      earthquake_detected: "⚡",
      evacuation_notice: "🏃",
      other: "⚠️",
    };
    return icons[type] || "⚠️";
  };

  const getSeverityLabel = (severity) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };
    return labels[severity] || severity;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "#2196F3",
      medium: "#FFB300",
      high: "#FF6F00",
      critical: "#FF1744",
    };
    return colors[severity] || "#FF5722";
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: "#4CAF50",
      resolved: "#2196F3",
      expired: "#999",
    };
    return colors[status] || "#999";
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      return;
    }

    setDeletingId(alertId);
    try {
      await API.delete(`/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
      socket.emit('alertDeleted', alertId);
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Failed to delete alert. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="alert-history-container">
      <div className="alert-history-header">
        <h2>Emergency Alerts History</h2>
        <p className="alert-count">Total: {alerts.length} alerts</p>
      </div>

      {/* Filters */}
      <div className="alert-filters">
        <div className="filter-group">
          <label>Status:</label>
          <div className="filter-buttons">
            {["active", "resolved", "expired"].map((status) => (
              <button
                key={status}
                className={`filter-btn ${
                  selectedStatus === status ? "active" : ""
                }`}
                onClick={() => handleStatusChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="flood_warning">Flood Warning</option>
            <option value="cyclone_alert">Cyclone Alert</option>
            <option value="earthquake_detected">Earthquake</option>
            <option value="evacuation_notice">Evacuation Notice</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-list">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <p>No alerts found</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`alert-item alert-${alert.status}`}
              style={{
                borderLeftColor: getSeverityColor(alert.severity),
              }}
            >
              <div className="alert-item-icon">
                {getAlertIcon(alert.type)}
              </div>

              <div className="alert-item-content">
                <div className="alert-item-header">
                  <h3 className="alert-item-title">{alert.title}</h3>
                  <div className="alert-badges">
                    <span
                      className="badge severity"
                      style={{
                        backgroundColor: getSeverityColor(alert.severity),
                      }}
                    >
                      {getSeverityLabel(alert.severity)}
                    </span>
                    <span
                      className="badge status"
                      style={{
                        backgroundColor: getStatusBadgeColor(alert.status),
                      }}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>

                <p className="alert-item-message">{alert.message}</p>

                {alert.location && alert.location !== "All Areas" && (
                  <p className="alert-location">📍 {alert.location}</p>
                )}

                <div className="alert-item-footer">
                  <span className="alert-time">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                  {alert.createdBy && (
                    <span className="alert-creator">
                      By: {alert.createdBy.name}
                    </span>
                  )}
                  <span className="alert-views">
                    👥 {alert.readBy?.length || 0} read
                  </span>
                </div>
              </div>

              {/* Delete Button for Admin */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDeleteAlert(alert._id)}
                  disabled={deletingId === alert._id}
                  title="Delete alert"
                  className="alert-delete-btn"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredAlerts.length > 0 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage(page + 1)}
            disabled={filteredAlerts.length < itemsPerPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertHistory;
