from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.lesson import Lesson
from models.stage import ProjectStage
from models.experience import Experience

from schemas.lesson import (
    LessonCreate,
    LessonUpdate,
    LessonResponse
)


router = APIRouter(
    prefix="/projects/{project_id}/lessons",
    tags=["Hindsight - Lessons"]
)


@router.post(
    "",
    response_model=LessonResponse,
    status_code=201
)
def create_lesson(
    project_id: int,
    lesson_data: LessonCreate,
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

    if lesson_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == lesson_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    if lesson_data.experience_id is not None:
        experience = (
            db.query(Experience)
            .filter(
                Experience.id == lesson_data.experience_id,
                Experience.project_id == project_id
            )
            .first()
        )

        if not experience:
            raise HTTPException(
                status_code=404,
                detail="Experience not found for this project"
            )

    lesson = Lesson(
        project_id=project_id,
        stage_id=lesson_data.stage_id,
        experience_id=lesson_data.experience_id,
        lesson=lesson_data.lesson
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return lesson


@router.get(
    "",
    response_model=list[LessonResponse]
)
def get_lessons(
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
        db.query(Lesson)
        .filter(Lesson.project_id == project_id)
        .order_by(Lesson.id)
        .all()
    )


@router.get(
    "/{lesson_id}",
    response_model=LessonResponse
)
def get_lesson(
    project_id: int,
    lesson_id: int,
    db: Session = Depends(get_db)
):
    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.id == lesson_id,
            Lesson.project_id == project_id
        )
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    return lesson


@router.put(
    "/{lesson_id}",
    response_model=LessonResponse
)
def update_lesson(
    project_id: int,
    lesson_id: int,
    lesson_data: LessonUpdate,
    db: Session = Depends(get_db)
):
    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.id == lesson_id,
            Lesson.project_id == project_id
        )
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    if lesson_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == lesson_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    if lesson_data.experience_id is not None:
        experience = (
            db.query(Experience)
            .filter(
                Experience.id == lesson_data.experience_id,
                Experience.project_id == project_id
            )
            .first()
        )

        if not experience:
            raise HTTPException(
                status_code=404,
                detail="Experience not found for this project"
            )

    update_data = lesson_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(lesson, field, value)

    db.commit()
    db.refresh(lesson)

    return lesson


@router.delete("/{lesson_id}")
def delete_lesson(
    project_id: int,
    lesson_id: int,
    db: Session = Depends(get_db)
):
    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.id == lesson_id,
            Lesson.project_id == project_id
        )
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    db.delete(lesson)
    db.commit()

    return {
        "message": "Lesson deleted successfully"
    }