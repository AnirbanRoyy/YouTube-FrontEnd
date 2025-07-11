import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import Layout from "./Layout.jsx";
import {
    Admin,
    DelandEditVideo,
    fetchPlayBackData,
    fetchSelfVideos,
    fetchVideos,
    Settings,
    LoginPage,
    LogOut,
    PlayBack,
    Registration,
    UploadVideo,
    UserProfile,
    VideoCart,
    Subscribers,
    Playlist,
    WatchHistory
} from "./components/index.js";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import WatchLater from "./components/WatchLater.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route path="" element={<VideoCart />} loader={fetchVideos} />
            <Route path="delete-video" element={<DelandEditVideo />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="profile/:channelUserName" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="upload-video" element={<UploadVideo />} />
            <Route path="admin" element={<Admin />} loader={fetchSelfVideos} />
            <Route path="login" element={<LoginPage />} />
            <Route path="logout" element={<LogOut />} />
            <Route path="registration" element={<Registration />} />
            <Route
                path="playback/:videoId"
                element={<PlayBack />}
                loader={({ params }) => fetchPlayBackData(params.videoId)}
            />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="playlists" element={<Playlist />} />
            <Route path="history" element={<WatchHistory />} />
            <Route path="watch-later" element={<WatchLater />} />
        </Route>
    )
);

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
);
