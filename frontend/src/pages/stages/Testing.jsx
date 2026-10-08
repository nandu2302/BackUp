import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Plus,
    FlaskConical,
    CheckCircle2,
    XCircle,
    Clock3,
    Trash2,
    Pencil,
    Bug,
} from "lucide-react";

import api from "../../services/api";
import AskProjectMemory from "../../components/AskProjectMemory";

function Testing() {
    const { projectId } = useParams();

    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [creatingBugId, setCreatingBugId] = useState(null);
    const [testingInsights, setTestingInsights] = useState([]);
    const [insightsLoading, setInsightsLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingTest, setEditingTest] = useState(null);

    const [testName, setTestName] = useState("");
    const [testType, setTestType] = useState("UNIT");
    const [testStatus, setTestStatus] = useState("PENDING");
    const [testResult, setTestResult] = useState("");

    useEffect(() => {
        fetchTests();
        fetchTestingInsights();
    }, [projectId]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/projects/${projectId}/tests`
            );

            setTests(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load test records.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTestingInsights = async () => {
        try {
            setInsightsLoading(true);

            const response = await api.get(
                `/projects/${projectId}/testing-insights`
            );

            setTestingInsights(
                response.data.insights || []
            );
        } catch (err) {
            console.error(err);
        } finally {
            setInsightsLoading(false);
        }
    };

    const resetForm = () => {
        setTestName("");
        setTestType("UNIT");
        setTestStatus("PENDING");
        setTestResult("");
        setEditingTest(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (test) => {
        setEditingTest(test);
        setTestName(test.test_name || "");
        setTestType(test.test_type || "UNIT");
        setTestStatus(test.status || "PENDING");
        setTestResult(test.result || "");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!testName.trim()) {
            setError("Test name is required.");
            return;
        }

        const testData = {
            test_name: testName.trim(),
            test_type: testType,
            status: testStatus,
            result: testResult.trim() || null,
        };

        try {
            setError("");

            if (editingTest) {
                await api.put(
                    `/projects/${projectId}/tests/${editingTest.id}`,
                    testData
                );

                setSuccessMessage(
                    "Test record updated successfully."
                );
            } else {
                await api.post(
                    `/projects/${projectId}/tests`,
                    testData
                );

                setSuccessMessage(
                    "Test record added successfully."
                );
            }

            closeModal();
            await fetchTests();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to save test record.");
        }
    };

    const handleCreateBug = async (test) => {
        if (test.bug_id) {
            setError("An issue has already been created for this test.");
            return;
        }

        try {
            setCreatingBugId(test.id);
            setError("");

            await api.post(
                `/projects/${projectId}/tests/${test.id}/create-bug`,
                {
                    severity: "MEDIUM",
                }
            );

            setSuccessMessage(
                "Issue created successfully from the failed test."
            );

            await fetchTests();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to create issue from test."
            );
        } finally {
            setCreatingBugId(null);
        }
    };

    const handleDelete = async (testId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this test record?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(`/projects/${projectId}/tests/${testId}`);

            setSuccessMessage(
                "Test record deleted successfully."
            );

            await fetchTests();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to delete test record.");
        }
    };

    const statistics = useMemo(() => {
        return {
            total: tests.length,
            passed: tests.filter(
                (test) => test.status === "PASSED"
            ).length,
            failed: tests.filter(
                (test) => test.status === "FAILED"
            ).length,
            blocked: tests.filter(
                (test) => test.status === "BLOCKED"
            ).length,
            pending: tests.filter(
                (test) => test.status === "PENDING"
            ).length,
        };
    }, [tests]);

    return (
        <div className="testing-page">

            {/* Header */}
            <div className="testing-header">
                <div>
                    <div className="testing-title-row">
                        <FlaskConical size={28} />
                        <h1>Testing</h1>
                    </div>

                    <p>
                        Validate the project through unit,
                        integration, and functional testing.
                    </p>
                </div>

                <button
                    className="testing-add-button"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Add Test
                </button>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="testing-success-message">
                    <CheckCircle2 size={18} />
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="testing-error-message">
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {/* Statistics */}
            <div className="testing-statistics">

                <div className="testing-stat-card">
                    <div className="testing-stat-icon">
                        <FlaskConical size={20} />
                    </div>

                    <div>
                        <span>Total Tests</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="testing-stat-card">
                    <div className="testing-stat-icon">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Passed</span>
                        <strong>{statistics.passed}</strong>
                    </div>
                </div>

                <div className="testing-stat-card">
                    <div className="testing-stat-icon">
                        <XCircle size={20} />
                    </div>

                    <div>
                        <span>Failed</span>
                        <strong>{statistics.failed}</strong>
                    </div>
                </div>

                <div className="testing-stat-card">
                    <div className="testing-stat-icon">
                        <Clock3 size={20} />
                    </div>

                    <div>
                        <span>Blocked</span>
                        <strong>{statistics.blocked}</strong>
                    </div>
                </div>

            </div>

            {/* Test Records */}
            <section className="testing-section">

                <div className="testing-section-header">
                    <div>
                        <h2>Test Records</h2>
                        <p>
                            Track testing activities and results
                            for this project.
                        </p>
                    </div>

                    <button
                        className="testing-secondary-button"
                        onClick={openAddModal}
                    >
                        <Plus size={17} />
                        Add Test
                    </button>
                </div>

                {loading ? (
                    <div className="testing-empty-state">
                        Loading test records...
                    </div>
                ) : tests.length === 0 ? (
                    <div className="testing-empty-state">
                        <FlaskConical size={38} />

                        <h3>No tests recorded yet</h3>

                        <p>
                            Add your first test record to start
                            tracking the testing stage.
                        </p>

                        <button
                            className="testing-add-button"
                            onClick={openAddModal}
                        >
                            <Plus size={18} />
                            Add First Test
                        </button>
                    </div>
                ) : (
                    <div className="testing-records">

                        {tests.map((test) => (
                            <div
                                className="testing-record-card"
                                key={test.id}
                            >

                                <div className="testing-record-main">

                                    <div className="testing-record-title-row">

                                        <h3>
                                            {test.test_name}
                                        </h3>

                                        <span
                                            className={`testing-status testing-status-${(
                                                test.status || ""
                                            ).toLowerCase()}`}
                                        >
                                            {test.status}
                                        </span>

                                    </div>

                                    <span className="testing-type">
                                        {test.test_type}
                                    </span>

                                    {test.result && (
                                        <p className="testing-result">
                                            {test.result}
                                        </p>
                                    )}

                                    {test.bug_id && (
                                        <div className="testing-linked-bug">
                                            <Bug size={15} />
                                            Issue #{test.bug_id} created
                                        </div>
                                    )}

                                </div>

                                <div className="testing-record-actions">

                                    {test.status === "FAILED" && !test.bug_id && (
                                        <button
                                            title="Create Issue"
                                            className="testing-action-button"
                                            onClick={() => handleCreateBug(test)}
                                            disabled={creatingBugId === test.id}
                                        >
                                            <Bug size={17} />

                                            {creatingBugId === test.id
                                                ? "Creating..."
                                                : "Create Issue"}
                                        </button>
                                    )}

                                    <button
                                        title="Edit"
                                        className="testing-action-button"
                                        onClick={() =>
                                            openEditModal(test)
                                        }
                                    >
                                        <Pencil size={17} />
                                    </button>

                                    <button
                                        title="Delete"
                                        className="testing-action-button danger"
                                        onClick={() =>
                                            handleDelete(test.id)
                                        }
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>


            {/* Suggested Checkpoints */}
            <section className="testing-section testing-checkpoints-section">

                <div className="testing-section-header">
                    <div>
                        <h2>Suggested Checkpoints</h2>

                        <p>
                            Important testing checks to consider before
                            moving to the Deployment stage.
                        </p>
                    </div>
                </div>

                <div className="testing-checkpoints-grid">

                    <div className="testing-checkpoint-card">
                        <span className="testing-checkpoint-label">
                            CHECKPOINT
                        </span>

                        <h3>Unit Tests</h3>

                        <p>
                            Make sure important application logic has
                            corresponding unit tests.
                        </p>
                    </div>

                    <div className="testing-checkpoint-card">
                        <span className="testing-checkpoint-label">
                            CHECKPOINT
                        </span>

                        <h3>Integration Tests</h3>

                        <p>
                            Verify that important components and APIs
                            communicate correctly.
                        </p>
                    </div>

                    <div className="testing-checkpoint-card">
                        <span className="testing-checkpoint-label">
                            CHECKPOINT
                        </span>

                        <h3>Known Bugs</h3>

                        <p>
                            Review open bugs and confirm that critical
                            issues are resolved or understood.
                        </p>
                    </div>

                    <div className="testing-checkpoint-card">
                        <span className="testing-checkpoint-label">
                            CHECKPOINT
                        </span>

                        <h3>Test Results</h3>

                        <p>
                            Review failed or blocked tests before
                            proceeding to deployment.
                        </p>
                    </div>

                </div>

            </section>



            <section className="testing-section testing-history-section">

                <div className="testing-section-header">
                    <div>
                        <h2>Historical Testing Lessons</h2>

                        <p>
                            Relevant experiences retrieved from
                            ProjectHindsight memory.
                        </p>
                    </div>
                </div>

                {insightsLoading ? (
                    <div className="testing-empty-state">
                        Searching project memory...
                    </div>
                ) : testingInsights.length === 0 ? (
                    <div className="testing-empty-state">
                        <FlaskConical size={34} />

                        <h3>No historical testing lessons found</h3>

                        <p>
                            As testing experiences are captured,
                            relevant lessons will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="testing-history-list">

                        {testingInsights
                            .slice(0, 5)
                            .map((memory, index) => (
                                <div
                                    className="testing-history-card"
                                    key={index}
                                >
                                    <div className="testing-history-icon">
                                        <FlaskConical size={18} />
                                    </div>

                                    <div>
                                        <span className="testing-history-label">
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div
                    className="testing-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="testing-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="testing-modal-header">
                            <div>
                                <h2>
                                    {editingTest
                                        ? "Edit Test"
                                        : "Add Test"}
                                </h2>

                                <p>
                                    Record a testing activity
                                    for this project.
                                </p>
                            </div>

                            <button
                                className="testing-modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="testing-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="testing-form-group">
                                <label>
                                    Test Name
                                </label>

                                <input
                                    type="text"
                                    value={testName}
                                    onChange={(event) =>
                                        setTestName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. User Login API"
                                />
                            </div>

                            <div className="testing-form-row">

                                <div className="testing-form-group">
                                    <label>
                                        Test Type
                                    </label>

                                    <select
                                        value={testType}
                                        onChange={(event) =>
                                            setTestType(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="UNIT">
                                            Unit
                                        </option>

                                        <option value="INTEGRATION">
                                            Integration
                                        </option>

                                        <option value="FUNCTIONAL">
                                            Functional
                                        </option>

                                        <option value="REGRESSION">
                                            Regression
                                        </option>

                                        <option value="PERFORMANCE">
                                            Performance
                                        </option>
                                    </select>
                                </div>

                                <div className="testing-form-group">
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={testStatus}
                                        onChange={(event) =>
                                            setTestStatus(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="PASSED">
                                            Passed
                                        </option>

                                        <option value="FAILED">
                                            Failed
                                        </option>

                                        <option value="BLOCKED">
                                            Blocked
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <div className="testing-form-group">
                                <label>
                                    Result / Notes
                                </label>

                                <textarea
                                    value={testResult}
                                    onChange={(event) =>
                                        setTestResult(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe the test result or any important observation..."
                                    rows={5}
                                />
                            </div>

                            <div className="testing-form-actions">

                                <button
                                    type="button"
                                    className="testing-cancel-button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="testing-save-button"
                                >
                                    {editingTest
                                        ? "Update Test"
                                        : "Save Test"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}
            <AskProjectMemory projectId={projectId} stage="TESTING"/>

        </div>
    );
}

export default Testing;