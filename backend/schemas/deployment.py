from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DeploymentCreate(BaseModel):
    environment: str
    status: str
    version: str | None = None
    deployment_notes: str | None = None


class DeploymentUpdate(BaseModel):
    environment: str | None = None
    status: str | None = None
    version: str | None = None
    deployment_notes: str | None = None


class DeploymentResponse(BaseModel):
    id: int
    project_id: int
    environment: str
    status: str
    version: str | None
    deployment_notes: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)