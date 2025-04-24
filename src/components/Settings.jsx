import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const { userDetails, isLoggedIn } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const [currentTab, setCurrentTab] = useState("personalInfo");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Personal Information state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, []);

    useEffect(() => {
        if (userDetails) {
            setName(userDetails.fullName || "");
            setEmail(userDetails.email || "");
        }
    }, [userDetails]);

    const handleUpdatePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }
        if (newPassword.length < 8) {
            alert("The new password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }
        try {
            await axios.post(
                "http://localhost:8000/api/v1/users/change-password",
                {
                    oldPassword,
                    newPassword,
                },
                {
                    withCredentials: true,
                }
            );
            alert("Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Error updating password:", error);
            alert(
                error.response?.data?.message ||
                    "Failed to update password. Please try again."
            );
        }
    };

    const handleSavePersonalInfo = async () => {
        try {
            await axios.patch(
                "http://localhost:8000/api/v1/users/update-user-details",
                {
                    name,
                    email,
                },
                {
                    withCredentials: true,
                }
            );
            alert("Personal information updated successfully!");
        } catch (error) {
            console.error("Error updating personal information:", error);
            alert(
                error.response?.data?.message ||
                    "Failed to update personal information. Please try again."
            );
        }
    };

    const handleCancelPersonalInfo = () => {
        setName(userDetails.fullName || "");
        setEmail(userDetails.email || "");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-6">
            {/* Outer Container */}
            <div className="w-full max-w-6xl bg-black bg-opacity-50 rounded-lg p-10 pl-40 pr-30">
                {/* Header with Avatar and User Info */}
                <div className="flex flex-col items-center mb-4">
                    <div
                        className="w-56 h-56 rounded-full bg-cover bg-center border-4 border-gray-800 mb-2"
                        style={{
                            backgroundImage: `url(${
                                userDetails.avatar || "/avatar.png"
                            })`,
                        }}
                    ></div>
                    <h1 className="text-2xl font-bold">
                        {userDetails.fullName}
                    </h1>
                    <p className="text-gray-400">@{userDetails.username}</p>
                    <button
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                        onClick={() => navigate("/profile")}
                    >
                        View Profile
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-700 mb-6">
                    <button
                        onClick={() => setCurrentTab("personalInfo")}
                        className={`px-6 py-3 ${
                            currentTab === "personalInfo"
                                ? "border-b-2 border-purple-600 text-purple-600"
                                : "text-gray-400"
                        }`}
                    >
                        Personal Information
                    </button>
                    <button
                        onClick={() => setCurrentTab("passwordChange")}
                        className={`px-6 py-3 ${
                            currentTab === "passwordChange"
                                ? "border-b-2 border-purple-600 text-purple-600"
                                : "text-gray-400"
                        }`}
                    >
                        Change Password
                    </button>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 gap-8">
                    {currentTab === "personalInfo" && (
                        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4">
                                Personal Information
                            </h2>
                            <div className="mb-4">
                                <label className="block mb-2 text-gray-400">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 rounded bg-gray-700 text-white"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-gray-400">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 rounded bg-gray-700 text-white"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleCancelPersonalInfo}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePersonalInfo}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {currentTab === "passwordChange" && (
                        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4">
                                Change Password
                            </h2>
                            <p className="text-gray-400 mb-4">
                                Please enter your current password to change
                                your password.
                            </p>
                            <div className="mb-4">
                                <label className="block mb-2 text-gray-400">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) =>
                                        setOldPassword(e.target.value)
                                    }
                                    className="w-full p-3 rounded bg-gray-700 text-white"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-gray-400">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className="w-full p-3 rounded bg-gray-700 text-white"
                                />
                                <p className="text-gray-500 text-sm mt-1">
                                    Your new password must be at least 8
                                    characters long.
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-gray-400">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="w-full p-3 rounded bg-gray-700 text-white"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setOldPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                    }}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdatePassword}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
