const API_URL = "http://127.0.0.1:8000";
let selectedStage = null;


// ------------------------------------
// NAVIGATION
// ------------------------------------

function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");


    const buttons = document.querySelectorAll(".nav-btn");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

}


// ------------------------------------
// SAVE EXPERIENCE
// ------------------------------------

async function saveExperience() {

    const data = {

        project_name:
            document.getElementById("projectName").value,

        experience_type:
            document.getElementById("experienceType").value,

        title:
            document.getElementById("experienceTitle").value,

        description:
            document.getElementById("description").value,

        solution:
            document.getElementById("solution").value,

        lesson:
            document.getElementById("lesson").value
    };


    if (!data.title ||
        !data.description ||
        !data.solution ||
        !data.lesson) {

        document.getElementById("saveMessage").innerText =
            "Please fill all fields.";

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/experiences`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        const result = await response.json();


        if (response.ok) {

            document.getElementById("saveMessage").innerText =
                "✓ Experience saved to Hindsight!";

            // document.getElementById("experienceCount").innerText =
            //     "1";

            // document.getElementById("dashboardExperienceCount").innerText =
            //     "1";

            loadExperienceCount();

        } else {

            document.getElementById("saveMessage").innerText =
                "Error: " + JSON.stringify(result);

        }

    } catch (error) {

        document.getElementById("saveMessage").innerText =
            "Could not connect to backend. Is FastAPI running?";

        console.error(error);
    }

}



// ------------------------------------
// SEARCH MEMORY
// ------------------------------------

async function searchMemory() {

    const query =
        document.getElementById("memoryQuery").value;


    if (!query) {
        return;
    }


    const resultsContainer =
        document.getElementById("memoryResults");


    resultsContainer.innerHTML =
        "<p>Searching project memory...</p>";


    try {

        const response = await fetch(
            `${API_URL}/memory?query=${encodeURIComponent(query)}`
        );


        const data = await response.json();


        resultsContainer.innerHTML = "";


        if (!data.memories || data.memories.length === 0) {

            resultsContainer.innerHTML =
                "<p class='empty-message'>No relevant memories found.</p>";

            return;
        }


        data.memories.forEach(memory => {

            const card =
                document.createElement("div");

            card.className = "memory-result";


            card.innerHTML = `

                <div class="memory-type">
                    ${memory.type || "Memory"}
                </div>

                <p>
                    ${memory.text}
                </p>

            `;


            resultsContainer.appendChild(card);

        });


    } catch (error) {

        resultsContainer.innerHTML =
            "<p>Could not connect to backend.</p>";

        console.error(error);
    }

}



// ------------------------------------
// GENERATE HINDSIGHT
// ------------------------------------

async function generateHindsight() {

    const resultContainer =
        document.getElementById("hindsightResult");

    resultContainer.innerHTML =
        "<p>AI is analyzing project memories...</p>";

    try {

        const response = await fetch(
            `${API_URL}/hindsight`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    query: `
                    You are the ProjectHindsight learning agent.

                    Analyze the previous project experiences
                    stored in project memory.

                    Organize the result into exactly these sections:

                    WHAT WORKED
                    WHAT FAILED
                    IMPORTANT DECISIONS
                    REJECTED IDEAS
                    LESSONS FOR FUTURE PROJECTS

                    Use concise bullet points.

                    Do not invent information.
                    Only use information available in project memory.
                    `
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            resultContainer.innerText =
                "Could not generate hindsight.";

            return;
        }

        const hindsight =
            data.hindsight || "No hindsight generated.";

        resultContainer.innerText = hindsight;

        updateHindsightCards(hindsight);

    } catch (error) {

        console.error(
            "Could not generate hindsight:",
            error
        );

        resultContainer.innerText =
            "Could not connect to backend.";
    }
}

function updateHindsightCards(hindsight) {

    const sections = {
        worked: document.getElementById("hindsightWorked"),
        failed: document.getElementById("hindsightFailed"),
        decisions: document.getElementById("hindsightDecisions"),
        lessons: document.getElementById("hindsightFutureLessons")
    };

    if (!hindsight) return;

    const workedMatch = hindsight.match(
        /WHAT WORKED([\s\S]*?)(?=WHAT FAILED|IMPORTANT DECISIONS|REJECTED IDEAS|LESSONS FOR FUTURE PROJECTS|$)/i
    );

    const failedMatch = hindsight.match(
        /WHAT FAILED([\s\S]*?)(?=IMPORTANT DECISIONS|REJECTED IDEAS|LESSONS FOR FUTURE PROJECTS|$)/i
    );

    const decisionsMatch = hindsight.match(
        /IMPORTANT DECISIONS([\s\S]*?)(?=REJECTED IDEAS|LESSONS FOR FUTURE PROJECTS|$)/i
    );

    const lessonsMatch = hindsight.match(
        /LESSONS FOR FUTURE PROJECTS([\s\S]*)/i
    );

    if (sections.worked && workedMatch) {
        sections.worked.innerText =
            workedMatch[1].trim();
    }

    if (sections.failed && failedMatch) {
        sections.failed.innerText =
            failedMatch[1].trim();
    }

    if (sections.decisions && decisionsMatch) {
        sections.decisions.innerText =
            decisionsMatch[1].trim();
    }

    if (sections.lessons && lessonsMatch) {
        sections.lessons.innerText =
            lessonsMatch[1].trim();
    }
}


// ------------------------------------
// REVIVE OLD IDEA
// ------------------------------------


async function reviveIdea() {

    const message =
        document.getElementById("reviveMessage");

    message.innerText =
        "Searching previous project decisions...";

    try {

        const response = await fetch(
            `${API_URL}/revive-idea`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    idea: "Google Maps API"
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            message.innerText =
                data.result;

        } else {

            message.innerText =
                "Could not find previous decision.";

        }

    } catch (error) {

        message.innerText =
            "Could not connect to backend.";

        console.error(error);

    }

}



function dismissIdea() {

    document.getElementById("reviveMessage").innerText =
        "Idea marked as not relevant to the current project.";

}


// ------------------------------------
// LOAD EXPERIENCE COUNT
// ------------------------------------

async function loadExperienceCount() {

    try {

        const response = await fetch(
            `${API_URL}/experience-count`
        );

        const data = await response.json();

        const experienceCount =
            document.getElementById("experienceCount");

        const dashboardExperienceCount =
            document.getElementById("dashboardExperienceCount");

        if (experienceCount) {
            experienceCount.innerText = data.count;
        }

        if (dashboardExperienceCount) {
            dashboardExperienceCount.innerText = data.count;
        }

    } catch (error) {

        console.error(
            "Could not load experience count:",
            error
        );

    }
}


loadExperienceCount();

// ------------------------------------
// CREATE NEW PROJECT
// ------------------------------------

async function createProject() {

    const projectName =
        document.getElementById("newProjectName").value.trim();

    const projectDescription =
        document.getElementById("newProjectDescription").value.trim();

    const message =
        document.getElementById("projectMessage");


    if (!projectName || !projectDescription) {

        message.innerText =
            "Please enter the project name and description.";

        return;
    }


    message.innerText =
        "Creating project...";


    try {

        const response = await fetch(
            `${API_URL}/projects`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: projectName,
                    description: projectDescription,
                    domain: "Software Engineering"
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            console.error(data);

            message.innerText =
                "Could not create project.";

            return;
        }


        message.innerText =
            "✓ Project created successfully.";


        // Store only the database ID.
        // PostgreSQL remains the source of truth.
        localStorage.setItem(
            "currentProjectId",
            data.id
        );


        await loadProjects();


        /*
         * Search for relevant experiences from
         * previous projects.
         */
        const historyResponse = await fetch(
            `${API_URL}/projects/${data.id}/historical-experiences`,
            {
                method: "POST"
            }
        );


        const historyData =
            await historyResponse.json();


        if (!historyResponse.ok) {

            console.error(historyData);

            message.innerText =
                "✓ Project created, but historical experiences could not be loaded.";

        } else {

            showNewProjectHistoricalExperiences(
                historyData.experiences || []
            );

        }


        /*
         * Open the existing project workspace.
         * Nothing about the existing workspace flow
         * is being changed.
         */


    } catch (error) {

        console.error(
            "Project creation failed:",
            error
        );

        message.innerText =
            "Could not connect to backend.";

    }

}

function showNewProjectHistoricalExperiences(experiences) {

    const container =
        document.getElementById(
            "newProjectHistoricalExperiences"
        );


    if (!container) {
        console.error(
            "Historical experiences container not found."
        );
        return;
    }


    // Clear previous results
    container.innerHTML = "";


    // No previous experiences
    if (!experiences || experiences.length === 0) {

        container.innerHTML = `
            <div class="workspace-card">
                <h3>Similar Project Experiences</h3>

                <p class="empty-message">
                    No relevant previous project experiences found.
                </p>

                <p>
                    This project can create new knowledge
                    that may help future projects.
                </p>

                <button
                    class="primary-btn"
                    onclick="openCreatedProject()">

                    Open Project

                </button>
            </div>
        `;

        return;
    }


    // Relevant experiences found
    container.innerHTML = `
        <div class="workspace-card">

            <h3>
                Similar Project Experiences Found
            </h3>

            <p>
                ProjectHindsight found experiences
                from previous projects that may be
                relevant to this project.
            </p>

            <div id="newProjectExperienceCards">
            </div>

            <button
                class="primary-btn"
                onclick="openCreatedProject()">

                Open Project

            </button>

        </div>
    `;


    const cardsContainer =
        document.getElementById(
            "newProjectExperienceCards"
        );


    // Store experiences so View Experience
    // can access the selected one.
    window.newProjectHistoricalMemories =
        experiences;


    cardsContainer.innerHTML =
        experiences.map((experience, index) => {

            const text =
                experience.text ||
                "No experience details available.";

            const shortText =
                text.length > 300
                    ? text.substring(0, 300) + "..."
                    : text;


            return `
                <div
                    class="experience-card"
                    data-experience-index="${index}"
                >

                    <span class="small-label">
                        HISTORICAL EXPERIENCE
                    </span>

                    <p>
                        ${shortText}
                    </p>

                    <div class="experience-actions">

                        <button
                            class="primary-btn"
                            onclick="viewNewProjectExperience(${index})">

                            View Experience

                        </button>

                        <button
                            class="secondary-btn"
                            onclick="dismissNewProjectExperience(this)">

                            Dismiss

                        </button>

                    </div>

                </div>
            `;

        }).join("");
}

function viewNewProjectExperience(index) {

    const experiences =
        window.newProjectHistoricalMemories || [];

    const experience =
        experiences[index];


    if (!experience) {
        return;
    }


    const text =
        experience.text ||
        "No experience details available.";


    alert(
        "Historical Experience\n\n" +
        text
    );
}

function dismissNewProjectExperience(button) {

    const card =
        button.closest(".experience-card");


    if (card) {
        card.remove();
    }
}

function openCreatedProject() {

    const projectId =
        localStorage.getItem("currentProjectId");


    if (!projectId) {

        console.error(
            "Current project ID not found."
        );

        return;
    }


    loadProjectWorkspace(
        Number(projectId)
    );
}






// ------------------------------------
// LOAD PROJECTS FROM DATABASE
// ------------------------------------

// ------------------------------------
// LOAD PROJECTS FROM DATABASE
// ------------------------------------

async function loadProjects() {

    const container =
        document.getElementById("projectsContainer");


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p class='empty-message'>Loading projects...</p>";


    try {

        const response =
            await fetch(`${API_URL}/projects`);


        const data =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                "<p class='empty-message'>Could not load projects.</p>";

            console.error(data);

            return;
        }


        // Update dashboard project count
        const projectCount =
            document.getElementById("projectCount");


        if (projectCount) {

            projectCount.innerText =
                data.length;

        }


        // Clear loading message
        container.innerHTML = "";


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="idea-card">

                    <div>

                        <span class="small-label">
                            NO PROJECTS
                        </span>

                        <h2>
                            Create your first project.
                        </h2>

                        <p>
                            Start a project and ProjectHindsight
                            will begin capturing what your team learns.
                        </p>

                    </div>

                </div>

            `;

            return;
        }


        data.forEach(project => {

            const card =
                document.createElement("div");


            card.className =
                "project-card";


            card.innerHTML = `

    <div class="project-header">

        <div>

            <span class="badge">
                ${project.status || "ACTIVE"}
            </span>

            <h2>
                ${project.name}
            </h2>

            <p>
                ${project.description ||
                "No description provided."}
            </p>

            <p>
                <strong>Stage:</strong>
                ${project.current_stage || "IDEA"}
            </p>

            <p>
                <strong>Progress:</strong>
                ${project.progress || 0}%
            </p>

        </div>


        <div class="project-actions">

            <button
                class="secondary-btn"
                onclick="loadProjectWorkspace(${project.id})">
                View Project
            </button>

            ${
                project.status === "ACTIVE"
                ? `
                    <button
                        class="secondary-btn"
                        onclick="archiveProject(${project.id})">
                        Archive
                    </button>

                    <button
                        class="danger-btn"
                        onclick="deleteProject(${project.id})">
                        Delete
                    </button>
                `
                : `
                    <span class="badge">
                        ARCHIVED
                    </span>
                `
            }

        </div>

    </div>

`;

                

            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Could not load projects:",
            error
        );

        container.innerHTML =
            "<p class='empty-message'>Could not connect to backend.</p>";

    }

}


