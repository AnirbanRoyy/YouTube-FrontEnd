import React, { useState } from "react";

const DelandEditVideo = () => {
  const [videos, setVideos] = useState([
    {
      id: 1,
      status: true,
      name: "JavaScript Fundamentals: Variables and Data Types",
      likes: 921,
      dislikes: 49,
      dateUploaded: "9/22/2023",
      thumbnail: "https://via.placeholder.com/150",
      description: "Learn the basics of JavaScript, including variables and data types."
    },
    {
      id: 2,
      status: false,
      name: "React Hooks Explained: useState and useEffect",
      likes: 2520,
      dislikes: 279,
      dateUploaded: "9/21/2023",
      thumbnail: "https://via.placeholder.com/150",
      description: "Understand how to use React Hooks to manage state and side effects."
    },
    {
      id: 3,
      status: false,
      name: "Mastering Async Await in JavaScript",
      likes: 943,
      dislikes: 244,
      dateUploaded: "9/20/2023",
      thumbnail: "https://via.placeholder.com/150",
      description: "Master asynchronous programming in JavaScript with async/await."
    },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedVideo, setEditedVideo] = useState(null);

  const toggleStatus = (id) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === id ? { ...video, status: !video.status } : video
      )
    );
  };

  const handleDelete = (id) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
    setShowPopup(false);
  };

  const handleEdit = () => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === editedVideo.id ? editedVideo : video
      )
    );
    setShowEditModal(false);
  };

  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-900 text-white p-6">
      {/* Top Bar with Logo, Search Bar, and Avatar */}
      <div className="flex items-center justify-between mb-9">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 mr-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 w-full rounded bg-gray-800 text-white placeholder-gray-500"
          />
        </div>
        <img src="/avatar.png" alt="Avatar" className="w-12 h-12 rounded-full" />
      </div>

      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Welcome to Your Channel</h1>
      </div>

      {/* Video Management Section */}
      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Uploaded Video Name</th>
            <th className="p-2 text-left">Rating</th>
            <th className="p-2 text-left">Date Uploaded</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVideos.map((video) => (
            <tr key={video.id} className="border-b border-gray-700">
              <td className="p-2 flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={video.status}
                    onChange={() => toggleStatus(video.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500"></div>
                  <span className="ml-3">
                    {video.status ? "Published" : "Unpublished"}
                  </span>
                </label>
              </td>
              <td className="p-2">{video.name}</td>
              <td className="p-2">
                <span className="text-green-400">{video.likes} likes</span> /
                <span className="text-red-400"> {video.dislikes} dislikes</span>
              </td>
              <td className="p-2">{video.dateUploaded}</td>
              <td className="p-2 flex gap-2">
                <button
                  className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  onClick={() => {
                    setEditedVideo(video);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  onClick={() => {
                    setSelectedVideo(video);
                    setShowPopup(true);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Video Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded text-center">
            <h2 className="text-2xl font-bold mb-4">Edit Video</h2>
            <input
              type="text"
              placeholder="Title"
              value={editedVideo.name}
              onChange={(e) =>
                setEditedVideo({ ...editedVideo, name: e.target.value })
              }
              className="mb-4 p-2 w-full rounded bg-gray-800 text-white"
            />
            <input
              type="text"
              placeholder="Thumbnail URL"
              value={editedVideo.thumbnail}
              onChange={(e) =>
                setEditedVideo({ ...editedVideo, thumbnail: e.target.value })
              }
              className="mb-4 p-2 w-full rounded bg-gray-800 text-white"
            />
            <textarea
              placeholder="Description"
              value={editedVideo.description}
              onChange={(e) =>
                setEditedVideo({ ...editedVideo, description: e.target.value })
              }
              className="mb-4 p-2 w-full rounded bg-gray-800 text-white"
            ></textarea>
            <div className="flex justify-center">
              <button
                className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={handleEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded text-center">
            <h2 className="text-2xl font-bold mb-4">Delete Video</h2>
            <p className="mb-4">
              Are you sure you want to delete this video? Once deleted, you will
              not be able to recover it.
            </p>
            <button
              className="mr-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              onClick={() => setShowPopup(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              onClick={() => handleDelete(selectedVideo.id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelandEditVideo;
