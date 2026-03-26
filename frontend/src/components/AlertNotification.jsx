import { useEffect, useState } from "react";
import "./AlertNotification.css";

const AlertNotification = ({ alert, onClose, onRead }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "#FF1744";
      case "high":
        return "#FF6F00";
      case "medium":
        return "#FFB300";
      case "low":
        return "#2196F3";
      default:
        return "#FF5722";
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "flood_warning":
        return "🌊";
      case "cyclone_alert":
        return "🌪️";
      case "earthquake_detected":
        return "⚡";
      case "evacuation_notice":
        return "🏃";
      default:
        return "⚠️";
    }
  };

  const handleMarkAsRead = () => {
    onRead(alert._id);
    setIsVisible(false);
    onClose();
  };

  return (
    <div
      className="alert-notification"
      style={{ borderLeftColor: getSeverityColor(alert.severity) }}
    >
      <div className="alert-icon">{getAlertIcon(alert.type)}</div>

      <div className="alert-content">
        <div className="alert-header">
          <h3 className="alert-title">{alert.title}</h3>
          <span className="alert-severity" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
            {alert.severity.toUpperCase()}
          </span>
        </div>

        <p className="alert-message">{alert.message}</p>

        {alert.location && alert.location !== "All Areas" && (
          <p className="alert-location">📍 {alert.location}</p>
        )}

        <div className="alert-meta">
          <span className="alert-time">
            {new Date(alert.createdAt).toLocaleTimeString()}
          </span>
          {alert.createdBy && (
            <span className="alert-creator">By: {alert.createdBy.name}</span>
          )}
        </div>
      </div>

      <div className="alert-actions">
        <button className="btn-dismiss" onClick={onClose} title="Dismiss">
          ✕
        </button>
      </div>

      {/* Animated border for critical alerts */}
      {alert.severity === "critical" && <div className="alert-pulse"></div>}
    </div>
  );
};

export default AlertNotification;
