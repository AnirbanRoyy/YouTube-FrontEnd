import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadVideo = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        videoFile: null,
        thumbnail: null,
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "videoFile" || name === "thumbnail") {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !formData.title ||
            !formData.description ||
            !formData.videoFile ||
            !formData.thumbnail
        ) {
            alert("All fields are required!");
            return;
        }

        setIsUploading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("videoFile", formData.videoFile);
        data.append("thumbnail", formData.thumbnail);

        try {
            const authToken = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:8000/api/v1/videos/publish-video",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                alert("Video uploaded successfully!");
                navigate("/"); // Redirect to VideoCart page
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Failed to upload video. Please try again.");
        } finally {
            setIsUploading(false);
            navigate("/admin")
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Upload Video Form Section */}
            <div className="flex-grow flex items-center justify-center pt-20">
                <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-white">
                        Upload Video
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="Enter video title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Enter video description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="videoFile"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Video File
                            </label>
                            <input
                                type="file"
                                id="videoFile"
                                name="videoFile"
                                accept="video/*"
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="thumbnail"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Thumbnail
                            </label>
                            <input
                                type="file"
                                id="thumbnail"
                                name="thumbnail"
                                accept="image/*"
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Upload Video"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadVideo;
