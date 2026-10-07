from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TestRecordCreate(BaseModel):
    test_type: str
    test_name: str
    status: str
    result: str | None = None
    bug_id: int | None = None


class TestRecordUpdate(BaseModel):
    test_type: str | None = None
    test_name: str | None = None
    status: str | None = None
    result: str | None = None
    bug_id: int | None = None


class TestRecordResponse(BaseModel):
    id: int
    project_id: int
    test_type: str
    test_name: str
    status: str
    result: str | None
    bug_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)