from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DecisionCreate(BaseModel):
    stage_id: int | None = None
    title: str
    decision: str
    reason: str | None = None
    status: str = "PENDING"
    created_by: int | None = None


class DecisionUpdate(BaseModel):
    stage_id: int | None = None
    title: str | None = None
    decision: str | None = None
    reason: str | None = None
    status: str | None = None
    created_by: int | None = None


class DecisionResponse(BaseModel):
    id: int
    project_id: int
    stage_id: int | None
    title: str
    decision: str
    reason: str | None
    status: str
    created_by: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)