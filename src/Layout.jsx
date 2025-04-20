import React, { useState } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";

function Layout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleSidebarToggle = (collapsed) => {
        setIsSidebarCollapsed(collapsed);
    };

    return (
        <>
            <NavBar />
            <div className="flex">
                <SideBar onToggle={handleSidebarToggle} />
                <div
                    className={`flex-1 transition-all duration-75 bg-gray-900 ${
                        isSidebarCollapsed ? "ml-20" : "ml-48"
                    }`}
                >
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export default Layout;