// ------------------------------------
// LOAD PROJECT WORKSPACE FROM DATABASE
// ------------------------------------

async function loadProjectWorkspace(projectId) {

    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}/workspace`
            );


        const workspace =
            await response.json();


        if (!response.ok) {

            console.error(workspace);

            alert(
                "Could not load project workspace."
            );

            return;
        }


        // Remember current project ID
        localStorage.setItem(
            "currentProjectId",
            projectId
        );


        renderProjectWorkspace(workspace);


        showSection("projectWorkspace");


    } catch (error) {

        console.error(
            "Could not load project workspace:",
            error
        );

        alert(
            "Could not connect to backend."
        );

    }
}


async function refreshCurrentStage(projectId) {

    // Reload complete workspace from PostgreSQL
    await loadProjectWorkspace(projectId);

    const workspace = window.currentWorkspace;

    if (!workspace || !workspace.stages) {
        return;
    }

    // Find the currently selected stage.
    // If nothing is selected, use the project's current stage.
    const stageType =
        selectedStage || workspace.project.current_stage;

    const updatedStage = workspace.stages.find(
        stage => stage.stage_type === stageType
    );

    if (updatedStage) {
        selectedStage = updatedStage.stage_type;

        renderStageDetails(updatedStage);
    }
}


// async function refreshCurrentStage(projectId) {

//     // Reload complete workspace from PostgreSQL
//     await loadProjectWorkspace(projectId);

//     // If a stage is currently selected,
//     // render it again using the fresh stage data
//     if (selectedStage) {

//         const workspace = window.currentWorkspace;

//         if (!workspace || !workspace.stages) {
//             return;
//         }

//         const updatedStage = workspace.stages.find(
//             stage => stage.stage_type === selectedStage
//         );

//         if (updatedStage) {
//             renderStageDetails(updatedStage);
//         }
//     }
// }



// ------------------------------------
// RENDER PROJECT WORKSPACE
// ------------------------------------

function renderProjectWorkspace(workspace) {

    const project =
        workspace.project;


    const nameElement =
        document.getElementById(
            "currentProjectName"
        );


    const descriptionElement =
        document.getElementById(
            "currentProjectDescription"
        );


    if (nameElement) {

        nameElement.innerText =
            project.name;

    }


    if (descriptionElement) {

        descriptionElement.innerText =
            project.description ||
            "No project description.";

    }


    // Dashboard current project
    const dashboardName =
        document.getElementById(
            "dashboardProjectName"
        );


    const dashboardDescription =
        document.getElementById(
            "dashboardProjectDescription"
        );


    if (dashboardName) {

        dashboardName.innerText =
            project.name;

    }


    if (dashboardDescription) {

        dashboardDescription.innerText =
            project.description ||
            "No project description.";

    }


    window.currentWorkspace =
        workspace;

    // Render lifecycle stages
    renderProjectStages(
        workspace.stages,
        project.current_stage
    );

}



// ------------------------------------
// RENDER PROJECT STAGES
// ------------------------------------

function renderProjectStages(
    stages,
    currentStage
) {

    const lifecycle =
        document.querySelector(".lifecycle");


    if (!lifecycle) {
        return;
    }


    lifecycle.innerHTML = "";


    stages.forEach((stage, index) => {

        const stageElement =
            document.createElement("div");


        let stageClass =
            "stage";


        if (stage.stage_type === currentStage) {

            stageClass +=
                " active";

        }


        if (stage.status === "COMPLETED") {

            stageClass +=
                " completed";

        }


        stageElement.className =
            stageClass;


        /*
         * Make stage clickable
         */

        stageElement.style.cursor =
            "pointer";


        stageElement.innerHTML = `

            <span>
                ${index + 1}
            </span>

            <strong>
                ${formatStageName(stage.stage_type)}
            </strong>

            <small>
                ${stage.status}
                · ${stage.progress}%
            </small>

        `;


        /*
         * Stage click
         */

        stageElement.addEventListener(
            "click",
            () => {

                selectedStage =
                    stage.stage_type;


                /*
                 * Remove selected styling
                 * from all stages
                 */

                document
                    .querySelectorAll(".lifecycle .stage")
                    .forEach(element => {

                        element.classList.remove(
                            "selected"
                        );

                    });


                /*
                 * Highlight selected stage
                 */

                stageElement.classList.add(
                    "selected"
                );


                /*
                 * Show stage details
                 */

                renderStageDetails(stage);

            }
        );


        lifecycle.appendChild(
            stageElement
        );

    });

}



function renderStageDetails(stage) {

    const container =
        document.getElementById("stageDetails");

    if (!container) {
        return;
    }

    const stageName =
        formatStageName(stage.stage_type);

    if (stage.stage_type === "IDEA") {

        renderIdeaStage(stage);
        return;
    }

    if (stage.stage_type === "REQUIREMENTS") {

        renderRequirementsStage(stage);
        return;
    }

    if (stage.stage_type === "ARCHITECTURE") {
    renderArchitectureStage(stage);
    return;
    }

    if (stage.stage_type === "DEVELOPMENT") {
    renderDevelopmentStage(stage);
    return;
    }

    if (stage.stage_type === "TESTING") {
    renderTestingStage(stage);
    return;
    }

    if (stage.stage_type === "DEPLOYMENT") {
    renderDeploymentStage(stage);
    return;
    }

    // if (stage.stage_type === "HINDSIGHT") {
    // renderHindsightStage(stage);
    // return;
    // }

    container.innerHTML = `
        <div class="stage-info">

            <span class="small-label">
                CURRENT STAGE
            </span>

            <h2>
                ${stageName}
            </h2>

            <p>
                Status:
                <strong>
                    ${stage.status}
                </strong>
            </p>

            <p>
                Progress:
                <strong>
                    ${stage.progress}%
                </strong>
            </p>

        </div>

        <div class="idea-card">

            <div>

                <span class="small-label">
                    STAGE WORKSPACE
                </span>

                <h2>
                    ${stageName}
                </h2>

                <p>
                    Stage-specific project information
                    will appear here.
                </p>

            </div>

        </div>
    `;
}


async function renderIdeaStage(stage) {

    const container =
        document.getElementById("stageDetails");

    if (!container) {
        return;
    }

    const projectId =
        localStorage.getItem("currentProjectId");

    if (!projectId) {
        return;
    }

    container.innerHTML = `

        <div class="stage-info">

            <span class="small-label">
                CURRENT STAGE
            </span>

            <h2>
                IDEA
            </h2>

            <p>
                Status:
                <strong>
                    ${stage.status}
                </strong>
            </p>

            <p>
                Progress:
                <strong>
                    ${stage.progress}%
                </strong>
            </p>

        </div>


        <div class="idea-card">

            <div>

                <span class="small-label">
                    PROJECT IDEA
                </span>

                <h2>
                    Define the project idea
                </h2>

                <p>
                    Record the idea, its purpose and
                    whether the team selected, rejected
                    or postponed it.
                </p>

            </div>

        </div>


        <div class="stage-form">

            <h3>
                Add Project Idea
            </h3>

            <label>
                Idea
            </label>

            <input
                type="text"
                id="ideaInput"
                placeholder="Enter the project idea"
            >

            <label>
                Description
            </label>

            <textarea
                id="ideaDescription"
                placeholder="Describe the idea..."
            ></textarea>

            <label>
                Status
            </label>

            <select id="ideaStatus">

                <option value="PROPOSED">
                    Proposed
                </option>

                <option value="SELECTED">
                    Selected
                </option>

                <option value="REJECTED">
                    Rejected
                </option>

                <option value="POSTPONED">
                    Postponed
                </option>

            </select>

            <label>
                Rejection / Postponement Reason
            </label>

            <textarea
                id="ideaRejectionReason"
                placeholder="Explain why the idea was rejected or postponed..."
            ></textarea>

            <button
                class="primary-btn"
                onclick="saveProjectIdea()">
                Save Idea
            </button>

            <p id="ideaMessage"></p>

        </div>


        <div id="projectIdeas">

            <p class="empty-message">
                Loading ideas...
            </p>

        </div>

    `;

    await loadProjectIdeas(projectId);
}


async function renderRequirementsStage(stage) {

    const container =
        document.getElementById("stageDetails");

    if (!container) {
        return;
    }

    const projectId =
        localStorage.getItem("currentProjectId");

    if (!projectId) {
        return;
    }

    container.innerHTML = `

        <div class="stage-info">

            <span class="small-label">
                CURRENT STAGE
            </span>

            <h2>
                REQUIREMENTS
            </h2>

            <p>
                Status:
                <strong>
                    ${stage.status}
                </strong>
            </p>

            <p>
                Progress:
                <strong>
                    ${stage.progress}%
                </strong>
            </p>

        </div>


        <div class="idea-card">

            <div>

                <span class="small-label">
                    REQUIREMENTS WORKSPACE
                </span>

                <h2>
                    Define Project Requirements
                </h2>

                <p>
                    Capture what the project needs to
                    accomplish and track each requirement
                    through completion.
                </p>

            </div>

        </div>


        <div class="stage-form">

            <h3>
                Add Requirement
            </h3>

            <label>
                Requirement
            </label>

            <input
                type="text"
                id="requirementTitle"
                placeholder="Example: User authentication"
            >


            <label>
                Description
            </label>

            <textarea
                id="requirementDescription"
                placeholder="Describe what this requirement should accomplish..."
            ></textarea>


            <label>
                Priority
            </label>

            <select id="requirementPriority">

                <option value="LOW">
                    Low
                </option>

                <option value="MEDIUM" selected>
                    Medium
                </option>

                <option value="HIGH">
                    High
                </option>

                <option value="CRITICAL">
                    Critical
                </option>

            </select>


            <label>
                Status
            </label>

            <select id="requirementStatus">

                <option value="TODO">
                    To Do
                </option>

                <option value="IN_PROGRESS">
                    In Progress
                </option>

                <option value="BLOCKED">
                    Blocked
                </option>

                <option value="COMPLETED">
                    Completed
                </option>

            </select>


            <label>
                Progress
            </label>

            <input
                type="number"
                id="requirementProgress"
                min="0"
                max="100"
                value="0"
            >


            <button
                class="primary-btn"
                onclick="saveRequirement()">

                Save Requirement

            </button>


            <p id="requirementMessage"></p>

        </div>


        <div id="projectRequirements">

            <p class="empty-message">
                Loading requirements...
            </p>

        </div>

        <div
    id="requirementHistoricalExperiences"
    style="margin-top: 30px;"
>

<div
    id="requirementAIInsights"
    style="margin-top: 30px;"
>

    <div class="idea-card">

        <div>

            <span class="small-label">
                AI INSIGHTS
            </span>

            <h2>
                Requirement Insights
            </h2>

            <p>
                AI-generated insights based on current
                requirements and previous project experience.
            </p>

        </div>

    </div>

