import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username.replace(/\s/g, "_")); // Replace spaces in username
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullName", fullName);
      formData.append("avatar", avatar);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        navigate("/login"); // Navigate to the login page on success
      } else {
        setError("Registration failed. Please check your details and try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Registration Form Section */}
      <div className="flex-grow flex items-center justify-center pt-20">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md my-10">
          <h2 className="text-2xl font-bold text-center text-white">Registration</h2>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
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
                required
              />
            </div>

            {/* Email */}
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
                required
              />
            </div>

            {/* Password */}
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

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Avatar */}
            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-300"
              >
                Avatar
              </label>
              <input
                type="file"
                id="avatar"
                onChange={(e) => setAvatar(e.target.files[0])}
                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Cover Image (Optional) */}
            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-medium text-gray-300"
              >
                Cover Image (Optional)
              </label>
              <input
                type="file"
                id="coverImage"
                onChange={(e) => setCoverImage(e.target.files[0])}
                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className={`w-full px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          {/* Link to Login Page */}
          <p className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-purple-500 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;