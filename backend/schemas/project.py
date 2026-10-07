from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):

    name: str
    description: str | None = None
    domain: str | None = None
    team_size: int | None = None
    technology: str | None = None


class ProjectUpdate(BaseModel):

    name: str | None = None
    description: str | None = None
    domain: str | None = None
    status: str | None = None
    current_stage: str | None = None
    progress: int | None = None
    team_size: int | None = None
    technology: str | None = None


class ProjectResponse(BaseModel):

    id: int
    name: str
    description: str | None
    domain: str | None
    status: str
    current_stage: str
    progress: int
    created_at: datetime
    updated_at: datetime
    team_size: int | None
    technology: str | None

    model_config = ConfigDict(
        from_attributes=True
    )