</div>

    <div class="idea-card">

        <div>

            <span class="small-label">
                HINDSIGHT
            </span>

            <h2>
                Previous Project Experience
            </h2>

            <p>
                Historical lessons will appear here
                based on the current requirements.
            </p>

        </div>

    </div>

</div>

    `;

    await loadRequirements(projectId);
    await loadRequirementHistoricalExperiences(projectId);
    await loadRequirementAIInsights(projectId);
}


async function renderArchitectureStage(stage) {

    const container = document.getElementById("stageDetails");

    const projectId =
        localStorage.getItem("currentProjectId");

    container.innerHTML = `
        <div class="stage-header">

            <span class="small-label">
                ARCHITECTURE
            </span>

            <h2>
                Architecture Workspace
            </h2>

            <p>
                Define the current technical architecture
                and learn from architecture decisions made
                in previous projects.
            </p>

        </div>


        <div class="workspace-card">

            <h3>Current Architecture</h3>

            <div id="currentArchitecture">

                <p class="empty-message">
                    Loading architecture...
                </p>

            </div>

        </div>


        <div class="workspace-card">

            <h3>Add Architecture</h3>

            <div class="form-group">

                <label>Architecture Title</label>

                <input
                    id="architectureTitle"
                    type="text"
                    placeholder="e.g. Microservices Architecture"
                >

            </div>


            <div class="form-group">

                <label>Description</label>

                <textarea
                    id="architectureDescription"
                    placeholder="Describe the architecture..."
                ></textarea>

            </div>


            <div class="form-group">

                <label>Technology Stack</label>

                <textarea
                    id="architectureTechnologyStack"
                    placeholder="e.g. Java, Spring Boot, PostgreSQL, Docker"
                ></textarea>

            </div>


            <div class="form-group">

                <label>Architecture Diagram</label>

                <textarea
                    id="architectureDiagram"
                    placeholder="Describe the architecture or provide a diagram reference..."
                ></textarea>

            </div>


            <button
                class="primary-btn"
                onclick="saveArchitecture()">

                Save Architecture

            </button>


            <p id="architectureMessage"></p>

        </div>


        <div class="workspace-card">

            <h3>Previous Project Experiences</h3>

            <div id="architectureHistoricalExperiences">

                <p class="empty-message">
                    Searching previous project experiences...
                </p>

            </div>

        </div>


        <div class="workspace-card">

            <h3>Relevant Decisions</h3>

            <div id="architectureDecisions">

                <p class="empty-message">
                    Loading architecture decisions...
                </p>

            </div>

        </div>


        <div class="workspace-card">

            <h3>Architecture Lessons</h3>

            <div id="architectureLessons">

                <p class="empty-message">
                    Loading architecture lessons...
                </p>

            </div>

        </div>
    `;

    await loadArchitectures(projectId);
    await loadArchitectureDecisions(projectId);
    await loadArchitectureLessons(projectId);
    await loadArchitectureHistoricalExperiences(projectId);
}


async function saveArchitecture() {

    const projectId =
        localStorage.getItem("currentProjectId");

    if (!projectId) {
        return;
    }

    const title =
        document.getElementById("architectureTitle")
            .value
            .trim();

    const description =
        document.getElementById("architectureDescription")
            .value
            .trim();

    const technologyStack =
        document.getElementById("architectureTechnologyStack")
            .value
            .trim();

    const diagram =
        document.getElementById("architectureDiagram")
            .value
            .trim();

    const message =
        document.getElementById("architectureMessage");


    if (!title) {

        message.innerText =
            "Please enter an architecture title.";

        return;
    }


    message.innerText =
        "Saving architecture...";


    try {

        const response = await fetch(
            `${API_URL}/projects/${projectId}/architectures`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: title,

                    description:
                        description || null,

                    technology_stack:
                        technologyStack || null,

                    diagram:
                        diagram || null

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(data);

            message.innerText =
                "Could not save architecture.";

            return;
        }


        message.innerText =
            "✓ Architecture saved successfully.";


        document.getElementById(
            "architectureTitle"
        ).value = "";

        document.getElementById(
            "architectureDescription"
        ).value = "";

        document.getElementById(
            "architectureTechnologyStack"
        ).value = "";

        document.getElementById(
            "architectureDiagram"
        ).value = "";


        // await loadArchitectures(projectId);
        await refreshCurrentStage(projectId);

    } catch (error) {

        console.error(
            "Could not save architecture:",
            error
        );

        message.innerText =
            "Could not connect to backend.";

    }
}

async function loadArchitectures(projectId) {

    const container =
        document.getElementById("currentArchitecture");

    if (!container) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/projects/${projectId}/architectures`
        );

        const architectures =
            await response.json();


        if (!response.ok) {

            container.innerHTML =
                "<p>Could not load architecture.</p>";

            console.error(architectures);

            return;
        }


        if (!architectures ||
            architectures.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    No architecture defined yet.
                </p>
            `;

            return;
        }


        container.innerHTML =
            architectures.map(architecture => `

                <div class="experience-card">

                    <span class="small-label">
                        ARCHITECTURE
                    </span>

                    <h3>
                        ${architecture.title}
                    </h3>

                    <p>
                        ${architecture.description || ""}
                    </p>

                    <strong>
                        Technology Stack
                    </strong>

                    <p>
                        ${architecture.technology_stack || "Not specified"}
                    </p>

                    ${
                        architecture.diagram
                        ? `
                            <strong>
                                Architecture Diagram
                            </strong>

                            <p>
                                ${architecture.diagram}
                            </p>
                          `
                        : ""
                    }

                </div>

            `).join("");

    } catch (error) {

        console.error(
            "Could not load architectures:",
            error
        );

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}


async function loadArchitectureDecisions(projectId) {
    const container = document.getElementById("architectureDecisions");

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/decisions`
        );

        const decisions = await response.json();

        if (!response.ok) {
            container.innerHTML = "<p>Could not load decisions.</p>";
            console.error(decisions);
            return;
        }

        if (!decisions || decisions.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No architecture decisions recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = decisions.map(decision => `
            <div class="experience-card">
                <span class="small-label">DECISION</span>

                <h3>${decision.title}</h3>

                <p>
                    <strong>Decision:</strong>
                    ${decision.decision || "Not specified"}
                </p>

                <p>
                    <strong>Reason:</strong>
                    ${decision.reason || "Not specified"}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${decision.status || "Not specified"}
                </p>
            </div>
        `).join("");

    } catch (error) {
        console.error("Could not load architecture decisions:", error);

        container.innerHTML = `
            <p>Could not connect to backend.</p>
        `;
    }
}


async function loadArchitectureLessons(projectId) {
    const container = document.getElementById("architectureLessons");

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/lessons`
        );

        const lessons = await response.json();

        if (!response.ok) {
            container.innerHTML = "<p>Could not load architecture lessons.</p>";
            console.error(lessons);
            return;
        }

        if (!lessons || lessons.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No architecture lessons recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = lessons.map(lesson => `
            <div class="experience-card">
                <span class="small-label">LESSON</span>

                <h3>Architecture Lesson</h3>

                <p>
                    ${lesson.lesson || "No lesson description available."}
                </p>
            </div>
        `).join("");

    } catch (error) {
        console.error("Could not load architecture lessons:", error);

        container.innerHTML = `
            <p>Could not connect to backend.</p>
        `;
    }
}


async function loadArchitectureHistoricalExperiences(projectId) {
    const container = document.getElementById("architectureHistoricalExperiences");

    if (!container) return;

    try {
        // Get the current project's architecture
        const architectureResponse = await fetch(
            `${API_URL}/projects/${projectId}/architectures`
        );

        const architectures = await architectureResponse.json();

        if (!architectureResponse.ok) {
            container.innerHTML = `
                <p>Could not load architecture information.</p>
            `;
            return;
        }

        if (!architectures || architectures.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    Add an architecture first to search for relevant
                    historical experiences.
                </p>
            `;
            return;
        }

        const latestArchitecture = architectures[architectures.length - 1];

        const query = `
Architecture decision:
${latestArchitecture.title}

Description:
${latestArchitecture.description || ""}

Technology Stack:
${latestArchitecture.technology_stack || ""}

Find previous project experiences related to architecture,
technology choices, system design, frameworks, databases,
deployment architecture, scalability, or similar technical decisions.
        `;

        const response = await fetch(
            `${API_URL}/memory?query=${encodeURIComponent(query)}`
        );

        const memories = await response.json();

        const uniqueMemories = memories.filter((memory, index, self) =>
    index === self.findIndex(
        item => item.text === memory.text
    )
);

        if (!response.ok) {
            container.innerHTML = `
                <p>Could not retrieve historical experiences.</p>
            `;
            console.error(memories);
            return;
        }

        if (!uniqueMemories || uniqueMemories.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No relevant previous project experiences found.
                </p>
            `;
            return;
        }

        container.innerHTML = uniqueMemories.map((memory, index) => `
    <div class="experience-card">

        <span class="small-label">
            HISTORICAL EXPERIENCE ${index + 1}
        </span>

        <h3>Historical Lesson</h3>

        <p>
            ${memory.text || "No experience details available."}
        </p>

        <div class="experience-actions">

            <button
                class="secondary-btn"
                onclick="useArchitectureExperience(${index})"
            >
                Use as Reference
            </button>

            <button
                class="secondary-btn"
                onclick="dismissArchitectureExperience(this)"
            >
                Dismiss
            </button>

        </div>

    </div>
`).join("");

        // Keep the memories available for the buttons
        window.architectureHistoricalMemories = uniqueMemories;

    } catch (error) {
        console.error(
            "Could not load architecture historical experiences:",
            error
        );

        container.innerHTML = `
            <p>
                Could not connect to backend.
            </p>
        `;
    }
}

function useArchitectureExperience(index) {
    const memories = window.architectureHistoricalMemories || [];
    const memory = memories[index];

    if (!memory) return;

    alert(
        "Historical experience selected as a reference:\n\n" +
        (memory.text || "No details available.")
    );
}

function dismissArchitectureExperience(button) {
    const card = button.closest(".experience-card");

    if (card) {
        card.remove();
    }
}


async function saveRequirement() {

    const projectId =
        localStorage.getItem("currentProjectId");

    if (!projectId) {
        return;
    }

    const title =
        document.getElementById("requirementTitle")
            .value
            .trim();

    const description =
        document.getElementById("requirementDescription")
            .value
            .trim();

    const priority =
        document.getElementById("requirementPriority")
            .value;

    const status =
        document.getElementById("requirementStatus")
            .value;

    const progress =
        Number(
            document.getElementById("requirementProgress")
                .value
        );

    const message =
        document.getElementById("requirementMessage");


    if (!title) {

        message.innerText =
            "Please enter the requirement.";

        return;
    }


    if (progress < 0 || progress > 100) {

        message.innerText =
            "Progress must be between 0 and 100.";

        return;
    }


    message.innerText =
        "Saving requirement...";


    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}/requirements`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title: title,

                        description:
                            description || null,

                        status: status,

                        priority: priority,

                        progress: progress

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(data);

            message.innerText =
                "Could not save requirement.";

            return;
        }


        message.innerText =
            "✓ Requirement saved successfully.";


        document.getElementById("requirementTitle")
            .value = "";

        document.getElementById("requirementDescription")
            .value = "";

        document.getElementById("requirementPriority")
            .value = "MEDIUM";

        document.getElementById("requirementStatus")
            .value = "TODO";

        document.getElementById("requirementProgress")
            .value = "0";


        // await loadRequirements(projectId);
        await refreshCurrentStage(projectId);


    } catch (error) {

        console.error(
            "Could not save requirement:",
            error
        );

        message.innerText =
            "Could not connect to backend.";
    }
}


