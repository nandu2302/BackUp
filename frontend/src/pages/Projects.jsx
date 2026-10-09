import { useEffect, useState } from "react";
import api from "../services/api";
import ProjectCard from "../components/ProjectCard";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProjects = async () => {
            try {
                setError("");

                const response = await api.get("/projects");
                setProjects(response.data || []);
            } catch (err) {
                console.error("Projects loading error:", err);
                setError("Unable to load projects.");
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, []);

    return (
        <div className="projects-page">
            <div className="topbar">
                <div>
                    <h1>Projects</h1>
                    <p>
                        Manage your projects and explore their
                        development workspaces.
                    </p>
                </div>
            </div>

            {error && (
                <p className="message" role="alert">
                    {error}
                </p>
            )}

            {loading ? (
                <p>Loading projects...</p>
            ) : projects.length === 0 ? (
                <div className="project-card">
                    <h2>No projects yet</h2>
                    <p>Create a project to get started.</p>
                </div>
            ) : (
                <div
                    className="projects-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
                        gap: "20px",
                        alignItems: "start",
                    }}
                >
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Projects;