import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState("tweets");
    const [tweets, setTweets] = useState([]);
    const [videos, setVideos] = useState([]);
    const [newTweetContent, setNewTweetContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    const { isLoggedIn, userDetails } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    const fetchTweets = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `http://localhost:8000/api/v1/tweets/get-all-tweets/${userDetails._id}`,
                {
                    params: { page: 1, limit: 10 },
                    withCredentials: true,
                }
            );

            setTweets(response.data.data.docs || []);
        } catch (error) {
            console.error("Error fetching tweets:", error);
            setErrorMessage("Failed to load tweets. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVideos = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                "http://localhost:8000/api/v1/videos/get-self-videos",
                {
                    withCredentials: true,
                }
            );
            setVideos(response.data.data || []);
        } catch (error) {
            console.error("Error fetching videos:", error);
            setErrorMessage("Failed to load videos. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const createTweet = async () => {
        if (!newTweetContent.trim()) return;
        try {
            const response = await axios.post(
                "http://localhost:8000/api/v1/tweets/add-tweet",
                { content: newTweetContent },
                {
                    withCredentials: true,
                }
            );
            setTweets([response.data.data, ...tweets]);
            setNewTweetContent("");
        } catch (error) {
            console.error("Error creating tweet:", error);
            setErrorMessage("Failed to create tweet. Please try again.");
        }
    };

    const updateTweet = async (tweetId, updatedContent) => {
        try {
            await axios.patch(
                `http://localhost:8000/api/v1/tweets/update-tweet/${tweetId}`,
                { content: updatedContent },
                {
                    withCredentials: true,
                }
            );
            setTweets((prevTweets) =>
                prevTweets.map((tweet) =>
                    tweet._id === tweetId
                        ? { ...tweet, content: updatedContent }
                        : tweet
                )
            );
            setEditingTweetId(null); // Exit editing mode
            setEditingContent(""); // Clear editing content
        } catch (error) {
            console.error("Error updating tweet:", error);
            setErrorMessage("Failed to update tweet. Please try again.");
        }
    };

    const deleteTweet = async (tweetId) => {
        try {
            await axios.post(
                `http://localhost:8000/api/v1/tweets/delete-tweet/${tweetId}`,
                {},
                {
                    withCredentials: true,
                }
            );
            setTweets((prevTweets) =>
                prevTweets.filter((tweet) => tweet._id !== tweetId)
            );
        } catch (error) {
            console.error("Error deleting tweet:", error);
            setErrorMessage(
                error?.response?.data?.message ||
                    "Failed to delete tweet. Please try again."
            );
        }
    };

    useEffect(() => {
        if (activeTab === "tweets") {
            fetchTweets();
        } else if (activeTab === "videos") {
            fetchVideos();
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen py-20 px-15 bg-gray-900 text-white">
            {/* Profile Header */}
            <div className="relative h-48 w-full bg-gray-700 mt-16">
                <img
                    src={
                        userDetails.coverImage ||
                        "https://via.placeholder.com/1500x300"
                    }
                    alt="Cover"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="relative -mt-16 mx-auto max-w-7xl px-10 sm:px-6 lg:px-8">
                <div className="bg-gray-800 rounded-lg shadow-lg px-6 py-4 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-full border-4 border-gray-900 overflow-hidden">
                                <img
                                    src={
                                        userDetails.avatar ||
                                        "https://via.placeholder.com/150"
                                    }
                                    alt={userDetails.fullName || "User Avatar"}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold">
                                    {userDetails.fullName || "User Name"}
                                </h1>
                                <p className="text-gray-400">
                                    @{userDetails.username || "username"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {userDetails.watchHistory?.length || 0}{" "}
                                    Videos Watched
                                </p>
                            </div>
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white">
                            Subscribe
                        </button>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <button
                            className={`${
                                activeTab === "videos"
                                    ? "bg-purple-600"
                                    : "bg-gray-700"
                            } px-4 py-2 rounded text-white`}
                            onClick={() => setActiveTab("videos")}
                        >
                            Videos
                        </button>
                        <button
                            className={`${
                                activeTab === "tweets"
                                    ? "bg-purple-600"
                                    : "bg-gray-700"
                            } px-4 py-2 rounded text-white`}
                            onClick={() => setActiveTab("tweets")}
                        >
                            Tweets
                        </button>
                        <button
                            className={`${
                                activeTab === "subscribed"
                                    ? "bg-purple-600"
                                    : "bg-gray-700"
                            } px-4 py-2 rounded text-white`}
                            onClick={() => setActiveTab("subscribed")}
                        >
                            Subscribed
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 mx-auto max-w-7xl px-4">
                {activeTab === "tweets" && (
                    <div>
                        <h2 className="text-xl font-semibold">Tweets</h2>
                        <div className="flex mt-4 space-x-4">
                            <input
                                type="text"
                                placeholder="Write a new tweet..."
                                value={newTweetContent}
                                onChange={(e) =>
                                    setNewTweetContent(e.target.value)
                                }
                                className="flex-grow px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
                            />
                            <button
                                onClick={createTweet}
                                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
                            >
                                Tweet
                            </button>
                        </div>
                        {isLoading && <p>Loading tweets...</p>}
                        {!isLoading &&
                            tweets.map((tweet) => (
                                <div
                                    key={tweet._id}
                                    className="bg-gray-800 rounded-lg p-4 mt-4 shadow-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        {editingTweetId === tweet._id ? (
                                            <div className="flex-grow">
                                                <input
                                                    type="text"
                                                    value={editingContent}
                                                    onChange={(e) =>
                                                        setEditingContent(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 bg-gray-700 text-white rounded"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() =>
                                                            updateTweet(
                                                                tweet._id,
                                                                editingContent
                                                            )
                                                        }
                                                        className="text-green-500"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingTweetId(
                                                                null
                                                            );
                                                            setEditingContent(
                                                                ""
                                                            );
                                                        }}
                                                        className="text-red-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm">
                                                    {tweet.content}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingTweetId(
                                                                tweet._id
                                                            );
                                                            setEditingContent(
                                                                tweet.content
                                                            );
                                                        }}
                                                        className="text-sm text-purple-500 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteTweet(
                                                                tweet._id
                                                            )
                                                        }
                                                        className="text-sm text-red-500 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        {errorMessage && (
                            <p className="text-red-500">{errorMessage}</p>
                        )}
                    </div>
                )}
                {activeTab === "videos" && (
                    <div>
                        <h2 className="text-xl font-semibold">Videos</h2>
                        {isLoading && <p>Loading videos...</p>}
                        {!isLoading && videos.length === 0 && (
                            <p>No videos found.</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {videos.map((video) => (
                                <div
                                    key={video._id}
                                    className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                                >
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold">
                                            {video.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {video.views} views
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Uploaded on{" "}
                                            {new Date(
                                                video.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
