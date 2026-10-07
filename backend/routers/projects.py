from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from models.stage import ProjectStage

from database import get_db
from models.project import Project
from schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse
)

from models.project_member import ProjectMember
from models.requirement import Requirement
from models.architecture import Architecture
from models.task import Task
from models.decision import Decision
from models.experience import Experience
from models.bug import Bug
from models.test_record import TestRecord
from models.solution import Solution
from models.lesson import Lesson
from models.deployment import Deployment
from models.milestone import Milestone

from schemas.workspace import ProjectWorkspaceResponse
from services.project_progress import update_project_progress


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


def create_default_stages(
    project_id: int,
    db: Session
):
    stage_names = [
        "IDEA",
        "REQUIREMENTS",
        "ARCHITECTURE",
        "DEVELOPMENT",
        "TESTING",
        "DEPLOYMENT",
    ]

    for index, stage_name in enumerate(stage_names):

        stage = ProjectStage(
            project_id=project_id,
            stage_type=stage_name,
            status=(
                "IN_PROGRESS"
                if index == 0
                else "NOT_STARTED"
            ),
            progress=0
        )

        db.add(stage)

@router.post(
    "",
    response_model=ProjectResponse,
    status_code=201
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
):

    project = Project(
        name=project_data.name,
        description=project_data.description,
        domain=project_data.domain,
        status="ACTIVE",
        current_stage="IDEA",
        progress=0
    )

    db.add(project)

    db.flush()

    create_default_stages(
        project.id,
        db
    )

    db.commit()
    db.refresh(project)

    return project


# @router.post(
#     "",
#     response_model=ProjectResponse,
#     status_code=201
# )
# def create_project(
#     project_data: ProjectCreate,
#     db: Session = Depends(get_db)
# ):

#     project = Project(
#         name=project_data.name,
#         description=project_data.description,
#         domain=project_data.domain,
#         status="ACTIVE",
#         current_stage="IDEA",
#         progress=0
#     )

#     db.add(project)
#     db.flush()

#     stage_names = [
#         "IDEA",
#         "REQUIREMENTS",
#         "ARCHITECTURE",
#         "DEVELOPMENT",
#         "TESTING",
#         "DEPLOYMENT",
#         "HINDSIGHT"
#     ]

#     for index, stage_name in enumerate(stage_names):

#         stage = ProjectStage(
#             project_id=project.id,
#             stage_type=stage_name,
#             status=(
#                 "IN_PROGRESS"
#                 if index == 0
#                 else "NOT_STARTED"
#             ),
#             progress=0
#         )

#         db.add(stage)

#     db.commit()
#     db.refresh(project)

#     return project

# @router.post(
#     "",
#     response_model=ProjectResponse,
#     status_code=201
# )
# def create_project(
#     project_data: ProjectCreate,
#     db: Session = Depends(get_db)
# ):

#     project = Project(
#         name=project_data.name,
#         description=project_data.description,
#         domain=project_data.domain,
#         status="ACTIVE",
#         current_stage="IDEA",
#         progress=0
#     )

#     db.add(project)
#     db.commit()
#     db.refresh(project)

#     return project


@router.get(
    "",
    response_model=list[ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db)
):

    return (
        db.query(Project)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse
)
def get_project(
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

    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse
)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
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

    update_data = project_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        setattr(
            project,
            field,
            value
        )

    db.commit()
    db.refresh(project)

    return project



@router.post(
    "/{project_id}/archive",
    response_model=ProjectResponse
)
def archive_project(
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

    if project.status == "ARCHIVED":
        return project

    project.status = "ARCHIVED"

    db.commit()
    db.refresh(project)

    return project


@router.delete(
    "/{project_id}"
)
def delete_project(
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

    project_name = project.name

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted. Historical experiences preserved.",
        "project_name": project_name
    }


# @router.delete(
#     "/{project_id}",
#     status_code=204
# )
# def delete_project(
#     project_id: int,
#     db: Session = Depends(get_db)
# ):

#     project = (
#         db.query(Project)
#         .filter(Project.id == project_id)
#         .first()
#     )

#     if not project:

#         raise HTTPException(
#             status_code=404,
#             detail="Project not found"
#         )

#     db.delete(project)
#     db.commit()

#     return None


@router.get(
    "/{project_id}/stages"
)
def get_project_stages(
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

    stages = (
        db.query(ProjectStage)
        .filter(
            ProjectStage.project_id == project_id
        )
        .order_by(ProjectStage.id)
        .all()
    )

    return stages


@router.post(
    "/{project_id}/initialize-stages"
)
def initialize_project_stages(
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

    existing_stages = (
        db.query(ProjectStage)
        .filter(
            ProjectStage.project_id == project_id
        )
        .count()
    )

    if existing_stages > 0:

        return {
            "message": "Project stages already exist",
            "count": existing_stages
        }

    create_default_stages(
        project_id,
        db
    )

    db.commit()

    return {
        "message": "Project stages initialized",
        "count": 7
    }


@router.get(
    "/{project_id}/workspace",
    response_model=ProjectWorkspaceResponse
)
def get_project_workspace(
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

    members = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id)
        .all()
    )

    stages = (
        db.query(ProjectStage)
        .filter(ProjectStage.project_id == project_id)
        .order_by(ProjectStage.id)
        .all()
    )

    requirements = (
        db.query(Requirement)
        .filter(Requirement.project_id == project_id)
        .order_by(Requirement.id)
        .all()
    )

    architectures = (
        db.query(Architecture)
        .filter(Architecture.project_id == project_id)
        .order_by(Architecture.id)
        .all()
    )

    tasks = (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.id)
        .all()
    )

    decisions = (
        db.query(Decision)
        .filter(Decision.project_id == project_id)
        .order_by(Decision.id)
        .all()
    )

    experiences = (
        db.query(Experience)
        .filter(Experience.project_id == project_id)
        .order_by(Experience.id)
        .all()
    )

    bugs = (
        db.query(Bug)
        .filter(Bug.project_id == project_id)
        .order_by(Bug.id)
        .all()
    )

    tests = (
        db.query(TestRecord)
        .filter(TestRecord.project_id == project_id)
        .order_by(TestRecord.id)
        .all()
    )

    solutions = (
        db.query(Solution)
        .filter(Solution.project_id == project_id)
        .order_by(Solution.id)
        .all()
    )

    lessons = (
        db.query(Lesson)
        .filter(Lesson.project_id == project_id)
        .order_by(Lesson.id)
        .all()
    )

    deployments = (
        db.query(Deployment)
        .filter(Deployment.project_id == project_id)
        .order_by(Deployment.id)
        .all()
    )

    milestones = (
        db.query(Milestone)
        .filter(Milestone.project_id == project_id)
        .order_by(Milestone.id)
        .all()
    )

    return {
        "project": project,
        "members": members,
        "stages": stages,
        "requirements": requirements,
        "architectures": architectures,
        "tasks": tasks,
        "decisions": decisions,
        "experiences": experiences,
        "bugs": bugs,
        "tests": tests,
        "solutions": solutions,
        "lessons": lessons,
        "deployments": deployments,
        "milestones": milestones
    }


@router.post("/{project_id}/sync-progress")
def sync_project_progress(
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

    update_project_progress(project_id, db)

    db.commit()
    db.refresh(project)

    return {
        "project_id": project.id,
        "current_stage": project.current_stage,
        "progress": project.progress
    }