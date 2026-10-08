import { useEffect, useState } from "react";
import api from "../services/api";

function Hindsight() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const [experiences, setExperiences] = useState([]);

    const [hindsight, setHindsight] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    // ----------------------------------------
    // LOAD PROJECTS
    // ----------------------------------------

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setError("");

            const response = await api.get("/hindsight/projects");

            setProjects(response.data || []);
        } catch (error) {
            console.error("Could not load projects:", error);

            setError("Could not load projects.");
        }
    };

    // ----------------------------------------
    // SELECT PROJECT
    // ----------------------------------------

    const handleProjectSelect = async (project) => {
        try {
            setSelectedProject(project);

            setHindsight("");

            setError("");

            const response = await api.get(
                `/hindsight/projects/${project.id}/experiences`
            );

            setExperiences(response.data?.experiences || []);
        } catch (error) {
            console.error(
                "Could not load project experiences:",
                error
            );

            setExperiences([]);

            setError(
                "Could not load experiences for this project."
            );
        }
    };

    // ----------------------------------------
    // GENERATE HINDSIGHT
    // ----------------------------------------

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

Analyze the experiences of this project:

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

            const response = await api.post(
                "/hindsight/generate",
                {
                    query: query,
                    project_id: selectedProject.id
                }
            );

            const result =
                response.data?.hindsight || "";

            setHindsight(result);
        } catch (error) {
            console.error(
                "Could not generate hindsight:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Could not generate hindsight."
            );
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------
    // EXTRACT HINDSIGHT SECTIONS
    // ----------------------------------------

    const getSection = (sectionName, nextSections = []) => {
        if (!hindsight) {
            return "";
        }

        let endPattern = nextSections
            .map((section) => section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("|");

        const regex = endPattern
            ? new RegExp(
                  `${sectionName}([\\s\\S]*?)(?=${endPattern}|$)`,
                  "i"
              )
            : new RegExp(
                  `${sectionName}([\\s\\S]*)`,
                  "i"
              );

        const match = hindsight.match(regex);

        return match
            ? match[1].trim()
            : "";
    };

    const worked = getSection(
        "WHAT WORKED",
        [
            "WHAT FAILED",
            "IMPORTANT DECISIONS",
            "LESSONS FOR FUTURE PROJECTS"
        ]
    );

    const failed = getSection(
        "WHAT FAILED",
        [
            "IMPORTANT DECISIONS",
            "LESSONS FOR FUTURE PROJECTS"
        ]
    );

    const decisions = getSection(
        "IMPORTANT DECISIONS",
        [
            "LESSONS FOR FUTURE PROJECTS"
        ]
    );

    const lessons = getSection(
        "LESSONS FOR FUTURE PROJECTS"
    );

    // ----------------------------------------
    // PROJECT SELECTION SCREEN
    // ----------------------------------------

    if (!selectedProject) {
        return (
            <div className="hindsight-page">

                <div className="page-header">
                    <div>
                        <h1>Hindsight</h1>

                        <p>
                            Select a project to view what it
                            learned.
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <div className="hindsight-project-grid">

                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="hindsight-project-card"
                            onClick={() =>
                                handleProjectSelect(project)
                            }
                        >
                            <h2>{project.name}</h2>

                            <p>
                                {project.description ||
                                    "No project description available."}
                            </p>

                            <div className="project-experience-count">
                                {project.experience_count || 0}{" "}
                                Experiences
                            </div>
                        </div>
                    ))}

                </div>

                {projects.length === 0 && !error && (
                    <p className="empty-message">
                        No projects available.
                    </p>
                )}
            </div>
        );
    }

    // ----------------------------------------
    // PROJECT HINDSIGHT PAGE
    // ----------------------------------------

    return (
        <div className="hindsight-page">

            {/* PROJECT HEADER */}

            <div className="current-project-header">

                <div>
                    <span className="current-project-badge">
                        Current Project
                    </span>

                    <h1>
                        {selectedProject.name}
                    </h1>

                    <p>
                        {selectedProject.description ||
                            "No project description available."}
                    </p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={() => {
                        setSelectedProject(null);
                        setExperiences([]);
                        setHindsight("");
                        setError("");
                    }}
                >
                    ← Select Another Project
                </button>

            </div>

            {/* PROJECT HINDSIGHT */}

            <div className="topbar">

                <div>
                    <h1>Project Hindsight</h1>

                    <p>
                        What did this project teach us?
                    </p>
                </div>

                <button
                    className="primary-btn"
                    onClick={handleGenerateHindsight}
                    disabled={loading}
                >
                    {loading
                        ? "Generating..."
                        : "Generate Hindsight"}
                </button>

            </div>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            {/* HINDSIGHT CARDS */}

            <div className="hindsight-grid">

                {/* WHAT WORKED */}

                <div className="insight-card">

                    <span className="insight-label">
                        WHAT WORKED
                    </span>

                    <p>
                        {worked ||
                            "Generate Hindsight to see what worked."}
                    </p>

                </div>

                {/* WHAT FAILED */}

                <div className="insight-card">

                    <span className="insight-label">
                        WHAT FAILED
                    </span>

                    <p>
                        {failed ||
                            "Generate Hindsight to see what failed."}
                    </p>

                </div>

                {/* IMPORTANT DECISIONS */}

                <div className="insight-card">

                    <span className="insight-label">
                        IMPORTANT DECISIONS
                    </span>

                    <p>
                        {decisions ||
                            "Generate Hindsight to see important decisions."}
                    </p>

                </div>

                {/* LESSONS */}

                <div className="insight-card">

                    <span className="insight-label">
                        LESSONS FOR FUTURE PROJECTS
                    </span>

                    <p>
                        {lessons ||
                            "Generate Hindsight to see reusable lessons."}
                    </p>

                </div>

            </div>

            {/* AI HINDSIGHT */}

            <div className="ai-response">

                <h2>AI Hindsight</h2>

                <div className="ai-hindsight-content">

                    {!hindsight && !loading && (
                        <p>
                            Click{" "}
                            <b>Generate Hindsight</b>{" "}
                            to let the AI analyze this
                            project's experiences.
                        </p>
                    )}

                    {loading && (
                        <p>
                            AI is analyzing this project's
                            experiences...
                        </p>
                    )}

                    {hindsight && (
                        <pre className="hindsight-result">
                            {hindsight}
                        </pre>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Hindsight;