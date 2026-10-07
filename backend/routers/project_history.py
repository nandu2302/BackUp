from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from hindsight_service import search_memory


router = APIRouter(
    prefix="/projects",
    tags=["Project History"]
)


@router.post("/{project_id}/historical-experiences")
async def get_historical_experiences(
    project_id: int,
    db: Session = Depends(get_db)
):
    # Check whether the project exists
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Build a search query using the new project's details
    query = f"""
    Find relevant experiences from previous projects
    that are similar to this newly created project.

    Project Name:
    {project.name}

    Domain:
    {project.domain}

    Description:
    {project.description or "No description provided."}

    Look for previous project experiences related to:
    - similar projects
    - similar domain
    - similar problems
    - similar technical approaches
    - important decisions
    - failures
    - solutions
    - lessons learned

    Return only experiences that are relevant to the
    current project.
    """

    try:
        memories = await search_memory(query)

    except Exception as error:
        print("Historical experience search failed:", error)

        return {
            "experiences": [],
            "message": "Historical experiences could not be loaded."
        }

    return {
        "experiences": memories,
        "message": (
            "Relevant historical experiences found."
            if memories
            else "No relevant previous project experiences found."
        )
    }