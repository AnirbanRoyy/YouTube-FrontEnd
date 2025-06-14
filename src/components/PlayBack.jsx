import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import VideoCard from "./VideoCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import CommentSection from "./CommentSection";

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
                    <div className="max-w-screen-md mx-auto  rounded-lg overflow-hidden shadow-lg p-4">
                        <video
                            ref={videoRef}
                            src={video.videoFile}
                            controls
                            className="w-full h-auto rounded-lg"
                            muted={false}
                        >
                            Your browser does not support the video tag.
                        </video>

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
