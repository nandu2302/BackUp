import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Rocket,
    Plus,
    Pencil,
    Trash2,
    X,
    CheckCircle2,
    AlertTriangle,
    Clock3,
    History,
} from "lucide-react";

import api from "../../services/api";
import AskProjectMemory from "../../components/AskProjectMemory";

function Deployment() {
    const { projectId } = useParams();

    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingDeployment, setEditingDeployment] = useState(null);

    const [environment, setEnvironment] = useState("STAGING");
    const [status, setStatus] = useState("PENDING");
    const [version, setVersion] = useState("");
    const [deploymentNotes, setDeploymentNotes] = useState("");

    const [deploymentInsights, setDeploymentInsights] = useState([]);
    const [insightsLoading, setInsightsLoading] = useState(true);

    const fetchDeployments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/projects/${projectId}/deployments`
            );

            setDeployments(response.data || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to load deployments."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchDeploymentInsights = async () => {
        try {
            setInsightsLoading(true);

            const response = await api.get(
                `/projects/${projectId}/deployment-insights`
            );

            setDeploymentInsights(
                response.data?.insights || []
            );
        } catch (err) {
            console.error(err);
        } finally {
            setInsightsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeployments();
        fetchDeploymentInsights();
    }, [projectId]);

    const resetForm = () => {
        setEnvironment("STAGING");
        setStatus("PENDING");
        setVersion("");
        setDeploymentNotes("");
        setEditingDeployment(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (deployment) => {
        setEditingDeployment(deployment);

        setEnvironment(
            deployment.environment || "STAGING"
        );

        setStatus(
            deployment.status || "PENDING"
        );

        setVersion(
            deployment.version || ""
        );

        setDeploymentNotes(
            deployment.deployment_notes || ""
        );

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!environment.trim()) {
            setError("Environment is required.");
            return;
        }

        try {
            setError("");

            const deploymentData = {
                environment: environment.trim(),
                status,
                version: version.trim() || null,
                deployment_notes:
                    deploymentNotes.trim() || null,
            };

            if (editingDeployment) {
                await api.put(
                    `/projects/${projectId}/deployments/${editingDeployment.id}`,
                    deploymentData
                );

                setSuccessMessage(
                    status === "FAILED"
                        ? "Deployment updated and failure captured in project memory."
                        : "Deployment updated successfully."
                );
            } else {
                await api.post(
                    `/projects/${projectId}/deployments`,
                    deploymentData
                );

                setSuccessMessage(
                    "Deployment added successfully."
                );
            }

            closeModal();
            await fetchDeployments();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3500);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to save deployment."
            );
        }
    };

    const handleDelete = async (deploymentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this deployment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/projects/${projectId}/deployments/${deploymentId}`
            );

            setSuccessMessage(
                "Deployment deleted successfully."
            );

            await fetchDeployments();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to delete deployment."
            );
        }
    };

    const totalDeployments = deployments.length;

    const deployedCount = deployments.filter(
        (deployment) =>
            deployment.status === "DEPLOYED"
    ).length;

    const failedCount = deployments.filter(
        (deployment) =>
            deployment.status === "FAILED"
    ).length;

    const pendingCount = deployments.filter(
        (deployment) =>
            deployment.status === "PENDING"
    ).length;

    const getStatusClass = (deploymentStatus) => {
        switch (deploymentStatus) {
            case "DEPLOYED":
                return "deployment-status deployment-status-deployed";

            case "FAILED":
                return "deployment-status deployment-status-failed";

            case "PENDING":
                return "deployment-status deployment-status-pending";

            default:
                return "deployment-status";
        }
    };

    return (
        <div className="deployment-page">

            {/* Header */}

            <div className="deployment-header">

                <div>
                    <div className="deployment-title-row">
                        <Rocket size={28} />
                        <h1>Deployment</h1>
                    </div>

                    <p>
                        Manage deployment environments,
                        versions and deployment history.
                    </p>
                </div>

                <button
                    className="deployment-add-button"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    New Deployment
                </button>

            </div>

            {/* Messages */}

            {successMessage && (
                <div className="deployment-success-message">
                    <CheckCircle2 size={18} />
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="deployment-error-message">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {/* Statistics */}

            <div className="deployment-statistics">

                <div className="deployment-stat-card">
                    <div className="deployment-stat-icon">
                        <Rocket size={20} />
                    </div>

                    <div>
                        <span>Total</span>
                        <strong>{totalDeployments}</strong>
                    </div>
                </div>

                <div className="deployment-stat-card">
                    <div className="deployment-stat-icon">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Deployed</span>
                        <strong>{deployedCount}</strong>
                    </div>
                </div>

                <div className="deployment-stat-card">
                    <div className="deployment-stat-icon">
                        <AlertTriangle size={20} />
                    </div>

                    <div>
                        <span>Failed</span>
                        <strong>{failedCount}</strong>
                    </div>
                </div>

                <div className="deployment-stat-card">
                    <div className="deployment-stat-icon">
                        <Clock3 size={20} />
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>{pendingCount}</strong>
                    </div>
                </div>

            </div>

            {/* Deployment records */}

            <section className="deployment-section">

                <div className="deployment-section-header">

                    <div>
                        <h2>Deployment History</h2>

                        <p>
                            Track environments, versions
                            and deployment outcomes.
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="deployment-empty-state">
                        Loading deployments...
                    </div>
                ) : deployments.length === 0 ? (
                    <div className="deployment-empty-state">

                        <Rocket size={38} />

                        <h3>
                            No deployments yet
                        </h3>

                        <p>
                            Record your first project
                            deployment.
                        </p>

                        <button
                            className="deployment-secondary-button"
                            onClick={openAddModal}
                        >
                            <Plus size={17} />
                            Add Deployment
                        </button>

                    </div>
                ) : (
                    <div className="deployment-records">

                        {deployments.map((deployment) => (
                            <div
                                className="deployment-record-card"
                                key={deployment.id}
                            >

                                <div className="deployment-record-main">

                                    <div className="deployment-record-title-row">

                                        <h3>
                                            {deployment.environment}
                                        </h3>

                                        <span
                                            className={getStatusClass(
                                                deployment.status
                                            )}
                                        >
                                            {deployment.status}
                                        </span>

                                    </div>

                                    {deployment.version && (
                                        <div className="deployment-version">
                                            Version:{" "}
                                            {deployment.version}
                                        </div>
                                    )}

                                    {deployment.deployment_notes && (
                                        <p className="deployment-notes">
                                            {
                                                deployment.deployment_notes
                                            }
                                        </p>
                                    )}

                                    {deployment.status ===
                                        "FAILED" && (
                                        <div className="deployment-warning">
                                            <AlertTriangle
                                                size={15}
                                            />

                                            Deployment failure
                                            captured for
                                            project learning.
                                        </div>
                                    )}

                                </div>

                                <div className="deployment-record-actions">

                                    <button
                                        className="deployment-action-button"
                                        title="Edit deployment"
                                        onClick={() =>
                                            openEditModal(
                                                deployment
                                            )
                                        }
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        className="deployment-action-button danger"
                                        title="Delete deployment"
                                        onClick={() =>
                                            handleDelete(
                                                deployment.id
                                            )
                                        }
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

            {/* Historical lessons */}

            <section className="deployment-section deployment-history-section">

                <div className="deployment-section-header">

                    <div>
                        <div className="deployment-history-title">
                            <History size={20} />

                            <h2>
                                Historical Deployment Lessons
                            </h2>
                        </div>

                        <p>
                            Relevant deployment experiences
                            retrieved from ProjectHindsight.
                        </p>
                    </div>

                </div>

                {insightsLoading ? (
                    <div className="deployment-empty-state">
                        Searching project memory...
                    </div>
                ) : deploymentInsights.length === 0 ? (
                    <div className="deployment-empty-state">

                        <History size={34} />

                        <h3>
                            No historical deployment
                            lessons found
                        </h3>

                        <p>
                            Relevant deployment experiences
                            will appear here as they are
                            captured.
                        </p>

                    </div>
                ) : (
                    <div className="deployment-history-list">

                        {deploymentInsights
                            .slice(0, 5)
                            .map((memory, index) => (
                                <div
                                    className="deployment-history-card"
                                    key={index}
                                >

                                    <div className="deployment-history-icon">
                                        <History size={18} />
                                    </div>

                                    <div>
                                        <span className="deployment-history-label">
                                            Historical Experience
                                        </span>

                                        <p>
                                            {memory.text}
                                        </p>
                                    </div>

                                </div>
                            ))}

                    </div>
                )}

            </section>

            {/* Modal */}

            {showModal && (
                <div
                    className="deployment-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="deployment-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="deployment-modal-header">

                            <div>
                                <h2>
                                    {editingDeployment
                                        ? "Edit Deployment"
                                        : "New Deployment"}
                                </h2>

                                <p>
                                    Record deployment
                                    environment and outcome.
                                </p>
                            </div>

                            <button
                                className="deployment-modal-close"
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="deployment-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="deployment-form-row">

                                <div className="deployment-form-group">

                                    <label>
                                        Environment
                                    </label>

                                    <select
                                        value={environment}
                                        onChange={(event) =>
                                            setEnvironment(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="DEVELOPMENT">
                                            Development
                                        </option>

                                        <option value="TEST">
                                            Test
                                        </option>

                                        <option value="STAGING">
                                            Staging
                                        </option>

                                        <option value="PRODUCTION">
                                            Production
                                        </option>
                                    </select>

                                </div>

                                <div className="deployment-form-group">

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
                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="DEPLOYED">
                                            Deployed
                                        </option>

                                        <option value="FAILED">
                                            Failed
                                        </option>
                                    </select>

                                </div>

                            </div>

                            <div className="deployment-form-group">

                                <label>
                                    Version
                                </label>

                                <input
                                    type="text"
                                    value={version}
                                    onChange={(event) =>
                                        setVersion(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. v1.0.0"
                                />

                            </div>

                            <div className="deployment-form-group">

                                <label>
                                    Deployment Notes
                                </label>

                                <textarea
                                    rows="5"
                                    value={deploymentNotes}
                                    onChange={(event) =>
                                        setDeploymentNotes(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe the deployment, issues encountered, or outcome..."
                                />

                            </div>

                            <div className="deployment-form-actions">

                                <button
                                    type="button"
                                    className="deployment-cancel-button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="deployment-save-button"
                                >
                                    {editingDeployment
                                        ? "Update Deployment"
                                        : "Save Deployment"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            <AskProjectMemory projectId={projectId} stage="DEPLOYMENT"/>

        </div>
    );
}

export default Deployment;