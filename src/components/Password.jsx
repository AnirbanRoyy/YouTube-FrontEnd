import React, { useState } from "react";

const Password = () => {
    const [currentTab, setCurrentTab] = useState("personalInfo");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Personal Information state
    const [name, setName] = useState("John Doe");
    const [channelName, setChannelName] = useState("React Patterns");
    const [email, setEmail] = useState("example@example.com");

    const handleUpdatePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
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
        alert("Password updated successfully!");
        // Logic to handle password change
    };

    const handleSavePersonalInfo = () => {
        alert("Personal information saved!");
        // Logic to save personal info
    };

    const handleCancelPersonalInfo = () => {
        setName("John Doe");
        setChannelName("React Patterns");
        setEmail("example@example.com");
    };

    return (
        <div
            className="min-h-screen bg-cover bg-gray-900 text-white flex justify-center items-center p-6"
            style={{
                backgroundImage: "url('/background.jpg')", // Ensure correct path to your background image
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Outer Container */}
            <div className="w-full max-w-6xl bg-black bg-opacity-50 rounded-lg p-10 pl-40 pr-30">
                {/* Header with Avatar and Channel Info */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full mb-2 overflow-hidden">
                        <img
                            src="/background.jpg" // Ensure correct path to your background image
                            alt="Background DP"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <img
                        src="/avatar.png" // Ensure correct path to your avatar image
                        alt="Avatar"
                        className="w-16 h-16 rounded-full border-4 border-gray-800 mb-2"
                    />
                    <h1 className="text-2xl font-bold">React Patterns</h1>
                    <p className="text-gray-400">@reactpatterns</p>
                    <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                        View Channel
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
                                    Channel Name
                                </label>
                                <input
                                    type="text"
                                    value={channelName}
                                    onChange={(e) =>
                                        setChannelName(e.target.value)
                                    }
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
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
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
                                        setCurrentPassword("");
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

export default Password;
