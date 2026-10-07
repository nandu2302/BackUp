from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Lesson(Base):

    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    stage_id: Mapped[int | None] = mapped_column(
        ForeignKey("project_stages.id", ondelete="SET NULL"),
        nullable=True
    )

    experience_id: Mapped[int | None] = mapped_column(
        ForeignKey("experiences.id", ondelete="SET NULL"),
        nullable=True
    )

    lesson: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )