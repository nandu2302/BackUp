from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.decision import Decision
from models.stage import ProjectStage
from schemas.decision import (
    DecisionCreate,
    DecisionUpdate,
    DecisionResponse
)


router = APIRouter(
    prefix="/projects/{project_id}/decisions",
    tags=["Decisions"]
)


@router.post(
    "",
    response_model=DecisionResponse,
    status_code=201
)
def create_decision(
    project_id: int,
    decision_data: DecisionCreate,
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

    if decision_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == decision_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    decision = Decision(
        project_id=project_id,
        stage_id=decision_data.stage_id,
        title=decision_data.title,
        decision=decision_data.decision,
        reason=decision_data.reason,
        status=decision_data.status,
        created_by=decision_data.created_by
    )

    db.add(decision)
    db.commit()
    db.refresh(decision)

    return decision


@router.get(
    "",
    response_model=list[DecisionResponse]
)
def get_decisions(
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
        db.query(Decision)
        .filter(Decision.project_id == project_id)
        .order_by(Decision.id)
        .all()
    )


@router.get(
    "/{decision_id}",
    response_model=DecisionResponse
)
def get_decision(
    project_id: int,
    decision_id: int,
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(
            Decision.id == decision_id,
            Decision.project_id == project_id
        )
        .first()
    )

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    return decision


@router.put(
    "/{decision_id}",
    response_model=DecisionResponse
)
def update_decision(
    project_id: int,
    decision_id: int,
    decision_data: DecisionUpdate,
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(
            Decision.id == decision_id,
            Decision.project_id == project_id
        )
        .first()
    )

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    if decision_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == decision_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    update_data = decision_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(decision, field, value)

    db.commit()
    db.refresh(decision)

    return decision


@router.delete("/{decision_id}")
def delete_decision(
    project_id: int,
    decision_id: int,
    db: Session = Depends(get_db)
):
    decision = (
        db.query(Decision)
        .filter(
            Decision.id == decision_id,
            Decision.project_id == project_id
        )
        .first()
    )

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    db.delete(decision)
    db.commit()

    return {
        "message": "Decision deleted successfully"
    }