async function loadRequirements(projectId) {

    const container =
        document.getElementById("projectRequirements");

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}/requirements`
            );


        const requirements =
            await response.json();


        if (!response.ok) {

            console.error(requirements);

            container.innerHTML =
                "<p class='empty-message'>Could not load requirements.</p>";

            return;
        }


        if (
            !requirements ||
            requirements.length === 0
        ) {

            container.innerHTML = `

                <div class="idea-card">

                    <div>

                        <span class="small-label">
                            NO REQUIREMENTS
                        </span>

                        <h2>
                            Add the first requirement.
                        </h2>

                        <p>
                            Requirements will be tracked
                            throughout the project lifecycle.
                        </p>

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML = `

            <div class="stage-info">

                <span class="small-label">
                    CURRENT REQUIREMENTS
                </span>

                <h2>
                    Project Requirements
                </h2>

            </div>

        `;


        requirements.forEach(requirement => {

            const card =
                document.createElement("div");

            card.className =
                "memory-result";


            card.innerHTML = `

                <div class="memory-type">

                    ${requirement.priority}

                </div>


                <h3>
                    ${requirement.title}
                </h3>


                <p>
                    ${requirement.description ||
                    "No description provided."}
                </p>


                <p>

                    <strong>
                        Status:
                    </strong>

                    ${requirement.status}

                </p>


                <p>

                    <strong>
                        Progress:
                    </strong>

                    ${requirement.progress}%

                </p>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Could not load requirements:",
            error
        );

        container.innerHTML =
            "<p class='empty-message'>Could not connect to backend.</p>";
    }
}


async function loadRequirementHistoricalExperiences(projectId) {

    const container =
        document.getElementById("requirementHistoricalExperiences");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="idea-card">
            <div>
                <span class="small-label">
                    HISTORICAL EXPERIENCE
                </span>

                <h2>
                    Searching previous projects...
                </h2>

                <p>
                    Looking for relevant experiences from
                    previous projects.
                </p>
            </div>
        </div>
    `;

    try {

        const requirementsResponse =
            await fetch(
                `${API_URL}/projects/${projectId}/requirements`
            );

        const requirements =
            await requirementsResponse.json();

        if (!requirementsResponse.ok) {
            throw new Error("Could not load requirements");
        }

        if (
            !requirements ||
            requirements.length === 0
        ) {

            container.innerHTML = `
                <div class="idea-card">
                    <div>
                        <span class="small-label">
                            HISTORICAL EXPERIENCE
                        </span>

                        <h2>
                            Add requirements first.
                        </h2>

                        <p>
                            Hindsight can search previous
                            project experiences once requirements
                            have been added.
                        </p>
                    </div>
                </div>
            `;

            return;
        }

        const query =
            requirements
                .map(requirement =>
                    `${requirement.title}: ${requirement.description || ""}`
                )
                .join("\n");

        const response =
            await fetch(
                `${API_URL}/historical-lesson`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        query: `
                            Current project requirements:

                            ${query}

                            Find relevant experiences from
                            previous projects that could help
                            with these requirements.

                            Focus on practical lessons,
                            problems encountered, solutions,
                            and things the current project
                            should consider.
                        `
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                "Could not retrieve historical experience"
            );
        }

        container.innerHTML = `

            <div class="stage-info">

                <span class="small-label">
                    HINDSIGHT
                </span>

                <h2>
                    Previous Project Experience
                </h2>

                <p>
                    Historical knowledge relevant to the
                    current requirements.
                </p>

            </div>

            <div class="memory-result">

                <div class="memory-type">
                    HISTORICAL LESSON
                </div>

                <p>
                    ${data.lesson ||
                    "No relevant historical experience found."}
                </p>

            </div>

        `;

    } catch (error) {

        console.error(
            "Could not load historical requirements experience:",
            error
        );

        container.innerHTML = `
            <div class="idea-card">
                <div>
                    <span class="small-label">
                        HINDSIGHT
                    </span>

                    <h2>
                        Could not retrieve historical experience.
                    </h2>

                    <p>
                        Make sure the backend and Hindsight
                        service are running.
                    </p>
                </div>
            </div>
        `;
    }
}


async function loadRequirementAIInsights(projectId) {

    const container =
        document.getElementById("requirementAIInsights");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="idea-card">

            <div>

                <span class="small-label">
                    AI INSIGHTS
                </span>

                <h2>
                    Analyzing requirements...
                </h2>

                <p>
                    ProjectHindsight is analyzing previous
                    project experience.
                </p>

            </div>

        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}/requirements`
            );

        const requirements =
            await response.json();

        if (!response.ok) {
            throw new Error(
                "Could not load requirements"
            );
        }

        if (
            !requirements ||
            requirements.length === 0
        ) {

            container.innerHTML = `
                <div class="idea-card">

                    <div>

                        <span class="small-label">
                            AI INSIGHTS
                        </span>

                        <h2>
                            Add requirements first.
                        </h2>

                        <p>
                            AI insights will appear after
                            requirements are added.
                        </p>

                    </div>

                </div>
            `;

            return;
        }

        const requirementContext =
            requirements
                .map(requirement => `
                    Requirement: ${requirement.title}
                    Description: ${requirement.description || "None"}
                    Priority: ${requirement.priority}
                    Status: ${requirement.status}
                    Progress: ${requirement.progress}%
                `)
                .join("\n\n");

        const responseAI =
            await fetch(
                `${API_URL}/hindsight`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        query: `
                            You are the ProjectHindsight
                            learning agent.

                            Analyze the following current
                            project requirements using
                            previous project memory.

                            Current requirements:

                            ${requirementContext}

                            Identify practical insights
                            that could help the team.

                            Focus on:

                            1. Potential problems
                            2. Important considerations
                            3. Lessons from previous projects
                            4. Things the team should validate
                            5. Requirement gaps or risks

                            Do not invent project history.

                            Only use information available
                            in project memory.

                            Keep the response concise.
                        `

                    })
                }
            );

        const data =
            await responseAI.json();

        if (!responseAI.ok) {
            throw new Error(
                "Could not generate AI insights"
            );
        }

        container.innerHTML = `

            <div class="stage-info">

                <span class="small-label">
                    AI INSIGHTS
                </span>

                <h2>
                    Requirement Insights
                </h2>

                <p>
                    Generated from current requirements
                    and project memory.
                </p>

            </div>

            <div class="memory-result">

                <div class="memory-type">
                    PROJECTHINDSIGHT AI
                </div>

                <p>
                    ${(data.hindsight ||
                    "No additional insights found.")
                    .replace(/\n/g, "<br>")}
                </p>

            </div>

        `;

    } catch (error) {

        console.error(
            "Could not generate requirement AI insights:",
            error
        );

        container.innerHTML = `
            <div class="idea-card">

                <div>

                    <span class="small-label">
                        AI INSIGHTS
                    </span>

                    <h2>
                        Could not generate insights.
                    </h2>

                    <p>
                        Make sure the backend and
                        Hindsight service are running.
                    </p>

                </div>

            </div>
        `;
    }
}


async function renderDevelopmentStage(stage) {
    const container = document.getElementById("stageDetails");
    const projectId = localStorage.getItem("currentProjectId");

    container.innerHTML = `
        <div class="stage-header">
            <span class="small-label">DEVELOPMENT</span>

            <h2>Development Workspace</h2>

            <p>
                Manage development tasks, track issues,
                and capture experiences from implementation.
            </p>
        </div>

        <div class="workspace-card">
            <h3>Development Progress</h3>

            <p>
                <strong>Status:</strong>
                ${stage.status}
            </p>

            <p>
                <strong>Progress:</strong>
                ${stage.progress}%
            </p>
        </div>

        <div class="workspace-card">
            <h3>Development Tasks</h3>

            <div id="developmentTasks">
                <p class="empty-message">
                    Loading development tasks...
                </p>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Add Development Task</h3>

            <div class="form-group">
                <label>Task Title</label>

                <input
                    id="developmentTaskTitle"
                    type="text"
                    placeholder="e.g. Implement authentication API"
                >
            </div>

            <div class="form-group">
                <label>Description</label>

                <textarea
                    id="developmentTaskDescription"
                    placeholder="Describe the development task..."
                ></textarea>
            </div>

            <div class="form-group">
    <label>Assigned Developer</label>

    <input
        id="developmentTaskAssignedTo"
        type="number"
        placeholder="Enter developer user ID"
    >
</div>

            <div class="form-group">
                <label>Status</label>

                <select id="developmentTaskStatus">
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="BLOCKED">BLOCKED</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>
            </div>

            <div class="form-group">
                <label>Priority</label>

                <select id="developmentTaskPriority">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM" selected>MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                </select>
            </div>

            <button
                class="primary-btn"
                onclick="saveDevelopmentTask()"
            >
                Save Task
            </button>

            <p id="developmentTaskMessage"></p>
        </div>

        <div class="workspace-card">
    <h3>AI Development Conversation</h3>

    <p>
        Describe a development problem, solution, or important
        implementation experience. ProjectHindsight will help
        capture it as reusable project knowledge.
    </p>

    <div class="form-group">
        <label>What happened?</label>

        <textarea
            id="developmentExperienceProblem"
            placeholder="Describe the problem or experience you encountered..."
        ></textarea>
    </div>

    <div class="form-group">
        <label>How did you solve it?</label>

        <textarea
            id="developmentExperienceSolution"
            placeholder="Describe the solution or approach you used..."
        ></textarea>
    </div>

    <div class="form-group">
        <label>What should future projects learn?</label>

        <textarea
            id="developmentExperienceLesson"
            placeholder="Describe the lesson for future projects..."
        ></textarea>
    </div>

    <button
        class="primary-btn"
        onclick="saveDevelopmentExperience()"
    >
        Save Experience to Project Memory
    </button>

    <p id="developmentExperienceMessage"></p>
</div>

        <div class="workspace-card">
            <h3>Recent Issues</h3>

            <div id="developmentIssues">
                <p class="empty-message">
                    Loading recent issues...
                </p>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Relevant Historical Experience</h3>

            <div id="developmentHistoricalExperiences">
                <p class="empty-message">
                    Searching previous project experiences...
                </p>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Solution Used</h3>

            <div id="developmentSolutions">
                <p class="empty-message">
                    Loading solutions...
                </p>
            </div>
        </div>
    `;

    await loadDevelopmentTasks(projectId);
    await loadDevelopmentIssues(projectId);
    await loadDevelopmentHistoricalExperiences(projectId);
    await loadDevelopmentSolutions(projectId);
}


async function saveDevelopmentTask() {
    const projectId = localStorage.getItem("currentProjectId");

    if (!projectId) return;

    const title = document.getElementById("developmentTaskTitle").value.trim();
    const description = document.getElementById("developmentTaskDescription").value.trim();
    const status = document.getElementById("developmentTaskStatus").value;
    const priority = document.getElementById("developmentTaskPriority").value;
    const message = document.getElementById("developmentTaskMessage");
    const assignedTo = document
    .getElementById("developmentTaskAssignedTo")
    .value;

    if (!title) {
        message.innerText = "Please enter a task title.";
        return;
    }

    message.innerText = "Saving task...";

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/tasks`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    description: description || null,
                    assigned_to:assignedTo?Number(assignedTo):null,
                    status: status,
                    priority: priority
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            message.innerText = "Could not save task.";
            return;
        }

        message.innerText = "✓ Task saved successfully.";

        document.getElementById("developmentTaskTitle").value = "";
        document.getElementById("developmentTaskDescription").value = "";

        // await loadDevelopmentTasks(projectId);
        await refreshCurrentStage(projectId);

    } catch (error) {
        console.error("Could not save development task:", error);
        message.innerText = "Could not connect to backend.";
    }
}


async function loadDevelopmentTasks(projectId) {
    const container = document.getElementById("developmentTasks");

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/tasks`
        );

        const tasks = await response.json();

        if (!response.ok) {
            container.innerHTML = `
                <p>Could not load development tasks.</p>
            `;
            console.error(tasks);
            return;
        }

        if (!tasks || tasks.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No development tasks added yet.
                </p>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
    <div class="experience-card">

        <span class="small-label">
            DEVELOPMENT TASK
        </span>

        <h3>
            ${task.title}
        </h3>

        <p>
            <strong>Description:</strong>
            ${task.description || "No description provided."}
        </p>

        <p>
            <strong>Assigned Developer:</strong>
            ${task.assigned_to || "Unassigned"}
        </p>

        <p>
            <strong>Priority:</strong>
            ${task.priority || "MEDIUM"}
        </p>

        <p>
            <strong>Status:</strong>
            ${task.status || "TODO"}
        </p>

    </div>
`).join("");

    } catch (error) {
        console.error("Could not load development tasks:", error);

        container.innerHTML = `
            <p>Could not connect to backend.</p>
        `;
    }
}


