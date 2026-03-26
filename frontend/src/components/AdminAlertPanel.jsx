import { useState } from "react";
import API from "../services/api";
import "./AdminAlertPanel.css";

const AdminAlertPanel = ({ onAlertCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "other",
    severity: "high",
    location: "All Areas",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const alertTypes = [
    { value: "flood_warning", label: "🌊 Flood Warning", color: "#2196F3" },
    { value: "cyclone_alert", label: "🌪️ Cyclone Alert", color: "#FF6F00" },
    {
      value: "earthquake_detected",
      label: "⚡ Earthquake Detected",
      color: "#FFB300",
    },
    {
      value: "evacuation_notice",
      label: "🏃 Evacuation Notice",
      color: "#FF1744",
    },
    { value: "other", label: "⚠️ Other Alert", color: "#9C27B0" },
  ];

  const severityLevels = [
    { value: "low", label: "Low", color: "#2196F3" },
    { value: "medium", label: "Medium", color: "#FFB300" },
    { value: "high", label: "High", color: "#FF6F00" },
    { value: "critical", label: "Critical", color: "#FF1744" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAlertTypeSelect = (typeValue) => {
    setFormData((prev) => ({
      ...prev,
      type: typeValue,
    }));
  };

  const handleSeveritySelect = (severityValue) => {
    setFormData((prev) => ({
      ...prev,
      severity: severityValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await API.post("/alerts", formData);

      if (!response.data) {
        throw new Error("Failed to create alert");
      }

      const newAlert = response.data;
      setSuccess("Alert broadcasted successfully to all users!");

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "other",
        severity: "high",
        location: "All Areas",
      });

      // Call callback if provided
      if (onAlertCreated) {
        onAlertCreated(newAlert);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Alert creation error:", err);
      setError(err.message || "Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-alert-panel">
      <div className="panel-header">
        <h2>🚨 Broadcast Emergency Alert</h2>
        <p className="panel-subtitle">
          Send critical alerts to all connected users in real-time
        </p>
      </div>

      {error && <div className="alert-message alert-error">{error}</div>}
      {success && <div className="alert-message alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="alert-form">
        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Alert Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Severe Flood Warning"
            className="form-input"
            maxLength={100}
          />
          <span className="char-count">
            {formData.title.length}/100
          </span>
        </div>

        {/* Message Input */}
        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Alert Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe the emergency situation in detail..."
            className="form-textarea"
            rows="5"
            maxLength={500}
          />
          <span className="char-count">
            {formData.message.length}/500
          </span>
        </div>

        {/* Alert Type Selection */}
        <div className="form-group">
          <label className="form-label">Alert Type *</label>
          <div className="alert-type-grid">
            {alertTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`type-button ${
                  formData.type === type.value ? "selected" : ""
                }`}
                onClick={() => handleAlertTypeSelect(type.value)}
                style={{
                  borderColor:
                    formData.type === type.value ? type.color : "#ddd",
                }}
              >
                <span className="type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Selection */}
        <div className="form-group">
          <label className="form-label">Severity Level *</label>
          <div className="severity-grid">
            {severityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                className={`severity-button ${
                  formData.severity === level.value ? "selected" : ""
                }`}
                onClick={() => handleSeveritySelect(level.value)}
                style={{
                  backgroundColor:
                    formData.severity === level.value
                      ? level.color
                      : "transparent",
                  borderColor: level.color,
                  color:
                    formData.severity === level.value ? "white" : level.color,
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location Input */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Affected Location/Area
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Downtown District, North Region"
            className="form-input"
            maxLength={100}
          />
        </div>

        {/* Preview */}
        <div className="alert-preview">
          <h3 className="preview-title">Alert Preview</h3>
          <div
            className="preview-card"
            style={{
              borderLeftColor: severityLevels.find(
                (s) => s.value === formData.severity
              )?.color,
            }}
          >
            <div className="preview-content">
              <h4>{formData.title || "Alert Title..."}</h4>
              <p>{formData.message || "Alert message will appear here..."}</p>
              {formData.location && formData.location !== "All Areas" && (
                <p className="preview-location">📍 {formData.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-mini"></span>
                Broadcasting...
              </>
            ) : (
              <>
                <span className="btn-icon">🚨</span>
                Broadcast Alert to All Users
              </>
            )}
          </button>
        </div>

        <p className="form-notice">
          ℹ️ This alert will be sent immediately to all connected users via
          real-time Socket.IO connection.
        </p>
      </form>
    </div>
  );
};

export default AdminAlertPanel;
