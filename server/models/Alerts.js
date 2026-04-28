const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["flood_warning", "cyclone_alert", "earthquake_detected", "evacuation_notice", "other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
    },
    location: {
      type: String,
      default: "All Areas",
    },
    status: {
      type: String,
      enum: ["active", "resolved", "expired"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        readAt: Date,
      },
    ],
    affectedUsers: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "alert-circle",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);