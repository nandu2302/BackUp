from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.deployment import Deployment

from schemas.deployment import (
    DeploymentCreate,
    DeploymentUpdate,
    DeploymentResponse
)
from services.stage_progress import update_stage_progress

router = APIRouter(
    prefix="/projects/{project_id}/deployments",
    tags=["Deployment"]
)


@router.post(
    "",
    response_model=DeploymentResponse,
    status_code=201
)
def create_deployment(
    project_id: int,
    deployment_data: DeploymentCreate,
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

    deployment = Deployment(
        project_id=project_id,
        environment=deployment_data.environment,
        status=deployment_data.status,
        version=deployment_data.version,
        deployment_notes=deployment_data.deployment_notes
    )

    db.add(deployment)
    db.flush()
    update_stage_progress(
        project_id,
        "DEPLOYMENT",
        db
    )
    db.commit()
    db.refresh(deployment)

    return deployment


@router.get(
    "",
    response_model=list[DeploymentResponse]
)
def get_deployments(
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
        db.query(Deployment)
        .filter(Deployment.project_id == project_id)
        .order_by(Deployment.id)
        .all()
    )


@router.get(
    "/{deployment_id}",
    response_model=DeploymentResponse
)
def get_deployment(
    project_id: int,
    deployment_id: int,
    db: Session = Depends(get_db)
):
    deployment = (
        db.query(Deployment)
        .filter(
            Deployment.id == deployment_id,
            Deployment.project_id == project_id
        )
        .first()
    )

    if not deployment:
        raise HTTPException(
            status_code=404,
            detail="Deployment not found"
        )

    return deployment


@router.put(
    "/{deployment_id}",
    response_model=DeploymentResponse
)
def update_deployment(
    project_id: int,
    deployment_id: int,
    deployment_data: DeploymentUpdate,
    db: Session = Depends(get_db)
):
    deployment = (
        db.query(Deployment)
        .filter(
            Deployment.id == deployment_id,
            Deployment.project_id == project_id
        )
        .first()
    )

    if not deployment:
        raise HTTPException(
            status_code=404,
            detail="Deployment not found"
        )

    update_data = deployment_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(deployment, field, value)

    db.flush()
    update_stage_progress(
        project_id,
        "DEPLOYMENT",
        db
    )
    db.commit()
    db.refresh(deployment)

    return deployment


@router.delete("/{deployment_id}")
def delete_deployment(
    project_id: int,
    deployment_id: int,
    db: Session = Depends(get_db)
):
    deployment = (
        db.query(Deployment)
        .filter(
            Deployment.id == deployment_id,
            Deployment.project_id == project_id
        )
        .first()
    )

    if not deployment:
        raise HTTPException(
            status_code=404,
            detail="Deployment not found"
        )

    db.delete(deployment)
    db.flush()
    update_stage_progress(
        project_id,
        "DEPLOYMENT",
        db
    )
    db.commit()

    return {
        "message": "Deployment deleted successfully"
    }