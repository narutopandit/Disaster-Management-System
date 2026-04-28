const Alerts = require("../models/Alerts");

// Create and broadcast an alert
exports.createAlert = async (req, res) => {
  try {
    const { title, message, type, severity, location } = req.body;

    // Validate alert type
    const validTypes = ["flood_warning", "cyclone_alert", "earthquake_detected", "evacuation_notice", "other"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid alert type" });
    }

    const alert = await Alerts.create({
      title,
      message,
      type,
      severity: severity || "high",
      location: location || "All Areas",
      createdBy: req.user._id,
      icon: getAlertIcon(type),
    });

    // Populate creator details
    const populatedAlert = await Alerts.findById(alert._id).populate("createdBy", "name email");

    // Broadcast to all users via Socket.IO
    const io = req.app.get("io");
    io.emit("newAlert", populatedAlert);

    res.status(201).json(populatedAlert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all alerts with filtering and pagination
exports.getAlerts = async (req, res) => {
  try {
    const { status = "active", page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const query = {};
    if (status) {
      query.status = status;
    }

    const alerts = await Alerts.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alerts.countDocuments(query);

    res.status(200).json({
      alerts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single alert
exports.getAlert = async (req, res) => {
  try {
    const alert = await Alerts.findById(req.params.id).populate("createdBy", "name email");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark alert as read by user
exports.markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    const alert = await Alerts.findById(alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Check if already marked as read
    const alreadyRead = alert.readBy.some((read) => read.userId.toString() === userId.toString());

    if (!alreadyRead) {
      alert.readBy.push({
        userId,
        readAt: new Date(),
      });
      await alert.save();
    }

    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update alert status
exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "resolved", "expired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const alert = await Alerts.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("createdBy", "name email");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Broadcast status update to all users
    const io = req.app.get("io");
    io.emit("alertStatusUpdated", alert);

    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alerts.findByIdAndDelete(id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Broadcast deletion to all users
    const io = req.app.get("io");
    io.emit("alertDeleted", id);

    res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get alert statistics
exports.getAlertStats = async (req, res) => {
  try {
    const totalAlerts = await Alerts.countDocuments();
    const activeAlerts = await Alerts.countDocuments({ status: "active" });
    const alertsByType = await Alerts.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    const alertsBySeverity = await Alerts.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalAlerts,
      activeAlerts,
      alertsByType,
      alertsBySeverity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get icon based on alert type
function getAlertIcon(type) {
  const iconMap = {
    flood_warning: "waves",
    cyclone_alert: "wind",
    earthquake_detected: "zap",
    evacuation_notice: "alert-triangle",
    other: "alert-circle",
  };
  return iconMap[type] || "alert-circle";
}