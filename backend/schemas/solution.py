from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SolutionCreate(BaseModel):
    experience_id: int | None = None
    problem: str
    solution: str
    result: str | None = None


class SolutionUpdate(BaseModel):
    experience_id: int | None = None
    problem: str | None = None
    solution: str | None = None
    result: str | None = None


class SolutionResponse(BaseModel):
    id: int
    project_id: int
    experience_id: int | None
    problem: str
    solution: str
    result: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)