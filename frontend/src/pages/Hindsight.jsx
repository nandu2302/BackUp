import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Brain,
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    Scale,
    Sparkles,
    FolderKanban,
    Search,
    ChevronDown,
} from "lucide-react";
import api from "../services/api";

// Remove Markdown syntax from AI-generated text before displaying it in the UI.
function cleanInsightText(value) {
    if (!value) return "";

    return value
        // Remove fenced code markers while preserving their contents.
        .replace(/```[a-zA-Z0-9_-]*\s*/g, "")
        // Turn Markdown headings into plain text.
        .replace(/^\s{0,3}#{1,6}\s*/gm, "")
        // Convert list markers before removing emphasis markers.
        .replace(/^\s*[*+]\s+/gm, "• ")
        .replace(/^\s*[-]\s+/gm, "• ")
        .replace(/^\s*\d+[.)]\s+/gm, "• ")
        // Remove bold/italic Markdown markers, including malformed triple stars.
        .replace(/\*{2,3}([^*\n]+?)\*{2,3}/g, "$1")
        .replace(/_{2,3}([^_\n]+?)_{2,3}/g, "$1")
        .replace(/\*([^*\n]+)\*/g, "$1")
        .replace(/_([^_\n]+)_/g, "$1")
        // Strip any leftover Markdown heading/emphasis characters.
        .replace(/^[ \t]*#{1,6}[ \t]*/gm, "")
        .replace(/\*{1,}|_{1,}/g, "")
        .replace(/[ \t]+$/gm, "")
        .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n")
        .trim();
}
function Hindsight() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [hindsight, setHindsight] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [projectFilter, setProjectFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState("LATEST");

    useEffect(() => {
        loadProjects();
        // Load the project list on mount and open a project if projectId is in the URL.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadProjects = async () => {
        try {
            setError("");

            const response = await api.get("/hindsight/projects");
            const loadedProjects = response.data || [];

            setProjects(loadedProjects);

            const projectIdFromUrl = searchParams.get("projectId");

            if (projectIdFromUrl) {
                const project = loadedProjects.find(
                    (item) => String(item.id) === String(projectIdFromUrl)
                );

                if (project) {
                    await handleProjectSelect(project);
                }
            }
        } catch (error) {
            console.error("Could not load projects:", error);
            setError("Could not load projects.");
        }
    };

    const filteredProjects = projects
        .filter((project) => {
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                project.name?.toLowerCase().includes(search) ||
                project.description?.toLowerCase().includes(search);

            if (!matchesSearch) {
                return false;
            }

            if (projectFilter === "ACTIVE") {
                return (project.status || "ACTIVE").toUpperCase() === "ACTIVE";
            }

            if (projectFilter === "ARCHIVED") {
                return (project.status || "").toUpperCase() === "ARCHIVED";
            }

            return true;
        })
        .sort((a, b) => {
            if (sortOrder === "NAME") {
                return (a.name || "").localeCompare(b.name || "");
            }

            if (sortOrder === "EXPERIENCES") {
                return (b.experience_count || 0) - (a.experience_count || 0);
            }

            return b.id - a.id;
        });

    const handleProjectSelect = async (project) => {
        window.history.replaceState(
            null,
            "",
            `/hindsight?projectId=${project.id}`
        );

        try {
            setLoadingProject(true);
            setSelectedProject(project);
            setHindsight("");
            setError("");

            const experiencesResponse = await api.get(
                `/hindsight/projects/${project.id}/experiences`
            );

            setExperiences(experiencesResponse.data?.experiences || []);
        } catch (error) {
            console.error("Could not load project data:", error);
            setExperiences([]);
            setError("Could not load project details.");
        } finally {
            setLoadingProject(false);
        }
    };

    const handleBackToProjects = () => {
        setSelectedProject(null);
        setExperiences([]);
        setHindsight("");
        setError("");

        window.history.replaceState(null, "", "/hindsight");
    };

    const handleGenerateHindsight = async () => {
        if (!selectedProject) {
            return;
        }

        try {
            setLoading(true);
            setHindsight("");
            setError("");

            const query = `
You are the ProjectHindsight learning agent.

Analyze the experiences of this project.

Project Name:
${selectedProject.name}

Project Description:
${selectedProject.description || "No description available."}

Project experiences:
${experiences
    .map(
        (experience) => `
Experience Type: ${experience.type}
Title: ${experience.title}
What happened: ${experience.description}
Solution / Decision: ${experience.solution || "Not recorded"}
Outcome: ${experience.outcome || "Not recorded"}
Lesson: ${experience.lesson || "Not recorded"}
`
    )
    .join("\n")}

Organize the result into exactly these sections:

WHAT WORKED
WHAT FAILED
IMPORTANT DECISIONS
LESSONS FOR FUTURE PROJECTS

Use concise bullet points.
Do not invent information.
Only use information available in this project's experiences.
`;

            const response = await api.post("/hindsight/generate", {
                query,
                project_id: selectedProject.id,
            });

            setHindsight(response.data?.hindsight || "");
        } catch (error) {
            console.error("Could not generate hindsight:", error);
            setError(
                error.response?.data?.detail ||
                    "Could not generate hindsight."
            );
        } finally {
            setLoading(false);
        }
    };

    const getSection = (sectionName, nextSections = []) => {
        if (!hindsight) {
            return "";
        }

        const escapeRegExp = (value) =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const nextPattern = nextSections
            .map(escapeRegExp)
            .join("|");

        const regex = nextPattern
            ? new RegExp(
                  `${escapeRegExp(sectionName)}\\s*([\\s\\S]*?)(?=${nextPattern}|$)`,
                  "i"
              )
            : new RegExp(
                  `${escapeRegExp(sectionName)}\\s*([\\s\\S]*)`,
                  "i"
              );

        const match = hindsight.match(regex);
        return match ? cleanInsightText(match[1]) : "";
    };

    const worked = getSection("WHAT WORKED", [
        "WHAT FAILED",
        "IMPORTANT DECISIONS",
        "LESSONS FOR FUTURE PROJECTS",
    ]);

    const failed = getSection("WHAT FAILED", [
        "IMPORTANT DECISIONS",
        "LESSONS FOR FUTURE PROJECTS",
    ]);

    const decisions = getSection("IMPORTANT DECISIONS", [
        "LESSONS FOR FUTURE PROJECTS",
    ]);

    const lessons = getSection("LESSONS FOR FUTURE PROJECTS");

    if (!selectedProject) {
        return (
            <div className="hindsight-page">
                <div className="hindsight-page-header">
                    <div className="hindsight-title-row">
                        <div className="hindsight-title-icon">
                            <Brain size={26} />
                        </div>

                        <div>
                            <h1>Hindsight</h1>
                            <p>
                                Explore what your projects have learned and reuse
                                that knowledge in future work.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="hindsight-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="hindsight-controls">
                    <div className="hindsight-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search projects, lessons, technologies..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <div className="hindsight-sort">
                        <span>Sort by:</span>
                        <select
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                        >
                            <option value="LATEST">Latest</option>
                            <option value="NAME">Name</option>
                            <option value="EXPERIENCES">Experiences</option>
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className="hindsight-filters">
                    <button
                        className={
                            projectFilter === "ALL"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() => setProjectFilter("ALL")}
                    >
                        All Projects <span>{projects.length}</span>
                    </button>

                    <button
                        className={
                            projectFilter === "ARCHIVED"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() => setProjectFilter("ARCHIVED")}
                    >
                        Archived
                        <span>
                            {
                                projects.filter(
                                    (project) =>
                                        (project.status || "").toUpperCase() ===
                                        "ARCHIVED"
                                ).length
                            }
                        </span>
                    </button>

                    <button
                        className={
                            projectFilter === "ACTIVE"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() => setProjectFilter("ACTIVE")}
                    >
                        Active
                        <span>
                            {
                                projects.filter(
                                    (project) =>
                                        (project.status || "ACTIVE").toUpperCase() ===
                                        "ACTIVE"
                                ).length
                            }
                        </span>
                    </button>
                </div>

                {filteredProjects.length > 0 ? (
                    <div className="hindsight-project-grid">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="hindsight-project-card"
                                onClick={() => handleProjectSelect(project)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        handleProjectSelect(project);
                                    }
                                }}
                            >
                                <div className="project-card-top">
                                    <span
                                        className={
                                            (project.status || "ACTIVE").toLowerCase() ===
                                            "active"
                                                ? "status-badge active"
                                                : "status-badge archived"
                                        }
                                    >
                                        {project.status || "ACTIVE"}
                                    </span>
                                </div>

                                <h2>{project.name}</h2>

                                <p className="project-card-description">
                                    {project.description ||
                                        "No project description available."}
                                </p>

                                <div className="project-card-footer">
                                    <div className="experience-count">
                                        <Brain size={16} />
                                        <span>
                                            {project.experience_count || 0}{" "}
                                            {project.experience_count === 1
                                                ? "Experience"
                                                : "Experiences"}
                                        </span>
                                    </div>

                                    <span className="view-hindsight">
                                        View Hindsight <ArrowRight size={16} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="hindsight-empty-state">
                        <FolderKanban size={38} />
                        <h3>No projects found</h3>
                        <p>Try changing your search or project filter.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="hindsight-page">
            <button
                className="hindsight-back-btn"
                onClick={handleBackToProjects}
                type="button"
            >
                <ArrowLeft size={17} />
                Select Another Project
            </button>

            <div className="hindsight-project-header">
                <div className="hindsight-project-heading">
                    <span className="current-project-badge">CURRENT PROJECT</span>
                    <h1>{selectedProject.name}</h1>
                    <p>
                        {selectedProject.description ||
                            "No project description available."}
                    </p>
                </div>

                <div className="project-header-stat">
                    <Brain size={20} />
                    <div>
                        <strong>{experiences.length}</strong>
                        <span>
                            {experiences.length === 1
                                ? "Experience"
                                : "Experiences"}
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="hindsight-error">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="lessons-section">
                <div className="hindsight-section-header">
                    <div>
                        <div className="hindsight-section-title">
                            <Lightbulb size={20} />
                            <h2>Lessons Learned</h2>
                        </div>
                        <p>Turn project experiences into reusable knowledge.</p>
                    </div>

                    <button
                        className="primary-btn hindsight-generate-btn"
                        onClick={handleGenerateHindsight}
                        disabled={loading || loadingProject}
                        type="button"
                    >
                        <Sparkles size={17} />
                        {loading ? "Generating..." : "Generate Hindsight"}
                    </button>
                </div>

                {loadingProject ? (
                    <p>Loading project experiences...</p>
                ) : (
                    <div className="hindsight-grid">
                        <div className="insight-card insight-worked">
                            <div className="insight-card-header">
                                <div className="insight-icon">
                                    <CheckCircle2 size={19} />
                                </div>
                                <span className="insight-label">WHAT WORKED</span>
                            </div>
                            <div className="insight-content">
                                {worked ||
                                    "Generate Hindsight to see what worked in this project."}
                            </div>
                        </div>

                        <div className="insight-card insight-failed">
                            <div className="insight-card-header">
                                <div className="insight-icon">
                                    <AlertTriangle size={19} />
                                </div>
                                <span className="insight-label">WHAT FAILED</span>
                            </div>
                            <div className="insight-content">
                                {failed ||
                                    "Generate Hindsight to identify problems and failures."}
                            </div>
                        </div>

                        <div className="insight-card insight-decisions">
                            <div className="insight-card-header">
                                <div className="insight-icon">
                                    <Scale size={19} />
                                </div>
                                <span className="insight-label">
                                    IMPORTANT DECISIONS
                                </span>
                            </div>
                            <div className="insight-content">
                                {decisions ||
                                    "Generate Hindsight to see important project decisions."}
                            </div>
                        </div>

                        <div className="insight-card insight-lessons">
                            <div className="insight-card-header">
                                <div className="insight-icon">
                                    <Lightbulb size={19} />
                                </div>
                                <span className="insight-label">
                                    LESSONS FOR FUTURE PROJECTS
                                </span>
                            </div>
                            <div className="insight-content">
                                {lessons ||
                                    "Generate Hindsight to discover reusable lessons."}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {hindsight && (
                <div className="ai-response">
                    <div className="ai-response-header">
                        <div>
                            <div className="ai-response-title">
                                <Brain size={20} />
                                <h2>AI Hindsight</h2>
                            </div>
                            <p>
                                AI-generated analysis based on this project's
                                recorded experiences.
                            </p>
                        </div>

                        <span className="generated-badge">Generated</span>
                    </div>

                    <div className="ai-hindsight-content">
                        <div className="hindsight-result" style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{cleanInsightText(hindsight)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Hindsight;
