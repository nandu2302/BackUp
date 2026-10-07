from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectStageResponse(BaseModel):
    id: int
    project_id: int
    stage_type: str
    status: str
    progress: int
    started_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)