import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import axios from "axios";

const VideoCart = () => {
    const videos = useLoaderData();
    const navigate = useNavigate();

    // Navigate to playback page with the video ID
    const handleVideoClick = (video) => {
        console.log(video._id);
        
        navigate(`/playback/${video._id}`); // Only pass the video ID
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center py-10 px-5">
            <div className="flex flex-col items-center w-full max-w-7xl">
                <h1 className="text-3xl font-bold mb-10 text-center">Videos</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {videos.map((video) => (
                        <div
                            key={video._id}
                            className="bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleVideoClick(video)}
                        >
                            {/* Thumbnail */}
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-40 object-cover"
                            />

                            {/* Video Details */}
                            <div className="p-4">
                                <h2 className="text-lg font-semibold">
                                    {video.title}
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    {/* Avatar */}
                                    <img
                                        src={video.owner.avatar}
                                        alt={video.owner.fullName}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <p className="text-sm text-gray-400">
                                        {video.owner.fullName || "Anonymous"}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                    {video.channelName}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {video.views} views
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoCart;

export const fetchVideos = async () => {
    try {
        const response = await axios.get(
            "http://localhost:8000/api/v1/videos/get-all-videos"
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching videos:", error.message);
    }
};