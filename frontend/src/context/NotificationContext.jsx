import { createContext, useState, useEffect } from "react";
import socket from "../services/socket";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  const addNotification = (type, message, data = null) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  };

  const addEmergencyAlert = (alert) => {
    setEmergencyAlerts((prev) => [alert, ...prev].slice(0, 20)); // Keep last 20
  };

  useEffect(() => {
    // Incident notifications
    socket.on("newIncident", (data) => {
      addNotification("incident", `New Incident: ${data.title}`, data);
    });

    // Emergency alerts
    socket.on("newAlert", (data) => {
      addEmergencyAlert(data);
      addNotification("emergency_alert", `🚨 ${data.title}`, data);
    });

    // Status updates
    socket.on("statusUpdated", (data) => {
      addNotification("status_update", `Status Updated: ${data.title}`, data);
    });

    socket.on("incidentStatusUpdated", (data) => {
      addNotification("incident_status", `Incident Status: ${data.status}`, data);
    });

    socket.on("alertStatusUpdated", (data) => {
      addNotification("alert_status", `Alert Status: ${data.status}`, data);
      // Update or remove from emergency alerts
      if (data.status !== "active") {
        setEmergencyAlerts((prev) =>
          prev.filter((alert) => alert._id !== data._id)
        );
      }
    });

    socket.on("alertDeleted", (alertId) => {
      setEmergencyAlerts((prev) =>
        prev.filter((alert) => alert._id !== alertId)
      );
    });

    return () => {
      socket.off("newIncident");
      socket.off("newAlert");
      socket.off("statusUpdated");
      socket.off("incidentStatusUpdated");
      socket.off("alertStatusUpdated");
      socket.off("alertDeleted");
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearEmergencyAlerts = () => {
    setEmergencyAlerts([]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const removeEmergencyAlert = (alertId) => {
    setEmergencyAlerts((prev) =>
      prev.filter((alert) => alert._id !== alertId)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        emergencyAlerts,
        addNotification,
        addEmergencyAlert,
        clearNotifications,
        clearEmergencyAlerts,
        removeNotification,
        removeEmergencyAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};