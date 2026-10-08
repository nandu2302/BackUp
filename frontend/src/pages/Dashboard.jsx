import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import AskProjectMemory from "../components/AskProjectMemory";

function Dashboard() {

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [experienceCount, setExperienceCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const [projectsResponse, experienceResponse] =
                    await Promise.all([
                        api.get("/projects"),
                        api.get("/experience-count")
                    ]);

                setProjects(projectsResponse.data);

                setExperienceCount(
                    experienceResponse.data.count
                );

            } catch (err) {

                console.error("Dashboard loading error:", err);

                setError(
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);

            }
        };

        loadDashboard();

    }, []);

    const currentProject = projects.length > 0
        ? projects[0]
        : null;

    if (loading) {

        return (
            <div className="topbar">
                <div>
                    <h1>Project Dashboard</h1>
                    <p>Loading your project memory...</p>
                </div>
            </div>
        );
    }

    return (
        <div>

            {/* HEADER */}

            <div className="topbar">

                <div>

                    <h1>
                        Project Dashboard
                    </h1>

                    <p>
                        Turn project experiences into
                        organizational memory.
                    </p>

                </div>

                <button
                    className="primary-btn"
                    onClick={() =>
                        navigate("/experience")
                    }
                >
                    + Add Experience
                </button>

            </div>


            {/* ERROR */}

            {error && (
                <p className="message">
                    {error}
                </p>
            )}


            {/* STATISTICS */}

            <div className="stats">

                <StatCard
                    value={projects.length}
                    label="Projects"
                />

                <StatCard
                    value={experienceCount}
                    label="Experiences"
                />

                <StatCard
                    value="AI"
                    label="Memory Enabled"
                />

            </div>


            {/* CURRENT PROJECT */}

            <ProjectCard
                project={currentProject}
            />


            {/* PROJECT MEMORY */}

            <div className="idea-card">

                <div>

                    <span className="small-label">
                        PROJECT MEMORY
                    </span>

                    <h2>
                        Your projects should not
                        repeat the same mistakes.
                    </h2>

                    <p>
                        ProjectHindsight stores failures,
                        decisions, rejected ideas and lessons
                        so future projects can learn from
                        previous experience.
                    </p>

                </div>

            </div>

            <AskProjectMemory />
        </div>
    );
}

export default Dashboard;