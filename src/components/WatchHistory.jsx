import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import VideoCard from "./VideoCard";

const WatchHistory = () => {
    const { userDetails } = useSelector((state) => state.auth);
    const [history, setHistory] = useState([]); // array of video objects
    const [loading, setLoading] = useState(true);

    // Load history from localStorage or userDetails
    useEffect(() => {
        let videoIds = [];
        // Prefer localStorage for removals
        const local = localStorage.getItem("watchHistory");
        if (local) {
            try {
                videoIds = JSON.parse(local);
            } catch {
                videoIds = userDetails.history || [];
            }
        } else {
            videoIds = userDetails.watchHistory || [];
        }
        if (!videoIds.length) {
            setHistory([]);
            setLoading(false);
            return;
        }
        // Fetch video objects for these IDs
        axios
            .get("http://localhost:8000/api/v1/videos/get-all-videos")
            .then((res) => {
                const allVideos = res.data.data || [];
                // Only keep videos in history
                setHistory(
                    videoIds
                        .map((id) => allVideos.find((v) => v._id === id))
                        .filter(Boolean)
                );
            })
            .finally(() => setLoading(false));
    }, [userDetails]);

    // Remove video from history (localStorage)
    const handleRemove = (videoId) => {
        let videoIds = [];
        const local = localStorage.getItem("watchHistory");
        if (local) {
            try {
                videoIds = JSON.parse(local);
            } catch {
                videoIds = userDetails.history || [];
            }
        } else {
            videoIds = userDetails.history || [];
        }
        videoIds = videoIds.filter((id) => id !== videoId);
        localStorage.setItem("watchHistory", JSON.stringify(videoIds));
        setHistory((prev) => prev.filter((v) => v._id !== videoId));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center mt-20 py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Watch History</h1>
            {history.length === 0 ? (
                <div className="text-2xl text-gray-400 mt-20">
                    No watch history found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl">
                    {history.map((video) => (
                        <div key={video._id} className="relative group">
                            <VideoCard video={video} />
                            <button
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-800 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10 opacity-80 group-hover:opacity-100 transition"
                                onClick={() => handleRemove(video._id)}
                                title="Remove from history"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchHistory;
