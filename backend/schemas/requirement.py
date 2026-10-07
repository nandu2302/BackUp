from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RequirementCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "TODO"
    priority: str = "MEDIUM"
    progress: int = 0


class RequirementUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    progress: int | None = None


class RequirementResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    status: str
    priority: str
    progress: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)