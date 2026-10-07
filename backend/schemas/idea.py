from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IdeaCreate(BaseModel):

    idea: str
    description: str | None = None
    status: str = "PROPOSED"
    rejection_reason: str | None = None


class IdeaUpdate(BaseModel):

    idea: str | None = None
    description: str | None = None
    status: str | None = None
    rejection_reason: str | None = None


class IdeaResponse(BaseModel):

    id: int
    project_id: int
    idea: str
    description: str | None
    status: str
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )