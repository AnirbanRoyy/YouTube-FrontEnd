import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FaHome,
    FaUpload,
    FaUser,
    FaCog,
    FaFolder,
    FaUsers,
    FaBars,
    FaVideo,
} from "react-icons/fa";

const SideBar = ({ onToggle }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        if (onToggle) {
            onToggle(isCollapsed);
        }
    }, [isCollapsed, onToggle]);

    const { userDetails } = useSelector((state) => state.auth);

    return (
        <div
            className={`${
                isCollapsed ? "w-20" : "w-48"
            } min-h-screen bg-gray-900 border-r border-gray-700 p-4 fixed top-16 flex flex-col transition-all duration-75`}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="text-white mb-6 focus:outline-none"
            >
                <FaBars size={20} />
            </button>

            {/* Menu Items */}
            <ul className="space-y-2 flex-1">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 text-slate-100 rounded hover:bg-gray-800 ${
                                isActive ? "bg-slate-600 bg-opacity-50" : ""
                            }`
                        }
                    >
                        <FaHome size={20} />
                        {!isCollapsed && <span>Home</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/upload-video"
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 text-slate-100 rounded hover:bg-gray-800 ${
                                isActive ? "bg-slate-600 bg-opacity-50" : ""
                            }`
                        }
                    >
                        <FaUpload size={20} />
                        {!isCollapsed && <span>Upload Video</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 text-slate-100 rounded hover:bg-gray-800 ${
                                isActive ? "bg-slate-600 bg-opacity-50" : ""
                            }`
                        }
                    >
                        <FaUser size={20} />
                        {!isCollapsed && <span>Admin</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={
                            userDetails?.username
                                ? `/profile/${userDetails.username}`
                                : "/profile"
                        }
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 text-slate-100 rounded hover:bg-gray-800 ${
                                isActive ? "bg-slate-600 bg-opacity-50" : ""
                            }`
                        }
                    >
                        <FaVideo size={20} />
                        {!isCollapsed && <span>My Content</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/subscribers"
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 text-slate-100 rounded hover:bg-gray-800 ${
                                isActive ? "bg-slate-600 bg-opacity-50" : ""
                            }`
                        }
                    >
                        <FaUsers size={20} />
                        {!isCollapsed && <span>Subscribers</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/playlists"
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 text-slate-100 rounded hover:bg-gray-800 ${
                                isActive ? "bg-slate-600 bg-opacity-50" : ""
                            }`
                        }
                    >
                        <FaUsers size={20} />
                        {!isCollapsed && <span>Playlists</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 text-slate-100 rounded hover:bg-gray-800 ${
                                isActive ? "bg-slate-600 bg-opacity-50" : ""
                            }`
                        }
                    >
                        <FaCog size={20} />
                        {!isCollapsed && <span>Settings</span>}
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default SideBar;
