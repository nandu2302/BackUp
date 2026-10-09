import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Layers3,
    Brain,
    Users,
    Code2,
    Lightbulb,
    ClipboardList,
    Palette,
    FlaskConical,
    Rocket
} from "lucide-react";

import api from "../services/api";
import AskProjectMemory from "../components/AskProjectMemory";

function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [stages, setStages] = useState([]);
    const [experiences, setExperiences] = useState([]);

    const [activeTab, setActiveTab] = useState("OVERVIEW");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [experienceError, setExperienceError] = useState("");
    const [ideasCount, setIdeasCount] = useState(0);

    useEffect(() => {
        let cancelled = false;


        const fetchIdeasCount = async () => {
            try {
                const response = await api.get(
                    `/projects/${projectId}/ideas`
                );

                setIdeasCount(response.data.length);
            } catch (error) {
                console.error("Failed to fetch ideas count:", error);
                setIdeasCount(0);
            }
        };

        const loadWorkspace = async () => {
            setLoading(true);
            setError("");
            setExperienceError("");

            try {
                const [projectResponse, stagesResponse] =
                    await Promise.all([
                        api.get(`/projects/${projectId}`),
                        api.get(`/projects/${projectId}/stages`)
                    ]);

                if (cancelled) return;

                setProject(projectResponse.data);

                setStages(
                    (stagesResponse.data || []).filter(
                        (stage) => stage.stage_type !== "HINDSIGHT"
                    )
                );

                // Load experiences independently so that an
                // experience-loading error doesn't hide the workspace.
                try {
                    const experiencesResponse = await api.get(
                        `/hindsight/projects/${projectId}/experiences`
                    );

                    if (!cancelled) {
                        setExperiences(
                            experiencesResponse.data?.experiences || []
                        );
                    }
                } catch (err) {
                    console.error("Could not load experiences:", err);

                    if (!cancelled) {
                        setExperiences([]);
                        setExperienceError(
                            "Unable to load project experiences."
                        );
                    }
                }
            } catch (err) {
                console.error("Workspace loading error:", err);

                if (!cancelled) {
                    setError("Unable to load project workspace.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadWorkspace();
        fetchIdeasCount();

        return () => {
            cancelled = true;
        };
    }, [projectId]);

    const stageRoutes = {
        IDEA: "idea",
        REQUIREMENTS: "requirements",
        ARCHITECTURE: "architecture",
        DEVELOPMENT: "development",
        TESTING: "testing",
        DEPLOYMENT: "deployment"
    };

    const openStage = (stageType) => {
        const route = stageRoutes[stageType];

        if (route) {
            navigate(`/projects/${projectId}/${route}`);
        }
    };

    if (loading) {
        return (
            <div className="workspace-loading">
                <h1>Loading project...</h1>
                <p>Preparing your project workspace.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Project Workspace</h1>
                <p className="message" role="alert">
                    {error}
                </p>
                <button
                    type="button"
                    className="workspace-back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!project) {
        return <h1>Project not found</h1>;
    }

    return (
        <div className="workspace-page">
            {/* Header */}
            <div className="workspace-page-header">
                <button
                    type="button"
                    className="workspace-back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
                </button>

                <div className="workspace-title">
                    <span className="badge">
                        {project.status || "ACTIVE"}
                    </span>

                    <h1>{project.name}</h1>

                    <p>
                        {project.description ||
                            "No project description available."}
                    </p>

                    <span className="workspace-domain">
                        {project.domain || "General"}
                    </span>
                </div>
            </div>

            {/* Three tabs only */}
            <div
                className="workspace-tabs"
                role="tablist"
                aria-label="Project workspace sections"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "OVERVIEW"}
                    className={`workspace-tab ${
                        activeTab === "OVERVIEW" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("OVERVIEW")}
                >
                    Overview
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "STAGES"}
                    className={`workspace-tab ${
                        activeTab === "STAGES" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("STAGES")}
                >
                    Stages
                    <span className="workspace-tab-count">
                        {stages.length}
                    </span>
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "EXPERIENCES"}
                    className={`workspace-tab ${
                        activeTab === "EXPERIENCES" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("EXPERIENCES")}
                >
                    Experiences
                    <span className="workspace-tab-count">
                        {experiences.length}
                    </span>
                </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "OVERVIEW" && (
                <section
                    className="workspace-tab-content"
                    role="tabpanel"
                >
                    <div className="workspace-section-heading">
                        <div>
                            <h2>Project Overview</h2>
                            <p>
                                A summary of your project's current
                                progress and configuration.
                            </p>
                        </div>
                    </div>

                    <div className="workspace-overview-grid">
                        <div className="workspace-overview-card">
                            <div className="workspace-overview-icon">
                                <Layers3 size={21} />
                            </div>

                            <div>
                                <span>Overall Progress</span>
                                <strong>
                                    {project.progress ?? 0}%
                                </strong>
                            </div>
                        </div>

                        <div className="workspace-overview-card">
                            <div className="workspace-overview-icon">
                                <Brain size={21} />
                            </div>

                            <div>
                                <span>Current Stage</span>
                                <strong>
                                    {project.current_stage || "IDEA"}
                                </strong>
                            </div>
                        </div>

                        <div className="workspace-overview-card">
                            <div className="workspace-overview-icon">
                                <Users size={21} />
                            </div>

                            <div>
                                <span>Team Size</span>
                                <strong>
                                    {project.team_size ?? "-"}
                                </strong>
                            </div>
                        </div>

                        <div className="workspace-overview-card">
                            <div className="workspace-overview-icon">
                                <Code2 size={21} />
                            </div>

                            <div>
                                <span>Technology</span>
                                <strong className="workspace-technology">
                                    {project.technology || "-"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="workspace-progress-panel">
                        <div className="workspace-progress-heading">
                            <div>
                                <h3>Project Progress</h3>
                                <p>
                                    Track progress across the project lifecycle.
                                </p>
                            </div>

                            <strong>{project.progress ?? 0}%</strong>
                        </div>

                        <div
                            className="workspace-progress-track"
                            role="progressbar"
                            aria-valuenow={project.progress ?? 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Overall project progress"
                        >
                            <div
                                className="workspace-progress-fill"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.max(0, Number(project.progress) || 0)
                                    )}%`
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            className="primary-btn"
                            onClick={() => setActiveTab("STAGES")}
                        >
                            Explore Project Stages
                        </button>
                    </div>

                    <AskProjectMemory
                        projectId={projectId}
                        stage="PROJECT OVERVIEW"
                    />
                </section>
            )}
            
            {/* STAGES TAB */}
            {activeTab === "STAGES" && (
                <section
                    className="workspace-tab-content"
                    role="tabpanel"
                >
                    <div className="workspace-section-heading">
                        <div>
                            <h2>Project Stages</h2>
                            <p>
                                Explore each stage to view project details
                                and experiences.
                            </p>
                        </div>
                    </div>

                    <div className="workspace-journey">
                        <div className="workspace-journey-heading">
                            <h3>Project Journey</h3>
                            <p>
                                Visual representation of all stages and
                                their progress.
                            </p>
                        </div>

                        <div className="workspace-journey-grid">
                            {stages.map((stage, index) => {
                                const stageVisuals = {
                                    IDEA: {
                                        title: "Planning",
                                        icon: Lightbulb,
                                        description:
                                            "Project concept, team setup and project scope."
                                    },
                                    REQUIREMENTS: {
                                        title: "Requirements",
                                        icon: ClipboardList,
                                        description:
                                            "Functional requirements and project scope."
                                    },
                                    ARCHITECTURE: {
                                        title: "Design",
                                        icon: Palette,
                                        description:
                                            "System architecture, UI/UX and API planning."
                                    },
                                    DEVELOPMENT: {
                                        title: "Development",
                                        icon: Code2,
                                        description:
                                            "Feature development, API integration and modules."
                                    },
                                    TESTING: {
                                        title: "Testing",
                                        icon: FlaskConical,
                                        description:
                                            "Unit tests, integration tests and bug fixes."
                                    },
                                    DEPLOYMENT: {
                                        title: "Production",
                                        icon: Rocket,
                                        description:
                                            "Final deployment, monitoring and release."
                                    }
                                };

                                const visual = stageVisuals[stage.stage_type];
                                const StageIcon = visual?.icon || Layers3;

                                const progress = Math.min(
                                    100,
                                    Math.max(0, Number(stage.progress) || 0)
                                );

                                const stageExperiences = experiences.filter(
                                    (experience) =>
                                        experience.stage_id === stage.id
                                ).length;

                                return (
                                    <div
                                        className={`workspace-journey-stage ${
                                            stage.stage_type === project.current_stage
                                                ? "current"
                                                : ""
                                        }`}
                                        key={stage.id}
                                    >
                                        <div className="workspace-journey-node-area">
                                            <div
                                                className={`workspace-journey-node ${
                                                    progress === 100
                                                        ? "completed"
                                                        : ""
                                                }`}
                                            >
                                                <StageIcon size={23} />
                                            </div>

                                            <span className="workspace-journey-number">
                                                {index + 1}
                                            </span>
                                        </div>

                                        <h4>
                                            {visual?.title || stage.stage_type}
                                        </h4>

                                        <span className="workspace-journey-stage-type">
                                            {stage.stage_type}
                                        </span>

                                        <div className="workspace-journey-card">
                                            <p>
                                                {visual?.description ||
                                                    "Project stage details and progress."}
                                            </p>

                                            
                                            <div className="workspace-journey-card-footer">
                                                <span>
                                                    {stageExperiences}{" "}
                                                    {stageExperiences === 1
                                                        ? "Experience"
                                                        : "Experiences"}
                                                </span>

                                                <strong>
                                                    {stage.stage_type === "IDEA"
                                                        ? `${ideasCount} Ideas`
                                                        : `${progress}%`}
                                                </strong>
                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            className="workspace-journey-open"
                                            onClick={() =>
                                                openStage(stage.stage_type)
                                            }
                                        >
                                            Open Stage <span>→</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <AskProjectMemory
                        projectId={projectId}
                        stage="PROJECT OVERVIEW"
                    />
                </section>
            )}


            {/* EXPERIENCES TAB */}
            {activeTab === "EXPERIENCES" && (
                <section
                    className="workspace-tab-content"
                    role="tabpanel"
                >
                    <div className="workspace-section-heading">
                        <div>
                            <h2>Project Experiences</h2>
                            <p>
                                Review the decisions, problems, solutions
                                and lessons captured during this project.
                            </p>
                        </div>

                        <span className="workspace-experience-total">
                            <Brain size={17} />
                            {experiences.length}{" "}
                            {experiences.length === 1
                                ? "Experience"
                                : "Experiences"}
                        </span>
                    </div>

                    {experienceError && (
                        <p className="message" role="alert">
                            {experienceError}
                        </p>
                    )}

                    {!experienceError && experiences.length === 0 ? (
                        <div className="workspace-empty-state">
                            <Brain size={32} />

                            <h3>No experiences recorded yet</h3>

                            <p>
                                Experiences saved through manual entry,
                                AI Development Conversation, or other
                                enabled integrations will appear here.
                            </p>

                            <button
                                type="button"
                                className="primary-btn"
                                onClick={() =>
                                    navigate(
                                        `/projects/${projectId}/development`
                                    )
                                }
                            >
                                Open Development
                            </button>
                        </div>
                    ) : (
                        <div className="workspace-experience-list">
                            {experiences.map((experience) => (
                                <article
                                    className="workspace-experience-card"
                                    key={experience.id}
                                >
                                    <div className="workspace-experience-header">
                                        <span className="workspace-experience-type">
                                            {(experience.type || "EXPERIENCE")
                                                .replaceAll("_", " ")}
                                        </span>

                                        {experience.source && (
                                            <span className="workspace-experience-source">
                                                {experience.source
                                                    .replaceAll("_", " ")}
                                            </span>
                                        )}
                                    </div>

                                    <h3>{experience.title}</h3>

                                    <p className="workspace-experience-description">
                                        {experience.description}
                                    </p>

                                    {experience.solution && (
                                        <div className="workspace-experience-detail">
                                            <strong>Solution / Decision</strong>
                                            <p>{experience.solution}</p>
                                        </div>
                                    )}

                                    {experience.outcome && (
                                        <div className="workspace-experience-detail">
                                            <strong>Outcome</strong>
                                            <p>{experience.outcome}</p>
                                        </div>
                                    )}

                                    {experience.lesson && (
                                        <div className="workspace-experience-lesson">
                                            <strong>Lesson for future projects</strong>
                                            <p>{experience.lesson}</p>
                                        </div>
                                    )}

                                    {experience.created_at && (
                                        <span className="workspace-experience-date">
                                            Recorded{" "}
                                            {new Date(
                                                experience.created_at
                                            ).toLocaleDateString()}
                                        </span>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default ProjectWorkspace;