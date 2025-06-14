import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

// Helper for time ago formatting
function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Helper to normalize user info from comment or reply
function getUserDetails(comment) {
    if (comment.userDetails) return comment.userDetails;
    if (Array.isArray(comment.owner) && comment.owner.length > 0)
        return comment.owner[0];
    if (typeof comment.owner === "object" && comment.owner !== null)
        return comment.owner;
    return {};
}

const CommentSection = ({ videoId }) => {
    const { userDetails, isLoggedIn } = useSelector((state) => state.auth);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState({}); // { [commentId]: "" }
    const [showReplyBox, setShowReplyBox] = useState({}); // { [commentId]: true/false }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState({}); // { [commentId]: true/false }
    const [editContent, setEditContent] = useState({}); // { [commentId]: "new content" }
    const [menuOpen, setMenuOpen] = useState({}); // { [commentId]: true/false }
    const menuRefs = useRef({});

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            Object.keys(menuRefs.current).forEach((id) => {
                if (
                    menuRefs.current[id] &&
                    !menuRefs.current[id].contains(event.target)
                ) {
                    setMenuOpen((prev) => ({ ...prev, [id]: false }));
                }
            });
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch top-level comments for the video
    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `http://localhost:8000/api/v1/comments/get-all-comments/${videoId}`,
                    { withCredentials: true }
                );
                // Normalize comments: add empty replies array
                const normalized = (res.data.data || []).map((c) => ({
                    ...c,
                    replies: [],
                }));
                setComments(normalized);
            } catch (err) {
                setError("Failed to load comments.");
            } finally {
                setLoading(false);
            }
        };
        if (videoId) fetchComments();
    }, [videoId]);

    // Fetch replies for a comment
    const fetchReplies = async (commentId) => {
        try {
            const res = await axios.get(
                `http://localhost:8000/api/v1/comments/${commentId}/replies`,
                { withCredentials: true }
            );
            return res.data.data || [];
        } catch {
            return [];
        }
    };

    // Add a new comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(
                `http://localhost:8000/api/v1/comments/add-comment/${videoId}`,
                { content: commentContent },
                { withCredentials: true }
            );
            // Add empty replies array to new comment
            setComments([{ ...res.data.data, replies: [] }, ...comments]);
            setCommentContent("");
        } catch {
            setError("Failed to add comment.");
        } finally {
            setLoading(false);
        }
    };

    // Add a reply to a comment
    const handleAddReply = async (parentId) => {
        if (!replyContent[parentId]?.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(
                `http://localhost:8000/api/v1/comments/${parentId}/replies`,
                { content: replyContent[parentId] },
                { withCredentials: true }
            );
            // Fetch the reply again to get user info (owner)
            const replyId = res.data.data._id;
            const replyRes = await axios.get(
                `http://localhost:8000/api/v1/comments/${parentId}/replies`,
                { withCredentials: true }
            );
            // Find the new reply with full user info
            const newReply = (replyRes.data.data || []).find(
                (r) => r._id === replyId
            );
            setComments((prev) =>
                prev.map((c) =>
                    c._id === parentId
                        ? {
                              ...c,
                              replies: [newReply, ...(c.replies || [])],
                          }
                        : c
                )
            );
            setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
            setShowReplyBox((prev) => ({ ...prev, [parentId]: false }));
        } catch {
            setError("Failed to add reply.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle reply box
    const toggleReplyBox = (commentId) => {
        setShowReplyBox((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    // Load replies for a comment (on demand)
    const handleLoadReplies = async (commentId) => {
        setLoading(true);
        try {
            const replies = await fetchReplies(commentId);
            // Normalize replies: ensure user field is always present
            const normalizedReplies = replies.map((r) => ({
                ...r,
                replies: [], // No nested replies
            }));
            setComments((prev) =>
                prev.map((c) =>
                    c._id === commentId
                        ? { ...c, replies: normalizedReplies }
                        : c
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // Edit comment or reply
    const handleEdit = (commentId, isReply, parentId) => {
        setEditing((prev) => ({ ...prev, [commentId]: true }));
        setEditContent((prev) => ({
            ...prev,
            [commentId]:
                comments
                    .flatMap((c) => [c, ...(c.replies || [])])
                    .find((c) => c._id === commentId)?.content || "",
        }));
    };

    // Save edited comment or reply
    const handleSaveEdit = async (commentId, isReply, parentId) => {
        setLoading(true);
        try {
            if (isReply) {
                await axios.patch(
                    `http://localhost:8000/api/v1/comments/${parentId}/replies/${commentId}`,
                    { content: editContent[commentId] },
                    { withCredentials: true }
                );
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === parentId
                            ? {
                                  ...c,
                                  replies: c.replies.map((r) =>
                                      r._id === commentId
                                          ? {
                                                ...r,
                                                content: editContent[commentId],
                                            }
                                          : r
                                  ),
                              }
                            : c
                    )
                );
            } else {
                await axios.patch(
                    `http://localhost:8000/api/v1/comments/update-comment/${commentId}`,
                    { content: editContent[commentId] },
                    { withCredentials: true }
                );
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === commentId
                            ? { ...c, content: editContent[commentId] }
                            : c
                    )
                );
            }
            setEditing((prev) => ({ ...prev, [commentId]: false }));
        } catch {
            setError("Failed to update.");
        } finally {
            setLoading(false);
        }
    };

    // Delete comment or reply
    const handleDelete = async (commentId, isReply, parentId) => {
        setLoading(true);
        try {
            if (isReply) {
                await axios.delete(
                    `http://localhost:8000/api/v1/comments/${parentId}/replies/${commentId}`,
                    { withCredentials: true }
                );
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === parentId
                            ? {
                                  ...c,
                                  replies: c.replies.filter(
                                      (r) => r._id !== commentId
                                  ),
                              }
                            : c
                    )
                );
            } else {
                await axios.delete(
                    `http://localhost:8000/api/v1/comments/delete-comment/${commentId}`,
                    { withCredentials: true }
                );
                setComments((prev) => prev.filter((c) => c._id !== commentId));
            }
        } catch {
            setError("Failed to delete.");
        } finally {
            setLoading(false);
        }
    };

    // Render a single comment and its replies
    const renderComment = (comment, depth = 0, parentId = null) => {
        const user = getUserDetails(comment);
        const isOwner = userDetails && user && userDetails._id === user._id;
        const isReply = !!parentId;
        return (
            <div key={comment._id} className={`mb-4 ml-${depth * 6}`}>
                <div className="flex items-start gap-3">
                    <img
                        src={user.avatar || "/avatar.png"}
                        alt={user.fullName || user.username || "User"}
                        className="w-8 h-8 rounded-full object-cover border border-gray-700"
                    />
                    <div className="flex-1">
                        <div className="bg-gray-800 rounded-lg px-4 py-2 relative">
                            <div className="font-semibold text-white flex items-center gap-2">
                                {user.fullName || user.username || "User"}
                                <span className="text-xs text-gray-400 ml-2">
                                    {timeAgo(comment.createdAt)}
                                </span>
                                {isOwner && (
                                    <div
                                        className="relative"
                                        ref={(el) =>
                                            (menuRefs.current[comment._id] = el)
                                        }
                                    >
                                        <button
                                            className="ml-2 p-1 rounded-full hover:bg-gray-700 focus:outline-none"
                                            onClick={() =>
                                                setMenuOpen((prev) => ({
                                                    ...prev,
                                                    [comment._id]:
                                                        !prev[comment._id],
                                                }))
                                            }
                                        >
                                            <svg
                                                width="20"
                                                height="20"
                                                fill="currentColor"
                                                className="text-gray-400"
                                                viewBox="0 0 20 20"
                                            >
                                                <circle cx="4" cy="10" r="2" />
                                                <circle cx="10" cy="10" r="2" />
                                                <circle cx="16" cy="10" r="2" />
                                            </svg>
                                        </button>
                                        {menuOpen[comment._id] && (
                                            <div className="absolute right-0 mt-2 w-28 bg-gray-900 border border-gray-700 rounded shadow-lg z-10">
                                                <button
                                                    className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-800"
                                                    onClick={() => {
                                                        setMenuOpen((prev) => ({
                                                            ...prev,
                                                            [comment._id]: false,
                                                        }));
                                                        handleEdit(
                                                            comment._id,
                                                            isReply,
                                                            parentId
                                                        );
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                                                    onClick={() => {
                                                        setMenuOpen((prev) => ({
                                                            ...prev,
                                                            [comment._id]: false,
                                                        }));
                                                        handleDelete(
                                                            comment._id,
                                                            isReply,
                                                            parentId
                                                        );
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="text-gray-200 mt-1">
                                {editing[comment._id] ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSaveEdit(
                                                comment._id,
                                                isReply,
                                                parentId
                                            );
                                        }}
                                    >
                                        <input
                                            type="text"
                                            value={
                                                editContent[comment._id] || ""
                                            }
                                            onChange={(e) =>
                                                setEditContent((prev) => ({
                                                    ...prev,
                                                    [comment._id]:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                            type="submit"
                                            className="ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="ml-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                            onClick={() =>
                                                setEditing((prev) => ({
                                                    ...prev,
                                                    [comment._id]: false,
                                                }))
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    comment.content
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {/* Only allow reply to top-level comments */}
                            {comment.parentComment == null && (
                                <button
                                    className="text-xs text-purple-400 hover:underline"
                                    onClick={() => toggleReplyBox(comment._id)}
                                >
                                    Reply
                                </button>
                            )}
                            {/* Only show Load Replies for top-level comments with no replies loaded */}
                            {comment.parentComment == null &&
                                !comment.replies.length && (
                                    <button
                                        className="text-xs text-gray-400 hover:underline"
                                        onClick={() =>
                                            handleLoadReplies(comment._id)
                                        }
                                    >
                                        Load Replies
                                    </button>
                                )}
                        </div>
                        {showReplyBox[comment._id] && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddReply(comment._id);
                                }}
                                className="mt-2"
                            >
                                <input
                                    type="text"
                                    value={replyContent[comment._id] || ""}
                                    onChange={(e) =>
                                        setReplyContent((prev) => ({
                                            ...prev,
                                            [comment._id]: e.target.value,
                                        }))
                                    }
                                    placeholder="Write a reply..."
                                    className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    type="submit"
                                    className="mt-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                    Reply
                                </button>
                            </form>
                        )}
                        {/* Render replies recursively (only one level deep) */}
                        {Array.isArray(comment.replies) &&
                            comment.replies.length > 0 && (
                                <div className="mt-2 ml-6">
                                    {comment.replies.map((reply) =>
                                        renderComment(
                                            reply,
                                            depth + 1,
                                            comment._id
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">Comments</h3>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {isLoggedIn && (
                <form onSubmit={handleAddComment} className="mb-6">
                    <input
                        type="text"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        disabled={loading}
                    >
                        {loading ? "Posting..." : "Post Comment"}
                    </button>
                </form>
            )}
            {loading && <div className="text-gray-400">Loading...</div>}
            <div>
                {comments.length === 0 && !loading && (
                    <div className="text-gray-400">No comments yet.</div>
                )}
                {comments.map((comment) =>
                    !comment.parentComment ? renderComment(comment) : null
                )}
            </div>
        </div>
    );
};

export default CommentSection;
