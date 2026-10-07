from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Solution(Base):

    __tablename__ = "solutions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    experience_id: Mapped[int | None] = mapped_column(
        ForeignKey("experiences.id", ondelete="SET NULL"),
        nullable=True
    )

    problem: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    solution: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    result: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )