import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoCard from "./VideoCard";

function timeAgo(dateString) {
    const now = new Date();
    const tweetDate = new Date(dateString);
    const diffMs = now - tweetDate;
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

const UserProfile = () => {
    const { isLoggedIn, userDetails } = useSelector((state) => state.auth);
    const { channelUserName } = useParams();
    const [channelProfile, setChannelProfile] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [activeTab, setActiveTab] = useState("tweets");
    const [tweets, setTweets] = useState([]);
    const [videos, setVideos] = useState([]);
    const [newTweetContent, setNewTweetContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [tweetsCache, setTweetsCache] = useState({});
    const [videosCache, setVideosCache] = useState({});
    const [subscribers, setSubscribers] = useState([]);
    const [subscribersCache, setSubscribersCache] = useState({});
    const [subscribedTo, setSubscribedTo] = useState([]);
    const [subscribedToCache, setSubscribedToCache] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    const username = channelUserName || userDetails?.username;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.post(
                    `http://localhost:8000/api/v1/users/get-user-channel-profile/${username}`,
                    {},
                    { withCredentials: true }
                );

                setChannelProfile(response.data.data);
                setIsSubscribed(response.data.data.isSubscribed);
                setIsOwnProfile(
                    userDetails && response.data.data._id === userDetails._id
                );
            } catch (error) {
                setErrorMessage("Failed to load channel profile.");
            }
        };
        if (userDetails) {
            fetchProfile();
        }
    }, [username, userDetails]);

    const fetchTweets = useCallback(async () => {
        if (tweetsCache[channelProfile?._id]) {
            setTweets(tweetsCache[channelProfile._id]);
            return;
        }
        try {
            setIsLoading(true);
            const response = await axios.get(
                `http://localhost:8000/api/v1/tweets/get-all-tweets/${channelProfile?._id}`,
                {
                    params: { page: 1, limit: 10 },
                    withCredentials: true,
                }
            );
            setTweets(response.data.data.docs || []);
            setTweetsCache((prev) => ({
                ...prev,
                [channelProfile._id]: response.data.data.docs || [],
            }));
        } catch (error) {
            console.error("Error fetching tweets:", error);
            setErrorMessage("Failed to load tweets. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [channelProfile?._id, tweetsCache]);

    const fetchVideos = useCallback(async () => {
        if (videosCache[channelProfile?._id]) {
            setVideos(videosCache[channelProfile._id]);
            return;
        }
        try {
            setIsLoading(true);
            const response = await axios.get(
                `http://localhost:8000/api/v1/videos/get-self-videos`,
                {
                    params: { userId: channelProfile?._id },
                    withCredentials: true,
                }
            );
            setVideos(response.data.data || []);
            setVideosCache((prev) => ({
                ...prev,
                [channelProfile._id]: response.data.data || [],
            }));
        } catch (error) {
            console.error("Error fetching videos:", error);
            setErrorMessage("Failed to load videos. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [channelProfile?._id, videosCache]);

    const fetchSubscribers = useCallback(
        async (force = false) => {
            if (!force && subscribersCache[channelProfile?._id]) {
                setSubscribers(subscribersCache[channelProfile._id]);
                return;
            }
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `http://localhost:8000/api/v1/subscriptions/get-channel-subscribers/${channelProfile?._id}`,
                    { withCredentials: true }
                );
                const subs = response.data.data || [];
                setSubscribers(subs);
                setSubscribersCache((prev) => ({
                    ...prev,
                    [channelProfile._id]: subs,
                }));
            } catch (error) {
                console.log(error);

                setErrorMessage(
                    "Failed to load subscribers. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        },
        [channelProfile?._id, subscribersCache]
    );

    const fetchSubscribedTo = useCallback(
        async (force = false) => {
            if (!force && subscribedToCache[channelProfile?._id]) {
                setSubscribedTo(subscribedToCache[channelProfile._id]);
                return;
            }
            try {
                setIsLoading(true);
                // Use a dedicated API to get the latest subscriptions with state
                const response = await axios.get(
                    `http://localhost:8000/api/v1/subscriptions/get-subscribed-channels/${channelProfile._id}`,
                    { withCredentials: true }
                );
                // Expecting response.data.data to be an array of channels with subscription state
                const subs = response.data.data || [];
                setSubscribedTo(subs);
                setSubscribedToCache((prev) => ({
                    ...prev,
                    [channelProfile._id]: subs,
                }));
            } catch (error) {
                setErrorMessage(
                    "Failed to load subscriptions. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        },
        [channelProfile?._id, subscribedToCache]
    );

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
            // Ensure the new tweet has the owner field populated like other tweets
            const newTweet = {
                ...response.data.data,
                owner: {
                    _id: userDetails._id,
                    fullName: userDetails.fullName,
                    avatar: userDetails.avatar,
                    username: userDetails.username,
                },
            };
            setTweets([newTweet, ...tweets]);
            setTweetsCache((prev) => ({
                ...prev,
                [channelProfile._id]: [
                    newTweet,
                    ...(prev[channelProfile._id] || []),
                ],
            }));
            setNewTweetContent("");
        } catch (error) {
            console.error("Error creating tweet:", error);
            setErrorMessage("Failed to create tweet. Please try again.");
        }
    };

    const updateTweet = async (tweetId, updatedContent) => {
        try {
            const response = await axios.patch(
                `http://localhost:8000/api/v1/tweets/update-tweet/${tweetId}`,
                { content: updatedContent },
                {
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setTweets((prevTweets) =>
                    prevTweets.map((tweet) =>
                        tweet._id === tweetId
                            ? { ...tweet, content: updatedContent }
                            : tweet
                    )
                );
                setTweetsCache((prev) => ({
                    ...prev,
                    [channelProfile._id]: prev[channelProfile._id].map(
                        (tweet) =>
                            tweet._id === tweetId
                                ? { ...tweet, content: updatedContent }
                                : tweet
                    ),
                }));
                setEditingTweetId(null); // Exit editing mode
                setEditingContent(""); // Clear editing content
            } else {
                throw new Error("Failed to update tweet.");
            }
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
            setTweetsCache((prev) => ({
                ...prev,
                [channelProfile._id]: prev[channelProfile._id].filter(
                    (tweet) => tweet._id !== tweetId
                ),
            }));
        } catch (error) {
            console.error("Error deleting tweet:", error);
            setErrorMessage(
                error?.response?.data?.message ||
                    "Failed to delete tweet. Please try again."
            );
        }
    };

    const handleToggleSubscription = async () => {
        try {
            const response = await axios.patch(
                `http://localhost:8000/api/v1/subscriptions/toggle-subscription/${userDetails._id}`,
                {}, // empty data payload
                { withCredentials: true }
            );
            if (typeof response.data.isSubscribed === "boolean") {
                setIsSubscribed(response.data.isSubscribed);
            } else if (typeof response.data.data?.isSubscribed === "boolean") {
                setIsSubscribed(response.data.data.isSubscribed);
            } else {
                setIsSubscribed((prev) => !prev); // fallback toggle
            }
        } catch (error) {
            setErrorMessage("Failed to toggle subscription. Please try again.");
            console.log(error?.response?.data?.message);
        }
    };

    const handleToggleSubscriptionForUser = async (userId, type) => {
        try {
            await axios.patch(
                `http://localhost:8000/api/v1/subscriptions/toggle-subscription/${userId}`,
                {},
                { withCredentials: true }
            );
            if (type === "subscribers") {
                // Update the button state locally in Subscribers tab
                setSubscribers((prev) =>
                    prev.map((u) =>
                        u._id === userId
                            ? {
                                  ...u,
                                  subscribedToSubscriber:
                                      !u.subscribedToSubscriber,
                              }
                            : u
                    )
                );
                setSubscribersCache((prev) => ({
                    ...prev,
                    [channelProfile._id]: (prev[channelProfile._id] || []).map(
                        (u) =>
                            u._id === userId
                                ? {
                                      ...u,
                                      subscribedToSubscriber:
                                          !u.subscribedToSubscriber,
                                  }
                                : u
                    ),
                }));
                // Always refresh Subscribed To tab to reflect new state
                fetchSubscribedTo(true);
            } else if (type === "subscribedTo") {
                // Update the button state locally in Subscribed To tab
                setSubscribedTo((prev) =>
                    prev.map((u) =>
                        u._id === userId
                            ? {
                                  ...u,
                                  subscribedToSubscriber:
                                      !u.subscribedToSubscriber,
                              }
                            : u
                    )
                );
                setSubscribedToCache((prev) => ({
                    ...prev,
                    [channelProfile._id]: (prev[channelProfile._id] || []).map(
                        (u) =>
                            u._id === userId
                                ? {
                                      ...u,
                                      subscribedToSubscriber:
                                          !u.subscribedToSubscriber,
                                  }
                                : u
                    ),
                }));
                // Also update Subscribers tab button state if present
                setSubscribers((prev) =>
                    prev.map((u) =>
                        u._id === userId
                            ? { ...u, subscribedToSubscriber: false }
                            : u
                    )
                );
                setSubscribersCache((prev) => ({
                    ...prev,
                    [channelProfile._id]: (prev[channelProfile._id] || []).map(
                        (u) =>
                            u._id === userId
                                ? { ...u, subscribedToSubscriber: false }
                                : u
                    ),
                }));
                // Always refresh Subscribed To tab to reflect new state
                fetchSubscribedTo(true);
            }
        } catch (err) {
            setErrorMessage("Failed to update subscription. Please try again.");
        }
    };

    const handleEditClick = (tweetId, currentContent) => {
        setEditingTweetId(tweetId);
        setEditingContent(currentContent);
    };

    const handleCancelEdit = () => {
        setEditingTweetId(null);
        setEditingContent("");
    };

    useEffect(() => {
        if (!isLoading && channelProfile?._id) {
            if (activeTab === "tweets") {
                fetchTweets();
            } else if (activeTab === "videos") {
                fetchVideos();
            } else if (activeTab === "subscribed") {
                fetchSubscribers();
            } else if (activeTab === "subscribers") {
                fetchSubscribedTo();
            }
        }
        // eslint-disable-next-line
    }, [
        activeTab,
        channelProfile?._id,
        fetchTweets,
        fetchVideos,
        fetchSubscribers,
        fetchSubscribedTo,
    ]);

    return (
        <div className="min-h-screen py-2 px-15 bg-gray-900 text-white">
            {/* Profile Header */}
            <div
                className="relative h-60 w-full bg-gray-700 mt-16 cursor-pointer"
                onClick={() =>
                    navigate(
                        `/profile/${
                            channelProfile?.username || channelProfile?._id
                        }`
                    )
                }
            >
                <img
                    src={
                        channelProfile?.coverImage ||
                        "https://via.placeholder.com/1500x300"
                    }
                    alt="Cover"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="relative -mt-16 mx-auto max-w-7xl px-10 sm:px-6 lg:px-8">
                <div className="bg-gray-800 rounded-lg shadow-lg px-6 py-4 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                        <div
                            className="flex items-center space-x-6 cursor-pointer"
                            onClick={() =>
                                navigate(
                                    `/profile/${
                                        channelProfile?.username ||
                                        channelProfile?._id
                                    }`
                                )
                            }
                        >
                            <div className="w-24 h-24 rounded-full border-4 border-gray-900 overflow-hidden">
                                <img
                                    src={
                                        channelProfile?.avatar ||
                                        "https://via.placeholder.com/150"
                                    }
                                    alt={
                                        channelProfile?.fullName ||
                                        "User Avatar"
                                    }
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold">
                                    {channelProfile?.fullName || "User Name"}
                                </h1>
                                <p className="text-gray-400">
                                    @{channelProfile?.username || "username"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {channelProfile?.watchHistory?.length || 0}{" "}
                                    Videos Watched
                                </p>
                            </div>
                        </div>
                        {!isOwnProfile && (
                            <button
                                className={`${
                                    isSubscribed
                                        ? "bg-gray-600"
                                        : "bg-purple-600 hover:bg-purple-700"
                                } px-4 py-2 rounded text-white`}
                                onClick={handleToggleSubscription}
                            >
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        )}
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
                            Subscribers
                        </button>
                        <button
                            className={`${
                                activeTab === "subscribers"
                                    ? "bg-purple-600"
                                    : "bg-gray-700"
                            } px-4 py-2 rounded text-white`}
                            onClick={() => setActiveTab("subscribers")}
                        >
                            Subscribed To
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 mx-auto max-w-7xl px-4">
                {activeTab === "tweets" && (
                    <div>
                        <h2 className="text-xl font-semibold">Tweets</h2>
                        {isOwnProfile && (
                            <div className="flex mt-4 space-x-4">
                                <input
                                    type="text"
                                    placeholder="Write a new tweet..."
                                    value={newTweetContent}
                                    onChange={(e) =>
                                        setNewTweetContent(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") createTweet();
                                    }}
                                    className="flex-grow px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white"
                                />
                                <button
                                    onClick={createTweet}
                                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
                                >
                                    Tweet
                                </button>
                            </div>
                        )}
                        {isLoading && <p>Loading tweets...</p>}
                        {!isLoading &&
                            tweets.map((tweet) => (
                                <div
                                    key={tweet._id}
                                    className="flex items-start gap-4 bg-gray-800 rounded-lg p-4 mt-4 shadow-lg"
                                >
                                    {/* Avatar */}
                                    <img
                                        src={
                                            tweet.owner?.avatar ||
                                            "https://via.placeholder.com/40"
                                        }
                                        alt={
                                            tweet.owner?.fullName ||
                                            "User Avatar"
                                        }
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-white text-base">
                                                {tweet.owner?.fullName ||
                                                    "User Name"}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                •{" "}
                                                {tweet.createdAt
                                                    ? timeAgo(tweet.createdAt)
                                                    : ""}
                                            </span>
                                        </div>
                                        {editingTweetId === tweet._id ? (
                                            <TweetEditInput
                                                value={editingContent}
                                                onChange={setEditingContent}
                                                onEnter={() =>
                                                    updateTweet(
                                                        tweet._id,
                                                        editingContent
                                                    )
                                                }
                                            />
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-200 mb-2">
                                                    {tweet.content}
                                                </p>
                                                {isOwnProfile &&
                                                    tweet.owner._id ===
                                                        channelProfile?._id && (
                                                        <div className="flex gap-2 mt-1">
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
                                                    )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        {errorMessage && activeTab === "tweets" && (
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
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                        {errorMessage && activeTab === "videos" && (
                            <p className="text-red-500 mt-2">{errorMessage}</p>
                        )}
                    </div>
                )}
                {activeTab === "subscribed" && (
                    <div>
                        {isLoading && <p>Loading subscribers...</p>}
                        {!isLoading && subscribers.length === 0 && (
                            <p>No subscribers found.</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subscribers.map((sub) => (
                                <div
                                    key={sub._id}
                                    className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                                >
                                    <img
                                        src={
                                            sub.avatar ||
                                            "https://via.placeholder.com/40"
                                        }
                                        alt={sub.fullName || "User Avatar"}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onClick={() =>
                                            navigate(`/profile/${sub.username}`)
                                        }
                                    />
                                    <div
                                        className="flex-1"
                                        onClick={() =>
                                            navigate(`/profile/${sub.username}`)
                                        }
                                    >
                                        <div className="font-semibold text-white">
                                            {sub.fullName}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            @{sub.username}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Subscribers:{" "}
                                            {sub.subscribersCount || 0}
                                        </div>
                                    </div>
                                    <button
                                        className={`ml-2 px-3 py-1 rounded text-white ${
                                            sub.subscribedToSubscriber
                                                ? "bg-gray-600 hover:bg-gray-700"
                                                : "bg-purple-600 hover:bg-purple-700"
                                        }`}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await handleToggleSubscriptionForUser(
                                                sub._id,
                                                "subscribers"
                                            );
                                        }}
                                    >
                                        {sub.subscribedToSubscriber
                                            ? "Subscribed"
                                            : "Subscribe"}
                                    </button>
                                </div>
                            ))}
                        </div>
                        {errorMessage && activeTab === "subscribed" && (
                            <p className="text-red-500 mt-2">{errorMessage}</p>
                        )}
                    </div>
                )}
                {activeTab === "subscribers" && (
                    <div>
                        {isLoading && <p>Loading subscriptions...</p>}
                        {!isLoading && subscribedTo.length === 0 && (
                            <p>No subscriptions found.</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subscribedTo.map((sub) => (
                                <div
                                    key={sub._id}
                                    id={sub._id}
                                    className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                                >
                                    <img
                                        src={
                                            sub.avatar ||
                                            "https://via.placeholder.com/40"
                                        }
                                        alt={sub.fullName || "User Avatar"}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onClick={() =>
                                            navigate(`/profile/${sub.username}`)
                                        }
                                    />
                                    <div
                                        className="flex-1"
                                        onClick={() =>
                                            navigate(`/profile/${sub.username}`)
                                        }
                                    >
                                        <div className="font-semibold text-white">
                                            {sub.fullName}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            @{sub.username}
                                        </div>
                                    </div>
                                    {userDetails._id === channelProfile._id && (
                                        <button
                                            className={`ml-2 px-3 py-1 rounded text-white ${
                                                sub.subscribedToSubscriber
                                                    ? "bg-gray-600 hover:bg-gray-700"
                                                    : "bg-purple-600 hover:bg-purple-700"
                                            }`}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await handleToggleSubscriptionForUser(
                                                    sub._id,
                                                    "subscribedTo"
                                                );
                                            }}
                                        >
                                            Unsubscribe
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errorMessage && activeTab === "subscribers" && (
                            <p className="text-red-500 mt-2">{errorMessage}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

function TweetEditInput({ value, onChange, onEnter }) {
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);
    return (
        <div className="flex flex-col gap-2">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onEnter();
                }}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded"
            />
            <div className="flex gap-2 mt-1">
                <button onClick={onEnter} className="text-green-500">
                    Save
                </button>
                <button
                    onClick={() => {
                        onChange("");
                        setEditingTweetId(null);
                    }}
                    className="text-red-500"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default UserProfile;
