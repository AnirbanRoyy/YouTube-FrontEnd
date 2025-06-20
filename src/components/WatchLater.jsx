import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SideBar from "./SideBar";

const WatchLater = () => {
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState("");
    const navigate = useNavigate();
    const { userDetails } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchWatchLater = async () => {
            if (!userDetails?._id) return;
            try {
                const playlistsRes = await axios.get(
                    `http://localhost:8000/api/v1/users/${userDetails._id}/playlists`,
                    {
                        withCredentials: true,
                    }
                );
                const watchLater = playlistsRes.data.data.find(
                    (pl) => pl.name?.toLowerCase() === "watch later"
                );
                if (watchLater) {
                    // Fetch full playlist details
                    const playlistRes = await axios.get(
                        `http://localhost:8000/api/v1/playlists/${watchLater._id}`,
                        {
                            withCredentials: true,
                        }
                    );
                    setPlaylist(playlistRes.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch Watch Later playlist", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWatchLater();
    }, [navigate, userDetails?._id]);

    // Remove video from Watch Later
    const handleRemoveVideo = async (videoId) => {
        if (!playlist?._id) return;
        setRemoving(videoId);
        try {
            const updatedVideos = playlist.video
                .map((v) => (typeof v === "string" ? v : v._id))
                .filter((id) => id !== videoId);
            await axios.patch(
                `http://localhost:8000/api/v1/playlists/${playlist._id}`,
                { video: updatedVideos },
                { withCredentials: true }
            );
            setPlaylist((prev) => ({
                ...prev,
                video: prev.video.filter((v) => (v._id || v) !== videoId),
            }));
        } catch (err) {
            alert("Failed to remove video from Watch Later");
        } finally {
            setRemoving("");
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen flex">
            <div className="flex-1 ml-40 p-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-semibold shadow"
                >
                    ← Back to Home
                </button>

                <h2 className="text-3xl font-bold mb-8 text-white">
                    Watch Later
                </h2>

                {loading ? (
                    <div className="text-white text-lg">Loading...</div>
                ) : !playlist ||
                  !playlist.video ||
                  playlist.video.length === 0 ? (
                    <div className="text-gray-400 text-lg mt-16 text-center">
                        No videos in your Watch Later playlist yet.
                        <br />
                        Add some videos to see them here!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {playlist.video.map((video) => (
                            <div
                                key={video._id}
                                className="bg-gray-800 hover:bg-gray-700 transition p-4 rounded-xl shadow-lg cursor-pointer flex flex-col relative"
                            >
                                {/* Remove (X) button */}
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-red-800 border-2 border-white z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveVideo(video._id);
                                    }}
                                    title="Remove from Watch Later"
                                    disabled={removing === video._id}
                                >
                                    ×
                                </button>
                                <div
                                    onClick={() =>
                                        navigate(`/playback/${video._id}`)
                                    }
                                >
                                    <img
                                        src={
                                            video.thumbnail ||
                                            "/default-thumbnail.png"
                                        }
                                        alt={video.title}
                                        className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-700"
                                    />
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={
                                                (Array.isArray(video.owner) &&
                                                    video.owner[0]?.avatar) ||
                                                video.owner?.avatar ||
                                                "/default-avatar.png"
                                            }
                                            alt={
                                                (Array.isArray(video.owner) &&
                                                    video.owner[0]?.username) ||
                                                video.owner?.username ||
                                                "User"
                                            }
                                            className="w-8 h-8 rounded-full mr-3 border border-gray-600"
                                        />
                                        <span className="text-slate-200 font-semibold">
                                            {(Array.isArray(video.owner) &&
                                                video.owner[0]?.username) ||
                                                video.owner?.username ||
                                                "User"}
                                        </span>
                                    </div>
                                    <div className="text-white font-bold text-lg mb-1 truncate">
                                        {video.title}
                                    </div>
                                    <div className="text-gray-400 text-sm truncate">
                                        {video.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchLater;
