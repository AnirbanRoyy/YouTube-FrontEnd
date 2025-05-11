import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function Subscribers() {
    const { userDetails, isLoggedIn } = useSelector((state) => state.auth);
    const { channelUserName } = useParams();
    const [subscribers, setSubscribers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [channelProfile, setChannelProfile] = useState(null);
    const navigate = useNavigate();

    // Fetch channel profile by username
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login")
            return
        }
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                console.log(userDetails);
                
                const response = await axios.post(
                    `http://localhost:8000/api/v1/users/get-user-channel-profile/${userDetails.username}`,
                    {},
                    { withCredentials: true }
                );
                setChannelProfile(response.data.data);
            } catch (err) {
                setErrorMessage("Failed to load channel profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [channelUserName, userDetails, isLoggedIn, navigate]);

    // Fetch subscribers for the channel
    const fetchSubscribers = useCallback(async () => {
        if (!channelProfile?._id) return;
        try {
            setIsLoading(true);
            setErrorMessage("");
            const res = await axios.get(
                `http://localhost:8000/api/v1/subscriptions/get-channel-subscribers/${channelProfile._id}`,
                { withCredentials: true }
            );
            setSubscribers(res.data.data || []);
        } catch (err) {
            setErrorMessage("Failed to load subscribers.");
        } finally {
            setIsLoading(false);
        }
    }, [channelProfile]);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    // Toggle subscription for a user
    const handleToggleSubscription = async (userId) => {
        try {
            await axios.patch(
                `http://localhost:8000/api/v1/subscriptions/toggle-subscription/${userId}`,
                {},
                { withCredentials: true }
            );
            setSubscribers((prev) =>
                prev.map((u) =>
                    u._id === userId
                        ? {
                              ...u,
                              subscribedToSubscriber: !u.subscribedToSubscriber,
                          }
                        : u
                )
            );
        } catch (err) {
            setErrorMessage("Failed to update subscription. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-10 px-5">
            <h1 className="text-3xl font-bold mb-8 text-center">Subscribers</h1>
            {isLoading && <p>Loading subscribers...</p>}
            {!isLoading && errorMessage && (
                <p className="text-red-500 mb-4">{errorMessage}</p>
            )}
            {!isLoading && subscribers.length === 0 && !errorMessage && (
                <p>No subscribers found.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {subscribers.map((sub) => (
                    <div
                        key={sub._id}
                        className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                    >
                        <img
                            src={sub.avatar || "https://via.placeholder.com/40"}
                            alt={sub.fullName || "User Avatar"}
                            className="w-12 h-12 rounded-full object-cover"
                            onClick={() => navigate(`/profile/${sub.username}`)}
                        />
                        <div
                            className="flex-1"
                            onClick={() => navigate(`/profile/${sub.username}`)}
                        >
                            <div className="font-semibold text-white">
                                {sub.fullName}
                            </div>
                            <div className="text-gray-400 text-sm">
                                @{sub.username}
                            </div>
                            <div className="text-xs text-gray-400">
                                Subscribers: {sub.subscribersCount || 0}
                            </div>
                        </div>
                        <button
                            className={`ml-2 px-3 py-1 rounded text-white ${
                                sub.subscribedToSubscriber
                                    ? "bg-gray-600 hover:bg-gray-700"
                                    : "bg-purple-600 hover:bg-purple-700"
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSubscription(sub._id);
                            }}
                        >
                            {sub.subscribedToSubscriber
                                ? "Subscribed"
                                : "Subscribe"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Subscribers;
