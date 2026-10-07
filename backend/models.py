from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False)

    role = Column(String(50), nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Project(Base):

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False)

    description = Column(Text)

    domain = Column(String(100))

    status = Column(String(50), default="ACTIVE")

    current_stage = Column(
        String(50),
        default="IDEA"
    )

    progress = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class ProjectMember(Base):

    __tablename__ = "project_members"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False
    )

    joined_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class ProjectStage(Base):

    __tablename__ = "project_stages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False
    )

    stage_type = Column(
        String(50),
        nullable=False
    )

    status = Column(
        String(50),
        default="NOT_STARTED"
    )

    progress = Column(
        Integer,
        default=0
    )

    started_at = Column(DateTime)

    completed_at = Column(DateTime)