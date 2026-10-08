import { useNavigate } from "react-router-dom";

function ProjectCard({ project }) {
    const navigate = useNavigate();

    if (!project) {
        return (
            <div className="project-card">
                <div className="project-header">
                    <div>
                        <span className="badge">
                            No Active Project
                        </span>

                        <h2>No project created yet</h2>

                        <p>
                            Create a project to start using
                            ProjectHindsight.
                        </p>
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

    return (
        <div className="project-card">

            <div className="project-header">

                <div>

                    <span className="badge">
                        {project.status || "ACTIVE"}
                    </span>

                    <h2>
                        {project.name}
                    </h2>

                    <p>
                        {project.description ||
                            "No project description available."}
                    </p>

                </div>

                <button
                    className="secondary-btn"
                    onClick={() =>
                        navigate(`/projects/${project.id}`)
                    }
                >
                    Open Project
                </button>

            </div>

            <div className="project-metrics">

                <div>
                    <strong>
                        {project.progress ?? 0}%
                    </strong>

                    <span>
                        Progress
                    </span>
                </div>

                <div>
                    <strong>
                        {project.current_stage || "IDEA"}
                    </strong>

                    <span>
                        Current Stage
                    </span>
                </div>

                <div>
                    <strong>
                        {project.domain || "General"}
                    </strong>

                    <span>
                        Domain
                    </span>
                </div>

            </div>

        </div>
    );
}

export default ProjectCard;