import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ProjectCard({ project }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState(project?.status || "ACTIVE");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    if (!project) {
        return (
            <div className="project-card">
                <div className="project-header">
                    <div>
                        <span className="badge">No Active Project</span>
                        <h2>No project created yet</h2>
                        <p>Create a project to start using ProjectHindsight.</p>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/projects/create")}
                    >
                        Create Project
                    </button>
                </div>
            </div>
        );
    }

    const handleArchive = async () => {
        if (status === "ARCHIVED") return;

        try {
            setBusy(true);
            setError("");
            const response = await api.post(`/projects/${project.id}/archive`);
            setStatus(response.data.status || "ARCHIVED");
        } catch (err) {
            console.error(err);
            setError("Unable to archive project.");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete "${project.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setBusy(true);
            setError("");
            await api.delete(`/projects/${project.id}`);
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError("Unable to delete project.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="project-card">
            <div className="project-header">
                <div>
                    <span className="badge">{status}</span>
                    <h2>{project.name}</h2>
                    <p>
                        {project.description ||
                            "No project description available."}
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    <button
                        className="secondary-btn"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        View Project
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={handleArchive}
                        disabled={busy || status === "ARCHIVED"}
                    >
                        {status === "ARCHIVED" ? "Archived" : "Archive"}
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={handleDelete}
                        disabled={busy}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {error && (
                <p className="message" role="alert">
                    {error}
                </p>
            )}

            <div className="project-metrics">
                <div>
                    <strong>{project.progress ?? 0}%</strong>
                    <span>Progress</span>
                </div>

                <div>
                    <strong>{project.current_stage || "IDEA"}</strong>
                    <span>Current Stage</span>
                </div>

                <div>
                    <strong>{project.domain || "General"}</strong>
                    <span>Domain</span>
                </div>
            </div>
        </div>
    );
}

export default ProjectCard;