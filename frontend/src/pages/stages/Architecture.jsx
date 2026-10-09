import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Plus,
    X,
    Layers3,
    Server,
    Database,
    Brain,
    Trash2,
    ArrowRight,
    CheckCircle2,
    Pencil,
    Upload,
    Image as ImageIcon,
} from "lucide-react";

import api from "../../services/api";
import AskProjectMemory from "../../components/AskProjectMemory";

function Architecture() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [architectures, setArchitectures] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
     * showForm controls the modal.
     *
     * editingArchitecture:
     * null  -> Add mode
     * object -> Edit mode
     */
    const [showForm, setShowForm] = useState(false);
    const [editingArchitecture, setEditingArchitecture] =
        useState(null);

    /*
     * Form fields
     */
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [technologyStack, setTechnologyStack] =
        useState("");
    const [diagram, setDiagram] = useState("");

    /*
     * Image upload
     */
    const [selectedImage, setSelectedImage] =
        useState(null);

    const [imagePreview, setImagePreview] =
        useState(null);

    /*
     * Fetch architectures whenever
     * projectId changes.
     */
    useEffect(() => {
        fetchArchitectures();
    }, [projectId]);

    /*
     * =========================================
     * FETCH ARCHITECTURES
     * =========================================
     */

    const fetchArchitectures = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/projects/${projectId}/architectures`
            );

            setArchitectures(response.data);
        } catch (err) {
            console.error(err);

            setError(
                "Failed to load architecture."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * =========================================
     * RESET FORM
     * =========================================
     */

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setTechnologyStack("");
        setDiagram("");

        setSelectedImage(null);
        setImagePreview(null);

        setEditingArchitecture(null);
    };

    /*
     * =========================================
     * OPEN ADD FORM
     * =========================================
     */

    const openAddForm = () => {
        resetForm();

        setError("");

        setShowForm(true);
    };

    /*
     * =========================================
     * OPEN EDIT FORM
     * =========================================
     */

    const startEditingArchitecture = (
        architecture
    ) => {
        setEditingArchitecture(architecture);

        setTitle(
            architecture.title || ""
        );

        setDescription(
            architecture.description || ""
        );

        setTechnologyStack(
            architecture.technology_stack || ""
        );

        setDiagram(
            architecture.diagram || ""
        );

        setSelectedImage(null);
        setImagePreview(null);

        setError("");

        /*
         * IMPORTANT:
         * This opens the same modal,
         * but now in EDIT mode.
         */
        setShowForm(true);
    };

    /*
     * =========================================
     * CLOSE FORM
     * =========================================
     */

    const closeForm = () => {
        if (saving || uploadingImage) {
            return;
        }

        setShowForm(false);

        resetForm();

        setError("");
    };

    /*
     * =========================================
     * ADD ARCHITECTURE
     * =========================================
     */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError(
                "Architecture title is required."
            );

            return;
        }

        try {
            setSaving(true);

            setError("");
            setSuccessMessage("");

            await api.post(
                `/projects/${projectId}/architectures`,
                {
                    title: title.trim(),

                    description:
                        description.trim() || null,

                    technology_stack:
                        technologyStack.trim() || null,

                    diagram:
                        diagram.trim() || null,
                }
            );

            setShowForm(false);

            resetForm();

            await fetchArchitectures();

            setSuccessMessage(
                "Architecture added successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);

            setError(
                "Failed to save the architecture."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * =========================================
     * UPDATE ARCHITECTURE
     * =========================================
     */

    const handleUpdateArchitecture = async (
        event
    ) => {
        event.preventDefault();

        if (!editingArchitecture) {
            return;
        }

        if (!title.trim()) {
            setError(
                "Architecture title is required."
            );

            return;
        }

        setSaving(true);

        setError("");
        setSuccessMessage("");
        try {

            await api.put(
                `/projects/${projectId}/architectures/${editingArchitecture.id}`,
                {
                    title: title.trim(),

                    description:
                        description.trim() || null,

                    technology_stack:
                        technologyStack.trim() || null,

                    diagram:
                        diagram.trim() || null,
                }
            );

            /*
             * If an image was selected,
             * upload it as well.
             */
            if (selectedImage) {
                try {
                await uploadImage(
                    editingArchitecture.id,
                    selectedImage
                );
                } catch (imageError) {
                    console.error(
                        "Image upload failed:",
                        imageError
                    );
                    /*
                    * Important:
                    * Architecture text was successfully
                    * updated, so don't tell the user that
                    * the entire architecture update failed.
                    */
                    setError(
                        `Architecture updated, but image upload failed: ${
                            imageError.message
                        }`
                    );

                    /*
                    * Keep the modal open so the user
                    * can try the image again.
                    */
                    await fetchArchitectures();

                    return;
                }
            }
  /*
         * =========================================
         * STEP 3 — REFRESH DATA
         * =========================================
         */

            await fetchArchitectures();

            setShowForm(false);

            resetForm();

            await fetchArchitectures();

            setSuccessMessage(
                selectedImage
                ? "Architecture and diagram updated successfully."
                : "Architecture updated successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(
            "Architecture update error:",
            err
        );

        const backendMessage =
            err.response?.data?.detail;

        setError(
            backendMessage ||
            "Failed to update architecture."
        );

        } finally {
            setSaving(false);
        }
    };

    /*
     * =========================================
     * DELETE ARCHITECTURE
     * =========================================
     */

    const handleDelete = async (
        architectureId
    ) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this architecture?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(architectureId);

            setError("");

            await api.delete(
                `/projects/${projectId}/architectures/${architectureId}`
            );

            await fetchArchitectures();

            setSuccessMessage(
                "Architecture deleted successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);

            setError(
                "Failed to delete the architecture."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
     * =========================================
     * IMAGE SELECTION
     * =========================================
     */

    const handleImageSelect = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a PNG, JPG, JPEG or WEBP image."
            );

            return;
        }

        /*
         * Optional size restriction:
         * 5 MB
         */
        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Image size must be less than 5 MB."
            );

            return;
        }

        setSelectedImage(file);

        setImagePreview(
            URL.createObjectURL(file)
        );

        setError("");
    };

    /*
     * =========================================
     * UPLOAD IMAGE
     * =========================================
     */

    const uploadImage = async (
        architectureId,
        imageFile
    ) => {
        if (!architectureId || !imageFile) {
            return;
        }

        setUploadingImage(true);
        setError("");

        try {
            const formData = new FormData();

            formData.append(
                "file",
                imageFile
            );

            await api.post(
                `/projects/${projectId}/architectures/${architectureId}/diagram-image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            await fetchArchitectures();

        } finally {
            setUploadingImage(false);
        }
    };

    /*
     * =========================================
     * STANDALONE IMAGE UPLOAD
     * =========================================
     *
     * This is useful if the user opens
     * Edit Architecture and only wants
     * to change the image.
     */

    const handleUploadImage = async () => {
        if (
            !selectedImage ||
            !editingArchitecture
        ) {
            return;
        }

        try {
            setError("");

            await uploadImage(
                editingArchitecture.id,
                selectedImage
            );

            setSelectedImage(null);
            setImagePreview(null);

            setSuccessMessage(
                "Architecture diagram uploaded successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);

            setError(
                "Failed to upload architecture diagram."
            );
        }
    };

    /*
     * =========================================
     * CURRENT ARCHITECTURE
     * =========================================
     */

    const currentArchitecture = useMemo(() => {
        if (architectures.length === 0) {
            return null;
        }

        return architectures[
            architectures.length - 1
        ];
    }, [architectures]);

    /*
     * =========================================
     * PREVIOUS ARCHITECTURES
     * =========================================
     */

    const previousArchitectures =
        useMemo(() => {
            if (architectures.length <= 1) {
                return [];
            }

            return architectures
                .slice(0, -1)
                .reverse();
        }, [architectures]);

    /*
     * =========================================
     * TECHNOLOGY STACK
     * =========================================
     */

    const technologyList = useMemo(() => {
        if (
            !currentArchitecture
                ?.technology_stack
        ) {
            return [];
        }

        return currentArchitecture
            .technology_stack
            .split(",")
            .map(
                (technology) =>
                    technology.trim()
            )
            .filter(Boolean);
    }, [currentArchitecture]);

    /*
     * =========================================
     * IMAGE URL HELPER
     * =========================================
     */

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            return null;
        }

        /*
         * If backend already returned
         * a complete URL, use it.
         */
        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        /*
         * Otherwise attach API base URL.
         */
        return `${
            import.meta.env.VITE_API_URL
        }${imageUrl}`;
    };

    return (
        <div className="architecture-page">

            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <div className="architecture-page-header">

                <div className="architecture-title-section">

                    <div className="architecture-title-icon">
                        <Layers3 size={24} />
                    </div>

                    <div>
                        <h1>
                            Architecture
                        </h1>

                        <p>
                            Define how this
                            project is designed
                            and what powers it.
                        </p>
                    </div>

                </div>

                <button
                    className="primary-btn architecture-add-btn"
                    onClick={openAddForm}
                >
                    <Plus size={18} />

                    Add Architecture
                </button>

            </div>

            {/* =========================================
                SUCCESS MESSAGE
            ========================================= */}

            {successMessage && (
                <div className="architecture-success">

                    <CheckCircle2
                        size={18}
                    />

                    {successMessage}

                </div>
            )}

            {/* =========================================
                ERROR MESSAGE
            ========================================= */}

            {error && !showForm && (
                <div className="architecture-error">
                    {error}
                </div>
            )}

            {/* =========================================
                LOADING
            ========================================= */}

            {loading && (
                <div className="architecture-empty-state">

                    <Layers3 size={32} />

                    <p>
                        Loading architecture...
                    </p>

                </div>
            )}

            {/* =========================================
                NO ARCHITECTURE
            ========================================= */}

            {!loading &&
                !currentArchitecture && (
                    <div className="architecture-empty-state">

                        <div className="architecture-empty-icon">
                            <Layers3
                                size={30}
                            />
                        </div>

                        <h2>
                            No architecture
                            defined yet
                        </h2>

                        <p>
                            Start by documenting
                            how the major parts
                            of this project work
                            together.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={
                                openAddForm
                            }
                        >
                            <Plus size={17} />

                            Add Architecture
                        </button>

                    </div>
                )}

            {/* =========================================
                CURRENT ARCHITECTURE
            ========================================= */}

            {!loading &&
                currentArchitecture && (
                    <>

                        <section className="current-architecture-card">

                            {/* Current Label */}

                            <div className="current-architecture-label">

                                <span className="current-dot" />

                                CURRENT ARCHITECTURE

                            </div>

                            {/* Header */}

                            <div className="current-architecture-header">

                                <div>

                                    <h2>
                                        {
                                            currentArchitecture.title
                                        }
                                    </h2>

                                    <p>
                                        {
                                            currentArchitecture.description ||
                                            "No architecture description provided."
                                        }
                                    </p>

                                </div>

                                <button
                                    className="architecture-delete-btn"
                                    onClick={() =>
                                        handleDelete(
                                            currentArchitecture.id
                                        )
                                    }
                                    disabled={
                                        deletingId ===
                                        currentArchitecture.id
                                    }
                                    title="Delete architecture"
                                >

                                    <Trash2
                                        size={17}
                                    />

                                    {deletingId ===
                                    currentArchitecture.id
                                        ? "Deleting..."
                                        : ""}

                                </button>

                            </div>

                            {/* =========================================
                                ARCHITECTURE FLOW
                            ========================================= */}

                            <div className="architecture-diagram-section">

                                <div className="architecture-section-heading architecture-flow-heading">

                                    <div className="architecture-section-heading-title">

                                        <Layers3
                                            size={17}
                                        />

                                        <span>
                                            Architecture
                                            Flow
                                        </span>

                                    </div>

                                    <button
                                        className="architecture-edit-btn"
                                        onClick={() =>
                                            startEditingArchitecture(
                                                currentArchitecture
                                            )
                                        }
                                        title="Edit architecture flow"
                                    >

                                        <Pencil
                                            size={15}
                                        />

                                        Edit

                                    </button>

                                </div>

                                {/* Uploaded Image */}

                                {currentArchitecture.diagram_image_url ? (

                                    <div className="architecture-image-container">

                                        <img
                                            src={getImageUrl(
                                                currentArchitecture.diagram_image_url
                                            )}
                                            alt="Architecture diagram"
                                            className="architecture-diagram-image"
                                        />

                                    </div>

                                ) : currentArchitecture.diagram ? (

                                    /* Text Diagram */

                                    <div className="architecture-diagram">

                                        {currentArchitecture
                                            .diagram
                                            .split("\n")
                                            .map(
                                                (
                                                    line,
                                                    index
                                                ) => (
                                                    <div
                                                        className="architecture-diagram-line"
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {
                                                            line
                                                        }
                                                    </div>
                                                )
                                            )}

                                    </div>

                                ) : (

                                    /* Empty Diagram */

                                    <div className="architecture-no-diagram">

                                        <ImageIcon
                                            size={24}
                                        />

                                        <span>
                                            No architecture
                                            diagram added
                                            yet.
                                        </span>

                                        <button
                                            className="architecture-edit-btn"
                                            onClick={() =>
                                                startEditingArchitecture(
                                                    currentArchitecture
                                                )
                                            }
                                        >
                                            <Upload
                                                size={15}
                                            />

                                            Add Diagram
                                        </button>

                                    </div>
                                )}

                            </div>

                            {/* =========================================
                                TECHNOLOGY STACK
                            ========================================= */}

                            {technologyList.length >
                                0 && (
                                <div className="architecture-stack-section">

                                    <div className="architecture-section-heading">

                                        <Server
                                            size={17}
                                        />

                                        <span>
                                            Technology
                                            Stack
                                        </span>

                                    </div>

                                    <div className="technology-chips">

                                        {technologyList.map(
                                            (
                                                technology,
                                                index
                                            ) => (
                                                <span
                                                    className="technology-chip"
                                                    key={`${technology}-${index}`}
                                                >
                                                    {
                                                        technology
                                                    }
                                                </span>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* =========================================
                                SYSTEM OVERVIEW
                            ========================================= */}

                            <div className="architecture-layer-section">

                                <div className="architecture-section-heading">

                                    <Layers3
                                        size={17}
                                    />

                                    <span>
                                        System
                                        Overview
                                    </span>

                                </div>

                                <div className="architecture-flow">

                                    {/* Frontend */}

                                    <div className="architecture-flow-box frontend">

                                        <div className="architecture-flow-icon">

                                            <Layers3
                                                size={20}
                                            />

                                        </div>

                                        <strong>
                                            Frontend
                                        </strong>

                                        <span>
                                            React + Vite
                                        </span>

                                    </div>

                                    <ArrowRight
                                        className="architecture-flow-arrow"
                                        size={22}
                                    />

                                    {/* Backend */}

                                    <div className="architecture-flow-box backend">

                                        <div className="architecture-flow-icon">

                                            <Server
                                                size={20}
                                            />

                                        </div>

                                        <strong>
                                            Backend
                                        </strong>

                                        <span>
                                            FastAPI
                                        </span>

                                    </div>

                                    <ArrowRight
                                        className="architecture-flow-arrow"
                                        size={22}
                                    />

                                    {/* Database */}

                                    <div className="architecture-flow-box database">

                                        <div className="architecture-flow-icon">

                                            <Database
                                                size={20}
                                            />

                                        </div>

                                        <strong>
                                            Database
                                        </strong>

                                        <span>
                                            PostgreSQL
                                        </span>

                                    </div>

                                    <ArrowRight
                                        className="architecture-flow-arrow"
                                        size={22}
                                    />

                                    {/* AI Memory */}

                                    <div className="architecture-flow-box memory">

                                        <div className="architecture-flow-icon">

                                            <Brain
                                                size={20}
                                            />

                                        </div>

                                        <strong>
                                            AI Memory
                                        </strong>

                                        <span>
                                            Hindsight
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* =========================================
                            PREVIOUS ARCHITECTURES
                        ========================================= */}

                        {previousArchitectures.length >
                            0 && (
                            <section className="previous-architecture-section">

                                <div className="previous-architecture-header">

                                    <div>

                                        <h2>
                                            Previous
                                            Architectures
                                        </h2>

                                        <p>
                                            Earlier
                                            architecture
                                            versions
                                            documented
                                            for this
                                            project.
                                        </p>

                                    </div>

                                    <span>
                                        {
                                            previousArchitectures.length
                                        }
                                    </span>

                                </div>

                                <div className="previous-architecture-list">

                                    {previousArchitectures.map(
                                        (
                                            architecture
                                        ) => (
                                            <div
                                                className="previous-architecture-card"
                                                key={
                                                    architecture.id
                                                }
                                            >

                                                <div className="previous-architecture-main">

                                                    <div className="previous-architecture-icon">

                                                        <Layers3
                                                            size={
                                                                18
                                                            }
                                                        />

                                                    </div>

                                                    <div>

                                                        <h3>
                                                            {
                                                                architecture.title
                                                            }
                                                        </h3>

                                                        <p>
                                                            {
                                                                architecture.description ||
                                                                "No description provided."
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <div className="previous-architecture-actions">

                                                    <button
                                                        className="architecture-edit-btn"
                                                        onClick={() =>
                                                            startEditingArchitecture(
                                                                architecture
                                                            )
                                                        }
                                                        title="Edit architecture"
                                                    >
                                                        <Pencil
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        className="architecture-delete-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                architecture.id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            architecture.id
                                                        }
                                                        title="Delete architecture"
                                                    >

                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />

                                                    </button>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                            </section>
                        )}

                    </>
                )}

            {/* =========================================
                ADD / EDIT ARCHITECTURE MODAL
            ========================================= */}

            {showForm && (
                <div
                    className="architecture-modal-overlay"
                    onMouseDown={(
                        event
                    ) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }

                    }}
                >

                    <div className="architecture-modal">

                        {/* Modal Header */}

                        <div className="architecture-modal-header">

                            <div>

                                <div className="architecture-modal-title-row">

                                    <div className="architecture-modal-icon">

                                        <Layers3
                                            size={20}
                                        />

                                    </div>

                                    <h2>
                                        {editingArchitecture
                                            ? "Edit Architecture"
                                            : "Add Architecture"}
                                    </h2>

                                </div>

                                <p>
                                    {editingArchitecture
                                        ? "Update the architecture design and diagram for this project."
                                        : "Document how the major components of this project work together."}
                                </p>

                            </div>

                            <button
                                className="architecture-modal-close"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving ||
                                    uploadingImage
                                }
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>

                        {/* Form */}

                        <form
                            className="architecture-form"
                            onSubmit={
                                editingArchitecture
                                    ? handleUpdateArchitecture
                                    : handleSubmit
                            }
                        >

                            {/* Title */}

                            <div className="form-group">

                                <label>
                                    Architecture
                                    Title
                                    <span>
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={
                                        title
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setTitle(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. ProjectHindsight Application Architecture"
                                    autoFocus
                                />

                            </div>

                            {/* Description */}

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={
                                        description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Explain the overall architecture and how the major components interact..."
                                    rows="4"
                                />

                            </div>

                            {/* Technology Stack */}

                            <div className="form-group">

                                <label>
                                    Technology
                                    Stack
                                </label>

                                <input
                                    type="text"
                                    value={
                                        technologyStack
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setTechnologyStack(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="React, Vite, FastAPI, PostgreSQL, Hindsight"
                                />

                                <small className="architecture-field-hint">
                                    Separate
                                    technologies
                                    using commas.
                                </small>

                            </div>

                            {/* Text Diagram */}

                            <div className="form-group">

                                <label>
                                    Architecture
                                    Flow
                                </label>

                                <textarea
                                    value={
                                        diagram
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDiagram(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder={
                                        "React UI\n   |\nFastAPI\n   |\n   +---- PostgreSQL\n   |\n   +---- Hindsight"
                                    }
                                    rows="7"
                                    className="architecture-diagram-input"
                                />

                                <small className="architecture-field-hint">
                                    Use arrows,
                                    components and
                                    multiple lines
                                    to describe the
                                    architecture.
                                </small>

                            </div>

                            {/* =========================================
                                IMAGE UPLOAD
                            ========================================= */}

                            <div className="architecture-upload-section">

                                <label>
                                    Architecture
                                    Diagram Image
                                </label>

                                <div className="architecture-upload-box">

                                    {/* New Preview */}

                                    {imagePreview ? (

                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Selected architecture diagram"
                                            className="architecture-upload-preview"
                                        />

                                    ) : editingArchitecture?.diagram_image_url ? (

                                        <img
                                            src={getImageUrl(
                                                editingArchitecture.diagram_image_url
                                            )}
                                            alt="Current architecture diagram"
                                            className="architecture-upload-preview"
                                        />

                                    ) : (

                                        <div className="architecture-upload-placeholder">

                                            <ImageIcon
                                                size={
                                                    30
                                                }
                                            />

                                            <strong>
                                                Upload
                                                architecture
                                                diagram
                                            </strong>

                                            <span>
                                                PNG,
                                                JPG,
                                                JPEG
                                                or
                                                WEBP
                                            </span>

                                        </div>

                                    )}

                                    {/* Choose Image */}

                                    <label className="architecture-upload-button">

                                        <Upload
                                            size={
                                                16
                                            }
                                        />

                                        Choose
                                        Image

                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={
                                                handleImageSelect
                                            }
                                            hidden
                                        />

                                    </label>

                                    {/* Selected Image Name */}

                                    {selectedImage && (
                                        <div className="architecture-selected-file">

                                            <ImageIcon
                                                size={
                                                    14
                                                }
                                            />

                                            <span>
                                                {
                                                    selectedImage.name
                                                }
                                            </span>

                                        </div>
                                    )}

                                </div>

                                <small className="architecture-field-hint">
                                    Maximum file
                                    size: 5 MB.
                                </small>

                            </div>

                            {/* Error */}

                            {error && (
                                <div className="architecture-form-error">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}

                            <div className="architecture-form-actions">

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingArchitecture
                                            ? "Save Changes"
                                            : "Add Architecture"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =========================================
                BACK TO PROJECT
            ========================================= */}

            <div className="architecture-back">

                <button
                    type="button"
                    className="back-to-project-stages-btn"
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    <span className="back-to-project-stages-arrow">←</span>
                    <span>Back to Project</span>
                </button>

            </div>

            <AskProjectMemory projectId={projectId} stage="ARCHITECTURE"/>

        </div>
    );
}

export default Architecture;