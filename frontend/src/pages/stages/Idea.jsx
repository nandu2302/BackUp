import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
    Plus,
    X,
    Search,
    Lightbulb,
    CheckCircle2,
    Clock3,
    XCircle,
} from "lucide-react";

import api from "../../services/api";

import AskProjectMemory from "../../components/AskProjectMemory";


function Idea() {

    const { projectId } = useParams();

    const navigate = useNavigate();


    const [ideas, setIdeas] = useState([]);


    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);


    const [error, setError] = useState("");

    const [successMessage, setSuccessMessage] = useState("");


    // Modal

    const [showForm, setShowForm] = useState(false);


    // Form

    const [idea, setIdea] = useState("");

    const [description, setDescription] = useState("");

    const [status, setStatus] = useState("PROPOSED");

    const [rejectionReason, setRejectionReason] = useState("");


    // Search/filter

    const [searchTerm, setSearchTerm] = useState("");

    const [activeFilter, setActiveFilter] = useState("ALL");


    useEffect(() => {

        fetchIdeas();

    }, [projectId]);


    const fetchIdeas = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                `/projects/${projectId}/ideas`
            );


            setIdeas(response.data);

        } catch (err) {

            console.error(err);

            setError("Failed to load ideas.");

        } finally {

            setLoading(false);

        }

    };


    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!idea.trim()) {

            setError("Please enter an idea.");

            return;

        }


        // Rejection reason is mandatory for rejected ideas

        if (
            status === "REJECTED" &&
            !rejectionReason.trim()
        ) {

            setError("Please provide a rejection reason.");

            return;

        }


        try {

            setSaving(true);

            setError("");

            setSuccessMessage("");


            await api.post(
                `/projects/${projectId}/ideas`,
                {
                    idea: idea.trim(),

                    description:
                        description.trim() || null,

                    status,

                    rejection_reason:
                        status === "REJECTED"
                            ? rejectionReason.trim() || null
                            : null,
                }
            );


            // Reset form

            setIdea("");

            setDescription("");

            setStatus("PROPOSED");

            setRejectionReason("");


            setShowForm(false);

            setSuccessMessage(
                "Idea added successfully."
            );


            await fetchIdeas();


            setTimeout(() => {

                setSuccessMessage("");

            }, 3000);


        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to save the idea."
            );

        } finally {

            setSaving(false);

        }

    };


    const closeForm = () => {

        if (saving) {

            return;

        }


        setShowForm(false);

        setError("");


        setIdea("");

        setDescription("");

        setStatus("PROPOSED");

        setRejectionReason("");

    };


    const filteredIdeas = useMemo(() => {

        return ideas.filter((item) => {

            const matchesFilter =
                activeFilter === "ALL" ||
                item.status === activeFilter;


            const search =
                searchTerm.toLowerCase();


            const matchesSearch =
                item.idea
                    .toLowerCase()
                    .includes(search) ||

                (item.description || "")
                    .toLowerCase()
                    .includes(search);


            return matchesFilter && matchesSearch;

        });

    }, [
        ideas,
        activeFilter,
        searchTerm,
    ]);


    const proposedCount = ideas.filter(
        (item) => item.status === "PROPOSED"
    ).length;


    const selectedCount = ideas.filter(
        (item) => item.status === "SELECTED"
    ).length;


    const rejectedCount = ideas.filter(
        (item) => item.status === "REJECTED"
    ).length;


    const getStatusClass = (statusValue) => {

        return statusValue.toLowerCase();

    };


    return (

        <div className="idea-page">


            {/* Header */}

            <div className="idea-page-header">


                <div className="idea-title-section">


                    <div className="idea-title-icon">

                        <Lightbulb size={24} />

                    </div>


                    <div>

                        <h1>Ideas</h1>

                        <p>
                            Capture, explore and evaluate ideas
                            for this project.
                        </p>

                    </div>


                </div>


                <button
                    className="primary-btn add-idea-btn"
                    onClick={() => {

                        setShowForm(true);

                        setError("");

                    }}
                >

                    <Plus size={18} />

                    Add New Idea

                </button>


            </div>


            {/* Success */}

            {successMessage && (

                <div className="idea-success-message">

                    <CheckCircle2 size={18} />

                    {successMessage}

                </div>

            )}


            {/* Statistics */}

            <div className="idea-stats">


                <div className="idea-stat-card">

                    <div className="idea-stat-icon total">

                        <Lightbulb size={18} />

                    </div>


                    <div>

                        <span>Total Ideas</span>

                        <strong>
                            {ideas.length}
                        </strong>

                    </div>

                </div>


                <div className="idea-stat-card">

                    <div className="idea-stat-icon proposed">

                        <Clock3 size={18} />

                    </div>


                    <div>

                        <span>Proposed</span>

                        <strong>
                            {proposedCount}
                        </strong>

                    </div>

                </div>


                <div className="idea-stat-card">

                    <div className="idea-stat-icon selected">

                        <CheckCircle2 size={18} />

                    </div>


                    <div>

                        <span>Selected</span>

                        <strong>
                            {selectedCount}
                        </strong>

                    </div>

                </div>


                <div className="idea-stat-card">

                    <div className="idea-stat-icon rejected">

                        <XCircle size={18} />

                    </div>


                    <div>

                        <span>Rejected</span>

                        <strong>
                            {rejectedCount}
                        </strong>

                    </div>

                </div>


            </div>


            {/* Search + Filters */}

            <div className="idea-toolbar">


                <div className="idea-search">

                    <Search size={18} />


                    <input
                        type="text"
                        placeholder="Search ideas..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="idea-filters">


                    <button
                        className={
                            activeFilter === "ALL"
                                ? "idea-filter active"
                                : "idea-filter"
                        }
                        onClick={() =>
                            setActiveFilter("ALL")
                        }
                    >

                        All

                    </button>


                    <button
                        className={
                            activeFilter === "PROPOSED"
                                ? "idea-filter active"
                                : "idea-filter"
                        }
                        onClick={() =>
                            setActiveFilter("PROPOSED")
                        }
                    >

                        Proposed

                    </button>


                    <button
                        className={
                            activeFilter === "SELECTED"
                                ? "idea-filter active"
                                : "idea-filter"
                        }
                        onClick={() =>
                            setActiveFilter("SELECTED")
                        }
                    >

                        Selected

                    </button>


                    <button
                        className={
                            activeFilter === "REJECTED"
                                ? "idea-filter active"
                                : "idea-filter"
                        }
                        onClick={() =>
                            setActiveFilter("REJECTED")
                        }
                    >

                        Rejected

                    </button>


                </div>

            </div>


            {/* Error */}

            {error && !showForm && (

                <div className="idea-error-message">

                    {error}

                </div>

            )}


            {/* Ideas */}

            <div className="ideas-section">


                <div className="ideas-section-header">

                    <div>

                        <h2>Project Ideas</h2>

                        <p>

                            {filteredIdeas.length}{" "}

                            {
                                filteredIdeas.length === 1
                                    ? "idea"
                                    : "ideas"
                            }{" "}

                            shown

                        </p>

                    </div>

                </div>


                {loading && (

                    <div className="idea-empty-state">

                        <Lightbulb size={32} />

                        <p>Loading ideas...</p>

                    </div>

                )}


                {!loading &&
                    filteredIdeas.length === 0 && (

                        <div className="idea-empty-state">


                            <div className="empty-idea-icon">

                                <Lightbulb size={28} />

                            </div>


                            <h3>

                                {ideas.length === 0
                                    ? "No ideas yet"
                                    : "No matching ideas"}

                            </h3>


                            <p>

                                {ideas.length === 0
                                    ? "Start capturing ideas for this project."
                                    : "Try another search or filter."}

                            </p>


                            {ideas.length === 0 && (

                                <button
                                    className="primary-btn"
                                    onClick={() =>
                                        setShowForm(true)
                                    }
                                >

                                    <Plus size={17} />

                                    Add First Idea

                                </button>

                            )}


                        </div>

                    )}


                {!loading &&
                    filteredIdeas.length > 0 && (

                        <div className="ideas-grid">


                            {filteredIdeas.map((item) => (

                                <div
                                    className="idea-item-card"
                                    key={item.id}
                                >


                                    <div className="idea-card-top">


                                        <div className="idea-card-icon">

                                            <Lightbulb size={18} />

                                        </div>


                                        <span
                                            className={`idea-status ${getStatusClass(
                                                item.status
                                            )}`}
                                        >

                                            {item.status}

                                        </span>


                                    </div>


                                    <h3>
                                        {item.idea}
                                    </h3>


                                    {item.description && (

                                        <p>
                                            {item.description}
                                        </p>

                                    )}


                                    {/* Existing rejection reason display */}

                                    {item.rejection_reason && (

                                        <div className="rejection-box">

                                            <strong>
                                                Rejection reason
                                            </strong>

                                            <span>
                                                {
                                                    item.rejection_reason
                                                }
                                            </span>

                                        </div>

                                    )}


                                </div>

                            ))}


                        </div>

                    )}


            </div>


            {/* Add Idea Modal */}

            {showForm && (

                <div
                    className="idea-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeForm();

                        }

                    }}
                >


                    <div className="idea-modal">


                        <div className="idea-modal-header">


                            <div>

                                <div className="modal-title-row">


                                    <div className="modal-icon">

                                        <Lightbulb size={20} />

                                    </div>


                                    <h2>
                                        Add New Idea
                                    </h2>


                                </div>


                                <p>
                                    Capture a new idea for this
                                    project.
                                </p>


                            </div>


                            <button
                                className="modal-close-btn"
                                onClick={closeForm}
                                disabled={saving}
                            >

                                <X size={20} />

                            </button>


                        </div>


                        <form
                            className="idea-form"
                            onSubmit={handleSubmit}
                        >


                            {/* Idea */}

                            <div className="form-group">

                                <label>

                                    Idea

                                    <span>*</span>

                                </label>


                                <input
                                    type="text"
                                    value={idea}
                                    onChange={(event) =>
                                        setIdea(
                                            event.target.value
                                        )
                                    }
                                    placeholder="What is your idea?"
                                    autoFocus
                                />

                            </div>


                            {/* Description */}

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
                                    placeholder="Describe the idea and why it could be useful..."
                                    rows="4"
                                />

                            </div>


                            {/* Status */}

                            <div className="form-group">

                                <label>
                                    Status
                                </label>


                                <select
                                    value={status}
                                    onChange={(event) => {

                                        setStatus(
                                            event.target.value
                                        );

                                        // Clear rejection reason
                                        // when status is changed
                                        // away from REJECTED

                                        if (
                                            event.target.value !==
                                            "REJECTED"
                                        ) {

                                            setRejectionReason("");

                                        }

                                    }}
                                >

                                    <option value="PROPOSED">
                                        Proposed
                                    </option>


                                    <option value="SELECTED">
                                        Selected
                                    </option>


                                    <option value="REJECTED">
                                        Rejected
                                    </option>

                                </select>

                            </div>


                            {/* Rejection Reason */}

                            {status === "REJECTED" && (

                                <div className="form-group">

                                    <label>

                                        Rejection Reason

                                        <span>*</span>

                                    </label>


                                    <textarea
                                        value={rejectionReason}
                                        onChange={(event) =>
                                            setRejectionReason(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Why was this idea rejected?"
                                        rows="3"
                                    />

                                </div>

                            )}


                            {/* Form Error */}

                            {error && (

                                <div className="idea-form-error">

                                    {error}

                                </div>

                            )}


                            {/* Form Actions */}

                            <div className="idea-form-actions">


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
                                        : "Add Idea"}

                                </button>


                            </div>


                        </form>


                    </div>

                </div>

            )}

             <button
                    type="button"
                    className="back-to-project-stages-btn"
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    <span className="back-to-project-stages-arrow">←</span>
                    <span>Back to Project</span>
                </button>
                
            <AskProjectMemory
                projectId={projectId}
                stage="IDEA"
            />


        </div>

    );

}


export default Idea;