async function loadDevelopmentIssues(projectId) {
    const container = document.getElementById("developmentIssues");

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/bugs`
        );

        const bugs = await response.json();

        if (!response.ok) {
            container.innerHTML = `
                <p>Could not load recent issues.</p>
            `;
            console.error(bugs);
            return;
        }

        if (!bugs || bugs.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No development issues recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = bugs.map(bug => `
            <div class="experience-card">

                <span class="small-label">
                    ${bug.severity || "MEDIUM"}
                </span>

                <h3>${bug.title}</h3>

                <p>
                    ${bug.description || "No description provided."}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${bug.status || "OPEN"}
                </p>

                <p>
                    <strong>Severity:</strong>
                    ${bug.severity || "MEDIUM"}
                </p>

                ${
                    bug.solution
                    ? `
                        <p>
                            <strong>Solution:</strong>
                            ${bug.solution}
                        </p>
                    `
                    : ""
                }

            </div>
        `).join("");

    } catch (error) {
        console.error("Could not load development issues:", error);

        container.innerHTML = `
            <p>Could not connect to backend.</p>
        `;
    }
}


async function loadDevelopmentHistoricalExperiences(projectId) {
    const container = document.getElementById(
        "developmentHistoricalExperiences"
    );

    if (!container) return;

    try {
        const tasksResponse = await fetch(
            `${API_URL}/projects/${projectId}/tasks`
        );

        const tasks = await tasksResponse.json();

        if (!tasksResponse.ok) {
            container.innerHTML = `
                <p>Could not load development tasks.</p>
            `;
            return;
        }

        if (!tasks || tasks.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    Add development tasks first to search for
                    relevant historical experiences.
                </p>
            `;
            return;
        }

        const taskContext = tasks.map(task => `
Task: ${task.title}
Description: ${task.description || ""}
Status: ${task.status || ""}
Priority: ${task.priority || ""}
        `).join("\n");

        const query = `
Current development tasks:

${taskContext}

Find previous project experiences related to:
- software development
- implementation problems
- coding issues
- backend development
- APIs
- authentication
- databases
- debugging
- development decisions
- solutions used by previous projects

Return only relevant historical experiences.
        `;

        const response = await fetch(
            `${API_URL}/memory?query=${encodeURIComponent(query)}`
        );

        const memories = await response.json();

        if (!response.ok) {
            container.innerHTML = `
                <p>Could not retrieve historical experiences.</p>
            `;
            console.error(memories);
            return;
        }

        const uniqueMemories = memories.filter(
            (memory, index, self) =>
                index === self.findIndex(
                    item => item.text === memory.text
                )
        );

        if (uniqueMemories.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No relevant previous project experiences found.
                </p>
            `;
            return;
        }

        window.developmentHistoricalMemories = uniqueMemories;

        container.innerHTML = uniqueMemories.map((memory, index) => `
            <div class="experience-card">

                <span class="small-label">
                    HISTORICAL EXPERIENCE ${index + 1}
                </span>

                <h3>Previous Project Experience</h3>

                <p>
                    ${memory.text || "No experience details available."}
                </p>

                <div class="experience-actions">

                    <button
                        class="secondary-btn"
                        onclick="useDevelopmentExperience(${index})"
                    >
                        Use as Reference
                    </button>

                    <button
                        class="secondary-btn"
                        onclick="dismissDevelopmentExperience(this)"
                    >
                        Dismiss
                    </button>

                </div>

            </div>
        `).join("");

    } catch (error) {
        console.error(
            "Could not load development historical experiences:",
            error
        );

        container.innerHTML = `
            <p>Could not connect to backend.</p>
        `;
    }
}


function useDevelopmentExperience(index) {
    const memories = window.developmentHistoricalMemories || [];
    const memory = memories[index];

    if (!memory) return;

    alert(
        "Historical experience selected as a reference:\n\n" +
        (memory.text || "No details available.")
    );
}

function dismissDevelopmentExperience(button) {
    const card = button.closest(".experience-card");

    if (card) {
        card.remove();
    }
}


async function loadDevelopmentSolutions(projectId) {
    const container = document.getElementById("developmentSolutions");

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/solutions`
        );

        const solutions = await response.json();

        if (!response.ok) {
            container.innerHTML = `
                <p>Could not load solutions.</p>
            `;
            console.error(solutions);
            return;
        }

        if (!solutions || solutions.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No solutions recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = solutions.map(solution => `
            <div class="experience-card">

                <span class="small-label">
                    SOLUTION
                </span>

                <h3>
                    ${solution.problem || "Development Problem"}
                </h3>

                <p>
                    <strong>Solution:</strong>
                    ${solution.solution || "Not specified"}
                </p>

                <p>
                    <strong>Result:</strong>
                    ${solution.result || "Not specified"}
                </p>

            </div>
        `).join("");

    } catch (error) {
        console.error(
            "Could not load development solutions:",
            error
        );

        container.innerHTML = `
            <p>Could not connect to backend.</p>
        `;
    }
}


async function saveDevelopmentExperience() {
    const projectId = localStorage.getItem("currentProjectId");

    if (!projectId) {
        return;
    }

    const problem = document
        .getElementById("developmentExperienceProblem")
        .value
        .trim();

    const solution = document
        .getElementById("developmentExperienceSolution")
        .value
        .trim();

    const lesson = document
        .getElementById("developmentExperienceLesson")
        .value
        .trim();

    const message = document.getElementById(
        "developmentExperienceMessage"
    );

    if (!problem || !solution || !lesson) {
        message.innerText =
            "Please fill all three fields.";

        return;
    }

    message.innerText = "Saving development experience...";

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/experiences`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "DEVELOPMENT",
                    title: "Development Experience",
                    description: problem,
                    solution: solution,
                    outcome: null,
                    lesson: lesson,
                    source: "AI_DEVELOPMENT_CONVERSATION"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            message.innerText =
                "Could not save development experience.";

            return;
        }

        message.innerText =
            "✓ Development experience saved to Project Memory.";

        document.getElementById(
            "developmentExperienceProblem"
        ).value = "";

        document.getElementById(
            "developmentExperienceSolution"
        ).value = "";

        document.getElementById(
            "developmentExperienceLesson"
        ).value = "";

        await loadDevelopmentHistoricalExperiences(projectId);

    } catch (error) {
        console.error(
            "Could not save development experience:",
            error
        );

        message.innerText =
            "Could not connect to backend.";
    }
}


async function renderTestingStage(stage) {
    const container = document.getElementById("stageDetails");
    const projectId = localStorage.getItem("currentProjectId");

    container.innerHTML = `
        <div class="stage-header">
            <span class="small-label">TESTING</span>

            <h2>Testing Workspace</h2>

            <p>
                Track tests, known bugs, testing experiences,
                and lessons from previous projects.
            </p>
        </div>

        <div class="workspace-card">
            <h3>Testing Progress</h3>

            <p>
                <strong>Status:</strong>
                ${stage.status}
            </p>

            <p>
                <strong>Progress:</strong>
                ${stage.progress}%
            </p>
        </div>

        <div class="workspace-card">
    <h3>Unit Tests</h3>

    <div id="testingUnitTests">
        <p class="empty-message">
            Loading unit tests...
        </p>
    </div>

    <div class="form-group">
        <label>Test Name</label>

        <input
            id="unitTestName"
            type="text"
            placeholder="e.g. LoginServiceTest"
        >
    </div>

    <div class="form-group">
        <label>Status</label>

        <select id="unitTestStatus">
            <option value="PASSED">PASSED</option>
            <option value="FAILED">FAILED</option>
            <option value="BLOCKED">BLOCKED</option>
        </select>
    </div>

    <div class="form-group">
        <label>Result</label>

        <textarea
            id="unitTestResult"
            placeholder="Describe the test result..."
        ></textarea>
    </div>

    <button
        class="primary-btn"
        onclick="saveUnitTest()"
    >
        Record Unit Test
    </button>

    <p id="unitTestMessage"></p>
</div>

        <div class="workspace-card">
    <h3>Integration Tests</h3>

    <div id="testingIntegrationTests">
        <p class="empty-message">
            Loading integration tests...
        </p>
    </div>

    <div class="form-group">
        <label>Test Name</label>

        <input
            id="integrationTestName"
            type="text"
            placeholder="e.g. Auth API Integration Test"
        >
    </div>

    <div class="form-group">
        <label>Status</label>

        <select id="integrationTestStatus">
            <option value="PASSED">PASSED</option>
            <option value="FAILED">FAILED</option>
            <option value="BLOCKED">BLOCKED</option>
        </select>
    </div>

    <div class="form-group">
        <label>Result</label>

        <textarea
            id="integrationTestResult"
            placeholder="Describe the integration test result..."
        ></textarea>
    </div>

    <button
        class="primary-btn"
        onclick="saveIntegrationTest()"
    >
        Record Integration Test
    </button>

    <p id="integrationTestMessage"></p>
</div>

        <div class="workspace-card">
    <h3>Known Bugs</h3>

    <div id="testingKnownBugs">
        <p class="empty-message">
            Loading known bugs...
        </p>
    </div>

    <div class="form-group">
        <label>Bug Title</label>

        <input
            id="testingBugTitle"
            type="text"
            placeholder="e.g. Login fails with invalid password"
        >
    </div>

    <div class="form-group">
        <label>Description</label>

        <textarea
            id="testingBugDescription"
            placeholder="Describe the bug..."
        ></textarea>
    </div>

    <div class="form-group">
        <label>Severity</label>

        <select id="testingBugSeverity">
            <option value="LOW">LOW</option>
            <option value="MEDIUM" selected>MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
        </select>
    </div>

    <div class="form-group">
        <label>Status</label>

        <select id="testingBugStatus">
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
        </select>
    </div>

    <div class="form-group">
        <label>Solution</label>

        <textarea
            id="testingBugSolution"
            placeholder="Describe the solution if already fixed..."
        ></textarea>
    </div>

    <button
        class="primary-btn"
        onclick="saveTestingBug()"
    >
        Record Bug
    </button>

    <p id="testingBugMessage"></p>
</div>

        <div class="workspace-card">
            <h3>Record Test Experience</h3>

            <div class="form-group">
                <label>What happened during testing?</label>

                <textarea
                    id="testingExperienceProblem"
                    placeholder="Describe the testing problem or observation..."
                ></textarea>
            </div>

            <div class="form-group">
                <label>Solution / Action Taken</label>

                <textarea
                    id="testingExperienceSolution"
                    placeholder="Describe how it was handled..."
                ></textarea>
            </div>

            <div class="form-group">
                <label>Lesson for Future Projects</label>

                <textarea
                    id="testingExperienceLesson"
                    placeholder="What should future projects remember?"
                ></textarea>
            </div>

            <button
                class="primary-btn"
                onclick="saveTestingExperience()"
            >
                Save Test Experience
            </button>

            <p id="testingExperienceMessage"></p>
        </div>

       <div class="workspace-card">
    <h3>Relevant Historical Experiences</h3>

    <p>
        See how previous projects handled similar testing
        problems and apply their lessons to the current project.
    </p>

    <div id="testingHistoricalExperiences">
        <p class="empty-message">
            Searching previous project experiences...
        </p>
    </div>
</div>

        <div class="workspace-card">
    <h3>Suggested Checkpoints</h3>

    <p>
        Important testing checks to consider before moving
        to the Deployment stage.
    </p>

    <div id="testingSuggestedCheckpoints">
        <div class="experience-card">
            <span class="small-label">CHECKPOINT</span>
            <h3>Unit Tests</h3>
            <p>
                Make sure important application logic has
                corresponding unit tests.
            </p>
        </div>

        <div class="experience-card">
            <span class="small-label">CHECKPOINT</span>
            <h3>Integration Tests</h3>
            <p>
                Verify that important components and APIs
                communicate correctly.
            </p>
        </div>

        <div class="experience-card">
            <span class="small-label">CHECKPOINT</span>
            <h3>Known Bugs</h3>
            <p>
                Review open bugs and confirm that critical
                issues are resolved or understood.
            </p>
        </div>

        <div class="experience-card">
            <span class="small-label">CHECKPOINT</span>
            <h3>Test Results</h3>
            <p>
                Review failed or blocked tests before proceeding
                to deployment.
            </p>
        </div>
    </div>
</div>
    `;

    await loadTestingUnitTests(projectId);
    await loadTestingIntegrationTests(projectId);
    await loadTestingKnownBugs(projectId);
    await loadTestingHistoricalExperiences(projectId);
}

async function saveUnitTest() {
    const projectId = localStorage.getItem("currentProjectId");

    if (!projectId) return;

    const testName = document.getElementById("unitTestName").value.trim();
    const status = document.getElementById("unitTestStatus").value;
    const result = document.getElementById("unitTestResult").value.trim();
    const message = document.getElementById("unitTestMessage");

    if (!testName) {
        message.innerText = "Please enter a test name.";
        return;
    }

    message.innerText = "Saving unit test...";

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/tests`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    test_type: "UNIT",
                    test_name: testName,
                    status: status,
                    result: result || null
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            message.innerText = "Could not save unit test.";
            return;
        }

        message.innerText = "✓ Unit test recorded.";

        document.getElementById("unitTestName").value = "";
        document.getElementById("unitTestResult").value = "";

        // await loadTestingUnitTests(projectId);
        await refreshCurrentStage(projectId);

    } catch (error) {
        console.error("Could not save unit test:", error);
        message.innerText = "Could not connect to backend.";
    }
}

