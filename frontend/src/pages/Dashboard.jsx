import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import AskProjectMemory from "../components/AskProjectMemory";

function Dashboard() {
    const navigate = useNavigate();
    const username =
    localStorage.getItem("projectHindsightUsername") || "User";

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
                setError("Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

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
            
            <div className="topbar">
                <div>
                    <h1>Project Dashboard</h1>
                    <p>
                        Manage your projects and turn project
                        experiences into organizational memory.
                    </p>
                </div>

                <div className="dashboard-topbar-actions">
                    <div className="dashboard-user">
                        <div className="dashboard-user-avatar">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <span>{username}</span>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/experience")}
                    >
                        + Add Experience
                    </button>
                </div>
            </div>


            {error && (
                <p className="message" role="alert">
                    {error}
                </p>
            )}

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

            <section className="dashboard-projects">
                <div className="dashboard-projects-header">
                    <div>
                        <h2>All Projects</h2>
                        <p>
                            Open a project to manage its lifecycle,
                            archive it, or delete it.
                        </p>
                    </div>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/projects/create")}
                    >
                        + New Project
                    </button>
                </div>

                {projects.length > 0 ? (
                    <div className="dashboard-project-grid">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="project-card">
                        <h2>No projects yet</h2>
                        <p>
                            Create your first project to start
                            capturing decisions, experiences and lessons.
                        </p>
                        <button
                            className="primary-btn"
                            onClick={() => navigate("/projects/create")}
                        >
                            Create Project
                        </button>
                    </div>
                )}
            </section>

            <div className="idea-card">
                <div>
                    <span className="small-label">
                        PROJECT MEMORY
                    </span>
                    <h2>
                        Your projects should not repeat the same mistakes.
                    </h2>
                    <p>
                        ProjectHindsight stores failures, decisions,
                        rejected ideas and lessons so future projects
                        can learn from previous experience.
                    </p>
                </div>
            </div>

            <AskProjectMemory />
        </div>
    );
}

export default Dashboard;