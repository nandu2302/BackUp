from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LessonCreate(BaseModel):
    stage_id: int | None = None
    experience_id: int | None = None
    lesson: str


class LessonUpdate(BaseModel):
    stage_id: int | None = None
    experience_id: int | None = None
    lesson: str | None = None


class LessonResponse(BaseModel):
    id: int
    project_id: int
    stage_id: int | None
    experience_id: int | None
    lesson: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)