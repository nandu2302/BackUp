from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Decision(Base):

    __tablename__ = "decisions"

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

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    decision: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="PENDING"
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