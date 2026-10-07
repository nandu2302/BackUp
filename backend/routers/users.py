from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post(
    "",
    response_model=UserResponse,
    status_code=201
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail="User with this email already exists"
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get(
    "",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db)
):

    return (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )