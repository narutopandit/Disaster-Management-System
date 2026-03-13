import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";

const Topbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { notifications, clearNotifications } =
        useContext(NotificationContext);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    return (
        <div className="sticky top-0 z-20 bg-white text-black shadow-sm border-b border-gray-200 p-4 flex justify-between items-center transition-colors">
            <h2 className="text-xl font-semibold text-black">
                Welcome, {user?.name}
            </h2>

            <div className="flex items-center space-x-6">
                {/* Notification Bell */}
                <div className="relative">
                    <button onClick={() => setOpen(!open)}>
                        🔔
                    </button>

                    {notifications.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                            {notifications.length}
                        </span>
                    )}

                    {open && (
                        <div className="absolute right-0 mt-3 w-80 bg-white text-black shadow-lg rounded p-4 z-50">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-bold">Notifications</h3>
                                <button
                                    onClick={clearNotifications}
                                    className="text-sm text-blue-500"
                                >
                                    Clear
                                </button>
                            </div>

                            {notifications.length === 0 && (
                                <p className="text-gray-500 text-sm">
                                    No notifications
                                </p>
                            )}

                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className="border-b py-2 text-sm"
                                >
                                    <p className="font-semibold">{n.type}</p>
                                    <p>{n.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Topbar;