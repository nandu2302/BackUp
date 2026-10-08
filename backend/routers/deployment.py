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
from hindsight_service import store_experience


router = APIRouter(
    prefix="/projects/{project_id}/deployments",
    tags=["Deployment"]
)


# ============================================================
# CREATE DEPLOYMENT
# ============================================================

@router.post(
    "",
    response_model=DeploymentResponse,
    status_code=201
)
async def create_deployment(
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

    # --------------------------------------------------------
    # Store deployment experience in Hindsight
    # --------------------------------------------------------

    try:
        await store_experience(
            project_name=project.name,
            experience_type="Deployment",
            title=(
                f"{deployment.environment} deployment "
                f"{deployment.status}"
            ),
            description=(
                f"A deployment was recorded for the project.\n\n"
                f"Environment: {deployment.environment}\n"
                f"Status: {deployment.status}\n"
                f"Version: {deployment.version or 'Not specified'}\n"
                f"Notes: "
                f"{deployment.deployment_notes or 'No deployment notes provided.'}"
            ),
            solution=(
                deployment.deployment_notes
                or "No specific solution recorded."
            ),
            lesson=(
                "Record deployment environment, outcome, version, "
                "and deployment configuration so future projects "
                "can learn from previous deployment outcomes."
            )
        )
    except Exception as hindsight_error:
        # Hindsight failure must not break deployment creation.
        print(
            "Hindsight deployment capture failed:",
            hindsight_error
        )

    return deployment


# ============================================================
# GET ALL DEPLOYMENTS
# ============================================================

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
        .filter(
            Deployment.project_id == project_id
        )
        .order_by(Deployment.id)
        .all()
    )


# ============================================================
# GET SINGLE DEPLOYMENT
# ============================================================

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


# ============================================================
# UPDATE DEPLOYMENT
# ============================================================

@router.put(
    "/{deployment_id}",
    response_model=DeploymentResponse
)
async def update_deployment(
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
        setattr(
            deployment,
            field,
            value
        )

    db.flush()

    update_stage_progress(
        project_id,
        "DEPLOYMENT",
        db
    )

    db.commit()
    db.refresh(deployment)

    # --------------------------------------------------------
    # Store updated deployment experience in Hindsight
    # --------------------------------------------------------

    try:
        project = (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if project:
            await store_experience(
                project_name=project.name,
                experience_type="Deployment",
                title=(
                    f"{deployment.environment} deployment "
                    f"updated to {deployment.status}"
                ),
                description=(
                    f"A deployment outcome was updated.\n\n"
                    f"Environment: {deployment.environment}\n"
                    f"Status: {deployment.status}\n"
                    f"Version: {deployment.version or 'Not specified'}\n"
                    f"Notes: "
                    f"{deployment.deployment_notes or 'No deployment notes provided.'}"
                ),
                solution=(
                    deployment.deployment_notes
                    or "No specific solution recorded."
                ),
                lesson=(
                    "Review deployment configuration and environment "
                    "settings when deployment outcomes change."
                )
            )

    except Exception as hindsight_error:
        print(
            "Hindsight deployment update capture failed:",
            hindsight_error
        )

    return deployment


# ============================================================
# DELETE DEPLOYMENT
# ============================================================

@router.delete(
    "/{deployment_id}"
)
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