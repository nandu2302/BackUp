from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.solution import Solution
from models.experience import Experience

from schemas.solution import (
    SolutionCreate,
    SolutionUpdate,
    SolutionResponse
)


router = APIRouter(
    prefix="/projects/{project_id}/solutions",
    tags=["Testing - Solutions"]
)


@router.post(
    "",
    response_model=SolutionResponse,
    status_code=201
)
def create_solution(
    project_id: int,
    solution_data: SolutionCreate,
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

    if solution_data.experience_id is not None:
        experience = (
            db.query(Experience)
            .filter(
                Experience.id == solution_data.experience_id,
                Experience.project_id == project_id
            )
            .first()
        )

        if not experience:
            raise HTTPException(
                status_code=404,
                detail="Experience not found for this project"
            )

    solution = Solution(
        project_id=project_id,
        experience_id=solution_data.experience_id,
        problem=solution_data.problem,
        solution=solution_data.solution,
        result=solution_data.result
    )

    db.add(solution)
    db.commit()
    db.refresh(solution)

    return solution


@router.get(
    "",
    response_model=list[SolutionResponse]
)
def get_solutions(
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
        db.query(Solution)
        .filter(Solution.project_id == project_id)
        .order_by(Solution.id)
        .all()
    )


@router.get(
    "/{solution_id}",
    response_model=SolutionResponse
)
def get_solution(
    project_id: int,
    solution_id: int,
    db: Session = Depends(get_db)
):
    solution = (
        db.query(Solution)
        .filter(
            Solution.id == solution_id,
            Solution.project_id == project_id
        )
        .first()
    )

    if not solution:
        raise HTTPException(
            status_code=404,
            detail="Solution not found"
        )

    return solution


@router.put(
    "/{solution_id}",
    response_model=SolutionResponse
)
def update_solution(
    project_id: int,
    solution_id: int,
    solution_data: SolutionUpdate,
    db: Session = Depends(get_db)
):
    solution = (
        db.query(Solution)
        .filter(
            Solution.id == solution_id,
            Solution.project_id == project_id
        )
        .first()
    )

    if not solution:
        raise HTTPException(
            status_code=404,
            detail="Solution not found"
        )

    if solution_data.experience_id is not None:
        experience = (
            db.query(Experience)
            .filter(
                Experience.id == solution_data.experience_id,
                Experience.project_id == project_id
            )
            .first()
        )

        if not experience:
            raise HTTPException(
                status_code=404,
                detail="Experience not found for this project"
            )

    update_data = solution_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(solution, field, value)

    db.commit()
    db.refresh(solution)

    return solution


@router.delete("/{solution_id}")
def delete_solution(
    project_id: int,
    solution_id: int,
    db: Session = Depends(get_db)
):
    solution = (
        db.query(Solution)
        .filter(
            Solution.id == solution_id,
            Solution.project_id == project_id
        )
        .first()
    )

    if not solution:
        raise HTTPException(
            status_code=404,
            detail="Solution not found"
        )

    db.delete(solution)
    db.commit()

    return {
        "message": "Solution deleted successfully"
    }