import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;