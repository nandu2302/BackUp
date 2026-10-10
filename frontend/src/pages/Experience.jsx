
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Experience() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        project_name: "",
        experience_type: "Lesson Learned",
        title: "",
        description: "",
        solution: "",
        outcome: "",
        lesson: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await api.post("/experiences", form);

            setMessage(
                response.data.message ||
                "Experience saved successfully!"
            );

            setForm({
                project_name: "",
                experience_type: "Lesson Learned",
                title: "",
                description: "",
                solution: "",
                outcome: "",
                lesson: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Could not save the experience. Please check your backend connection and try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="experience-page">
            <div className="topbar">
                <div>
                    <h1>Add Project Experience</h1>
                    <p>
                        Capture what happened, how your team solved it,
                        and what future projects should remember.
                    </p>
                </div>
            </div>

            <div className="form-card experience-card">
                <div className="experience-card-heading">
                    <h2>Project Experience</h2>
                    <p>
                        Your submission will be stored in Hindsight memory
                        for future recall.
                    </p>
                </div>

                {message && (
                    <div className="form-success" role="status">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="form-error" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="experience-form-grid">
                        <div className="form-field">
                            <label htmlFor="project_name">
                                Project Name *
                            </label>
                            <input
                                id="project_name"
                                name="project_name"
                                value={form.project_name}
                                onChange={handleChange}
                                placeholder="e.g. Smart Emergency Response"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="experience_type">
                                Experience Type *
                            </label>
                            <select
                                id="experience_type"
                                name="experience_type"
                                value={form.experience_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="Lesson Learned">
                                    Lesson Learned
                                </option>
                                <option value="Problem">
                                    Problem
                                </option>
                                <option value="Decision">
                                    Decision
                                </option>
                                <option value="Success">
                                    Success
                                </option>
                                <option value="Challenge">
                                    Challenge
                                </option>
                            </select>
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="title">
                                Experience Title *
                            </label>
                            <input
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Give this experience a short, meaningful title"
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="description">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="What happened? Describe the situation or problem."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="solution">
                                Solution *
                            </label>
                            <textarea
                                id="solution"
                                name="solution"
                                value={form.solution}
                                onChange={handleChange}
                                placeholder="How did the team solve the problem or make the decision?"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="outcome">
                                Outcome *
                            </label>
                            <textarea
                                id="outcome"
                                name="outcome"
                                value={form.outcome}
                                onChange={handleChange}
                                placeholder="What was the result? What improved or changed?"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="lesson">
                                Lesson for Future Projects *
                            </label>
                            <textarea
                                id="lesson"
                                name="lesson"
                                value={form.lesson}
                                onChange={handleChange}
                                placeholder="What should another team remember or do differently?"
                                rows={4}
                                required
                            />
                        </div>
                    </div>

                    <div className="experience-form-actions">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => navigate("/dashboard")}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving Experience..."
                                : "Save Experience"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Experience;
