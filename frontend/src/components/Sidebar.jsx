import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    PlusCircle,
    Brain
} from "lucide-react";

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="logo">
                <span>◈</span>
                ProjectHindsight
            </div>

            <nav>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `nav-btn ${isActive ? "active" : ""}`
                    }
                >
                    <LayoutDashboard size={17} />
                    Dashboard
                </NavLink>

                {/* <NavLink
                    to="/experience"
                    className={({ isActive }) =>
                        `nav-btn ${isActive ? "active" : ""}`
                    }
                >
                    <PlusCircle size={17} />
                    Add Experience
                </NavLink> */}

                <NavLink
                    to="/hindsight"
                    className={({ isActive }) =>
                        `nav-btn ${isActive ? "active" : ""}`
                    }
                >
                    <Brain size={17} />
                    Hindsight
                </NavLink>

                {/* <NavLink
                    to="/memory"
                    className={({ isActive }) =>
                        `nav-btn ${isActive ? "active" : ""}`
                    }
                >
                    <Search size={17} />
                    Ask Project Memory
                </NavLink> */}

                <NavLink
                    to="/projects/create"
                    className={({ isActive }) =>
                        `nav-btn ${isActive ? "active" : ""}`
                    }
                >
                    <PlusCircle size={17} />
                    Create Project
                </NavLink>

            </nav>

            <div className="sidebar-bottom">
                <p>AI that remembers</p>
                <p>what your projects learned.</p>
            </div>

        </aside>
    );
}

export default Sidebar;