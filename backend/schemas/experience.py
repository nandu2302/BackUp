from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ExperienceCreate(BaseModel):
    stage_id: int | None = None
    type: str
    title: str
    description: str
    solution: str | None = None
    outcome: str | None = None
    lesson: str | None = None
    source: str = "MANUAL"
    created_by: int | None = None


class ExperienceUpdate(BaseModel):
    stage_id: int | None = None
    type: str | None = None
    title: str | None = None
    description: str | None = None
    solution: str | None = None
    outcome: str | None = None
    lesson: str | None = None
    source: str | None = None
    created_by: int | None = None


class ExperienceResponse(BaseModel):
    id: int
    project_id: int | None
    project_name: str
    stage_id: int | None
    type: str
    title: str
    description: str
    solution: str | None
    outcome: str | None
    lesson: str | None
    source: str
    created_by: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)