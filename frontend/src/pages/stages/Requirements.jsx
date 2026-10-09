import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Plus,
    X,
    Search,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    Clock3,
} from "lucide-react";

import api from "../../services/api";
import AskProjectMemory from "../../components/AskProjectMemory";

function Requirements() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [requirements, setRequirements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Modal
    const [showForm, setShowForm] = useState(false);

    // Form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("TODO");

    // Search / filter
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");

    useEffect(() => {
        fetchRequirements();
    }, [projectId]);

    const fetchRequirements = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/projects/${projectId}/requirements`
            );

            setRequirements(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load requirements.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Requirement title is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            await api.post(
                `/projects/${projectId}/requirements`,
                {
                    title: title.trim(),
                    description:
                        description.trim() || null,
                    status,
                    priority,
                    progress: 0,
                }
            );

            resetForm();

            setShowForm(false);
            setSuccessMessage(
                "Requirement added successfully."
            );

            await fetchRequirements();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to save the requirement.");
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setStatus("TODO");
        setError("");
    };

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        resetForm();
    };

    const updateRequirement = async (
        requirementId,
        data
    ) => {
        try {
            setError("");

           await api.put(
                `/projects/${projectId}/requirements/${requirementId}`,
                data
            );

            await fetchRequirements();
        } catch (err) {
            console.error(err);
            setError(
                "Failed to update the requirement."
            );
        }
    };

    const filteredRequirements = useMemo(() => {
        return requirements.filter((item) => {
            const matchesFilter =
                activeFilter === "ALL" ||
                item.status === activeFilter ||
                (
                    activeFilter === "HIGH" &&
                    item.priority === "HIGH"
                );

            const search =
                searchTerm.toLowerCase();

            const matchesSearch =
                item.title
                    .toLowerCase()
                    .includes(search) ||
                (item.description || "")
                    .toLowerCase()
                    .includes(search);

            return (
                matchesFilter &&
                matchesSearch
            );
        });
    }, [
        requirements,
        activeFilter,
        searchTerm,
    ]);

    const completedCount =
        requirements.filter(
            (item) => item.status === "COMPLETED"
        ).length;

    const blockedCount =
        requirements.filter(
            (item) => item.status === "BLOCKED"
        ).length;

    const inProgressCount =
        requirements.filter(
            (item) => item.status === "IN_PROGRESS"
        ).length;

    const overallProgress =
        requirements.length === 0
            ? 0
            : Math.round(
                requirements.reduce(
                    (total, item) =>
                        total + item.progress,
                    0
                ) / requirements.length
            );

    const getPriorityClass = (value) => {
        return value.toLowerCase();
    };

    const getStatusClass = (value) => {
        return value.toLowerCase();
    };

    return (
        <div className="requirements-page">

            {/* Header */}
            <div className="requirements-page-header">

                <div className="requirements-title-section">

                    <div className="requirements-title-icon">
                        <ClipboardList size={24} />
                    </div>

                    <div>
                        <h1>Requirements</h1>

                        <p>
                            Define and track what this
                            project needs to deliver.
                        </p>
                    </div>

                </div>

                <button
                    className="primary-btn add-requirement-btn"
                    onClick={() => {
                        setShowForm(true);
                        setError("");
                    }}
                >
                    <Plus size={18} />
                    Add Requirement
                </button>

            </div>

            {/* Success */}
            {successMessage && (
                <div className="requirement-success-message">
                    <CheckCircle2 size={18} />
                    {successMessage}
                </div>
            )}

            {/* Statistics */}
            <div className="requirement-stats">

                <div className="requirement-stat-card">
                    <div className="requirement-stat-icon total">
                        <ClipboardList size={18} />
                    </div>

                    <div>
                        <span>Total</span>
                        <strong>
                            {requirements.length}
                        </strong>
                    </div>
                </div>

                <div className="requirement-stat-card">
                    <div className="requirement-stat-icon progress">
                        <Clock3 size={18} />
                    </div>

                    <div>
                        <span>In Progress</span>
                        <strong>
                            {inProgressCount}
                        </strong>
                    </div>
                </div>

                <div className="requirement-stat-card">
                    <div className="requirement-stat-icon completed">
                        <CheckCircle2 size={18} />
                    </div>

                    <div>
                        <span>Completed</span>
                        <strong>
                            {completedCount}
                        </strong>
                    </div>
                </div>

                <div className="requirement-stat-card">
                    <div className="requirement-stat-icon blocked">
                        <AlertCircle size={18} />
                    </div>

                    <div>
                        <span>Blocked</span>
                        <strong>
                            {blockedCount}
                        </strong>
                    </div>
                </div>

            </div>

            {/* Overall Progress */}
            {requirements.length > 0 && (
                <div className="overall-progress-card">

                    <div className="overall-progress-header">
                        <div>
                            <h3>Overall Progress</h3>
                            <p>
                                Average progress across
                                project requirements
                            </p>
                        </div>

                        <strong>
                            {overallProgress}%
                        </strong>
                    </div>

                    <div className="overall-progress-track">
                        <div
                            className="overall-progress-fill"
                            style={{
                                width: `${overallProgress}%`,
                            }}
                        />
                    </div>

                </div>
            )}

            {/* Search + filters */}
            <div className="requirements-toolbar">

                <div className="requirements-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search requirements..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div className="requirements-filters">

                    <button
                        className={
                            activeFilter === "ALL"
                                ? "requirement-filter active"
                                : "requirement-filter"
                        }
                        onClick={() =>
                            setActiveFilter("ALL")
                        }
                    >
                        All
                    </button>

                    <button
                        className={
                            activeFilter === "HIGH"
                                ? "requirement-filter active"
                                : "requirement-filter"
                        }
                        onClick={() =>
                            setActiveFilter("HIGH")
                        }
                    >
                        High Priority
                    </button>

                    <button
                        className={
                            activeFilter === "IN_PROGRESS"
                                ? "requirement-filter active"
                                : "requirement-filter"
                        }
                        onClick={() =>
                            setActiveFilter("IN_PROGRESS")
                        }
                    >
                        In Progress
                    </button>

                    <button
                        className={
                            activeFilter === "BLOCKED"
                                ? "requirement-filter active"
                                : "requirement-filter"
                        }
                        onClick={() =>
                            setActiveFilter("BLOCKED")
                        }
                    >
                        Blocked
                    </button>

                    <button
                        className={
                            activeFilter === "COMPLETED"
                                ? "requirement-filter active"
                                : "requirement-filter"
                        }
                        onClick={() =>
                            setActiveFilter("COMPLETED")
                        }
                    >
                        Completed
                    </button>

                </div>

            </div>

            {/* Error */}
            {error && !showForm && (
                <div className="requirement-error-message">
                    {error}
                </div>
            )}

            {/* Requirements */}
            <div className="requirements-section">

                <div className="requirements-section-header">
                    <div>
                        <h2>Project Requirements</h2>

                        <p>
                            {filteredRequirements.length}{" "}
                            {filteredRequirements.length === 1
                                ? "requirement"
                                : "requirements"}{" "}
                            shown
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="requirement-empty-state">
                        <ClipboardList size={32} />
                        <p>
                            Loading requirements...
                        </p>
                    </div>
                )}

                {!loading &&
                    filteredRequirements.length === 0 && (
                        <div className="requirement-empty-state">

                            <div className="empty-requirement-icon">
                                <ClipboardList size={28} />
                            </div>

                            <h3>
                                {requirements.length === 0
                                    ? "No requirements yet"
                                    : "No matching requirements"}
                            </h3>

                            <p>
                                {requirements.length === 0
                                    ? "Start defining what this project needs to deliver."
                                    : "Try another search or filter."}
                            </p>

                            {requirements.length === 0 && (
                                <button
                                    className="primary-btn"
                                    onClick={() =>
                                        setShowForm(true)
                                    }
                                >
                                    <Plus size={17} />
                                    Add First Requirement
                                </button>
                            )}

                        </div>
                    )}

                {!loading &&
                    filteredRequirements.length > 0 && (
                        <div className="requirements-list">

                            {filteredRequirements.map(
                                (item) => (
                                    <div
                                        className="requirement-card"
                                        key={item.id}
                                    >

                                        <div className="requirement-card-header">

                                            <div className="requirement-card-title">

                                                <div className="requirement-card-icon">
                                                    <ClipboardList
                                                        size={17}
                                                    />
                                                </div>

                                                <div>
                                                    <h3>
                                                        {item.title}
                                                    </h3>

                                                    <div className="requirement-badges">

                                                        <span
                                                            className={`requirement-priority ${getPriorityClass(
                                                                item.priority
                                                            )}`}
                                                        >
                                                            {item.priority}
                                                        </span>

                                                        <span
                                                            className={`requirement-status ${getStatusClass(
                                                                item.status
                                                            )}`}
                                                        >
                                                            {item.status.replace(
                                                                "_",
                                                                " "
                                                            )}
                                                        </span>

                                                    </div>
                                                </div>

                                            </div>

                                            <strong className="requirement-percentage">
                                                {item.progress}%
                                            </strong>

                                        </div>

                                        {item.description && (
                                            <p className="requirement-description">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="requirement-progress-area">

                                            <div className="requirement-progress-track">

                                                <div
                                                    className="requirement-progress-fill"
                                                    style={{
                                                        width: `${item.progress}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                        <div className="requirement-card-footer">

                                            <span>
                                                Progress
                                            </span>

                                            <select
                                                value={item.progress}
                                                onChange={(event) =>
                                                    updateRequirement(
                                                        item.id,
                                                        {
                                                            progress:
                                                                Number(
                                                                    event
                                                                        .target
                                                                        .value
                                                                ),
                                                        }
                                                    )
                                                }
                                            >
                                                <option value="0">
                                                    0%
                                                </option>

                                                <option value="25">
                                                    25%
                                                </option>

                                                <option value="50">
                                                    50%
                                                </option>

                                                <option value="75">
                                                    75%
                                                </option>

                                                <option value="100">
                                                    100%
                                                </option>
                                            </select>

                                            <span className="requirement-footer-divider">
                                                Status
                                            </span>

                                            <select
                                                value={item.status}
                                                onChange={(event) =>
                                                    updateRequirement(
                                                        item.id,
                                                        {
                                                            status:
                                                                event
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                            >
                                                <option value="TODO">
                                                    TODO
                                                </option>

                                                <option value="IN_PROGRESS">
                                                    IN PROGRESS
                                                </option>

                                                <option value="COMPLETED">
                                                    COMPLETED
                                                </option>

                                                <option value="BLOCKED">
                                                    BLOCKED
                                                </option>
                                            </select>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

            </div>

            {/* Add Requirement Modal */}
            {showForm && (
                <div
                    className="requirement-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }
                    }}
                >

                    <div className="requirement-modal">

                        <div className="requirement-modal-header">

                            <div>
                                <div className="requirement-modal-title-row">

                                    <div className="requirement-modal-icon">
                                        <ClipboardList
                                            size={20}
                                        />
                                    </div>

                                    <h2>
                                        Add Requirement
                                    </h2>

                                </div>

                                <p>
                                    Define something this
                                    project needs to deliver.
                                </p>
                            </div>

                            <button
                                className="requirement-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="requirement-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-group">
                                <label>
                                    Requirement
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="What does this project need?"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe the requirement and expected outcome..."
                                    rows="4"
                                />
                            </div>

                            <div className="requirement-form-row">

                                <div className="form-group">
                                    <label>
                                        Priority
                                    </label>

                                    <select
                                        value={priority}
                                        onChange={(event) =>
                                            setPriority(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="LOW">
                                            Low
                                        </option>

                                        <option value="MEDIUM">
                                            Medium
                                        </option>

                                        <option value="HIGH">
                                            High
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="TODO">
                                            TODO
                                        </option>

                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>

                                        <option value="COMPLETED">
                                            Completed
                                        </option>

                                        <option value="BLOCKED">
                                            Blocked
                                        </option>
                                    </select>
                                </div>

                            </div>

                            {error && (
                                <div className="requirement-form-error">
                                    {error}
                                </div>
                            )}

                            <div className="requirement-form-actions">

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Adding..."
                                        : "Add Requirement"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* Back to project */}
            <div className="requirements-back">
                <button
                    type="button"
                    className="back-to-project-stages-btn"
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    <span className="back-to-project-stages-arrow">←</span>
                    <span>Back to Project</span>
                </button>
            </div>

            <AskProjectMemory projectId={projectId} stage="REQUIREMENTS"/>

        </div>
    );
}

export default Requirements;