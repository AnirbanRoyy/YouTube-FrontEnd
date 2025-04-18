import React from "react";
import { NavLink } from "react-router-dom";

const SideBar = () => {
    return (
        <div className="w-40 min-h-screen bg-gray-900 border-r border-gray-700 p-4 fixed top-16 flex flex-col">
            {/* Menu Items */}
            <ul className="space-y-4 flex-1">
                {/* Home Menu Item */}
                <li className="">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `p-1 border border-gray-600 bg-gray-900 text-slate-100 rounded items-center hover:bg-gray-800 cursor-pointer
                            no-underline w-full h-full block py-2 text-center ${
                                isActive ? "bg-slate-600 bg-opacity-50 " : ""
                            }`
                        }
                    >
                        <span>Home</span>
                    </NavLink>
                </li>

                {/* Upload Video Menu Item */}
                <li className="">
                    <NavLink
                        to="/upload-video"
                        className={({ isActive }) =>
                            `p-1 border border-gray-600 bg-gray-900 text-slate-100 rounded items-center hover:bg-gray-800 cursor-pointer
                            no-underline w-full h-full block py-2 text-center ${
                                isActive ? "bg-slate-600 bg-opacity-50 " : ""
                            }`
                        }
                    >
                        <span>Upload Video</span>
                    </NavLink>
                </li>

                {/* Other Menu Items */}
                <li className="">
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `p-1 border border-gray-600 bg-gray-900 text-slate-100 rounded items-center hover:bg-gray-800 cursor-pointer
                            no-underline w-full h-full block py-2 text-center ${
                                isActive ? "bg-slate-600 bg-opacity-50 " : ""
                            }`
                        }
                    >
                        <span>Admin</span>
                    </NavLink>
                </li>
                <li className="">
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `p-1 border border-gray-600 bg-gray-900 text-slate-100 rounded items-center hover:bg-gray-800 cursor-pointer
                            no-underline w-full h-full block py-2 text-center ${
                                isActive ? "bg-slate-600 bg-opacity-50 " : ""
                            }`
                        }
                    >
                        <span>My Content</span>
                    </NavLink>
                </li>
                <li className="">
                    <NavLink
                        to="/collections"
                        className={({ isActive }) =>
                            `p-1 border border-gray-600 bg-gray-900 text-slate-100 rounded items-center hover:bg-gray-800 cursor-pointer
                            no-underline w-full h-full block py-2 text-center ${
                                isActive ? "bg-slate-600 bg-opacity-50 " : ""
                            }`
                        }
                    >
                        <span className="w-full h-full block py-2 text-center">
                            Collections
                        </span>
                    </NavLink>
                </li>
                <li className="">
                    <NavLink
                        to="/subscribers"
                        className={({ isActive }) =>
                            `p-1 border border-gray-600 bg-gray-900 text-slate-100 rounded items-center hover:bg-gray-800 cursor-pointer
                            no-underline w-full h-full block py-2 text-center ${
                                isActive ? "bg-slate-600 bg-opacity-50 " : ""
                            }`
                        }
                    >
                        <span className="w-full h-full block py-2 text-center">
                            Subscribers
                        </span>
                    </NavLink>
                </li>
                <li className="">
                    <NavLink
                        to="/change-password"
                        className={({ isActive }) =>
                            `p-1 border border-gray-600 bg-gray-900 text-slate-100 rounded items-center hover:bg-gray-800 cursor-pointer
                            no-underline w-full h-full block py-2 text-center ${
                                isActive ? "bg-slate-600 bg-opacity-50 " : ""
                            }`
                        }
                    >
                        <span>Settings</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default SideBar;
