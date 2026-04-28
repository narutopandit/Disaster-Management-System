const express = require("express");
const { authRole } = require("../middlewares/roleMiddleWare");
const { protect } = require("../middlewares/authMiddleware");
const {
  createAlert,
  getAlerts,
  getAlert,
  markAlertAsRead,
  updateAlertStatus,
  deleteAlert,
  getAlertStats,
} = require("../controllers/alertController");

const router = express.Router();

// Public routes (protected)
router.get("/", protect, getAlerts);
router.get("/stats", protect, getAlertStats);
router.get("/:id", protect, getAlert);
router.post("/:id/read", protect, markAlertAsRead);

// Admin-only routes
router.post("/", protect, authRole("admin"), createAlert);
router.patch("/:id/status", protect, authRole("admin"), updateAlertStatus);
router.delete("/:id", protect, authRole("admin"), deleteAlert);

module.exports = router;