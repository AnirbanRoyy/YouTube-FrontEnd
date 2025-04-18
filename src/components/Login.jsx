import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext.js";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const { setUser } = useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:8000/api/v1/users/login",
                {
                    email,
                    username,
                    password,
                }
            );

            const { accessToken } = response.data.data;
            const { user } = response.data.data;

            setUser(user);

            // Store the token in localStorage or a cookie
            localStorage.setItem("token", accessToken);

            localStorage.setItem("username", user.username);
            localStorage.setItem("email", user.email);
            localStorage.setItem("avatar", user.avatar);
            localStorage.setItem("fullName", user.fullName);
            localStorage.setItem("userId", user._id);

            // Navigate to the home page or dashboard
            navigate("/");
        } catch (error) {
            console.log(error.message);
            setErrorMessage(
                error?.response?.data || "Failed to login. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Login Form Section */}
            <div className="flex-grow flex items-center justify-center pt-20">
                <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-white">
                        Login
                    </h2>

                    {errorMessage && (
                        <p className="text-sm text-red-500 text-center">
                            {errorMessage}
                        </p>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <a
                                href="/forgotpassword"
                                className="text-sm text-purple-500 hover:underline"
                            >
                                Forgot password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            Login
                        </button>
                    </form>
                    <p className="text-sm text-gray-400 text-center">
                        Don’t have an account?{" "}
                        <a
                            href="/registration"
                            className="text-purple-500 hover:underline"
                        >
                            Registration
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
