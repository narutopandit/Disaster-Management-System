import { createContext, useState, useEffect } from "react";
import socket from "../services/socket";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  useEffect(() => {
    socket.on("newIncident", (data) => {
      addNotification("New Incident", data.title);
    });

    socket.on("newAlert", (data) => {
      addNotification("Emergency Alert", data.message);
    });

    socket.on("statusUpdated", (data) => {
      addNotification("Status Updated", data.title);
    });

    return () => {
      socket.off("newIncident");
      socket.off("newAlert");
      socket.off("statusUpdated");
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};