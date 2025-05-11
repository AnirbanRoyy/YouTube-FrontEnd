import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import axios from "axios";
import VideoCard from "./VideoCard";

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
                        <VideoCard key={video._id} video={video} />
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
