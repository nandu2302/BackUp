from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.milestone import Milestone

from schemas.milestone import (
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse
)


router = APIRouter(
    prefix="/projects/{project_id}/milestones",
    tags=["Milestones"]
)


@router.post(
    "",
    response_model=MilestoneResponse,
    status_code=201
)
def create_milestone(
    project_id: int,
    milestone_data: MilestoneCreate,
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

    milestone = Milestone(
        project_id=project_id,
        title=milestone_data.title,
        description=milestone_data.description,
        status=milestone_data.status,
        target_date=milestone_data.target_date
    )

    if milestone_data.status.upper() == "COMPLETED":
        milestone.completed_at = datetime.utcnow()

    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    return milestone


@router.get(
    "",
    response_model=list[MilestoneResponse]
)
def get_milestones(
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

    return (
        db.query(Milestone)
        .filter(Milestone.project_id == project_id)
        .order_by(Milestone.id)
        .all()
    )


@router.get(
    "/{milestone_id}",
    response_model=MilestoneResponse
)
def get_milestone(
    project_id: int,
    milestone_id: int,
    db: Session = Depends(get_db)
):
    milestone = (
        db.query(Milestone)
        .filter(
            Milestone.id == milestone_id,
            Milestone.project_id == project_id
        )
        .first()
    )

    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    return milestone


@router.put(
    "/{milestone_id}",
    response_model=MilestoneResponse
)
def update_milestone(
    project_id: int,
    milestone_id: int,
    milestone_data: MilestoneUpdate,
    db: Session = Depends(get_db)
):
    milestone = (
        db.query(Milestone)
        .filter(
            Milestone.id == milestone_id,
            Milestone.project_id == project_id
        )
        .first()
    )

    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    update_data = milestone_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(milestone, field, value)

    if (
        milestone_data.status is not None
        and milestone_data.status.upper() == "COMPLETED"
        and milestone.completed_at is None
    ):
        milestone.completed_at = datetime.utcnow()

    elif (
        milestone_data.status is not None
        and milestone_data.status.upper() != "COMPLETED"
    ):
        milestone.completed_at = None

    db.commit()
    db.refresh(milestone)

    return milestone


@router.delete("/{milestone_id}")
def delete_milestone(
    project_id: int,
    milestone_id: int,
    db: Session = Depends(get_db)
):
    milestone = (
        db.query(Milestone)
        .filter(
            Milestone.id == milestone_id,
            Milestone.project_id == project_id
        )
        .first()
    )

    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    db.delete(milestone)
    db.commit()

    return {
        "message": "Milestone deleted successfully"
    }