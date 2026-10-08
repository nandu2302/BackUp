from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from hindsight_service import search_memory


router = APIRouter(
    prefix="/projects/{project_id}",
    tags=["Deployment Insights"]
)


@router.get("/deployment-insights")
async def get_deployment_insights(
    project_id: int,
    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # Verify project
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # --------------------------------------------------------
    # Search specifically for deployment experiences
    # --------------------------------------------------------

    query = """
    Find deployment experiences from previous projects.

    Focus ONLY on:
    - deployment failures
    - successful deployments
    - staging deployments
    - production deployments
    - release problems
    - environment configuration problems
    - deployment versions
    - deployment configuration
    - deployment fixes
    - lessons learned from deployment outcomes

    Do not return unrelated experiences about:
    - requirements
    - architecture
    - development
    - testing
    - Google Maps
    - databases
    - user roles
    - emergency response
    unless they are directly related to a deployment problem.

    Return the most relevant deployment experiences and lessons.
    """

    memories = await search_memory(query)

    # --------------------------------------------------------
    # Additional safety filter
    # --------------------------------------------------------

    deployment_keywords = [
        "deployment",
        "deployed",
        "deploy",
        "release",
        "staging",
        "production",
        "environment variable",
        "environment configuration",
        "deployment configuration",
        "deployment failure"
    ]

    filtered_memories = []

    for memory in memories:
        text = (
            memory.get("text", "")
            if isinstance(memory, dict)
            else ""
        )

        text_lower = text.lower()

        if any(
            keyword in text_lower
            for keyword in deployment_keywords
        ):
            filtered_memories.append(memory)

    return {
        "project_id": project_id,
        "insights": filtered_memories
    }