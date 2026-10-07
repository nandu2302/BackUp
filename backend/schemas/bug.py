from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BugCreate(BaseModel):
    stage_id: int | None = None
    title: str
    description: str | None = None
    severity: str = "MEDIUM"
    status: str = "OPEN"
    solution: str | None = None


class BugUpdate(BaseModel):
    stage_id: int | None = None
    title: str | None = None
    description: str | None = None
    severity: str | None = None
    status: str | None = None
    solution: str | None = None


class BugResponse(BaseModel):
    id: int
    project_id: int
    stage_id: int | None
    title: str
    description: str
    severity: str
    status: str
    solution: str | None
    created_at: datetime
    resolved_at: datetime | None

    model_config = ConfigDict(from_attributes=True)