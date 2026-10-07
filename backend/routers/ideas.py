from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.idea import Idea

from schemas.idea import (
    IdeaCreate,
    IdeaUpdate,
    IdeaResponse
)
from services.stage_progress import update_stage_progress


router = APIRouter(
    prefix="/projects/{project_id}/ideas",
    tags=["Ideas"]
)


@router.post(
    "",
    response_model=IdeaResponse,
    status_code=201
)
def create_idea(
    project_id: int,
    idea_data: IdeaCreate,
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

    idea = Idea(
        project_id=project_id,
        idea=idea_data.idea,
        description=idea_data.description,
        status=idea_data.status,
        rejection_reason=idea_data.rejection_reason
    )

    db.add(idea)
    db.flush()
    update_stage_progress(
        project_id,
        "IDEA",
        db
    )
    db.commit()
    db.refresh(idea)

    return idea


@router.get(
    "",
    response_model=list[IdeaResponse]
)
def get_ideas(
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
        db.query(Idea)
        .filter(Idea.project_id == project_id)
        .order_by(Idea.id)
        .all()
    )


@router.get(
    "/{idea_id}",
    response_model=IdeaResponse
)
def get_idea(
    project_id: int,
    idea_id: int,
    db: Session = Depends(get_db)
):

    idea = (
        db.query(Idea)
        .filter(
            Idea.id == idea_id,
            Idea.project_id == project_id
        )
        .first()
    )

    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Idea not found"
        )

    return idea


@router.put(
    "/{idea_id}",
    response_model=IdeaResponse
)
def update_idea(
    project_id: int,
    idea_id: int,
    idea_data: IdeaUpdate,
    db: Session = Depends(get_db)
):

    idea = (
        db.query(Idea)
        .filter(
            Idea.id == idea_id,
            Idea.project_id == project_id
        )
        .first()
    )

    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Idea not found"
        )

    update_data = idea_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(idea, field, value)

    db.flush()
    update_stage_progress(
        project_id, 
        "IDEA",
        db
    )
    db.commit()
    db.refresh(idea)

    return idea


@router.delete("/{idea_id}")
def delete_idea(
    project_id: int,
    idea_id: int,
    db: Session = Depends(get_db)
):

    idea = (
        db.query(Idea)
        .filter(
            Idea.id == idea_id,
            Idea.project_id == project_id
        )
        .first()
    )

    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Idea not found"
        )

    db.delete(idea)
    db.flush()
    update_stage_progress(
        project_id,
        "IDEA",
        db
    )
    db.commit()

    return {
        "message": "Idea deleted successfully"
    }