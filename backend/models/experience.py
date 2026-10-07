from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Experience(Base):

    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    project_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    stage_id: Mapped[int | None] = mapped_column(
        ForeignKey("project_stages.id", ondelete="SET NULL"),
        nullable=True
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    solution: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    outcome: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    lesson: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="MANUAL"
    )

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )