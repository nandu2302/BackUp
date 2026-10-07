from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.project_member import ProjectMember
from models.user import User

from schemas.project_member import (
    ProjectMemberCreate,
    ProjectMemberResponse
)


router = APIRouter(
    prefix="/projects",
    tags=["Project Members"]
)


@router.post(
    "/{project_id}/members",
    response_model=ProjectMemberResponse,
    status_code=201
)
def add_project_member(
    project_id: int,
    member_data: ProjectMemberCreate,
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

    user = (
        db.query(User)
        .filter(User.id == member_data.user_id)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == member_data.user_id
        )
        .first()
    )

    if existing_member:

        raise HTTPException(
            status_code=409,
            detail="User is already a project member"
        )

    member = ProjectMember(
        project_id=project_id,
        user_id=member_data.user_id,
        role=member_data.role
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return member


@router.get(
    "/{project_id}/members"
)
def get_project_members(
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
        db.query(
            ProjectMember,
            User
        )
        .join(
            User,
            ProjectMember.user_id == User.id
        )
        .filter(
            ProjectMember.project_id == project_id
        )
        .all()
    )

    return [
        {
            "id": member.id,
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": member.role
        }
        for member, user in members
    ]