async function saveIntegrationTest() {
    const projectId = localStorage.getItem("currentProjectId");

    if (!projectId) return;

    const testName = document
        .getElementById("integrationTestName")
        .value
        .trim();

    const status = document.getElementById(
        "integrationTestStatus"
    ).value;

    const result = document
        .getElementById("integrationTestResult")
        .value
        .trim();

    const message = document.getElementById(
        "integrationTestMessage"
    );

    if (!testName) {
        message.innerText = "Please enter a test name.";
        return;
    }

    message.innerText = "Saving integration test...";

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/tests`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    test_type: "INTEGRATION",
                    test_name: testName,
                    status: status,
                    result: result || null
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            message.innerText =
                "Could not save integration test.";
            return;
        }

        message.innerText =
            "✓ Integration test recorded.";

        document.getElementById(
            "integrationTestName"
        ).value = "";

        document.getElementById(
            "integrationTestResult"
        ).value = "";

        // await loadTestingIntegrationTests(projectId);
        await refreshCurrentStage(projectId);

    } catch (error) {
        console.error(
            "Could not save integration test:",
            error
        );

        message.innerText =
            "Could not connect to backend.";
    }
}

async function loadTestingUnitTests(projectId) {
    const container = document.getElementById("testingUnitTests");

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/tests`
        );

        const tests = await response.json();

        if (!response.ok) {
            container.innerHTML =
                "<p>Could not load unit tests.</p>";
            return;
        }

        const unitTests = tests.filter(
            test => test.test_type === "UNIT"
        );

        if (unitTests.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No unit tests recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = unitTests.map(test => `
            <div class="experience-card">
                <span class="small-label">
                    UNIT TEST
                </span>

                <h3>${test.test_name}</h3>

                <p>
                    <strong>Status:</strong>
                    ${test.status}
                </p>

                <p>
                    <strong>Result:</strong>
                    ${test.result || "Not specified"}
                </p>
            </div>
        `).join("");

    } catch (error) {
        console.error("Could not load unit tests:", error);

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}


async function loadTestingIntegrationTests(projectId) {
    const container = document.getElementById(
        "testingIntegrationTests"
    );

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/tests`
        );

        const tests = await response.json();

        if (!response.ok) {
            container.innerHTML =
                "<p>Could not load integration tests.</p>";
            return;
        }

        const integrationTests = tests.filter(
            test => test.test_type === "INTEGRATION"
        );

        if (integrationTests.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No integration tests recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = integrationTests.map(test => `
            <div class="experience-card">
                <span class="small-label">
                    INTEGRATION TEST
                </span>

                <h3>${test.test_name}</h3>

                <p>
                    <strong>Status:</strong>
                    ${test.status}
                </p>

                <p>
                    <strong>Result:</strong>
                    ${test.result || "Not specified"}
                </p>
            </div>
        `).join("");

    } catch (error) {
        console.error(
            "Could not load integration tests:",
            error
        );

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}

async function saveTestingBug() {
    const projectId = localStorage.getItem("currentProjectId");

    if (!projectId) return;

    const title = document
        .getElementById("testingBugTitle")
        .value
        .trim();

    const description = document
        .getElementById("testingBugDescription")
        .value
        .trim();

    const severity = document
        .getElementById("testingBugSeverity")
        .value;

    const status = document
        .getElementById("testingBugStatus")
        .value;

    const solution = document
        .getElementById("testingBugSolution")
        .value
        .trim();

    const message = document.getElementById(
        "testingBugMessage"
    );

    if (!title) {
        message.innerText = "Please enter a bug title.";
        return;
    }

    if (!description) {
        message.innerText = "Please enter a bug description.";
        return;
    }

    message.innerText = "Saving bug...";

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/bugs`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    severity: severity,
                    status: status,
                    solution: solution || null
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Bug save error:", data);

            message.innerText =
                data.detail || "Could not save bug.";
            return;
}

        message.innerText = "✓ Bug recorded.";

        document.getElementById(
            "testingBugTitle"
        ).value = "";

        document.getElementById(
            "testingBugDescription"
        ).value = "";

        document.getElementById(
            "testingBugSolution"
        ).value = "";

        // await loadTestingKnownBugs(projectId);
        await refreshCurrentStage(projectId);

    } catch (error) {
        console.error(
            "Could not save bug:",
            error
        );

        message.innerText =
            "Could not connect to backend.";
    }
}

async function loadTestingKnownBugs(projectId) {
    const container = document.getElementById(
        "testingKnownBugs"
    );

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/bugs`
        );

        const bugs = await response.json();

        if (!response.ok) {
            container.innerHTML =
                "<p>Could not load known bugs.</p>";
            return;
        }

        if (bugs.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No known bugs recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = bugs.map(bug => `
            <div class="experience-card">
                <span class="small-label">
                    BUG
                </span>

                <h3>${bug.title}</h3>

                <p>
                    <strong>Description:</strong>
                    ${bug.description || "No description provided."}
                </p>

                <p>
                    <strong>Severity:</strong>
                    ${bug.severity || "MEDIUM"}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${bug.status || "OPEN"}
                </p>

                <p>
                    <strong>Solution:</strong>
                    ${bug.solution || "Not resolved yet."}
                </p>
            </div>
        `).join("");

    } catch (error) {
        console.error(
            "Could not load known bugs:",
            error
        );

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}


async function loadTestingHistoricalExperiences(projectId) {
    const container = document.getElementById(
        "testingHistoricalExperiences"
    );

    if (!container) return;

    try {
        // Get current project's testing information
        const testsResponse = await fetch(
            `${API_URL}/projects/${projectId}/tests`
        );

        const tests = await testsResponse.json();

        let testingContext = "Testing stage";

        if (testsResponse.ok && tests.length > 0) {
            const testNames = tests
                .map(test => test.test_name)
                .filter(Boolean)
                .join(", ");

            testingContext +=
                `. Current tests include: ${testNames}`;
        }

        const response = await fetch(
            `${API_URL}/memory?query=${encodeURIComponent(
                `Testing problems, bugs, unit testing, integration testing, test failures, debugging, and lessons from previous projects. ${testingContext}`
            )}`
        );

        const memories = await response.json();

        if (!response.ok) {
            container.innerHTML = `
                <p>
                    Could not load historical experiences.
                </p>
            `;
            return;
        }

        const uniqueMemories = memories.filter(
            (memory, index, self) =>
                index === self.findIndex(
                    item => item.text === memory.text
                )
        );

        if (uniqueMemories.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No relevant historical experiences found.
                </p>
            `;
            return;
        }

        window.testingHistoricalMemories = uniqueMemories;

        container.innerHTML = uniqueMemories.map(
            (memory, index) => `
                <div class="experience-card">
                    <span class="small-label">
                        HISTORICAL EXPERIENCE
                    </span>

                    <h3>
                        Previous Project Lesson
                    </h3>

                    <p>
                        ${memory.text || "No details available."}
                    </p>

                    <div style="margin-top: 12px;">
                        <button
                            class="primary-btn"
                            onclick="useTestingExperience(${index})"
                        >
                            Use as Reference
                        </button>

                        <button
                            class="secondary-btn"
                            onclick="dismissTestingExperience(this)"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            `
        ).join("");

    } catch (error) {
        console.error(
            "Could not load testing historical experiences:",
            error
        );

        container.innerHTML = `
            <p>
                Could not connect to backend.
            </p>
        `;
    }
}

function useTestingExperience(index) {
    const memories =
        window.testingHistoricalMemories || [];

    const memory = memories[index];

    if (!memory) return;

    alert(
        "Historical experience selected as a reference:\n\n" +
        (memory.text || "No details available.")
    );
}

function dismissTestingExperience(button) {
    const card = button.closest(".experience-card");

    if (card) {
        card.remove();
    }
}

function renderDeploymentStage(stage) {
    const projectId = localStorage.getItem("currentProjectId");

    const container = document.getElementById("stageDetails");

    if (!container || !projectId) return;

    container.innerHTML = `
        <div class="workspace-card">
            <h2>Deployment</h2>

            <p>
                Manage deployment information and review
                historical deployment experiences before
                releasing the project.
            </p>
        </div>

        <div class="workspace-card">
            <h3>Deployment Environment</h3>

            <div class="form-group">
                <label>Environment</label>

                <select id="deploymentEnvironment">
                    <option value="DEVELOPMENT">
                        DEVELOPMENT
                    </option>

                    <option value="STAGING">
                        STAGING
                    </option>

                    <option value="PRODUCTION">
                        PRODUCTION
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>Status</label>

                <select id="deploymentStatus">
                    <option value="PLANNED">
                        PLANNED
                    </option>

                    <option value="IN_PROGRESS">
                        IN_PROGRESS
                    </option>

                    <option value="SUCCESS">
                        SUCCESS
                    </option>

                    <option value="FAILED">
                        FAILED
                    </option>

                    <option value="ROLLED_BACK">
                        ROLLED_BACK
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>Version</label>

                <input
                    id="deploymentVersion"
                    type="text"
                    placeholder="e.g. v1.0.0"
                >
            </div>

            <div class="form-group">
                <label>Deployment Notes</label>

                <textarea
                    id="deploymentNotes"
                    placeholder="Describe the deployment..."
                ></textarea>
            </div>

            <button
                class="primary-btn"
                onclick="saveDeployment()"
            >
                Record Deployment
            </button>

            <p id="deploymentMessage"></p>
        </div>

        <div class="workspace-card">
            <h3>Deployment History</h3>

            <div id="deploymentHistory">
                <p class="empty-message">
                    Loading deployment history...
                </p>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Historical Deployment Experiences</h3>

            <div id="deploymentHistoricalExperiences">
                <p class="empty-message">
                    Searching previous project experiences...
                </p>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Deployment Checklist</h3>

            <div id="deploymentChecklist">

                <div class="experience-card">
                    <span class="small-label">
                        CHECKPOINT
                    </span>

                    <h3>Environment Configuration</h3>

                    <p>
                        Verify that all required environment
                        variables and configuration values are
                        available.
                    </p>
                </div>

                <div class="experience-card">
    <span class="small-label">
        POTENTIAL ISSUE
    </span>

    <h3>Configuration Mismatch</h3>

    <p>
        Check whether local, staging, and production
        environments use different configuration values.
    </p>
</div>

<div class="experience-card">
    <span class="small-label">
        POTENTIAL ISSUE
    </span>

    <h3>Unresolved Bugs</h3>

    <p>
        Review open HIGH or CRITICAL severity bugs before
        production deployment.
    </p>
</div>

<div class="experience-card">
    <span class="small-label">
        POTENTIAL ISSUE
    </span>

    <h3>Database Migration</h3>

    <p>
        Confirm that all required database migrations have
        been applied before starting the new application version.
    </p>
</div>


                <div class="experience-card">
                    <span class="small-label">
                        CHECKPOINT
                    </span>

                    <h3>Database</h3>

                    <p>
                        Confirm database connectivity,
                        migrations, and required schema changes.
                    </p>
                </div>

                <div class="experience-card">
                    <span class="small-label">
                        CHECKPOINT
                    </span>

                    <h3>Application Health</h3>

                    <p>
                        Verify that the deployed application
                        starts successfully and required APIs
                        are responding.
                    </p>
                </div>

                <div class="experience-card">
                    <span class="small-label">
                        CHECKPOINT
                    </span>

                    <h3>Rollback Plan</h3>

                    <p>
                        Ensure there is a known rollback or
                        recovery approach if deployment fails.
                    </p>
                </div>

            </div>
        </div>

        <div class="experience-card">
    <span class="small-label">
        POTENTIAL ISSUE
    </span>

    <h3>Configuration Mismatch</h3>

    <p>
        Check whether local, staging, and production
        environments use different configuration values.
    </p>
</div>

    `;

    loadDeploymentHistory(projectId);
    loadDeploymentHistoricalExperiences(projectId);
}

