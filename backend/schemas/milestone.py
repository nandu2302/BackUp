from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MilestoneCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "PENDING"
    target_date: datetime | None = None


class MilestoneUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    target_date: datetime | None = None


class MilestoneResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    status: str
    target_date: datetime | None
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)