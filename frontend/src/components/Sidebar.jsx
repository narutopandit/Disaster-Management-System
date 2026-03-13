import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col transition-colors">
      <h1 className="text-2xl font-bold p-6 border-b border-blue-700">
        DisasterSys
      </h1>

      <nav className="flex-1 p-4 space-y-3">
        <Link to="/dashboard" className="block hover:bg-blue-700 p-2 rounded">
          Dashboard
        </Link>

        <Link
            to="/report"
            className="block hover:bg-blue-700 p-2 rounded"
          >
            Report Incident
          </Link>

        {user?.role === "admin" && (
          <Link to="/admin" className="block hover:bg-blue-700 p-2 rounded">
            Admin Review
          </Link>
          
        )}
        {user?.role === "admin" && (
          <Link to="/assign" className="block hover:bg-blue-700 p-2 rounded">
            Assign Responders
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;