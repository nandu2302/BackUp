from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.task import Task
from schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)
from services.stage_progress import update_stage_progress




router = APIRouter(
    prefix="/projects/{project_id}/tasks",
    tags=["Development"]
)


@router.post(
    "",
    response_model=TaskResponse,
    status_code=201
)
def create_task(
    project_id: int,
    task_data: TaskCreate,
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

    task = Task(
        project_id=project_id,
        title=task_data.title,
        description=task_data.description,
        assigned_to=task_data.assigned_to,
        status=task_data.status,
        priority=task_data.priority
    )

    db.add(task)
    db.flush()
    update_stage_progress(
        project_id,
        "DEVELOPMENT",
        db
    )
    db.commit()
    db.refresh(task)

    return task


@router.get(
    "",
    response_model=list[TaskResponse]
)
def get_tasks(
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
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.id)
        .all()
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse
)
def get_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.project_id == project_id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse
)
def update_task(
    project_id: int,
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.project_id == project_id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    update_data = task_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(task, field, value)

    db.flush()
    update_stage_progress(
        project_id,
        "DEVELOPMENT",
        db
    )
    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}")
def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.project_id == project_id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.flush()  # Ensure the task is deleted before updating stage progress
    update_stage_progress(
        project_id,
        "DEVELOPMENT",
        db
    )
    db.commit()

    return {
        "message": "Task deleted successfully"
    }