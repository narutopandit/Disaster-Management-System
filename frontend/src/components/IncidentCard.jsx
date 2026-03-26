import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaClock, FaUser, FaExclamationTriangle, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaExternalLinkAlt, FaImage, FaEdit, FaChevronDown, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import socket from '../services/socket';

const IncidentCard = ({ incident, onStatusUpdate }) => {
  const { user } = useContext(AuthContext);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <FaExclamationTriangle className="text-red-600" />;
      case 'medium':
        return <FaClock className="text-yellow-600" />;
      case 'low':
        return <FaCheckCircle className="text-green-600" />;
      default:
        return <FaCheckCircle className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'In-progress':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'solved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <FaCheckCircle className="text-blue-600" />;
      case 'In-progress':
        return <FaHourglassHalf className="text-purple-600" />;
      case 'pending':
        return <FaClock className="text-orange-600" />;
      case 'solved':
        return <FaTimesCircle className="text-green-600" />;
      default:
        return <FaCheckCircle className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Allow responders to update incident status on any card (for their workflow)
  const canUpdateStatus = user?.role === 'responder';

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === incident.status) {
      setShowStatusDropdown(false);
      return;
    }

    setIsUpdating(true);
    try {
      await API.put('/incident-status', {
        incidentId: incident._id,
        status: newStatus
      });

      // Emit socket event for real-time updates
      socket.emit('incidentStatusUpdated', { ...incident, status: newStatus });

      // Call parent callback if provided
      if (onStatusUpdate) {
        onStatusUpdate(incident._id, newStatus);
      }

      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update incident status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if user can delete the incident
  const canDelete = user?.role === 'admin' || 
                    user?._id === incident.reportedBy?._id || 
                    user?._id === incident.assignedTo?._id;

  const handleDeleteIncident = async () => {
    if (!window.confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await API.delete('/delete-incident', {
        data: {
          incidentId: incident._id
        }
      });

      socket.emit('incidentDeleted', incident._id);
      alert('Incident deleted successfully');
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert('Failed to delete incident. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
    { value: 'verified', label: 'Verified', color: 'bg-blue-100 text-blue-800' },
    { value: 'In-progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'solved', label: 'Solved', color: 'bg-green-100 text-green-800' }
  ];

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group">
      {/* Header with severity badge */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
              {incident.title}
            </h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                {getSeverityIcon(incident.severity)}
                <span className="ml-1 capitalize">{incident.severity}</span>
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                {getStatusIcon(incident.status)}
                <span className="ml-1 capitalize">{incident.status}</span>
              </span>
              {incident.autoDetected && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <FaClock className="mr-1" />
                  Auto-detected
                </span>
              )}
            </div>
          </div>

          {/* Status Update Button for Responders */}
          {canUpdateStatus && (
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={isUpdating}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaEdit className="mr-2" />
                Update Status
                <FaChevronDown className={`ml-2 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Status Dropdown */}
              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                  <div className="py-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusUpdate(option.value)}
                        disabled={isUpdating}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                          incident.status === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${option.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                          {option.label}
                          {incident.status === option.value && (
                            <FaCheckCircle className="ml-auto text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Button */}
          {canDelete && (
            <button
              onClick={handleDeleteIncident}
              disabled={isDeleting}
              title="Delete incident"
              className="ml-2 inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {incident.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <FaMapMarkerAlt className="mr-2 text-red-500" />
          <span>Lat: {incident.location.coordinates[1].toFixed(4)}, Lng: {incident.location.coordinates[0].toFixed(4)}</span>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <FaUser className="mr-1" />
            <span>Reported by: {incident.reportedBy?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <FaClock className="mr-1" />
            <span>{formatDate(incident.createdAt)}</span>
          </div>
        </div>

        {/* Assigned To */}
        {incident.assignedTo && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FaUser className="mr-2 text-blue-500" />
              <span>Assigned to: <span className="font-medium">{incident.assignedTo.name}</span></span>
            </div>
          </div>
        )}

        {/* Source/News URL */}
        {incident.source && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">Source:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{incident.source}</span>
              {incident.newsUrl && (
                <a
                  href={incident.newsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <FaExternalLinkAlt />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Images */}
        {incident.images && incident.images.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FaImage className="mr-2" />
              <span>{incident.images.length} image{incident.images.length > 1 ? 's' : ''} attached</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer with review status */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400 mr-2">Review:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              incident.reviewStatus === 'approved'
                ? 'bg-green-100 text-green-800'
                : incident.reviewStatus === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {incident.reviewStatus || 'pending'}
            </span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            ID: {incident._id.slice(-6)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;