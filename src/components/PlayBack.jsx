import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import axios from "axios";

const PlayBack = () => {
    const navigate = useNavigate();
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null); // Track which comment is being edited
    const [editedContent, setEditedContent] = useState(""); // Track the edited content
    const videoRef = useRef(null);

    const { playbackVideo, videoComments, otherVideos } = useLoaderData();

    // Update state when loader data changes
    useEffect(() => {
        setVideo(playbackVideo);
        setComments(videoComments);
        setRelatedVideos(otherVideos);
    }, [playbackVideo, videoComments, otherVideos]);

    // Redirect to login if video data is not available
    useEffect(() => {
        if (!playbackVideo) {
            navigate("/login");
        }
    }, [playbackVideo, navigate]);

    // Handle clicking on a related video
    const handleRelatedVideoClick = (relatedVideo) => {
        navigate(`/playback/${relatedVideo._id}`);
    };

    // Handle adding a comment
    const handleAddComment = async () => {
        if (!commentContent) return;
        try {
            const response = await axios.post(
                `http://localhost:8000/api/v1/comments/add-comment/${videoId}`,
                { content: commentContent },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setComments([response.data.data, ...comments]); // Add the new comment to the list
            setCommentContent(""); // Clear the comment input
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Handle updating a comment
    const handleUpdateComment = async (commentId, newContent) => {
        try {
            const authToken = localStorage.getItem("token");
            const response = await axios.patch(
                `http://localhost:8000/api/v1/comments/update-comment/${commentId}`,
                { content: newContent },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data.success) {
                setComments(
                    comments.map((comment) =>
                        comment._id === commentId
                            ? { ...comment, content: newContent }
                            : comment
                    )
                );
                setEditingCommentId(null); // Stop editing after saving
                setEditedContent(""); // Clear the edited content
            } else {
                throw new Error("Failed to update comment");
            }
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    // Handle deleting a comment
    const handleDeleteComment = async (commentId) => {
        try {
            await axios.post(
                `http://localhost:8000/api/v1/comments/delete-comment/${commentId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setComments(
                comments.filter((comment) => comment._id !== commentId)
            ); // Remove the deleted comment
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    // Handle starting the edit process
    const handleEditClick = (commentId, currentContent) => {
        setEditingCommentId(commentId); // Set the comment being edited
        setEditedContent(currentContent); // Set the current content for editing
    };

    // Handle canceling the edit process
    const handleCancelEdit = () => {
        setEditingCommentId(null); // Stop editing
        setEditedContent(""); // Clear the edited content
    };

    if (!video) return <div>Loading...</div>; // Show loading state while fetching video

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
                        <div className="flex items-center mt-6">
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
                                    {video.owner.username || "No Name"}
                                </p>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="mt-6">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentContent}
                                onChange={(e) =>
                                    setCommentContent(e.target.value)
                                }
                                onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                        handleAddComment();
                                    }
                                }}
                                className="w-full p-2 bg-gray-800 text-white rounded-lg"
                            />
                            <button
                                onClick={handleAddComment}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                            >
                                Post
                            </button>
                            <div className="mt-4 space-y-4">
                                {comments.map((comment) => (
                                    <div
                                        key={comment._id}
                                        id={comment._id}
                                        className="p-4 bg-gray-700 rounded-lg"
                                    >
                                        {editingCommentId === comment._id ? (
                                            // Edit mode: Show input field
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    value={editedContent}
                                                    onChange={(e) =>
                                                        setEditedContent(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 bg-gray-800 text-white rounded-lg"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateComment(
                                                                comment._id,
                                                                editedContent
                                                            )
                                                        }
                                                        className="text-green-500"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleCancelEdit
                                                        }
                                                        className="text-red-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View mode: Show comment content
                                            <div>
                                                <p className="text-white">
                                                    {comment.content}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    {comment.userDetails
                                                        .username ===
                                                        localStorage.getItem(
                                                            "username"
                                                        ) && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleEditClick(
                                                                        comment._id,
                                                                        comment.content
                                                                    )
                                                                }
                                                                className="text-yellow-400"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteComment(
                                                                        comment._id
                                                                    )
                                                                }
                                                                className="text-red-500"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                            <div
                                key={relatedVideo._id}
                                className="flex items-center cursor-pointer"
                                onClick={() =>
                                    handleRelatedVideoClick(relatedVideo)
                                }
                            >
                                <img
                                    src={
                                        relatedVideo.thumbnail ||
                                        "/default-thumbnail.jpg"
                                    }
                                    alt="Thumbnail"
                                    className="w-16 h-16 rounded-md mr-4"
                                />
                                <div>
                                    <p className="text-gray-300">
                                        {relatedVideo.title}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        {relatedVideo.owner.username}
                                    </p>
                                </div>
                            </div>
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
        const authToken = localStorage.getItem("token");
        console.log(videoId);

        const response = await axios.get(
            `http://localhost:8000/api/v1/videos/get-video/${videoId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        playbackVideo = response.data.data; // the fetched video data
    } catch (error) {
        console.error("Error fetching video:", error);
    }

    try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(
            `http://localhost:8000/api/v1/comments/get-all-comments/${videoId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
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
            (v) => v._id !== videoId // Exclude the current video
        );
        otherVideos = filteredVideos;
    } catch (error) {
        console.error("Error fetching related videos:", error);
    }

    return { playbackVideo, videoComments, otherVideos };
};
