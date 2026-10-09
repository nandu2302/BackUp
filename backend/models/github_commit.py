from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from database import Base


class GitHubCommit(Base):
    __tablename__ = "github_commits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    integration_id: Mapped[int] = mapped_column(
        ForeignKey("github_integrations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    commit_sha: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    commit_message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    author_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True
    )

    author_email: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True
    )

    branch: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    commit_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    committed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "project_id",
            "commit_sha",
            name="uq_project_commit_sha"
        ),
    )