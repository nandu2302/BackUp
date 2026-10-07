from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.stage import ProjectStage
from models.bug import Bug
from schemas.bug import (
    BugCreate,
    BugUpdate,
    BugResponse
)
from services.stage_progress import update_stage_progress


router = APIRouter(
    prefix="/projects/{project_id}/bugs",
    tags=["Testing - Bugs"]
)


@router.post(
    "",
    response_model=BugResponse,
    status_code=201
)
def create_bug(
    project_id: int,
    bug_data: BugCreate,
    db: Session = Depends(get_db)
):
    # Check project
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

    # Validate stage if supplied
    if bug_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == bug_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    bug = Bug(
        project_id=project_id,
        stage_id=bug_data.stage_id,
        title=bug_data.title,
        description=bug_data.description,
        severity=bug_data.severity,
        status=bug_data.status,
        solution=bug_data.solution
    )

    # Set resolved time when created as resolved/closed
    if bug.status.upper() in ["RESOLVED", "CLOSED"]:
        bug.resolved_at = datetime.utcnow()

    db.add(bug)
    db.flush()

    update_stage_progress(
        project_id,
        "TESTING",
        db
    )

    db.commit()
    db.refresh(bug)

    return bug


@router.get(
    "",
    response_model=list[BugResponse]
)
def get_bugs(
    project_id: int,
    db: Session = Depends(get_db)
):
    # Check project
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

    return (
        db.query(Bug)
        .filter(Bug.project_id == project_id)
        .order_by(Bug.id)
        .all()
    )


@router.get(
    "/{bug_id}",
    response_model=BugResponse
)
def get_bug(
    project_id: int,
    bug_id: int,
    db: Session = Depends(get_db)
):
    bug = (
        db.query(Bug)
        .filter(
            Bug.id == bug_id,
            Bug.project_id == project_id
        )
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found"
        )

    return bug


@router.put(
    "/{bug_id}",
    response_model=BugResponse
)
def update_bug(
    project_id: int,
    bug_id: int,
    bug_data: BugUpdate,
    db: Session = Depends(get_db)
):
    bug = (
        db.query(Bug)
        .filter(
            Bug.id == bug_id,
            Bug.project_id == project_id
        )
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found"
        )

    # Validate stage if supplied
    if bug_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == bug_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    update_data = bug_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(bug, field, value)

    # Update resolved timestamp
    if bug.status.upper() in ["RESOLVED", "CLOSED"]:
        if bug.resolved_at is None:
            bug.resolved_at = datetime.utcnow()
    else:
        bug.resolved_at = None

    db.flush()

    update_stage_progress(
        project_id,
        "TESTING",
        db
    )

    db.commit()
    db.refresh(bug)

    return bug


@router.delete("/{bug_id}")
def delete_bug(
    project_id: int,
    bug_id: int,
    db: Session = Depends(get_db)
):
    bug = (
        db.query(Bug)
        .filter(
            Bug.id == bug_id,
            Bug.project_id == project_id
        )
        .first()
    )

    if not bug:
        raise HTTPException(
            status_code=404,
            detail="Bug not found"
        )

    db.delete(bug)
    db.flush()

    update_stage_progress(
        project_id,
        "TESTING",
        db
    )

    db.commit()

    return {
        "message": "Bug deleted successfully"
    }