from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.test_record import TestRecord
from models.bug import Bug
from schemas.test_record import (
    TestRecordCreate,
    TestRecordUpdate,
    TestRecordResponse
)
from services.stage_progress import update_stage_progress


router = APIRouter(
    prefix="/projects/{project_id}/tests",
    tags=["Testing - Test Records"]
)


@router.post(
    "",
    response_model=TestRecordResponse,
    status_code=201
)
def create_test_record(
    project_id: int,
    test_data: TestRecordCreate,
    db: Session = Depends(get_db)
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if test_data.bug_id is not None:
        bug = (
            db.query(Bug)
            .filter(
                Bug.id == test_data.bug_id,
                Bug.project_id == project_id
            )
            .first()
        )

        if not bug:
            raise HTTPException(
                status_code=404,
                detail="Bug not found for this project"
            )

    test_record = TestRecord(
        project_id=project_id,
        test_type=test_data.test_type,
        test_name=test_data.test_name,
        status=test_data.status,
        result=test_data.result,
        bug_id=test_data.bug_id
    )

    db.add(test_record)
    db.flush()
    update_stage_progress(
        project_id,
        "TESTING",
        db
    )
    db.commit()
    db.refresh(test_record)

    return test_record


@router.get(
    "",
    response_model=list[TestRecordResponse]
)
def get_test_records(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return (
        db.query(TestRecord)
        .filter(TestRecord.project_id == project_id)
        .order_by(TestRecord.id)
        .all()
    )


@router.get(
    "/{test_id}",
    response_model=TestRecordResponse
)
def get_test_record(
    project_id: int,
    test_id: int,
    db: Session = Depends(get_db)
):
    test_record = (
        db.query(TestRecord)
        .filter(
            TestRecord.id == test_id,
            TestRecord.project_id == project_id
        )
        .first()
    )

    if not test_record:
        raise HTTPException(
            status_code=404,
            detail="Test record not found"
        )

    return test_record


@router.put(
    "/{test_id}",
    response_model=TestRecordResponse
)
def update_test_record(
    project_id: int,
    test_id: int,
    test_data: TestRecordUpdate,
    db: Session = Depends(get_db)
):
    test_record = (
        db.query(TestRecord)
        .filter(
            TestRecord.id == test_id,
            TestRecord.project_id == project_id
        )
        .first()
    )

    if not test_record:
        raise HTTPException(
            status_code=404,
            detail="Test record not found"
        )

    if test_data.bug_id is not None:
        bug = (
            db.query(Bug)
            .filter(
                Bug.id == test_data.bug_id,
                Bug.project_id == project_id
            )
            .first()
        )

        if not bug:
            raise HTTPException(
                status_code=404,
                detail="Bug not found for this project"
            )

    update_data = test_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(test_record, field, value)

    db.flush()
    update_stage_progress(
        project_id,
        "TESTING",
        db
    )
    db.commit()
    db.refresh(test_record)

    return test_record


@router.delete("/{test_id}")
def delete_test_record(
    project_id: int,
    test_id: int,
    db: Session = Depends(get_db)
):
    test_record = (
        db.query(TestRecord)
        .filter(
            TestRecord.id == test_id,
            TestRecord.project_id == project_id
        )
        .first()
    )

    if not test_record:
        raise HTTPException(
            status_code=404,
            detail="Test record not found"
        )

    db.delete(test_record)
    db.flush()
    update_stage_progress(
        project_id,
        "TESTING",
        db
    )
    db.commit()

    return {
        "message": "Test record deleted successfully"
    }