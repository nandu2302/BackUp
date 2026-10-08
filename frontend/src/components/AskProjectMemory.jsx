import { useState } from "react";
import api from "../services/api";

function formatInlineText(text) {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={index}>
                    {part.slice(2, -2)}
                </strong>
            );
        }

        return <span key={index}>{part}</span>;
    });
}

function formatHindsight(text) {
    if (!text) return null;

    const sections = text
        .split(/###\s+/)
        .map((section) => section.trim())
        .filter(Boolean);

    return (
        <div className="memory-result">

            {sections.map((section, index) => {

                const lines = section
                    .split("\n")
                    .filter((line) => line.trim() !== "");

                const title = lines[0];
                const content = lines.slice(1);

                return (
                    <div
                        className={`memory-section ${
                            index === 0
                                ? "memory-section-primary"
                                : ""
                        }`}
                        key={index}
                    >
                        <div className="memory-section-title">
                            <span className="section-number">
                                {index + 1}
                            </span>

                            <h4>{title}</h4>
                        </div>

                        <div className="memory-section-content">

                            {content.map((line, lineIndex) => {

                                const cleanLine = line.trim();

                                if (
                                    cleanLine.startsWith("- ") ||
                                    cleanLine.startsWith("* ")
                                ) {
                                    return (
                                        <div
                                            className="memory-bullet"
                                            key={lineIndex}
                                        >
                                            <span className="bullet-dot">
                                                •
                                            </span>

                                            <span>
                                                {formatInlineText(
                                                    cleanLine.substring(2)
                                                )}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <p key={lineIndex}>
                                        {formatInlineText(cleanLine)}
                                    </p>
                                );
                            })}

                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AskProjectMemory({ projectId, stage }) {

    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [lastQuery, setLastQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const askMemory = async () => {

        if (!query.trim()) {
            return;
        }

        setLoading(true);
        setError("");
        setAnswer("");

        try {

            const currentQuery = query.trim();

            const response = await api.post("/hindsight", {
                query: currentQuery,
                project_id: projectId,
                current_stage: stage || null
            });

            setLastQuery(currentQuery);
            setAnswer(response.data.hindsight);

        } catch (err) {

            console.error(
                "Ask Project Memory error:",
                err
            );

            setError(
                "Unable to retrieve project memory."
            );

        } finally {

            setLoading(false);

        }
    };

    const clearMemory = () => {
        setQuery("");
        setAnswer("");
        setLastQuery("");
        setError("");
    };

    return (
        <section className="ask-memory-section">

            <div className="topbar">

                <div>
                    <h2>Ask Project Memory</h2>

                    <p>
                        Search what your organization has already learned.
                    </p>
                </div>

            </div>

            {/* SEARCH */}

            <div className="search-card">

                <input
                    type="text"
                    value={query}
                    onChange={(e) =>
                        setQuery(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            askMemory();
                        }
                    }}
                    placeholder="Example: Have we faced API integration problems?"
                />

                <button
                    className="primary-btn"
                    onClick={askMemory}
                    disabled={loading}
                >
                    {loading
                        ? "Searching..."
                        : "Ask Memory"}
                </button>

            </div>

            {/* LOADING */}

            {loading && (
                <div className="memory-loading">
                    <div className="memory-loading-icon">
                        ◈
                    </div>

                    <div>
                        <strong>
                            Searching project memory...
                        </strong>

                        <p>
                            Looking through previous project
                            experiences and lessons.
                        </p>
                    </div>
                </div>
            )}

            {/* ERROR */}

            {error && (
                <p className="message">
                    {error}
                </p>
            )}

            {/* RESULT */}

            {answer && !loading && (

                <div className="memory-answer-card">

                    {/* HEADER */}

                    <div className="memory-answer-header">

                        <div>

                            <span className="small-label">
                                PROJECT MEMORY
                            </span>

                            <h3>
                                Hindsight Insights
                            </h3>

                            <p>
                                Previous project experiences
                                relevant to your question.
                            </p>

                        </div>

                        <div className="memory-icon">
                            ◈
                        </div>

                    </div>

                    {/* QUESTION */}

                    <div className="memory-question">

                        <span>
                            YOUR QUESTION
                        </span>

                        <p>
                            {lastQuery}
                        </p>

                    </div>

                    {/* INSIGHTS */}

                    {formatHindsight(answer)}

                    {/* ACTION */}

                    <div className="memory-footer">

                        <button
                            className="secondary-btn"
                            onClick={clearMemory}
                        >
                            Ask Another Question
                        </button>

                    </div>

                </div>
            )}

        </section>
    );
}

export default AskProjectMemory;