const Alerts = require("../models/Alerts");

/**
 * Initialize Socket.IO events for real-time communication
 */
const initializeSocketManager = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // User joins room based on role and user ID
    socket.on("joinRoom", ({ userId, role }) => {
      socket.join(role); // Join role-based room (admin, responder, user)
      socket.join(`user_${userId}`); // Join personal room
      console.log(`📍 User ${userId} joined ${role} room`);
    });

    // Listen for alert updates
    socket.on("alertAcknowledged", ({ alertId, userId }) => {
      console.log(`✓ User ${userId} acknowledged alert ${alertId}`);
      io.emit("userAcknowledgedAlert", { alertId, userId });
    });

    // Broadcast alert to specific role
    socket.on("broadcastAlertToRole", (data) => {
      const { role, alert } = data;
      io.to(role).emit("newAlert", alert);
      console.log(`📢 Alert broadcasted to ${role}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`⚠️ Socket error for ${socket.id}:`, error);
    });
  });
};

/**
 * Send alert to all connected users via Socket.IO
 */
const broadcastAlert = (io, alert) => {
  io.emit("newAlert", alert);
  console.log(`🚨 Emergency Alert broadcasted:`, alert.title);
};

/**
 * Send alert to specific users
 */
const sendAlertToUsers = (io, userIds, alert) => {
  userIds.forEach((userId) => {
    io.to(`user_${userId}`).emit("newAlert", alert);
  });
  console.log(`🚨 Alert sent to ${userIds.length} users`);
};

/**
 * Send alert to all admins
 */
const sendAlertToAdmins = (io, alert) => {
  io.to("admin").emit("newAlert", alert);
  console.log(`🚨 Alert sent to all admins`);
};

/**
 * Update alert status in real-time
 */
const updateAlertStatusBroadcast = (io, alert) => {
  io.emit("alertStatusUpdated", alert);
  console.log(`📝 Alert status updated: ${alert._id}`);
};

/**
 * Delete alert in real-time
 */
const deleteAlertBroadcast = (io, alertId) => {
  io.emit("alertDeleted", alertId);
  console.log(`🗑️ Alert deleted: ${alertId}`);
};

module.exports = {
  initializeSocketManager,
  broadcastAlert,
  sendAlertToUsers,
  sendAlertToAdmins,
  updateAlertStatusBroadcast,
  deleteAlertBroadcast,
};
