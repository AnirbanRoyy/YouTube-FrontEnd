import React from "react";
import { useNavigate } from "react-router-dom";

// Helper for time ago formatting (expects a date string or Date object)
function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const VideoCard = ({ video, hideChannel, onClick }) => {
    const navigate = useNavigate();
    const handleCardClick = () => {
        if (onClick) return onClick(video);
        navigate(`/playback/${video._id}`);
    };
    return (
        <div
            className="bg-[#181818] rounded-xl shadow-lg overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform duration-200 group w-full max-w-xs mx-auto"
            onClick={handleCardClick}
        >
            {/* Thumbnail with hover zoom */}
            <div className="relative w-full h-44 overflow-hidden bg-black">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Video duration (optional) */}
                {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-xs text-white px-2 py-0.5 rounded">
                        {video.duration}
                    </span>
                )}
            </div>
            {/* Details */}
            <div className="flex gap-3 p-3">
                {/* Avatar */}
                <img
                    src={video.owner?.avatar}
                    alt={video.owner?.fullName || "User"}
                    className="w-9 h-9 rounded-full object-cover border border-gray-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${video.owner?.username}`);
                    }}
                />
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3
                        className="text-base font-semibold text-white truncate"
                        title={video.title}
                    >
                        {video.title}
                    </h3>
                    {/* Channel name (if not hidden) */}
                    {!hideChannel && (
                        <div
                            className="text-sm text-gray-400 hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${video.owner?.username}`);
                            }}
                        >
                            {video.owner?.fullName ||
                                video.channelName ||
                                "Channel"}
                        </div>
                    )}
                    {/* Views and upload date */}
                    <div className="text-xs text-gray-400 mt-0.5">
                        {video.views || 0} views •{" "}
                        {video.createdAt
                            ? timeAgo(video.createdAt)
                            : "just now"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
