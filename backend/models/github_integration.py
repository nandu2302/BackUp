from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from database import Base


class GitHubIntegration(Base):
    __tablename__ = "github_integrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    repository_owner: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    repository_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    branch: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="main"
    )

    access_token: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    webhook_secret: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )