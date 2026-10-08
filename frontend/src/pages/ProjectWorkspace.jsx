import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AskProjectMemory from "../components/AskProjectMemory";

function ProjectWorkspace() {

    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [stages, setStages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadWorkspace = async () => {

            try {

                const [projectResponse, stagesResponse] =
                    await Promise.all([
                        api.get(`/projects/${projectId}`),
                        api.get(`/projects/${projectId}/stages`)
                    ]);

                setProject(projectResponse.data);
                setStages(stagesResponse.data);

            } catch (err) {

                console.error(err);

                setError(
                    "Unable to load project workspace."
                );

            } finally {

                setLoading(false);

            }
        };

        loadWorkspace();

    }, [projectId]);


    if (loading) {
        return (
            <div>
                <h1>Loading project...</h1>
            </div>
        );
    }


    if (error) {
        return (
            <div>
                <h1>Project Workspace</h1>
                <p className="message">{error}</p>
            </div>
        );
    }


    if (!project) {
        return (
            <div>
                <h1>Project not found</h1>
            </div>
        );
    }


    return (
        <div>

            <div className="topbar">

                <div>

                    <button
                        className="text-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Back to Dashboard
                    </button>

                    <h1>
                        {project.name}
                    </h1>

                    <p>
                        {project.description}
                    </p>

                </div>

            </div>


            <div className="project-card">

                <div className="project-header">

                    <div>

                        <span className="badge">
                            {project.status || "ACTIVE"}
                        </span>

                        <h2>
                            Project Workspace
                        </h2>

                        <p>
                            {project.domain ||
                                "Project domain not specified"}
                        </p>

                    </div>

                </div>


                <div className="project-metrics">

                    <div>
                        <strong>
                            {project.progress ?? 0}%
                        </strong>

                        <span>
                            Overall Progress
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
                            {project.team_size ?? "-"}
                        </strong>

                        <span>
                            Team Size
                        </span>
                    </div>

                    <div>
                        <strong>
                            {project.technology || "-"}
                        </strong>

                        <span>
                            Technology
                        </span>
                    </div>

                </div>

            </div>


            <h2>
                Project Lifecycle
            </h2>


            <div className="lifecycle">

                {stages.filter((stage) => stage.stage_type !== "HINDSIGHT")
                .map((stage) => (

                <div
                    key={stage.id}
                    className={`stage ${
                        stage.stage_type ===
                        project.current_stage
                            ? "active"
                            : ""
                    }`}
                        onClick={() => {

                            const stageRoutes = {
                                IDEA: "idea",
                                REQUIREMENTS: "requirements",
                                ARCHITECTURE: "architecture",
                                DEVELOPMENT: "development",
                                TESTING: "testing",
                                DEPLOYMENT: "deployment",
                                HINDSIGHT: "hindsight"
                            };

                            const route =
                                stageRoutes[stage.stage_type];

                            if (route) {
                                navigate(
                                    `/projects/${projectId}/${route}`
                                );
                            }

                        }}
                        style={{
                            cursor: "pointer"
                        }}
                    >

                        <span>
                            {stage.progress}%
                        </span>

                        <strong>
                            {stage.stage_type}
                        </strong>

                        <small>
                            {stage.status}
                        </small>

                    </div>

                ))}

            </div>

            <div className="stage-info">

                <h2>
                    Current Stage
                </h2>

                <p>
                    {project.current_stage}
                </p>

                <p>
                    This stage will contain the
                    project-specific information,
                    decisions, problems and lessons
                    captured during this phase.
                </p>

            </div>

            <AskProjectMemory projectId={projectId} stage="PROJECT OVERVIEW"/>

        </div>
    );
}

export default ProjectWorkspace;