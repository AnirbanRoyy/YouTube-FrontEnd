import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import VideoCard from "./VideoCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import CommentSection from "./CommentSection";
import Playlist from "./Playlist";

function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    if (diffSec > 0) return `${diffSec} second${diffSec > 1 ? "s" : ""} ago`;
    return "just now";
}

const PlayBack = () => {
    const navigate = useNavigate();
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const videoRef = useRef(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [playlistLoading, setPlaylistLoading] = useState(false);
    const [playlistError, setPlaylistError] = useState("");
    const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
    const [addStatus, setAddStatus] = useState("");

    const { playbackVideo, otherVideos } = useLoaderData();
    const { userDetails, isLoggedIn } = useSelector((state) => state.auth);

    useEffect(() => {
        setVideo(playbackVideo);
        setRelatedVideos(otherVideos);
    }, [playbackVideo, otherVideos]);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    const handleRelatedVideoClick = (relatedVideo) => {
        navigate(`/playback/${relatedVideo._id}`);
    };

    // Fetch user's playlists
    const fetchUserPlaylists = async () => {
        if (!userDetails?._id) return;
        setPlaylistLoading(true);
        setPlaylistError("");
        try {
            const res = await axios.get(
                `http://localhost:8000/api/v1/users/${userDetails._id}/playlists`,
                { withCredentials: true }
            );
            setUserPlaylists(res.data.data || []);
        } catch (err) {
            setPlaylistError("Failed to load playlists.");
        } finally {
            setPlaylistLoading(false);
        }
    };

    // Open modal and fetch playlists
    const handleOpenPlaylistModal = () => {
        setShowPlaylistModal(true);
        fetchUserPlaylists();
        setAddStatus("");
        setSelectedPlaylistId("");
        setNewPlaylistName("");
        setNewPlaylistDesc("");
    };

    // Add video to selected playlist
    const handleAddToPlaylist = async (e) => {
        e.preventDefault();
        setAddStatus("");
        try {
            if (selectedPlaylistId) {
                // Update existing playlist
                await axios.patch(
                    `http://localhost:8000/api/v1/playlists/${selectedPlaylistId}`,
                    { video: [video._id] },
                    { withCredentials: true }
                );
                setAddStatus("Added to playlist!");
            } else if (newPlaylistName) {
                // Create new playlist
                await axios.post(
                    `http://localhost:8000/api/v1/playlists`,
                    {
                        name: newPlaylistName,
                        description: newPlaylistDesc,
                        video: [video._id],
                        owner: userDetails._id,
                    },
                    { withCredentials: true }
                );
                setAddStatus("Playlist created and video added!");
            } else {
                setAddStatus("Please select or enter a playlist name.");
                return;
            }
            fetchUserPlaylists();
            setShowPlaylistModal(false); // Close modal after successful add
        } catch (err) {
            setAddStatus("Failed to add to playlist.");
        }
    };

    if (!video)
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <span className="loader"></span>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="flex pl-32 mt-10 py-12 px-4">
                {/* Left side - Video player */}
                <div className="flex-1 mr-8">
                    <h1 className="text-3xl font-bold text-gray-100 text-center mb-4">
                        {video.title || "Untitled Video"}
                    </h1>
                    {/* Add to Playlist Button - moved just below the title for visibility */}
                    <div className="flex justify-end mb-2">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-lg"
                            onClick={handleOpenPlaylistModal}
                        >
                            Add to Playlist
                        </button>
                    </div>
                    <div className="max-w-screen-md mx-auto rounded-lg overflow-hidden shadow-lg p-4">
                        {/* Responsive 16:9 Aspect Ratio Container */}
                        <div
                            className="relative w-full"
                            style={{ paddingTop: "56.25%" }}
                        >
                            <video
                                ref={videoRef}
                                src={video.videoFile}
                                controls
                                className="absolute top-0 left-0 w-full h-full rounded-lg object-cover bg-black"
                                muted={false}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* Video Details */}
                        <div className="mt-4 text-white">
                            <p>
                                {video.description ||
                                    "No description available."}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {video.views} Views ·{" "}
                                {new Date(video.createdAt).toLocaleString()}
                            </p>
                        </div>

                        {/* Channel Information */}
                        <div
                            className="flex items-center mt-6 cursor-pointer"
                            onClick={() =>
                                navigate(`/profile/${video.owner.username}`)
                            }
                        >
                            <img
                                src={
                                    video.owner.avatar || "/default-avatar.png"
                                }
                                alt={video.owner.fullName || "Anonymous"}
                                className="w-12 h-12 rounded-full mr-4"
                            />
                            <div>
                                <p className="text-lg font-semibold text-slate-200">
                                    {video.owner.fullName || "Anonymous"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    @{video.owner.username || "No Name"}
                                </p>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="mt-6">
                            <CommentSection videoId={video._id} />
                        </div>
                    </div>
                </div>

                {/* Right side - Related videos */}
                <div className="w-1/4 bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4">
                    <h2 className="text-xl text-gray-300 mb-6">
                        Related Videos
                    </h2>
                    <div className="space-y-4">
                        {relatedVideos.map((relatedVideo) => (
                            <VideoCard
                                key={relatedVideo._id}
                                video={relatedVideo}
                                hideChannel={false}
                                onClick={() =>
                                    handleRelatedVideoClick(relatedVideo)
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Playlist Modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <form
                        className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-lg"
                        onSubmit={handleAddToPlaylist}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-white">
                            Add to Playlist
                        </h2>
                        {playlistLoading ? (
                            <p className="text-gray-300">
                                Loading playlists...
                            </p>
                        ) : (
                            <>
                                <label className="block mb-2 text-gray-300">
                                    Select Playlist
                                </label>
                                <select
                                    className="w-full mb-4 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                                    value={selectedPlaylistId}
                                    onChange={(e) =>
                                        setSelectedPlaylistId(e.target.value)
                                    }
                                >
                                    <option value="">-- Select --</option>
                                    {userPlaylists.map((pl) => (
                                        <option key={pl._id} value={pl._id}>
                                            {pl.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="text-center text-gray-400 mb-2">
                                    or
                                </div>
                                <label className="block mb-2 text-gray-300">
                                    New Playlist Name
                                </label>
                                <input
                                    className="w-full mb-2 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) =>
                                        setNewPlaylistName(e.target.value)
                                    }
                                    placeholder="Enter new playlist name"
                                />
                                <label className="block mb-2 text-gray-300">
                                    Description (optional)
                                </label>
                                <input
                                    className="w-full mb-4 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                                    type="text"
                                    value={newPlaylistDesc}
                                    onChange={(e) =>
                                        setNewPlaylistDesc(e.target.value)
                                    }
                                    placeholder="Enter description"
                                />
                            </>
                        )}
                        {addStatus && (
                            <p className="text-center text-green-400 mb-2">
                                {addStatus}
                            </p>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                                onClick={() => setShowPlaylistModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                                disabled={playlistLoading}
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PlayBack;

export const fetchPlayBackData = async (videoId) => {
    let playbackVideo, videoComments, otherVideos;

    try {
        const response = await axios.get(
            `http://localhost:8000/api/v1/videos/get-video/${videoId}`,
            {
                withCredentials: true,
            }
        );
        playbackVideo = response.data.data;
    } catch (error) {
        console.error("Error fetching video:", error);
    }

    try {
        const response = await axios.get(
            `http://localhost:8000/api/v1/comments/get-all-comments/${videoId}`,
            {
                withCredentials: true,
            }
        );
        videoComments = response.data.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
    }

    try {
        const response = await axios.get(
            `http://localhost:8000/api/v1/videos/get-all-videos`
        );
        const filteredVideos = response.data.data.filter(
            (v) => v._id !== videoId
        );
        otherVideos = filteredVideos;
    } catch (error) {
        console.error("Error fetching related videos:", error);
    }

    return { playbackVideo, videoComments, otherVideos };
};
