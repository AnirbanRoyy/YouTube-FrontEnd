import React, { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("tweets"); // Default tab: tweets
  const [tweets, setTweets] = useState([]);
  const [newTweetContent, setNewTweetContent] = useState("");
  const [userId] = useState("12345"); // Replace with actual user ID (e.g., from context or props)
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch Tweets
  const fetchTweets = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/v1/tweets/${userId}`,
        {
          params: { page: 1, limit: 10 }, // Optional pagination params
        }
      );
      setTweets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setErrorMessage("Failed to load tweets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create Tweet
  const createTweet = async () => {
    if (!newTweetContent.trim()) return; // Prevent empty tweets
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/tweets/create-tweet",
        { content: newTweetContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with token logic
          },
        }
      );
      setTweets([response.data.data, ...tweets]); // Prepend new tweet
      setNewTweetContent(""); // Clear input
    } catch (error) {
      console.error("Error creating tweet:", error);
      setErrorMessage("Failed to create tweet. Please try again.");
    }
  };

  // Update Tweet
  const updateTweet = async (tweetId, updatedContent) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/tweets/${tweetId}`,
        { content: updatedContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update the tweet locally
      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet._id === tweetId ? { ...tweet, content: updatedContent } : tweet
        )
      );
    } catch (error) {
      console.error("Error updating tweet:", error);
      setErrorMessage("Failed to update tweet. Please try again.");
    }
  };

  // Fetch tweets on component mount
  useEffect(() => {
    if (activeTab === "tweets") {
      fetchTweets();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen py-20 px-15 bg-gray-900 text-white">
      {/* Navbar */}
      <div className="w-full bg-gray-800 border-b border-gray-700 flex items-center justify-between p-4 fixed top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-purple-500 p-2 rounded-full">
            <a href="/" className="text-lg font-bold text-white">
              Play
            </a>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative h-48 w-full bg-gray-700 mt-16">
        <img
          src="https://via.placeholder.com/1500x300"
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative -mt-16 mx-auto max-w-7xl px-10 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-lg px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full border-4 border-gray-900 overflow-hidden">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">React Patterns</h1>
                <p className="text-gray-400">@reactpatterns</p>
                <p className="text-sm text-gray-400">
                  600k Subscribers · 220 Subscribed
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
                activeTab === "videos" ? "bg-purple-600" : "bg-gray-700"
              } px-4 py-2 rounded text-white`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
            <button
              className={`${
                activeTab === "tweets" ? "bg-purple-600" : "bg-gray-700"
              } px-4 py-2 rounded text-white`}
              onClick={() => setActiveTab("tweets")}
            >
              Tweets
            </button>
            <button
              className={`${
                activeTab === "subscribed" ? "bg-purple-600" : "bg-gray-700"
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

            {/* Create Tweet */}
            <div className="flex mt-4 space-x-4">
              <input
                type="text"
                placeholder="Write a new tweet..."
                value={newTweetContent}
                onChange={(e) => setNewTweetContent(e.target.value)}
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

            {/* Tweets List */}
            {!isLoading &&
              tweets.map((tweet) => (
                <div
                  key={tweet._id}
                  className="bg-gray-800 rounded-lg p-4 mt-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{tweet.content}</p>
                    <button
                      onClick={() =>
                        updateTweet(tweet._id, "Updated Tweet Content")
                      }
                      className="text-sm text-purple-500 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
