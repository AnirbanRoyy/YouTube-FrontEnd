import React, { useState } from "react";
import { FiSearch } from "react-icons/fi"; // Import search icon
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem("token");

    // Handle logout
    const handleLogout = () => {
        // Clear all localStorage items
        localStorage.clear();

        // Redirect to the login page
        navigate("/login");
    };

    return (
        <div className="w-full bg-gray-800 border-b border-gray-700 flex items-center justify-between p-4 fixed top-0 z-10">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <div
                    className="h-10 w-16 rounded-full bg-cover bg-center hover:scale-110 transition-transform duration-300 shadow-lg"
                    style={{
                        backgroundImage: `url('src/assets/logo for video hosting platform.png')`,
                    }}
                >
                    <Link to="/" className="block h-full w-full"></Link>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-center flex-1">
                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="w-full px-4 py-2 text-white bg-slate-950 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <FiSearch
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                    // If logged in, show Logout button
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-gray-500 rounded text-white bg-purple-500 hover:bg-gray-700 w-full max-w-xs"
                    >
                        Logout
                    </button>
                ) : (
                    // If not logged in, show Login and Registration buttons
                    <>
                        <button className="px-4 py-2 border border-gray-500 rounded text-white bg-purple-500 hover:bg-gray-700 w-full max-w-xs">
                            <Link
                                to="/login"
                                className="block w-full h-full text-center text-white"
                            >
                                Log in
                            </Link>
                        </button>
                        <button className="px-4 py-2 border border-gray-500 rounded text-white bg-purple-500 hover:bg-gray-700 w-full max-w-xs">
                            <Link
                                to="/registration"
                                className="block w-full h-full text-center text-white"
                            >
                                Registration
                            </Link>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default NavBar;
