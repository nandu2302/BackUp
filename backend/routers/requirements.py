from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.requirement import Requirement
from schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
    RequirementResponse
)
from services.stage_progress import update_stage_progress

router = APIRouter(
    prefix="/projects/{project_id}/requirements",
    tags=["Requirements"]
)


@router.post("", response_model=RequirementResponse, status_code=201)
def create_requirement(
    project_id: int,
    requirement_data: RequirementCreate,
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

    requirement = Requirement(
        project_id=project_id,
        title=requirement_data.title,
        description=requirement_data.description,
        status=requirement_data.status,
        priority=requirement_data.priority,
        progress=requirement_data.progress
    )

    db.add(requirement)
    db.flush()
    update_stage_progress(
        project_id,
        "REQUIREMENTS",
        db
    )
    db.commit()
    db.refresh(requirement)

    return requirement


@router.get("", response_model=list[RequirementResponse])
def get_requirements(
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
        db.query(Requirement)
        .filter(Requirement.project_id == project_id)
        .order_by(Requirement.id)
        .all()
    )


@router.get("/{requirement_id}", response_model=RequirementResponse)
def get_requirement(
    project_id: int,
    requirement_id: int,
    db: Session = Depends(get_db)
):
    requirement = (
        db.query(Requirement)
        .filter(
            Requirement.id == requirement_id,
            Requirement.project_id == project_id
        )
        .first()
    )

    if not requirement:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found"
        )

    return requirement


@router.put("/{requirement_id}", response_model=RequirementResponse)
def update_requirement(
    project_id: int,
    requirement_id: int,
    requirement_data: RequirementUpdate,
    db: Session = Depends(get_db)
):
    requirement = (
        db.query(Requirement)
        .filter(
            Requirement.id == requirement_id,
            Requirement.project_id == project_id
        )
        .first()
    )

    if not requirement:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found"
        )

    update_data = requirement_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(requirement, field, value)

    db.flush()
    update_stage_progress(
        project_id,
        "REQUIREMENTS",
        db
    )

    db.commit()
    db.refresh(requirement)

    return requirement


@router.delete("/{requirement_id}")
def delete_requirement(
    project_id: int,
    requirement_id: int,
    db: Session = Depends(get_db)
):
    requirement = (
        db.query(Requirement)
        .filter(
            Requirement.id == requirement_id,
            Requirement.project_id == project_id
        )
        .first()
    )

    if not requirement:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found"
        )

    db.delete(requirement)
    db.flush()
    update_stage_progress(
        project_id,
        "REQUIREMENTS",
        db
    )
    db.commit()

    return {
        "message": "Requirement deleted successfully"
    }