async function saveDeployment() {
    const projectId = localStorage.getItem("currentProjectId");

    if (!projectId) return;

    const environment = document
        .getElementById("deploymentEnvironment")
        .value;

    const status = document
        .getElementById("deploymentStatus")
        .value;

    const version = document
        .getElementById("deploymentVersion")
        .value
        .trim();

    const deploymentNotes = document
        .getElementById("deploymentNotes")
        .value
        .trim();

    const message = document.getElementById(
        "deploymentMessage"
    );

    message.innerText = "Saving deployment...";

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/deployments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    environment: environment,
                    status: status,
                    version: version || null,
                    deployment_notes:
                        deploymentNotes || null
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            message.innerText =
                "Could not save deployment.";
            return;
        }

        message.innerText =
            "✓ Deployment recorded.";

        document.getElementById(
            "deploymentVersion"
        ).value = "";

        document.getElementById(
            "deploymentNotes"
        ).value = "";

        // await loadDeploymentHistory(projectId);
        await refreshCurrentStage(projectId);

    } catch (error) {
        console.error(
            "Could not save deployment:",
            error
        );

        message.innerText =
            "Could not connect to backend.";
    }
}

async function loadDeploymentHistory(projectId) {
    const container = document.getElementById(
        "deploymentHistory"
    );

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/deployments`
        );

        const deployments = await response.json();

        if (!response.ok) {
            container.innerHTML =
                "<p>Could not load deployment history.</p>";
            return;
        }

        if (deployments.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No deployments recorded yet.
                </p>
            `;
            return;
        }

        container.innerHTML = deployments.map(
            deployment => `
                <div class="experience-card">

                    <span class="small-label">
                        DEPLOYMENT
                    </span>

                    <h3>
                        ${deployment.environment}
                    </h3>

                    <p>
                        <strong>Status:</strong>
                        ${deployment.status}
                    </p>

                    <p>
                        <strong>Version:</strong>
                        ${deployment.version || "Not specified"}
                    </p>

                    <p>
                        <strong>Notes:</strong>
                        ${
                            deployment.deployment_notes ||
                            "No notes provided."
                        }
                    </p>

                </div>
            `
        ).join("");

    } catch (error) {
        console.error(
            "Could not load deployment history:",
            error
        );

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}

async function loadDeploymentHistoricalExperiences(projectId) {
    const container = document.getElementById(
        "deploymentHistoricalExperiences"
    );

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/memory?query=${encodeURIComponent(
                "deployment failures, production deployment problems, environment configuration, database deployment, rollback, deployment lessons, release issues from previous projects"
            )}`
        );

        const memories = await response.json();

        if (!response.ok) {
            container.innerHTML =
                "<p>Could not load historical experiences.</p>";
            return;
        }

        const uniqueMemories = memories.filter(
            (memory, index, self) =>
                index === self.findIndex(
                    item => item.text === memory.text
                )
        );

        if (uniqueMemories.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No relevant historical deployment
                    experiences found.
                </p>
            `;
            return;
        }

        window.deploymentHistoricalMemories =
            uniqueMemories;

        container.innerHTML =
            uniqueMemories.map(
                (memory, index) => `
                    <div class="experience-card">

                        <span class="small-label">
                            HISTORICAL EXPERIENCE
                        </span>

                        <h3>
                            Previous Deployment Lesson
                        </h3>

                        <p>
                            ${
                                memory.text ||
                                "No details available."
                            }
                        </p>

                        <div style="margin-top: 12px;">

                            <button
                                class="primary-btn"
                                onclick="useDeploymentExperience(${index})"
                            >
                                Use as Reference
                            </button>

                            <button
                                class="secondary-btn"
                                onclick="dismissDeploymentExperience(this)"
                            >
                                Dismiss
                            </button>

                        </div>

                    </div>
                `
            ).join("");

    } catch (error) {
        console.error(
            "Could not load deployment historical experiences:",
            error
        );

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}

function useDeploymentExperience(index) {
    const memories =
        window.deploymentHistoricalMemories || [];

    const memory = memories[index];

    if (!memory) return;

    alert(
        "Historical deployment experience selected:\n\n" +
        (memory.text || "No details available.")
    );
}

function dismissDeploymentExperience(button) {
    const card = button.closest(".experience-card");

    if (card) {
        card.remove();
    }
}

function renderHindsightStage(stage) {
    const projectId = localStorage.getItem("currentProjectId");

    const container = document.getElementById("stageDetails");

    if (!container || !projectId) return;

    container.innerHTML = `
        <div class="workspace-card">
            <h2>Learn / Hindsight</h2>

            <p>
                Capture what this project learned so that
                future projects can benefit from its experience.
            </p>
        </div>

        <div class="workspace-card">
            <h3>What Went Well</h3>

            <div class="form-group">
                <textarea
                    id="hindsightWentWell"
                    placeholder="What worked well in this project?"
                ></textarea>
            </div>
        </div>

        <div class="workspace-card">
            <h3>What Caused Problems</h3>

            <div class="form-group">
                <textarea
                    id="hindsightProblems"
                    placeholder="What caused problems, delays, failures, or rework?"
                ></textarea>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Important Decisions</h3>

            <div id="hindsightDecisions">
                <p class="empty-message">
                    Loading important decisions...
                </p>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Rejected Ideas</h3>

            <div id="hindsightRejectedIdeas">
                <p class="empty-message">
                    Loading rejected ideas...
                </p>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Lessons Learned</h3>

            <div class="form-group">
                <textarea
                    id="hindsightLessons"
                    placeholder="What should future projects learn from this project?"
                ></textarea>
            </div>
        </div>

        <div class="workspace-card">
            <h3>What Future Projects Should Know</h3>

            <div class="form-group">
                <textarea
                    id="hindsightFutureKnowledge"
                    placeholder="What important knowledge should be preserved for future projects?"
                ></textarea>
            </div>
        </div>

        <div class="workspace-card">
            <h3>Save to Project Memory</h3>

            <p>
                Save this project's final lessons and knowledge
                into ProjectHindsight memory.
            </p>

            <button
                class="primary-btn"
                onclick="saveProjectHindsight()"
            >
                Save to Project Memory
            </button>

            <p id="hindsightSaveMessage"></p>
        </div>
    `;

    loadHindsightDecisions(projectId);
    loadHindsightRejectedIdeas(projectId);
}

async function loadHindsightDecisions(projectId) {
    const container = document.getElementById(
        "hindsightDecisions"
    );

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/decisions`
        );

        const decisions = await response.json();

        if (!response.ok) {
            container.innerHTML =
                "<p>Could not load decisions.</p>";
            return;
        }

        if (decisions.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No important decisions recorded.
                </p>
            `;
            return;
        }

        container.innerHTML = decisions.map(
            decision => `
                <div class="experience-card">

                    <span class="small-label">
                        DECISION
                    </span>

                    <h3>
                        ${decision.title}
                    </h3>

                    <p>
                        <strong>Decision:</strong>
                        ${decision.decision}
                    </p>

                    <p>
                        <strong>Reason:</strong>
                        ${decision.reason || "Not specified"}
                    </p>

                </div>
            `
        ).join("");

    } catch (error) {
        console.error(
            "Could not load hindsight decisions:",
            error
        );

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}

async function loadHindsightRejectedIdeas(projectId) {
    const container = document.getElementById(
        "hindsightRejectedIdeas"
    );

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/ideas`
        );

        const ideas = await response.json();

        if (!response.ok) {
            container.innerHTML =
                "<p>Could not load ideas.</p>";
            return;
        }

        const rejectedIdeas = ideas.filter(
            idea =>
                idea.status === "REJECTED" ||
                idea.status === "POSTPONED"
        );

        if (rejectedIdeas.length === 0) {
            container.innerHTML = `
                <p class="empty-message">
                    No rejected or postponed ideas recorded.
                </p>
            `;
            return;
        }

        container.innerHTML = rejectedIdeas.map(
            idea => `
                <div class="experience-card">

                    <span class="small-label">
                        ${idea.status}
                    </span>

                    <h3>
                        ${idea.idea}
                    </h3>

                    <p>
                        <strong>Description:</strong>
                        ${
                            idea.description ||
                            "No description provided."
                        }
                    </p>

                    <p>
                        <strong>Reason:</strong>
                        ${
                            idea.rejection_reason ||
                            "No reason recorded."
                        }
                    </p>

                </div>
            `
        ).join("");

    } catch (error) {
        console.error(
            "Could not load rejected ideas:",
            error
        );

        container.innerHTML =
            "<p>Could not connect to backend.</p>";
    }
}

async function saveProjectHindsight() {
    const projectId = localStorage.getItem("currentProjectId");

    if (!projectId) return;

    const wentWell = document
        .getElementById("hindsightWentWell")
        .value
        .trim();

    const problems = document
        .getElementById("hindsightProblems")
        .value
        .trim();

    const lessons = document
        .getElementById("hindsightLessons")
        .value
        .trim();

    const futureKnowledge = document
        .getElementById("hindsightFutureKnowledge")
        .value
        .trim();

    const message = document.getElementById(
        "hindsightSaveMessage"
    );

    if (
        !wentWell &&
        !problems &&
        !lessons &&
        !futureKnowledge
    ) {
        message.innerText =
            "Please enter at least one project lesson.";
        return;
    }

    message.innerText =
        "Saving project hindsight...";

    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}/experiences`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "HINDSIGHT",
                    title: "Project Hindsight",
                    description:
                        `What went well:\n${wentWell}\n\n` +
                        `What caused problems:\n${problems}`,
                    solution: null,
                    outcome: futureKnowledge,
                    lesson: lessons,
                    source: "PROJECT_HINDSIGHT",
                    created_by: null
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            message.innerText =
                "Could not save project hindsight.";

            return;
        }

        message.innerText =
            "✓ Project hindsight saved to memory.";
        
        
        await refreshCurrentStage(projectId);

    } catch (error) {
        console.error(
            "Could not save project hindsight:",
            error
        );

        message.innerText =
            "Could not connect to backend.";
    }
}

