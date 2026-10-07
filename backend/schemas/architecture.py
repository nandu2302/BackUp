from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ArchitectureCreate(BaseModel):
    title: str
    description: str | None = None
    technology_stack: str | None = None
    diagram: str | None = None
    diagram_image_url: str | None = None


class ArchitectureUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    technology_stack: str | None = None
    diagram: str | None = None
    diagram_image_url: str | None = None


class ArchitectureResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    technology_stack: str | None
    diagram: str | None
    diagram_image_url: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)