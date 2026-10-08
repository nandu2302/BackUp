from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from hindsight_service import search_memory


router = APIRouter(
    prefix="/projects/{project_id}",
    tags=["Testing Insights"]
)


@router.get(
    "/testing-insights"
)
async def get_testing_insights(
    project_id: int,
    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # Verify project exists
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
    # Search Hindsight for testing-related experiences
    # --------------------------------------------------------

    query = (
        "Testing problems, bugs, unit testing, "
        "integration testing, test failures, "
        "debugging, concurrency problems, "
        "test automation, regression testing, "
        "and lessons learned from previous projects."
    )

    memories = await search_memory(query)

    return {
        "project_id": project_id,
        "insights": memories
    }