import React from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <>
            <NavBar />
            <Outlet />
            <SideBar />
        </>
    );
}

export default Layout;
