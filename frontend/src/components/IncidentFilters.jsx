import { useState } from "react";
import { FaSearch, FaFilter, FaRedo, FaExclamationTriangle, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

const IncidentFilters = ({ onFilter }) => {
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const applyFilters = () => {
    onFilter({
      severity,
      status,
      search,
    });
  };

  const resetFilters = () => {
    setSeverity("");
    setStatus("");
    setSearch("");

    onFilter({
      severity: "",
      status: "",
      search: "",
    });
  };

  const getSeverityIcon = (level) => {
    switch (level) {
      case "low":
        return <FaCheckCircle className="text-green-500" />;
      case "medium":
        return <FaClock className="text-yellow-500" />;
      case "high":
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case "pending":
        return <FaClock className="text-orange-500" />;
      case "verified":
        return <FaCheckCircle className="text-blue-500" />;
      case "In-progress":
        return <FaFilter className="text-purple-500" />;
      case "solved":
        return <FaTimesCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <FaFilter className="text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Incidents</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Incidents
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Severity Level
          </label>
          <div className="relative">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white appearance-none transition-all duration-200"
            >
              <option value="">All Severities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getSeverityIcon(severity)}
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white appearance-none transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="In-progress">In Progress</option>
              <option value="solved">Solved</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon(status)}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 opacity-0">
            Actions
          </label>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
            >
              <FaFilter className="inline mr-2" />
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
            >
              <FaRedo className="inline" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(severity || status || search) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Search: "{search}"
              </span>
            )}
            {severity && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {getSeverityIcon(severity)}
                <span className="ml-1 capitalize">{severity}</span>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentFilters;