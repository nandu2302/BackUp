import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateProject() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        domain: "",
        team_size: "",
        technology: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await api.post("/projects", {
                name: formData.name,
                description: formData.description,
                domain: formData.domain,
                team_size: Number(formData.team_size),
                technology: formData.technology
            });

            console.log("Project created:", response.data);

            setSuccess("Project created successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 800);

        } catch (err) {
            console.error("Create project error:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to create project."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            <div className="topbar">

                <div>
                    <h1>Create New Project</h1>

                    <p>
                        Start a new project and build its
                        organizational memory.
                    </p>
                </div>

            </div>


            <form
                className="form-card"
                onSubmit={handleSubmit}
            >

                <label htmlFor="name">
                    Project Name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: Smart Emergency Platform"
                    required
                />


                <label htmlFor="description">
                    Project Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this project is about..."
                    required
                />


                <label htmlFor="domain">
                    Domain
                </label>

                <input
                    id="domain"
                    name="domain"
                    type="text"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="Example: Healthcare, Finance, E-commerce"
                    required
                />


                <label htmlFor="team_size">
                    Team Size
                </label>

                <input
                    id="team_size"
                    name="team_size"
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={handleChange}
                    placeholder="Example: 5"
                    required
                />


                <label htmlFor="technology">
                    Technology Stack
                </label>

                <input
                    id="technology"
                    name="technology"
                    type="text"
                    value={formData.technology}
                    onChange={handleChange}
                    placeholder="Example: React, FastAPI, PostgreSQL"
                    required
                />


                {error && (
                    <p className="message">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="message">
                        {success}
                    </p>
                )}


                <button
                    type="submit"
                    className="primary-btn"
                    disabled={loading}
                >
                    {loading
                        ? "Creating Project..."
                        : "Create Project"}
                </button>

            </form>

        </div>
    );
}

export default CreateProject;