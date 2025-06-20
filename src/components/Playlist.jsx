import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import VideoCard from "./VideoCard";

const Playlist = () => {
    const { userDetails, isLoggedIn } = useSelector((state) => state.auth);
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        video: [],
    });
    const [editingId, setEditingId] = useState(null);
    const [showVideosModal, setShowVideosModal] = useState(false);
    const [activePlaylistId, setActivePlaylistId] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // For add-video-to-playlist modal
    const [showAddVideoModal, setShowAddVideoModal] = useState(false);
    const [allVideos, setAllVideos] = useState([]);

    // Fetch playlists
    const fetchPlaylists = async () => {
        if (!userDetails?._id) return;
        setIsLoading(true);
        setError("");
        try {
            const res = await axios.get(
                `http://localhost:8000/api/v1/users/${userDetails._id}/playlists`,
                { withCredentials: true }
            );
            setPlaylists(res.data.data || []);
        } catch (err) {
            setError("Failed to load playlists.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) fetchPlaylists();
    }, [isLoggedIn, userDetails]);

    // Handle form open for create/edit
    const openForm = (playlist = null) => {
        if (playlist) {
            setFormData({
                name: playlist.name,
                description: playlist.description,
                video: playlist.video || [],
            });
            setEditingId(playlist._id);
        } else {
            setFormData({ name: "", description: "", video: [] });
            setEditingId(null);
        }
        setShowForm(true);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            if (editingId) {
                // Update
                await axios.patch(
                    `http://localhost:8000/api/v1/playlists/${editingId}`,
                    { ...formData },
                    { withCredentials: true }
                );
            } else {
                // Create
                await axios.post(
                    `http://localhost:8000/api/v1/playlists`,
                    { ...formData, owner: userDetails._id },
                    { withCredentials: true }
                );
            }
            setShowForm(false);
            fetchPlaylists();
        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to save playlist."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this playlist?")) return;
        setIsLoading(true);
        setError("");
        try {
            await axios.delete(`http://localhost:8000/api/v1/playlists/${id}`, {
                withCredentials: true,
            });
            fetchPlaylists();
        } catch (err) {
            setError("Failed to delete playlist.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch video details for a playlist using the backend playlist details endpoint
    const fetchVideosForPlaylist = async (playlistId) => {
        if (!playlistId) return [];
        try {
            const res = await axios.get(
                `http://localhost:8000/api/v1/playlists/${playlistId}`,
                { withCredentials: true }
            );
            // The backend should return the playlist with a 'video' field containing video objects or an array of video IDs
            // If video objects are returned:
            if (
                res.data.data &&
                Array.isArray(res.data.data.video) &&
                typeof res.data.data.video[0] === "object"
            ) {
                return res.data.data.video;
            }
            // If only IDs are returned, fallback to empty array
            return [];
        } catch (err) {
            return [];
        }
    };

    // Store video objects for each playlist
    const [playlistVideos, setPlaylistVideos] = useState({});

    useEffect(() => {
        // For each playlist, fetch its videos using the playlist details endpoint
        const fetchAll = async () => {
            const newPlaylistVideos = {};
            for (const playlist of playlists) {
                if (playlist._id) {
                    newPlaylistVideos[playlist._id] =
                        await fetchVideosForPlaylist(playlist._id);
                }
            }
            setPlaylistVideos(newPlaylistVideos);
        };
        if (playlists.length > 0) fetchAll();
    }, [playlists]);

    // Remove video from playlist in edit mode
    const handleRemoveVideo = (videoId) => {
        setFormData((prev) => ({
            ...prev,
            video: prev.video.filter((id) => id !== videoId),
        }));
    };

    // Open modal to view playlist videos
    const openVideosModal = (playlistId) => {
        setActivePlaylistId(playlistId);
        setShowVideosModal(true);
    };

    // Fetch all videos for add-to-playlist modal
    const fetchAllVideos = async () => {
        try {
            const res = await axios.get(
                "http://localhost:8000/api/v1/videos/get-all-videos"
            );
            setAllVideos(res.data.data || []);
        } catch (err) {
            setAllVideos([]);
        }
    };

    // Open add-video modal (only in edit mode)
    const openAddVideoModal = () => {
        fetchAllVideos();
        setShowAddVideoModal(true);
    };

    // Add video to playlist (edit mode)
    const handleAddVideoToPlaylist = (videoId) => {
        if (!formData.video.includes(videoId)) {
            setFormData((prev) => ({
                ...prev,
                video: [...prev.video, videoId],
            }));
        }
        setShowAddVideoModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center mt-20 py-10 px-4">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Playlists</h1>
                    <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                        onClick={() => {
                            openForm();
                            setEditMode(false);
                        }}
                    >
                        + New Playlist
                    </button>
                </div>
                {isLoading && <p className="text-lg text-center">Loading...</p>}
                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}
                {!isLoading && playlists.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="text-6xl font-bold text-gray-400 mb-4">
                            No playlists found
                        </span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist._id}
                            className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col cursor-pointer"
                            onClick={() =>
                                !editMode && openVideosModal(playlist._id)
                            }
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-semibold truncate">
                                    {playlist.name}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        className="text-blue-400 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openForm(playlist);
                                            setEditMode(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-400 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(playlist._id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {playlistVideos[playlist._id] &&
                                playlistVideos[playlist._id].length > 0 ? (
                                    playlistVideos[playlist._id].map(
                                        (video) => (
                                            <div
                                                key={video._id}
                                                className="w-24 h-16 relative"
                                            >
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </div>
                                        )
                                    )
                                ) : (
                                    <span className="text-gray-500 text-sm">
                                        No videos
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Playlist Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <form
                        className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-lg"
                        onSubmit={handleSubmit}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4">
                            {editingId ? "Edit Playlist" : "Create Playlist"}
                        </h2>
                        <label className="block mb-2 text-gray-300">Name</label>
                        <input
                            className="w-full mb-4 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                        {/* Only show video thumbnails in edit mode */}

                        {editMode && (
                            <div className="mb-6">
                                <div className="flex flex-wrap gap-3 items-center">
                                    {/* Video thumbnails */}
                                    {formData.video.length === 0 && (
                                        <span className="text-gray-500 text-sm">
                                            No videos
                                        </span>
                                    )}
                                    {formData.video.map((vidId) => {
                                        let videoObj = null;
                                        for (const vids of Object.values(
                                            playlistVideos
                                        )) {
                                            videoObj =
                                                vids.find(
                                                    (v) => v._id === vidId
                                                ) || videoObj;
                                        }
                                        return (
                                            <div
                                                key={vidId}
                                                className="relative group"
                                            >
                                                {videoObj && (
                                                    <img
                                                        src={videoObj.thumbnail}
                                                        alt="thumb"
                                                        className="w-20 h-16 object-cover rounded-lg border-2 border-gray-800 group-hover:opacity-80 transition"
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-800 border-2 border-white"
                                                    onClick={() =>
                                                        handleRemoveVideo(vidId)
                                                    }
                                                    title="Remove video"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {/* + Button beside videos */}
                                    <button
                                        type="button"
                                        className="flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full w-10 h-10 text-2xl font-bold shadow-lg border-2 border-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                                        title="Add video to playlist"
                                        onClick={openAddVideoModal}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 4.5v15m7.5-7.5h-15"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                                disabled={isLoading}
                            >
                                {editingId ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* Playlist Videos Modal */}
            {showVideosModal && activePlaylistId && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={() => setShowVideosModal(false)}
                >
                    <div
                        className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4">
                            Playlist Videos
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {playlistVideos[activePlaylistId] &&
                            playlistVideos[activePlaylistId].length > 0 ? (
                                playlistVideos[activePlaylistId].map(
                                    (video) => (
                                        <a
                                            key={video._id}
                                            href={`/playback/${video._id}`}
                                            className="block group"
                                        >
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-32 object-cover rounded group-hover:opacity-80 transition"
                                            />
                                            <div className="mt-2 text-sm text-white truncate">
                                                {video.title}
                                            </div>
                                        </a>
                                    )
                                )
                            ) : (
                                <span className="text-gray-500 text-sm">
                                    No videos
                                </span>
                            )}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded"
                                onClick={() => setShowVideosModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Video Modal */}
            {showAddVideoModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={() => setShowAddVideoModal(false)}
                >
                    <div
                        className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4">
                            Add Video to Playlist
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {allVideos.filter(
                                (v) => !formData.video.includes(v._id)
                            ).length > 0 ? (
                                allVideos
                                    .filter(
                                        (v) => !formData.video.includes(v._id)
                                    )
                                    .map((video) => (
                                        <button
                                            key={video._id}
                                            type="button"
                                            onClick={() =>
                                                handleAddVideoToPlaylist(
                                                    video._id
                                                )
                                            }
                                            className="group focus:outline-none"
                                        >
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-32 object-cover rounded group-hover:opacity-80 transition"
                                            />
                                            <div className="mt-2 text-sm text-white truncate">
                                                {video.title}
                                            </div>
                                        </button>
                                    ))
                            ) : (
                                <span className="text-gray-500 text-sm">
                                    No videos available to add
                                </span>
                            )}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded"
                                onClick={() => setShowAddVideoModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlist;