async function saveProjectIdea() {

    const projectId =
        localStorage.getItem("currentProjectId");

    if (!projectId) {
        return;
    }

    const idea =
        document.getElementById("ideaInput")
            .value
            .trim();

    const description =
        document.getElementById("ideaDescription")
            .value
            .trim();

    const status =
        document.getElementById("ideaStatus")
            .value;

    const rejectionReason =
        document.getElementById("ideaRejectionReason")
            .value
            .trim();

    const message =
        document.getElementById("ideaMessage");

    if (!idea) {

        message.innerText =
            "Please enter the project idea.";

        return;
    }

    message.innerText =
        "Saving idea...";

    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}/ideas`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        idea: idea,

                        description:
                            description || null,

                        status: status,

                        rejection_reason:
                            rejectionReason || null

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(data);

            message.innerText =
                "Could not save idea.";

            return;
        }

        message.innerText =
            "✓ Idea saved successfully.";

        document.getElementById("ideaInput")
            .value = "";

        document.getElementById("ideaDescription")
            .value = "";

        document.getElementById("ideaStatus")
            .value = "PROPOSED";

        document.getElementById("ideaRejectionReason")
            .value = "";

        await loadProjectIdeas(projectId);

    } catch (error) {

        console.error(
            "Could not save idea:",
            error
        );

        message.innerText =
            "Could not connect to backend.";
    }
}


async function loadProjectIdeas(projectId) {

    const container =
        document.getElementById("projectIdeas");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}/ideas`
            );

        const ideas =
            await response.json();

        if (!response.ok) {

            container.innerHTML =
                "<p class='empty-message'>Could not load ideas.</p>";

            console.error(ideas);

            return;
        }

        if (!ideas || ideas.length === 0) {

            container.innerHTML = `

                <div class="idea-card">

                    <div>

                        <span class="small-label">
                            NO IDEAS RECORDED
                        </span>

                        <h2>
                            Start with your project idea.
                        </h2>

                        <p>
                            The idea will become part of
                            this project's history.
                        </p>

                    </div>

                </div>

            `;

            return;
        }

        container.innerHTML = `

            <div class="stage-info">

                <span class="small-label">
                    PROJECT IDEAS
                </span>

                <h2>
                    Recorded Ideas
                </h2>

            </div>

        `;

        ideas.forEach(idea => {

            const card =
                document.createElement("div");

            card.className =
                "memory-result";

            card.innerHTML = `

                <div class="memory-type">
                    ${idea.status}
                </div>

                <h3>
                    ${idea.idea}
                </h3>

                <p>
                    ${idea.description ||
                    "No description provided."}
                </p>

                ${
                    idea.rejection_reason
                    ? `
                        <p>
                            <strong>
                                Reason:
                            </strong>
                            ${idea.rejection_reason}
                        </p>
                    `
                    : ""
                }

            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Could not load project ideas:",
            error
        );

        container.innerHTML =
            "<p class='empty-message'>Could not connect to backend.</p>";
    }
}



// ------------------------------------
// FORMAT STAGE NAME
// ------------------------------------

function formatStageName(stageName) {

    if (!stageName) {
        return "";
    }


    // if (stageName === "HINDSIGHT") {

    //     return "LEARN / HINDSIGHT";

    // }


    return stageName
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}



// ------------------------------------
// LOAD CURRENT PROJECT
// ------------------------------------

// ------------------------------------
// LOAD CURRENT PROJECT
// ------------------------------------

async function loadCurrentProject() {

    const projectId =
        localStorage.getItem(
            "currentProjectId"
        );


    if (!projectId) {

        return;

    }


    await loadProjectWorkspace(
        projectId
    );

}


// ------------------------------------
// PROJECT 2 - HAVE WE FACED THIS BEFORE?
// ------------------------------------


async function findHistoricalExperience() {

    const query =
        document.getElementById("projectProblem").value.trim();

    const resultContainer =
        document.getElementById("historicalExperience");


    if (!query) {

        resultContainer.innerHTML =
            "<p class='empty-message'>Please describe the problem first.</p>";

        return;
    }


    resultContainer.innerHTML =
        "<p>Searching previous project experiences...</p>";


    try {

        const response = await fetch(
            `${API_URL}/memory?query=${encodeURIComponent(query)}`
        );


        const data = await response.json();


        resultContainer.innerHTML = "";


        if (!response.ok ||
            !data.memories ||
            data.memories.length === 0) {

            resultContainer.innerHTML = `
                <div class="memory-result">

                    <div class="memory-type">
                        NO HISTORICAL EXPERIENCE FOUND
                    </div>

                    <p>
                        No similar experience was found
                        in previous project history.
                    </p>

                </div>
            `;

            return;
        }


        const memory = data.memories[0];


        const card =
            document.createElement("div");

        card.className = "revive-card";


        card.innerHTML = `

            <span class="small-label">
                POTENTIAL HISTORICAL EXPERIENCE FOUND
            </span>


            <h2>
                Emergency Response System
            </h2>

            <div class="historical-detail">

                <strong>What happened</strong>

                <p>
                    ${memory.text}
                </p>

            </div>

           <div class="historical-detail">

                <strong>Historical Lesson</strong>

                <p id="historicalLesson">
                    Finding applicable lesson...
                </p>

            </div>


            <p class="warning">
                A similar situation was found in
                previous project memory.
            </p>


            <div class="reference-actions">

                <button
                    class="secondary-btn"
                    onclick="useHistoricalReference()">
                    Use as Reference
                </button>


                <button
                    class="text-btn"
                    onclick="dismissHistoricalExperience()">
                    Dismiss
                </button>

            </div>


            <p id="project2Message"></p>

        `;


        resultContainer.appendChild(card);
        getHistoricalLesson(query);


    } catch (error) {

        resultContainer.innerHTML =
            "<p>Could not connect to backend.</p>";

        console.error(error);
    }
}


async function getHistoricalLesson(query) {

    const lessonElement =
        document.getElementById("historicalLesson");

    try {

        const response = await fetch(
            `${API_URL}/historical-lesson`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    query: query
                })
            }
        );


        const data = await response.json();


        if (response.ok && data.lesson) {

            lessonElement.innerText =
                data.lesson;

        } else {

            lessonElement.innerText =
                "No specific historical lesson found.";
        }


    } catch (error) {

        lessonElement.innerText =
            "Could not retrieve historical lesson.";

        console.error(error);
    }
}



// ------------------------------------
// PROJECT 2 - USE AS REFERENCE
// ------------------------------------

function useHistoricalReference() {

    document.getElementById("project2Message").innerText =
        "✓ Historical experience added as guidance for Project 2. The team can now consider the previous solution and lesson before making its decision.";

}


// ------------------------------------
// PROJECT 2 - DISMISS
// ------------------------------------

function dismissHistoricalExperience() {

    document.getElementById("historicalExperience").innerHTML =
        "<p class='empty-message'>Historical experience dismissed.</p>";

}


// ------------------------------------
// DASHBOARD
// ------------------------------------



async function loadDashboard() {

    const container =
        document.getElementById("dashboardCurrentProject");

    if (!container) {
        return;
    }

    const projectId =
        localStorage.getItem("currentProjectId");

    if (!projectId) {

        container.innerHTML = `
            <div class="idea-card">

                <div>

                    <span class="small-label">
                        CURRENT PROJECT
                    </span>

                    <h2>
                        No current project selected
                    </h2>

                    <p>
                        Create or select a project to see
                        its current status and project memory.
                    </p>

                </div>

            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}/workspace`
            );

        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Could not load dashboard:",
                data
            );

            container.innerHTML = `
                <div class="idea-card">

                    <h2>
                        Could not load current project
                    </h2>

                    <p>
                        Please try again.
                    </p>

                </div>
            `;

            return;
        }


        const project =
            data.project;

        const stages =
            data.stages || [];

        const experiences =
            data.experiences || [];

        const decisions =
            data.decisions || [];

        const bugs =
            data.bugs || [];

        const lessons =
            data.lessons || [];


        /*
         * Find the current stage
         */

        const currentStage =
            stages.find(
                stage =>
                    stage.stage_type === project.current_stage
            );


        const stageName =
            currentStage
                ? formatStageName(currentStage.stage_type)
                : formatStageName(project.current_stage);


        const stageProgress =
            currentStage
                ? currentStage.progress
                : project.progress || 0;


        /*
         * Count pending decisions
         */

        const pendingDecisions =
            decisions.filter(
                decision =>
                    decision.status !== "COMPLETED" &&
                    decision.status !== "CLOSED"
            ).length;


        /*
         * Count open bugs/issues
         */

        const openIssues =
            bugs.filter(
                bug =>
                    bug.status !== "RESOLVED" &&
                    bug.status !== "CLOSED"
            ).length;


        /*
         * Render current project
         */

        container.innerHTML = `

            <div class="project-card">

                <div class="project-header">

                    <div>

                        <span class="badge">
                            ${project.status || "ACTIVE"}
                        </span>

                        <h2>
                            ${project.name}
                        </h2>

                        <p>
                            ${project.description ||
                            "No project description available."}
                        </p>

                        <p>
                            <strong>Domain:</strong>
                            ${project.domain ||
                            "Not specified"}
                        </p>

                    </div>


                    <div class="project-actions">

    <button
        class="secondary-btn"
        onclick="loadProjectWorkspace(${project.id})">

        View Project

    </button>

    ${
        project.status === "ACTIVE"
        ? `
            <button
                class="secondary-btn"
                onclick="archiveProject(${project.id})">

                Archive

            </button>

            <button
                class="danger-btn"
                onclick="deleteProject(${project.id})">

                Delete

            </button>
        `
        : `
            <span class="badge">
                ARCHIVED
            </span>
        `
    }

</div>

                </div>


                <div class="project-metrics">


                    <div>

                        <strong>
                            ${stageProgress}%
                        </strong>

                        <span>
                            Current Progress
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${stageName}
                        </strong>

                        <span>
                            Current Stage
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${experiences.length}
                        </strong>

                        <span>
                            New Experiences
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${pendingDecisions}
                        </strong>

                        <span>
                            Decisions Pending
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${openIssues}
                        </strong>

                        <span>
                            Open Issues
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${lessons.length}
                        </strong>

                        <span>
                            Lessons
                        </span>

                    </div>

                </div>

            </div>

        `;

    } catch (error) {

        console.error(
            "Could not load dashboard:",
            error
        );

        container.innerHTML = `

            <div class="idea-card">

                <h2>
                    Could not connect to backend
                </h2>

                <p>
                    Make sure the FastAPI server is running.
                </p>

            </div>

        `;

    }

}


async function archiveProject(projectId) {

    const confirmed = confirm(
        "Archive this project?\n\n" +
        "The project and all its data will be preserved, " +
        "but it will no longer appear as an active project."
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/projects/${projectId}/archive`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(data);

            alert(
                data.detail ||
                "Could not archive project."
            );

            return;
        }

        alert(
            "Project archived successfully."
        );

        await loadProjects();

    } catch (error) {

        console.error(
            "Archive project failed:",
            error
        );

        alert(
            "Could not connect to backend."
        );
    }
}

async function deleteProject(projectId) {

    const confirmed = confirm(
        "DELETE PROJECT?\n\n" +
        "Project-specific data will be deleted.\n" +
        "Historical experiences and Hindsight memory will be preserved.\n\n" +
        "This action cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/projects/${projectId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(data);

            alert(
                data.detail ||
                "Could not delete project."
            );

            return;
        }

        alert(
            "Project deleted.\n\n" +
            "Historical experiences were preserved."
        );

        const currentProjectId =
            localStorage.getItem("currentProjectId");

        if (
            currentProjectId &&
            Number(currentProjectId) === Number(projectId)
        ) {
            localStorage.removeItem(
                "currentProjectId"
            );
        }

        await loadProjects();

    } catch (error) {

        console.error(
            "Delete project failed:",
            error
        );

        alert(
            "Could not connect to backend."
        );
    }
}


// ------------------------------------
// OPEN CURRENT PROJECT
// ------------------------------------

async function openCurrentProject() {

    const projectId =
        localStorage.getItem(
            "currentProjectId"
        );


    if (!projectId) {

        alert(
            "No active project selected."
        );

        showSection("projects");

        return;

    }


    await loadProjectWorkspace(
        projectId
    );

}



loadExperienceCount();
loadProjects();
loadCurrentProject();
loadDashboard();