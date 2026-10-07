from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class TestRecord(Base):

    __tablename__ = "test_records"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    test_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    test_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    result: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    bug_id: Mapped[int | None] = mapped_column(
        ForeignKey("bugs.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )