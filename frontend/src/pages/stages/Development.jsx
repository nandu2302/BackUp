import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Plus,
    X,
    Code2,
    CheckCircle2,
    Clock3,
    ListTodo,
    Pencil,
    Trash2,
    CircleDot,
    AlertCircle,
    Users,
    Bug,
    AlertTriangle,
    ShieldAlert,
    CircleCheck,
    GitBranch,
} from "lucide-react";

import api from "../../services/api";
import AskProjectMemory from "../../components/AskProjectMemory";

function Development() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("TODO");
    const [priority, setPriority] = useState("MEDIUM");
    const [assignedTo, setAssignedTo] = useState("");

    const [bugs, setBugs] = useState([]);

    const [bugsLoading, setBugsLoading] = useState(true);
    const [bugSaving, setBugSaving] = useState(false);
    const [deletingBugId, setDeletingBugId] = useState(null);

    const [bugError, setBugError] = useState("");
    const [bugSuccessMessage, setBugSuccessMessage] = useState("");

    const [showBugForm, setShowBugForm] = useState(false);
    const [editingBug, setEditingBug] = useState(null);

    const [bugTitle, setBugTitle] = useState("");
    const [bugDescription, setBugDescription] = useState("");
    const [bugSeverity, setBugSeverity] = useState("MEDIUM");
    const [bugStatus, setBugStatus] = useState("OPEN");
    const [bugSolution, setBugSolution] = useState("");
    // AI Development Conversation
    const [developmentExperienceProblem, setDevelopmentExperienceProblem] =
        useState("");

    const [developmentExperienceSolution, setDevelopmentExperienceSolution] =
        useState("");

    const [developmentExperienceLesson, setDevelopmentExperienceLesson] =
        useState("");

    const [developmentExperienceSaving, setDevelopmentExperienceSaving] =
        useState(false);

    const [developmentExperienceMessage, setDevelopmentExperienceMessage] =
        useState("");


    // GitHub Integration
    const [showGithubConnect, setShowGithubConnect] = useState(false);
    const [githubOwner, setGithubOwner] = useState("");
    const [githubRepo, setGithubRepo] = useState("");
    const [githubBranch, setGithubBranch] = useState("main");
    const [githubAccessToken, setGithubAccessToken] = useState("");
    const [githubWebhookSecret, setGithubWebhookSecret] = useState("");

    const [githubConnecting, setGithubConnecting] = useState(false);
    const [githubStatus, setGithubStatus] = useState(null);
    const [githubLoading, setGithubLoading] = useState(true);
    const [githubSyncing, setGithubSyncing] = useState(false);
    const [githubError, setGithubError] = useState("");
    const [githubMessage, setGithubMessage] = useState("");
    const [githubExperiences, setGithubExperiences] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchBugs();
        fetchGithubStatus();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/projects/${projectId}/tasks`
            );

            setTasks(response.data);
        } catch (err) {
            console.error(err);

            setError(
                "Failed to load development tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchBugs = async () => {
        try {
            setBugsLoading(true);
            setBugError("");

            const response = await api.get(
                `/projects/${projectId}/bugs`
            );

            setBugs(response.data);

        } catch (err) {
            console.error(err);

            setBugError(
                "Failed to load development issues."
            );

        } finally {
            setBugsLoading(false);
        }
    };

    const fetchGithubStatus = async () => {
        try {
            setGithubLoading(true);
            setGithubError("");

            const response = await api.get(
                `/projects/${projectId}/github/status`
            );

            setGithubStatus(response.data);
        } catch (err) {
            console.error("Failed to load GitHub status:", err);

            setGithubStatus(null);

            setGithubError(
                err.response?.data?.detail ||
                "GitHub integration is not connected."
            );
        } finally {
            setGithubLoading(false);
        }
    };

    const connectGithub = async () => {
        if (!githubOwner.trim()) {
            setGithubError("GitHub owner is required.");
            return;
        }

        if (!githubRepo.trim()) {
            setGithubError("GitHub repository name is required.");
            return;
        }

        if (!githubBranch.trim()) {
            setGithubError("GitHub branch is required.");
            return;
        }

        if (!githubAccessToken.trim()) {
            setGithubError("GitHub access token is required.");
            return;
        }

        try {
            setGithubConnecting(true);
            setGithubError("");
            setGithubMessage("");

            const response = await api.post(
                `/projects/${projectId}/github/connect`,
                null,
                {
                    params: {
                        owner: githubOwner.trim(),
                        repo: githubRepo.trim(),
                        branch: githubBranch.trim(),
                        access_token: githubAccessToken.trim(),
                        webhook_secret: githubWebhookSecret.trim() || undefined,
                    },
                }
            );

            setGithubMessage(
                response.data.message ||
                "GitHub repository connected successfully."
            );

            setShowGithubConnect(false);

            await fetchGithubStatus();

            setGithubAccessToken("");
            setGithubWebhookSecret("");

        } catch (err) {
            console.error("GitHub connection failed:", err);

            setGithubError(
                err.response?.data?.detail ||
                "Failed to connect GitHub repository."
            );
        } finally {
            setGithubConnecting(false);
        }
    };

    const syncGithub = async () => {
        try {
            setGithubSyncing(true);
            setGithubError("");
            setGithubMessage("");

            const response = await api.post(
                `/projects/${projectId}/github/sync`
            );

            setGithubMessage(
                `GitHub synced successfully. ${response.data.new_commits} new commits found.`
            );

            await fetchGithubStatus();

            setTimeout(() => {
                setGithubMessage("");
            }, 4000);

        } catch (err) {
            console.error("GitHub sync failed:", err);

            setGithubError(
                err.response?.data?.detail ||
                "Failed to sync GitHub."
            );
        } finally {
            setGithubSyncing(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setPriority("MEDIUM");
        setAssignedTo("");
        setEditingTask(null);
    };

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        resetForm();
        setError("");
    };

    const openAddForm = () => {
        resetForm();
        setError("");
        setShowForm(true);
    };

    const resetBugForm = () => {
        setBugTitle("");
        setBugDescription("");
        setBugSeverity("MEDIUM");
        setBugStatus("OPEN");
        setBugSolution("");
        setEditingBug(null);
    };

    const openAddBugForm = () => {
        resetBugForm();
        setBugError("");
        setShowBugForm(true);
    };

    const closeBugForm = () => {
        if (bugSaving) {
            return;
        }

        setShowBugForm(false);
        resetBugForm();
        setBugError("");
    };

    const openEditForm = (task) => {
        setEditingTask(task);

        setTitle(task.title || "");
        setDescription(task.description || "");
        setStatus(task.status || "TODO");
        setPriority(task.priority || "MEDIUM");
        setAssignedTo(
            task.assigned_to
                ? String(task.assigned_to)
                : ""
        );

        setError("");
        setShowForm(true);
    };

    const openEditBugForm = (bug) => {
        setEditingBug(bug);

        setBugTitle(
            bug.title || ""
        );

        setBugDescription(
            bug.description || ""
        );

        setBugSeverity(
            bug.severity || "MEDIUM"
        );

        setBugStatus(
            bug.status || "OPEN"
        );

        setBugSolution(
            bug.solution || ""
        );

        setBugError("");
        setShowBugForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccessMessage("");

            const taskData = {
                title: title.trim(),

                description:
                    description.trim() || null,

                assigned_to:
                    assignedTo.trim()
                        ? Number(assignedTo)
                        : null,

                status,

                priority,
            };

            if (editingTask) {
                await api.put(
                    `/projects/${projectId}/tasks/${editingTask.id}`,
                    taskData
                );
            } else {
                await api.post(
                    `/projects/${projectId}/tasks`,
                    taskData
                );
            }

            await fetchTasks();

            setShowForm(false);
            resetForm();

            setSuccessMessage(
                editingTask
                    ? "Task updated successfully."
                    : "Task added successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

        } catch (err) {
            console.error(err);

            const backendMessage =
                err.response?.data?.detail;

            setError(
                backendMessage ||
                (
                    editingTask
                        ? "Failed to update task."
                        : "Failed to add task."
                )
            );
        } finally {
            setSaving(false);
        }
    };


    const saveDevelopmentExperience = async () => {
    const problem = developmentExperienceProblem.trim();
    const solution = developmentExperienceSolution.trim();
    const lesson = developmentExperienceLesson.trim();

    if (!problem || !solution || !lesson) {
        setDevelopmentExperienceMessage(
            "Please fill all three fields."
        );
        return;
    }

    try {
        setDevelopmentExperienceSaving(true);
        setDevelopmentExperienceMessage("");

        await api.post(
            `/projects/${projectId}/experiences`,
            {
                type: "DEVELOPMENT",
                title: "Development Experience",
                description: problem,
                solution: solution,
                outcome: null,
                lesson: lesson,
                source: "AI_DEVELOPMENT_CONVERSATION",
            }
        );

        setDevelopmentExperienceMessage(
            "✓ Development experience saved to Project Memory."
        );

        setDevelopmentExperienceProblem("");
        setDevelopmentExperienceSolution("");
        setDevelopmentExperienceLesson("");

    } catch (err) {
        console.error(
            "Could not save development experience:",
            err
        );

        const backendMessage =
            err.response?.data?.detail;

        setDevelopmentExperienceMessage(
            backendMessage ||
            "Could not save development experience."
        );
    } finally {
        setDevelopmentExperienceSaving(false);
    }
};



    const handleBugSubmit = async (event) => {
        event.preventDefault();

        if (!bugTitle.trim()) {
            setBugError(
                "Issue title is required."
            );

            return;
        }

        try {
            setBugSaving(true);
            setBugError("");
            setBugSuccessMessage("");

            const bugData = {
                title: bugTitle.trim(),

                description:
                    bugDescription.trim() || null,

                severity: bugSeverity,

                status: bugStatus,

                solution:
                    bugSolution.trim() || null,

                stage_id: null,
            };

            if (editingBug) {

                await api.put(
                    `/projects/${projectId}/bugs/${editingBug.id}`,
                    bugData
                );

            } else {

                await api.post(
                    `/projects/${projectId}/bugs`,
                    bugData
                );
            }

            await fetchBugs();

            setShowBugForm(false);

            resetBugForm();

            setBugSuccessMessage(
                editingBug && bugStatus === "RESOLVED"
                    ? "Issue resolved and captured in project memory."
                    : editingBug
                    ? "Issue updated successfully."
                    : "Issue added successfully."
            );

            setTimeout(() => {
                setBugSuccessMessage("");
            }, 3000);

        } catch (err) {
            console.error(err);

            const backendMessage =
                err.response?.data?.detail;

            setBugError(
                backendMessage ||
                (
                    editingBug
                        ? "Failed to update issue."
                        : "Failed to add issue."
                )
            );

        } finally {
            setBugSaving(false);
        }
    };

    const handleDelete = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(taskId);
            setError("");

            await api.delete(
                `/projects/${projectId}/tasks/${taskId}`
            );

            await fetchTasks();

            setSuccessMessage(
                "Task deleted successfully."
            );

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

        } catch (err) {
            console.error(err);

            const backendMessage =
                err.response?.data?.detail;

            setError(
                backendMessage ||
                "Failed to delete task."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteBug = async (bugId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this issue?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingBugId(bugId);
            setBugError("");

            await api.delete(
                `/projects/${projectId}/bugs/${bugId}`
            );

            await fetchBugs();

            setBugSuccessMessage(
                "Issue deleted successfully."
            );

            setTimeout(() => {
                setBugSuccessMessage("");
            }, 3000);

        } catch (err) {

            console.error(err);

            const backendMessage =
                err.response?.data?.detail;

            setBugError(
                backendMessage ||
                "Failed to delete issue."
            );

        } finally {

            setDeletingBugId(null);
        }
    };

    /*
     * Development statistics
     */

    const totalTasks = tasks.length;

    const todoTasks = tasks.filter(
        (task) => task.status === "TODO"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) =>
            task.status === "IN_PROGRESS"
    ).length;

    const completedTasks = tasks.filter(
        (task) =>
            task.status === "COMPLETED"
    ).length;

    const progress = useMemo(() => {
        if (totalTasks === 0) {
            return 0;
        }

        return Math.round(
            (completedTasks / totalTasks) * 100
        );
    }, [
        totalTasks,
        completedTasks
    ]);

    const getStatusClass = (taskStatus) => {
        switch (taskStatus) {
            case "COMPLETED":
                return "development-status completed";

            case "IN_PROGRESS":
                return "development-status in-progress";

            default:
                return "development-status todo";
        }
    };

    const getPriorityClass = (taskPriority) => {
        switch (taskPriority) {
            case "HIGH":
                return "development-priority high";

            case "LOW":
                return "development-priority low";

            default:
                return "development-priority medium";
        }
    };

    const formatStatus = (taskStatus) => {
        switch (taskStatus) {
            case "IN_PROGRESS":
                return "In Progress";

            case "COMPLETED":
                return "Completed";

            case "TODO":
                return "To Do";

            default:
                return taskStatus;
        }
    };

    const openBugs = bugs.filter(
        (bug) => bug.status === "OPEN"
    ).length;

    const inProgressBugs = bugs.filter(
        (bug) => bug.status === "IN_PROGRESS"
    ).length;

    const resolvedBugs = bugs.filter(
        (bug) =>
            bug.status === "RESOLVED" ||
            bug.status === "CLOSED"
    ).length;

    const getBugSeverityClass = (severity) => {

        switch (severity) {

            case "CRITICAL":
                return "bug-severity critical";

            case "HIGH":
                return "bug-severity high";

            case "LOW":
                return "bug-severity low";

            default:
                return "bug-severity medium";
        }
    };

    const getBugStatusClass = (status) => {

        switch (status) {

            case "IN_PROGRESS":
                return "bug-status in-progress";

            case "RESOLVED":
            case "CLOSED":
                return "bug-status resolved";

            default:
                return "bug-status open";
        }
    };

const formatBugStatus = (status) => {

    switch (status) {

        case "IN_PROGRESS":
            return "In Progress";

        case "RESOLVED":
            return "Resolved";

        case "CLOSED":
            return "Closed";

        case "OPEN":
            return "Open";

        default:
            return status;
    }
};

    return (
        <div className="development-page">

            {/* ========================================= */}
            {/* PAGE HEADER */}
            {/* ========================================= */}

            <div className="development-page-header">

                <div className="development-title-section">

                    <div className="development-title-icon">
                        <Code2 size={24} />
                    </div>

                    <div>
                        <h1>
                            Development
                        </h1>

                        <p>
                            Build, track and manage
                            development work for this
                            project.
                        </p>
                    </div>

                </div>

                <button
                    className="primary-btn development-add-btn"
                    onClick={openAddForm}
                >
                    <Plus size={18} />
                    Add Task
                </button>

            </div>

            {/* ========================================= */}
            {/* SUCCESS MESSAGE */}
            {/* ========================================= */}

            {successMessage && (
                <div className="development-success">
                    <CheckCircle2 size={18} />

                    {successMessage}
                </div>
            )}

            {/* ========================================= */}
            {/* ERROR MESSAGE */}
            {/* ========================================= */}

            {error && !showForm && (
                <div className="development-error">
                    <AlertCircle size={18} />

                    {error}
                </div>
            )}

            {/* ========================================= */}
            {/* PROGRESS CARD */}
            {/* ========================================= */}

            {!loading && (
                <section className="development-overview">

                    <div className="development-overview-header">

                        <div>
                            <span className="development-overline">
                                DEVELOPMENT PROGRESS
                            </span>

                            <h2>
                                {progress}% Complete
                            </h2>
                        </div>

                        <div className="development-progress-circle">
                            {progress}%
                        </div>

                    </div>

                    <div className="development-progress-track">
                        <div
                            className="development-progress-fill"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>

                    <div className="development-stats">

                        <div className="development-stat">

                            <div className="development-stat-icon total">
                                <ListTodo size={18} />
                            </div>

                            <div>
                                <strong>
                                    {totalTasks}
                                </strong>

                                <span>
                                    Total Tasks
                                </span>
                            </div>

                        </div>

                        <div className="development-stat">

                            <div className="development-stat-icon todo">
                                <CircleDot size={18} />
                            </div>

                            <div>
                                <strong>
                                    {todoTasks}
                                </strong>

                                <span>
                                    To Do
                                </span>
                            </div>

                        </div>

                        <div className="development-stat">

                            <div className="development-stat-icon progress">
                                <Clock3 size={18} />
                            </div>

                            <div>
                                <strong>
                                    {inProgressTasks}
                                </strong>

                                <span>
                                    In Progress
                                </span>
                            </div>

                        </div>

                        <div className="development-stat">

                            <div className="development-stat-icon completed">
                                <CheckCircle2 size={18} />
                            </div>

                            <div>
                                <strong>
                                    {completedTasks}
                                </strong>

                                <span>
                                    Completed
                                </span>
                            </div>

                        </div>

                    </div>

                </section>
            )}

            {/* ========================================= */}
            {/* TASKS */}
            {/* ========================================= */}

            <section className="development-tasks-section">

                <div className="development-section-header">

                    <div>
                        <h2>
                            Development Tasks
                        </h2>

                        <p>
                            Track the work required
                            to build this project.
                        </p>
                    </div>

                    {tasks.length > 0 && (
                        <span className="development-task-count">
                            {tasks.length}
                        </span>
                    )}

                </div>

                {/* Loading */}

                {loading && (
                    <div className="development-empty-state">

                        <Code2 size={32} />

                        <p>
                            Loading development tasks...
                        </p>

                    </div>
                )}

                {/* Empty */}

                {!loading &&
                    tasks.length === 0 && (
                        <div className="development-empty-state">

                            <div className="development-empty-icon">
                                <Code2 size={30} />
                            </div>

                            <h3>
                                No development tasks yet
                            </h3>

                            <p>
                                Start breaking the project
                                into manageable development
                                tasks.
                            </p>

                            <button
                                className="primary-btn"
                                onClick={openAddForm}
                            >
                                <Plus size={17} />
                                Add First Task
                            </button>

                        </div>
                    )}

                {/* Task List */}

                {!loading &&
                    tasks.length > 0 && (
                        <div className="development-task-list">

                            {tasks.map((task) => (
                                <article
                                    className="development-task-card"
                                    key={task.id}
                                >

                                    <div className="development-task-main">

                                        <div className="development-task-icon">
                                            <Code2 size={19} />
                                        </div>

                                        <div className="development-task-content">

                                            <div className="development-task-title-row">

                                                <h3>
                                                    {task.title}
                                                </h3>

                                                <span
                                                    className={getPriorityClass(
                                                        task.priority
                                                    )}
                                                >
                                                    {task.priority}
                                                </span>

                                            </div>

                                            {task.description && (
                                                <p>
                                                    {
                                                        task.description
                                                    }
                                                </p>
                                            )}

                                            <div className="development-task-meta">

                                                <span
                                                    className={getStatusClass(
                                                        task.status
                                                    )}
                                                >
                                                    {formatStatus(
                                                        task.status
                                                    )}
                                                </span>

                                                {task.assigned_to && (
                                                    <span className="development-assignee">
                                                        <Users size={14} />

                                                        User #
                                                        {
                                                            task.assigned_to
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                    <div className="development-task-actions">

                                        <button
                                            className="development-icon-btn"
                                            onClick={() =>
                                                openEditForm(
                                                    task
                                                )
                                            }
                                            title="Edit task"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            className="development-icon-btn delete"
                                            onClick={() =>
                                                handleDelete(
                                                    task.id
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                task.id
                                            }
                                            title="Delete task"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>

                                </article>
                            ))}

                        </div>
                    )}

            </section>


        {/* ========================================= */}
        {/* AI DEVELOPMENT CONVERSATION */}
        {/* ========================================= */}

            <section className="development-experience-section">

                <div className="development-section-header">
                    <div>
                        <h2>AI Development Conversation</h2>

                        <p>
                            Capture an important development experience
                            so ProjectHindsight can remember it for future projects.
                        </p>
                    </div>
                </div>

                <div className="development-experience-card">

                    <div className="form-group">
                        <label>
                            What happened?
                            <span>*</span>
                        </label>

                        <textarea
                            value={developmentExperienceProblem}
                            onChange={(event) =>
                                setDevelopmentExperienceProblem(
                                    event.target.value
                                )
                            }
                            placeholder="Describe the development problem, challenge, or important experience..."
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            How did you solve it?
                            <span>*</span>
                        </label>

                        <textarea
                            value={developmentExperienceSolution}
                            onChange={(event) =>
                                setDevelopmentExperienceSolution(
                                    event.target.value
                                )
                            }
                            placeholder="Describe the solution or approach you used..."
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            What should future projects learn?
                            <span>*</span>
                        </label>

                        <textarea
                            value={developmentExperienceLesson}
                            onChange={(event) =>
                                setDevelopmentExperienceLesson(
                                    event.target.value
                                )
                            }
                            placeholder="What lesson should ProjectHindsight remember for future projects?"
                            rows="4"
                        />
                    </div>

                    {developmentExperienceMessage && (
                        <div
                            className={
                                developmentExperienceMessage.startsWith("✓")
                                    ? "development-success"
                                    : "development-form-error"
                            }
                        >
                            {developmentExperienceMessage}
                        </div>
                    )}

                    <div className="development-form-actions">

                        <button
                            type="button"
                            className="primary-btn"
                            onClick={saveDevelopmentExperience}
                            disabled={developmentExperienceSaving}
                        >
                            {developmentExperienceSaving
                                ? "Saving..."
                                : "Save Experience to Project Memory"}
                        </button>

                    </div>

                </div>

            </section>


            {/* ========================================= */}
            {/* GITHUB INTEGRATION */}
            {/* ========================================= */}

            <section className="development-github-section">

                <div className="development-section-header">

                    <div>
                        <h2>
                            GitHub Integration
                        </h2>

                        <p>
                            Connect project development activity with
                            ProjectHindsight memory.
                        </p>
                    </div>

                    <GitBranch size={26} />

                </div>


                {githubLoading && (
                    <div className="development-empty-state">

                        <GitBranch size={32} />

                        <p>
                            Loading GitHub integration...
                        </p>

                    </div>
                )}


                {!githubLoading && githubError && !githubStatus && (
                    <div className="development-error">

                        <AlertCircle size={18} />

                        {githubError}

                    </div>
                )}


                {showGithubConnect && (
                    <div className="development-github-connect-card">

                        <div className="development-github-connect-header">

                            <div>
                                <h3>Connect GitHub Repository</h3>

                                <p>
                                    Connect a GitHub repository to this project.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="development-icon-btn"
                                onClick={() => {
                                    setShowGithubConnect(false);
                                    setGithubError("");
                                }}
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <div className="development-form">

                            <div className="development-form-row">

                                <div className="form-group">

                                    <label>
                                        Repository Owner
                                    </label>

                                    <input
                                        type="text"
                                        value={githubOwner}
                                        onChange={(event) =>
                                            setGithubOwner(event.target.value)
                                        }
                                        placeholder="e.g. nandu2302"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Repository Name
                                    </label>

                                    <input
                                        type="text"
                                        value={githubRepo}
                                        onChange={(event) =>
                                            setGithubRepo(event.target.value)
                                        }
                                        placeholder="e.g. BackUp"
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label>
                                    Branch
                                </label>

                                <input
                                    type="text"
                                    value={githubBranch}
                                    onChange={(event) =>
                                        setGithubBranch(event.target.value)
                                    }
                                    placeholder="e.g. main"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    GitHub Personal Access Token
                                </label>

                                <input
                                    type="password"
                                    value={githubAccessToken}
                                    onChange={(event) =>
                                        setGithubAccessToken(event.target.value)
                                    }
                                    placeholder="Enter GitHub access token"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Webhook Secret
                                </label>

                                <input
                                    type="password"
                                    value={githubWebhookSecret}
                                    onChange={(event) =>
                                        setGithubWebhookSecret(event.target.value)
                                    }
                                    placeholder="Enter webhook secret"
                                />

                                <small className="development-field-hint">
                                    Use the same secret configured in your GitHub webhook.
                                </small>

                            </div>


                            {githubError && (
                                <div className="development-form-error">

                                    <AlertCircle size={17} />

                                    {githubError}

                                </div>
                            )}


                            <div className="development-form-actions">

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => {
                                        setShowGithubConnect(false);
                                        setGithubError("");
                                    }}
                                    disabled={githubConnecting}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={connectGithub}
                                    disabled={githubConnecting}
                                >
                                    <GitBranch size={17} />

                                    {githubConnecting
                                        ? "Connecting..."
                                        : "Connect Repository"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}


                {!githubLoading && githubStatus?.connected && (
                    <div className="development-github-card">

                        <div className="development-github-header">

                            <div className="development-github-icon">
                                <GitBranch size={24} />
                            </div>

                            <div>
                                <h3>
                                    {githubStatus.repository_owner}/
                                    {githubStatus.repository_name}
                                </h3>

                                <p>
                                    GitHub repository connected to this project
                                </p>
                            </div>

                            <span className="development-github-status">
                                Connected
                            </span>

                        </div>


                        <div className="development-github-details">

                            <div className="development-github-detail">

                                <span>
                                    Repository
                                </span>

                                <strong>
                                    {githubStatus.repository_owner}/
                                    {githubStatus.repository_name}
                                </strong>

                            </div>


                            <div className="development-github-detail">

                                <span>
                                    Branch
                                </span>

                                <strong>
                                    {githubStatus.branch}
                                </strong>

                            </div>


                            <div className="development-github-detail">

                                <span>
                                    Last Synced
                                </span>

                                <strong>
                                    {githubStatus.last_synced_at
                                        ? new Date(
                                            githubStatus.last_synced_at
                                        ).toLocaleString()
                                        : "Not synced yet"}
                                </strong>

                            </div>

                        </div>


                        {githubMessage && (
                            <div className="development-success">

                                <CheckCircle2 size={18} />

                                {githubMessage}

                            </div>
                        )}


                        {githubError && (
                            <div className="development-form-error">

                                <AlertCircle size={17} />

                                {githubError}

                            </div>
                        )}


                        <div className="development-form-actions">

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => {
                                    setGithubError("");
                                    setGithubMessage("");
                                    setShowGithubConnect(true);
                                }}
                            >
                                Change Repository
                            </button>

                            <button
                                type="button"
                                className="primary-btn"
                                onClick={syncGithub}
                                disabled={githubSyncing}
                            >
                                <GitBranch size={17} />

                                {githubSyncing
                                    ? "Syncing..."
                                    : "Sync GitHub"}
                            </button>

                        </div>

                    </div>
                )}


                {!githubLoading &&
                    githubStatus?.connected === false && (

                    <div className="development-empty-state">

                        <div className="development-empty-icon">
                            <GitBranch size={30} />
                        </div>

                        <h3>
                            GitHub not connected
                        </h3>

                        <p>
                            Connect a GitHub repository to automatically
                            capture development activity as project
                            experience.
                        </p>

                        <button
                            type="button"
                            className="primary-btn"
                            onClick={() => {
                                setGithubError("");
                                setGithubMessage("");
                                setShowGithubConnect(true);
                            }}
                        >
                            <GitBranch size={17} />
                            Connect GitHub Repository
                        </button>

                    </div>

                )}

            </section>


            {/* ========================================= */}
            {/* DEVELOPMENT ISSUES PLACEHOLDER */}
            {/* ========================================= */}

            <section className="development-bugs-section">

                <div className="development-section-header">

                    <div>
                        <h2>
                            Issues & Bugs
                        </h2>

                        <p>
                            Track technical problems,
                            failures and their solutions.
                        </p>
                    </div>

                    <button
                        className="primary-btn development-add-btn"
                        onClick={openAddBugForm}
                    >
                        <Plus size={17} />
                        Add Issue
                    </button>

                </div>

                {bugSuccessMessage && (
                    <div className="development-success">
                        <CheckCircle2 size={18} />

                        {bugSuccessMessage}
                    </div>
                )}

                {bugError && !showBugForm && (
                    <div className="development-error">
                        <AlertCircle size={18} />

                        {bugError}
                    </div>
                )}

                {/* Bug Statistics */}

                {!bugsLoading && (
                    <div className="bug-statistics">

                        <div className="bug-stat-card">

                            <div className="bug-stat-icon open">
                                <Bug size={19} />
                            </div>

                            <div>
                                <strong>
                                    {openBugs}
                                </strong>

                                <span>
                                    Open
                                </span>
                            </div>

                        </div>

                        <div className="bug-stat-card">

                            <div className="bug-stat-icon progress">
                                <Clock3 size={19} />
                            </div>

                            <div>
                                <strong>
                                    {inProgressBugs}
                                </strong>

                                <span>
                                    In Progress
                                </span>
                            </div>

                        </div>

                        <div className="bug-stat-card">

                            <div className="bug-stat-icon resolved">
                                <CircleCheck size={19} />
                            </div>

                            <div>
                                <strong>
                                    {resolvedBugs}
                                </strong>

                                <span>
                                    Resolved
                                </span>
                            </div>

                        </div>

                        <div className="bug-stat-card">

                            <div className="bug-stat-icon total">
                                <AlertTriangle size={19} />
                            </div>

                            <div>
                                <strong>
                                    {bugs.length}
                                </strong>

                                <span>
                                    Total Issues
                                </span>
                            </div>

                        </div>

                    </div>
                )}

                {/* Loading */}

                {bugsLoading && (
                    <div className="development-empty-state">

                        <Bug size={32} />

                        <p>
                            Loading issues...
                        </p>

                    </div>
                )}

                {/* Empty */}

                {!bugsLoading &&
                    bugs.length === 0 && (
                        <div className="development-empty-state">

                            <div className="development-empty-icon">
                                <Bug size={30} />
                            </div>

                            <h3>
                                No issues reported
                            </h3>

                            <p>
                                Great! No development problems
                                have been recorded for this project.
                            </p>

                            <button
                                className="primary-btn"
                                onClick={openAddBugForm}
                            >
                                <Plus size={17} />
                                Report an Issue
                            </button>

                        </div>
                    )}

                {/* Bug Cards */}

                {!bugsLoading &&
                    bugs.length > 0 && (
                        <div className="development-bug-list">

                            {bugs.map((bug) => (

                                <article
                                    className="development-bug-card"
                                    key={bug.id}
                                >

                                    <div className="development-bug-main">

                                        <div className="development-bug-icon">
                                            <Bug size={19} />
                                        </div>

                                        <div className="development-bug-content">

                                            <div className="development-bug-title-row">

                                                <h3>
                                                    {bug.title}
                                                </h3>

                                                <span
                                                    className={getBugSeverityClass(
                                                        bug.severity
                                                    )}
                                                >
                                                    {bug.severity}
                                                </span>

                                            </div>

                                            {bug.description && (
                                                <p>
                                                    {bug.description}
                                                </p>
                                            )}

                                            <div className="development-bug-meta">

                                                <span
                                                    className={getBugStatusClass(
                                                        bug.status
                                                    )}
                                                >
                                                    {formatBugStatus(
                                                        bug.status
                                                    )}
                                                </span>

                                                {bug.solution && (
                                                    <span className="bug-solution-indicator">
                                                        Solution available
                                                    </span>
                                                )}

                                            </div>

                                            {bug.solution && (
                                                <div className="bug-solution-preview">

                                                    <strong>
                                                        Solution
                                                    </strong>

                                                    <span>
                                                        {bug.solution}
                                                    </span>

                                                </div>
                                            )}

                                        </div>

                                    </div>

                                    <div className="development-bug-actions">

                                        <button
                                            className="development-icon-btn"
                                            onClick={() =>
                                                openEditBugForm(
                                                    bug
                                                )
                                            }
                                            title="Edit issue"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            className="development-icon-btn delete"
                                            onClick={() =>
                                                handleDeleteBug(
                                                    bug.id
                                                )
                                            }
                                            disabled={
                                                deletingBugId ===
                                                bug.id
                                            }
                                            title="Delete issue"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>

                                </article>

                            ))}

                        </div>
                    )}

            </section>

            {/* ========================================= */}
            {/* ADD / EDIT TASK MODAL */}
            {/* ========================================= */}

            {showForm && (
                <div
                    className="development-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }
                    }}
                >

                    <div className="development-modal">

                        {/* Modal Header */}

                        <div className="development-modal-header">

                            <div>

                                <div className="development-modal-title-row">

                                    <div className="development-modal-icon">
                                        <Code2 size={20} />
                                    </div>

                                    <h2>
                                        {editingTask
                                            ? "Edit Development Task"
                                            : "Add Development Task"}
                                    </h2>

                                </div>

                                <p>
                                    {editingTask
                                        ? "Update the development task details."
                                        : "Add a piece of work that needs to be completed."}
                                </p>

                            </div>

                            <button
                                className="development-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Form */}

                        <form
                            className="development-form"
                            onSubmit={handleSubmit}
                        >

                            {/* Title */}

                            <div className="form-group">

                                <label>
                                    Task Title
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
                                    placeholder="e.g. Implement authentication API"
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
                                    placeholder="Describe what needs to be developed..."
                                    rows="4"
                                />

                            </div>

                            {/* Priority + Status */}

                            <div className="development-form-row">

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
                                            To Do
                                        </option>

                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>

                                        <option value="COMPLETED">
                                            Completed
                                        </option>
                                    </select>

                                </div>

                            </div>

                            {/* Assigned To */}

                            <div className="form-group">

                                <label>
                                    Assigned To
                                </label>

                                <input
                                    type="number"
                                    value={assignedTo}
                                    onChange={(event) =>
                                        setAssignedTo(
                                            event.target.value
                                        )
                                    }
                                    placeholder="User ID (optional)"
                                    min="1"
                                />

                                <small className="development-field-hint">
                                    Leave empty if the task
                                    is not assigned yet.
                                </small>

                            </div>

                            {/* Error */}

                            {error && (
                                <div className="development-form-error">
                                    <AlertCircle size={17} />

                                    {error}
                                </div>
                            )}

                            {/* Actions */}

                            <div className="development-form-actions">

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
                                        ? "Saving..."
                                        : editingTask
                                            ? "Save Changes"
                                            : "Add Task"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {showBugForm && (
                <div
                    className="development-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeBugForm();
                        }

                    }}
                >

                    <div className="development-modal">

                        <div className="development-modal-header">

                            <div>

                                <div className="development-modal-title-row">

                                    <div className="development-modal-icon">
                                        <Bug size={20} />
                                    </div>

                                    <h2>
                                        {editingBug
                                            ? "Edit Development Issue"
                                            : "Report Development Issue"}
                                    </h2>

                                </div>

                                <p>
                                    Document a technical problem
                                    and how it was resolved.
                                </p>

                            </div>

                            <button
                                className="development-modal-close"
                                onClick={closeBugForm}
                                disabled={bugSaving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="development-form"
                            onSubmit={handleBugSubmit}
                        >

                            {/* Title */}

                            <div className="form-group">

                                <label>
                                    Issue Title
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    value={bugTitle}
                                    onChange={(event) =>
                                        setBugTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. API returns 500 error"
                                    autoFocus
                                />

                            </div>

                            {/* Description */}

                            <div className="form-group">

                                <label>
                                    What happened?
                                </label>

                                <textarea
                                    value={bugDescription}
                                    onChange={(event) =>
                                        setBugDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe the problem, error or unexpected behaviour..."
                                    rows="4"
                                />

                            </div>

                            {/* Severity + Status */}

                            <div className="development-form-row">

                                <div className="form-group">

                                    <label>
                                        Severity
                                    </label>

                                    <select
                                        value={bugSeverity}
                                        onChange={(event) =>
                                            setBugSeverity(
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

                                        <option value="CRITICAL">
                                            Critical
                                        </option>

                                    </select>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={bugStatus}
                                        onChange={(event) =>
                                            setBugStatus(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="OPEN">
                                            Open
                                        </option>

                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>

                                        <option value="RESOLVED">
                                            Resolved
                                        </option>

                                        <option value="CLOSED">
                                            Closed
                                        </option>

                                    </select>

                                </div>

                            </div>

                            {/* Solution */}

                            <div className="form-group">

                                <label>
                                    Solution
                                </label>

                                <textarea
                                    value={bugSolution}
                                    onChange={(event) =>
                                        setBugSolution(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe how the issue was fixed..."
                                    rows="4"
                                />

                                <small className="development-field-hint">
                                    You can leave this empty
                                    until the issue is resolved.
                                </small>

                            </div>

                            {bugError && (
                                <div className="development-form-error">

                                    <AlertCircle size={17} />

                                    {bugError}

                                </div>
                            )}

                            <div className="development-form-actions">

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={closeBugForm}
                                    disabled={bugSaving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={bugSaving}
                                >
                                    {bugSaving
                                        ? "Saving..."
                                        : editingBug
                                            ? "Save Changes"
                                            : "Report Issue"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
            {/* ========================================= */}
            {/* BACK */}
            {/* ========================================= */}

            <div className="development-back">

                <button
                    type="button"
                    className="back-to-project-stages-btn"
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    <span className="back-to-project-stages-arrow">←</span>
                    <span>Back to Project</span>
                </button>

            </div>

            <AskProjectMemory projectId={projectId} stage="DEVELOPMENT"/>

        </div>
    );
}

export default Development;