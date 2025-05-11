import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Admin() {
    const [videos, setVideos] = useState(useLoaderData());
    const [searchQuery, setSearchQuery] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [editedVideo, setEditedVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const { isLoggedIn } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    const toggleStatus = async (id) => {
        try {
            setIsLoading(true); // Start loading
            const response = await axios.patch(
                `http://localhost:8000/api/v1/videos/toggle-publish/${id}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video._id === id
                        ? { ...video, isPublished: !video.isPublished }
                        : video
                )
            );
        } catch (error) {
            console.error("Error toggling publish status:", error);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const handleDelete = async () => {
        if (selectedVideo) {
            try {
                setIsLoading(true); // Start loading
                await axios.post(
                    `http://localhost:8000/api/v1/videos/delete-video/${selectedVideo._id}`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                setVideos((prevVideos) =>
                    prevVideos.filter(
                        (video) => video._id !== selectedVideo._id
                    )
                );
                setShowDeletePopup(false);
            } catch (error) {
                console.error("Error deleting video:", error.message);
            } finally {
                setIsLoading(false); // Stop loading
            }
        }
    };

    const handleEdit = async () => {
        if (editedVideo) {
            try {
                setIsLoading(true); // Start loading
                const formData = new FormData();

                formData.append("title", editedVideo.title);
                formData.append("description", editedVideo.description);

                if (
                    editedVideo.thumbnail &&
                    typeof editedVideo.thumbnail !== "string"
                ) {
                    formData.append("thumbnail", editedVideo.thumbnail);
                }

                const response = await axios.patch(
                    `http://localhost:8000/api/v1/videos/update-video/${editedVideo._id}`,
                    formData,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                setVideos((prevVideos) =>
                    prevVideos.map((video) =>
                        video._id === editedVideo._id
                            ? response.data.data
                            : video
                    )
                );

                setShowEditModal(false);
            } catch (error) {
                console.error("Error updating video:", error.message);
            } finally {
                setIsLoading(false); // Stop loading
            }
        }
    };

    const filteredVideos = videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <span className="loader"></span>
            </div>
        );
    }

    return (
        isLoggedIn && (
            <div className="min-h-screen bg-gray-900 text-white">
                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 py-4 bg-gray-800 w-full">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                        <h1 className="text-lg font-bold">Admin Dashboard</h1>
                    </div>
                    <div className="flex-grow mx-6">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded border bg-slate-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <img
                            src="/avatar.png"
                            alt="Avatar"
                            className="h-10 w-10 rounded-full border-2 border-purple-500"
                        />
                    </div>
                </nav>

                {/* Main Dashboard */}
                <div className="px-6 py-4 w-full">
                    {/* Welcome Section */}
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold">
                            Welcome Back,{" "}
                            {localStorage.getItem("fullName") || "Admin"}
                        </h2>
                        <p className="text-gray-400">
                            Seamless Video Management, Elevated Results.
                        </p>
                    </div>

                    {/* Video Table */}
                    <div className="overflow-x-hidden ml-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800">
                                    <th className="p-4 border-b border-gray-700">
                                        Actions
                                    </th>
                                    <th className="p-4 border-b border-gray-700">
                                        Uploaded
                                    </th>
                                    <th className="p-4 border-b border-gray-700">
                                        Date Uploaded
                                    </th>
                                    <th className="p-4 border-b border-gray-700">
                                        Date Updated
                                    </th>
                                    <th className="p-4 border-b border-gray-700">
                                        Details
                                    </th>
                                    <th className="p-4 border-b border-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVideos.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="p-4 text-center text-gray-500"
                                        >
                                            No videos found matching your
                                            search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVideos.map((video) => (
                                        <tr
                                            key={video._id}
                                            className="hover:bg-gray-700"
                                        >
                                            <td className="p-4 border-b border-gray-700">
                                                <button
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        video.isPublished
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-500 text-white"
                                                    }`}
                                                    onClick={() =>
                                                        toggleStatus(video._id)
                                                    }
                                                >
                                                    {video.isPublished
                                                        ? "Published"
                                                        : "Unpublished"}
                                                </button>
                                            </td>
                                            <td className="p-4 border-b border-gray-700">
                                                {video.title}
                                            </td>
                                            <td className="p-4 border-b border-gray-700">
                                                {new Date(
                                                    video.createdAt
                                                ).toLocaleString()}
                                            </td>
                                            <td className="p-4 border-b border-gray-700">
                                                {new Date(
                                                    video.updatedAt
                                                ).toLocaleString()}
                                            </td>
                                            <td className="p-4 border-b border-gray-700">
                                                <div className="text-sm text-gray-400">
                                                    <p>
                                                        {video.description ||
                                                            "No description available."}
                                                    </p>
                                                    <p>{video.views} Views</p>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b border-gray-700 flex gap-2">
                                                <button
                                                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                                                    onClick={() => {
                                                        setEditedVideo(video);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                                                    onClick={() => {
                                                        setSelectedVideo(video); // Make sure selectedVideo is set
                                                        setShowDeletePopup(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Video Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center mt-12">
                        <div className="bg-gray-800 p-6 rounded text-center">
                            <h2 className="text-2xl font-bold mb-4">
                                Edit Video
                            </h2>

                            {/* Thumbnail Preview */}
                            {editedVideo.thumbnail && (
                                <img
                                    src={
                                        typeof editedVideo.thumbnail ===
                                        "string"
                                            ? editedVideo.thumbnail // If it's a URL
                                            : URL.createObjectURL(
                                                  editedVideo.thumbnail
                                              ) // If it's a file object
                                    }
                                    alt="Thumbnail Preview"
                                    className="mb-4 w-full h-32 object-cover rounded"
                                />
                            )}

                            {/* Title Input */}
                            <p className="text-left text-slate-400">Title:</p>
                            <input
                                type="text"
                                placeholder="Title"
                                value={editedVideo.title}
                                onChange={(e) =>
                                    setEditedVideo({
                                        ...editedVideo,
                                        title: e.target.value,
                                    })
                                }
                                className="mb-4 p-2 w-full rounded bg-gray-800 text-slate-50"
                            />

                            {/* Thumbnail File Input */}
                            <p className="text-left text-slate-400">
                                Thumbnail:
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setEditedVideo({
                                            ...editedVideo,
                                            thumbnail: file,
                                        });
                                    }
                                }}
                                className="mb-4 p-2 w-full rounded bg-gray-800 text-slate-50"
                            />

                            {/* Description Textarea */}
                            <p className="text-left text-slate-400">
                                Description:
                            </p>
                            <textarea
                                placeholder="Description"
                                value={editedVideo.description}
                                onChange={(e) =>
                                    setEditedVideo({
                                        ...editedVideo,
                                        description: e.target.value,
                                    })
                                }
                                className="mb-4 p-2 w-full rounded bg-gray-800 text-slate-50"
                            ></textarea>

                            {/* Buttons */}
                            <div className="flex justify-center">
                                <button
                                    className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                    onClick={handleEdit}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Popup */}
                {showDeletePopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-gray-800 p-6 rounded text-center">
                            <h2 className="text-2xl font-bold mb-4">
                                Delete Video
                            </h2>
                            <p className="mb-4">
                                Are you sure you want to delete this video? Once
                                deleted, you will not be able to recover it.
                            </p>
                            <button
                                className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                onClick={() => setShowDeletePopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    );
}

export default Admin;

export const fetchSelfVideos = async () => {
    try {
        const response = await axios.get(
            `http://localhost:8000/api/v1/videos/get-self-videos`,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching videos:", error.message);
        return [];
    }
};
