from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.architecture import Architecture
from schemas.architecture import (
    ArchitectureCreate,
    ArchitectureUpdate,
    ArchitectureResponse
)
from services.stage_progress import update_stage_progress


router = APIRouter(
    prefix="/projects/{project_id}/architectures",
    tags=["Architecture"]
)


@router.post(
    "",
    response_model=ArchitectureResponse,
    status_code=201
)
def create_architecture(
    project_id: int,
    architecture_data: ArchitectureCreate,
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

    architecture = Architecture(
        project_id=project_id,
        title=architecture_data.title,
        description=architecture_data.description,
        technology_stack=architecture_data.technology_stack,
        diagram=architecture_data.diagram,
        diagram_image_url=architecture_data.diagram_image_url
    )

    db.add(architecture)
    db.flush()
    update_stage_progress(
        project_id,
        "ARCHITECTURE",
        db
    )
    db.commit()
    db.refresh(architecture)

    return architecture


@router.get(
    "",
    response_model=list[ArchitectureResponse]
)
def get_architectures(
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
        db.query(Architecture)
        .filter(Architecture.project_id == project_id)
        .order_by(Architecture.id)
        .all()
    )


@router.get(
    "/{architecture_id}",
    response_model=ArchitectureResponse
)
def get_architecture(
    project_id: int,
    architecture_id: int,
    db: Session = Depends(get_db)
):
    architecture = (
        db.query(Architecture)
        .filter(
            Architecture.id == architecture_id,
            Architecture.project_id == project_id
        )
        .first()
    )

    if not architecture:
        raise HTTPException(
            status_code=404,
            detail="Architecture not found"
        )

    return architecture


@router.put(
    "/{architecture_id}",
    response_model=ArchitectureResponse
)
def update_architecture(
    project_id: int,
    architecture_id: int,
    architecture_data: ArchitectureUpdate,
    db: Session = Depends(get_db)
):
    architecture = (
        db.query(Architecture)
        .filter(
            Architecture.id == architecture_id,
            Architecture.project_id == project_id
        )
        .first()
    )

    if not architecture:
        raise HTTPException(
            status_code=404,
            detail="Architecture not found"
        )

    update_data = architecture_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(architecture, field, value)

    db.flush()
    update_stage_progress(
    project_id,
    "ARCHITECTURE",
    db
    )
    db.commit()
    db.refresh(architecture)

    return architecture


@router.delete("/{architecture_id}")
def delete_architecture(
    project_id: int,
    architecture_id: int,
    db: Session = Depends(get_db)
):
    architecture = (
        db.query(Architecture)
        .filter(
            Architecture.id == architecture_id,
            Architecture.project_id == project_id
        )
        .first()
    )

    if not architecture:
        raise HTTPException(
            status_code=404,
            detail="Architecture not found"
        )

    db.delete(architecture)
    db.flush()
    update_stage_progress(
        project_id,
        "ARCHITECTURE",
        db
    )
    db.commit()

    return {
        "message": "Architecture deleted successfully"
    }