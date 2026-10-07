from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.experience import Experience
from models.stage import ProjectStage
from schemas.experience import (
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse
)
# from services.stage_progress import update_stage_progress
from hindsight_service import store_experience


router = APIRouter(
    prefix="/projects/{project_id}/experiences",
    tags=["Experiences"]
)


@router.post(
    "",
    response_model=ExperienceResponse,
    status_code=201
)
def create_experience(
    project_id: int,
    experience_data: ExperienceCreate,
    db: Session = Depends(get_db)
):
    # Check project
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

    # Validate stage if supplied
    if experience_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == experience_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    # Store in PostgreSQL
    experience = Experience(
        project_id=project_id,
        project_name=project.name,
        stage_id=experience_data.stage_id,
        type=experience_data.type,
        title=experience_data.title,
        description=experience_data.description,
        solution=experience_data.solution,
        outcome=experience_data.outcome,
        lesson=experience_data.lesson,
        source=experience_data.source,
        created_by=experience_data.created_by
    )

    db.add(experience)
    db.flush()
    # if experience_data.type.upper()=="HINDSIGHT":
    #     update_stage_progress(
    #         project_id,
    #         "HINDSIGHT",
    #         db
    #     )
    db.commit()
    db.refresh(experience)

    # Store the experience in Hindsight
    try:
        store_experience(
            project_name=project.name,
            experience_type=experience_data.type,
            title=experience_data.title,
            description=experience_data.description,
            solution=experience_data.solution or "",
            lesson=experience_data.lesson or ""
        )
    except Exception as e:
        # PostgreSQL record remains available even if
        # Hindsight temporarily fails.
        print("Hindsight storage failed:", e)

    return experience


@router.get(
    "",
    response_model=list[ExperienceResponse]
)
def get_experiences(
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
        db.query(Experience)
        .filter(Experience.project_id == project_id)
        .order_by(Experience.id)
        .all()
    )


@router.get(
    "/{experience_id}",
    response_model=ExperienceResponse
)
def get_experience(
    project_id: int,
    experience_id: int,
    db: Session = Depends(get_db)
):
    experience = (
        db.query(Experience)
        .filter(
            Experience.id == experience_id,
            Experience.project_id == project_id
        )
        .first()
    )

    if not experience:
        raise HTTPException(
            status_code=404,
            detail="Experience not found"
        )

    return experience


@router.put(
    "/{experience_id}",
    response_model=ExperienceResponse
)
def update_experience(
    project_id: int,
    experience_id: int,
    experience_data: ExperienceUpdate,
    db: Session = Depends(get_db)
):
    experience = (
        db.query(Experience)
        .filter(
            Experience.id == experience_id,
            Experience.project_id == project_id
        )
        .first()
    )

    if not experience:
        raise HTTPException(
            status_code=404,
            detail="Experience not found"
        )

    if experience_data.stage_id is not None:
        stage = (
            db.query(ProjectStage)
            .filter(
                ProjectStage.id == experience_data.stage_id,
                ProjectStage.project_id == project_id
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Stage not found for this project"
            )

    # Remember the old type
    old_type = experience.type.upper()

    update_data = experience_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(experience, field, value)

    # Make sure the updated experience is visible to the query
    db.flush()

    # Update Hindsight progress if the type changed
    # new_type = experience.type.upper()

    # if old_type == "HINDSIGHT" or new_type == "HINDSIGHT":
    #     update_stage_progress(
    #         project_id,
    #         "HINDSIGHT",
    #         db
    #     )

    db.commit()
    db.refresh(experience)

    return experience


# @router.put(
#     "/{experience_id}",
#     response_model=ExperienceResponse
# )
# def update_experience(
#     project_id: int,
#     experience_id: int,
#     experience_data: ExperienceUpdate,
#     db: Session = Depends(get_db)
# ):
#     experience = (
#         db.query(Experience)
#         .filter(
#             Experience.id == experience_id,
#             Experience.project_id == project_id
#         )
#         .first()
#     )

#     if not experience:
#         raise HTTPException(
#             status_code=404,
#             detail="Experience not found"
#         )

#     if experience_data.stage_id is not None:
#         stage = (
#             db.query(ProjectStage)
#             .filter(
#                 ProjectStage.id == experience_data.stage_id,
#                 ProjectStage.project_id == project_id
#             )
#             .first()
#         )

#         if not stage:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Stage not found for this project"
#             )

#     update_data = experience_data.model_dump(
#         exclude_unset=True
#     )

#     for field, value in update_data.items():
#         setattr(experience, field, value)

#     db.commit()
#     db.refresh(experience)

#     return experience

@router.delete("/{experience_id}")
def delete_experience(
    project_id: int,
    experience_id: int,
    db: Session = Depends(get_db)
):
    experience = (
        db.query(Experience)
        .filter(
            Experience.id == experience_id,
            Experience.project_id == project_id
        )
        .first()
    )

    if not experience:
        raise HTTPException(
            status_code=404,
            detail="Experience not found"
        )

    # Check before deleting
    # was_hindsight = experience.type.upper() == "HINDSIGHT"

    db.delete(experience)
    # db.flush()

    # Recalculate Hindsight progress
    # if was_hindsight:
    #     update_stage_progress(
    #         project_id,
    #         "HINDSIGHT",
    #         db
    #     )

    db.commit()

    return {
        "message": "Experience deleted successfully"
    }
# @router.delete("/{experience_id}")
# def delete_experience(
#     project_id: int,
#     experience_id: int,
#     db: Session = Depends(get_db)
# ):
#     experience = (
#         db.query(Experience)
#         .filter(
#             Experience.id == experience_id,
#             Experience.project_id == project_id
#         )
#         .first()
#     )

#     if not experience:
#         raise HTTPException(
#             status_code=404,
#             detail="Experience not found"
#         )

#     db.delete(experience)
#     db.flush()
#     if was_hindsight:
#         update_stage_progress(
#             project_id,
#             "HINDSIGHT",
#             db
#     )
#     db.commit()

#     return {
#         "message": "Experience deleted successfully"
#     }