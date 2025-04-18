import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear all localStorage items
        localStorage.clear();

        // Redirect to the login page
        navigate("/login");
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <p className="text-white text-lg">Logging out...</p>
        </div>
    );
};

export default LogOut;
