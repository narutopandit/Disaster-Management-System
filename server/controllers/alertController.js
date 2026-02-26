const Alerts = require("../models/Alerts");


exports.createAlert = async (req, res) => {
  try {
    const { message, severity } = req.body;

    const alert = await Alerts.create({
      message,
      severity,
      createdBy: req.user._id,
    });

    // 🔥 Broadcast to all users
    const io = req.app.get("io");
    io.emit("newAlert", alert);

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};