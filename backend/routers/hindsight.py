from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.experience import Experience
from models.project import Project
from hindsight_service import generate_hindsight, search_memory


router = APIRouter(
    prefix="/hindsight",
    tags=["Hindsight"]
)


# ============================================================
# GET ALL PROJECT EXPERIENCES
# ============================================================

@router.get("/experiences")
def get_all_experiences(
    db: Session = Depends(get_db)
):
    experiences = (
        db.query(Experience)
        .order_by(Experience.created_at.desc())
        .all()
    )

    return experiences


# ============================================================
# GET ALL PROJECTS WITH EXPERIENCE COUNTS
# ============================================================

@router.get("/projects")
def get_hindsight_projects(
    db: Session = Depends(get_db)
):
    projects = (
        db.query(Project)
        .order_by(Project.created_at.desc())
        .all()
    )

    result = []

    for project in projects:

        experience_count = (
            db.query(Experience)
            .filter(
                Experience.project_id == project.id
            )
            .count()
        )

        result.append({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "domain": project.domain,
            "status": project.status,
            "experience_count": experience_count
        })

    return result


# ============================================================
# GET EXPERIENCES FOR ONE PROJECT
# ============================================================

@router.get("/projects/{project_id}/experiences")
def get_project_hindsight(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    experiences = (
        db.query(Experience)
        .filter(
            Experience.project_id == project_id
        )
        .order_by(Experience.created_at.desc())
        .all()
    )

    return {
        "project": {
            "id": project.id,
            "name": project.name
        },
        "experiences": experiences
    }


# ============================================================
# SEARCH ALL PROJECT MEMORY
# ============================================================

@router.get("/memory")
async def hindsight_memory(
    query: str
):
    memories = await search_memory(query)

    return {
        "query": query,
        "memories": memories
    }


# ============================================================
# GENERATE GLOBAL HINDSIGHT
# ============================================================

@router.post("/generate")
async def generate_global_hindsight(
    data: dict,
    db: Session = Depends(get_db)
):
    query = (data.get("query") or "").strip()
    project_id = data.get("project_id")

    if project_id is None:
        raise HTTPException(
            status_code=400,
            detail="Project ID is required"
        )

    # ----------------------------------------
    # GET SELECTED PROJECT
    # ----------------------------------------

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # ----------------------------------------
    # GET POSTGRESQL EXPERIENCES
    # ----------------------------------------

    experiences = (
        db.query(Experience)
        .filter(
            Experience.project_id == project_id
        )
        .order_by(Experience.created_at.asc())
        .all()
    )

    # ----------------------------------------
    # BUILD EXPERIENCE CONTEXT
    # ----------------------------------------

    experience_context = ""

    for index, experience in enumerate(
        experiences,
        start=1
    ):
        experience_context += f"""
Experience {index}

Type:
{experience.type}

Title:
{experience.title}

What happened:
{experience.description}

Solution / Decision:
{experience.solution or "Not recorded"}

Outcome:
{experience.outcome or "Not recorded"}

Lesson:
{experience.lesson or "Not recorded"}

----------------------------------------
"""

    # ----------------------------------------
    # IF POSTGRESQL HAS NO EXPERIENCES,
    # SEARCH HINDSIGHT CLOUD
    # ----------------------------------------

    if not experiences:

        memories = await search_memory(
            f"""
            Project name: {project.name}

            Find experiences, decisions, failures,
            solutions, outcomes, rejected ideas,
            and lessons specifically related to this project.
            """
        )

        for index, memory in enumerate(
            memories,
            start=1
        ):
            experience_context += f"""
Historical Project Memory {index}

Type:
{memory.get("type", "Memory")}

Details:
{memory.get("text", "")}

----------------------------------------
"""

    # ----------------------------------------
    # STILL NOTHING FOUND
    # ----------------------------------------

    if not experience_context.strip():
        return {
            "query": query,
            "project_id": project_id,
            "project_name": project.name,
            "hindsight": (
                "No experiences or historical memories "
                "were found for this project."
            )
        }

    # ----------------------------------------
    # GENERATE HINDSIGHT
    # ----------------------------------------

    prompt = f"""
You are the ProjectHindsight learning agent.

Generate hindsight specifically for this project.

PROJECT NAME:
{project.name}

PROJECT DESCRIPTION:
{project.description or "No description available."}

PROJECT EXPERIENCES AND HISTORICAL MEMORY:

{experience_context}

Analyze ONLY the information above.

Organize the result into exactly these sections:

WHAT WORKED

WHAT FAILED

IMPORTANT DECISIONS

LESSONS FOR FUTURE PROJECTS

Rules:

- Use only information contained in the project experiences
  and historical memory.
- Do not invent information.
- Do not use information from unrelated projects.
- Put successful approaches under WHAT WORKED.
- Put failures and problems under WHAT FAILED.
- Put important decisions under IMPORTANT DECISIONS.
- Put reusable lessons under LESSONS FOR FUTURE PROJECTS.
- Use concise bullet points.
- Make the answer specific to this project.

{query}
"""

    result = await generate_hindsight(prompt)

    return {
        "query": query,
        "project_id": project_id,
        "project_name": project.name,
        "hindsight": result
    }

# ============================================================
# REVIVE OLD IDEA
# ============================================================

@router.post("/revive-idea")
async def revive_old_idea(
    data: dict
):
    idea = data.get("idea")

    if not idea:
        raise HTTPException(
            status_code=400,
            detail="Idea is required"
        )

    result = await generate_hindsight(
        f"""
        A project is considering this idea:

        {idea}

        Review experiences from all previous projects.

        Find whether this idea, technology, approach, or decision
        was previously rejected or not selected.

        If a previous rejection exists, explain:

        1. What was rejected?
        2. Why was it rejected?
        3. Which project made that decision?
        4. What should the current project reconsider?

        If no relevant historical rejection exists, say:

        No previous rejected decision was found.

        Keep the response concise and practical.
        """
    )

    return {
        "idea": idea,
        "result": result
    }