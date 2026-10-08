from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from database import get_db

from models.project import Project
from models.test_record import TestRecord
from models.bug import Bug
from models.stage import ProjectStage

from schemas.test_record import (
    TestRecordCreate,
    TestRecordUpdate,
    TestRecordResponse
)

from services.stage_progress import update_stage_progress
from hindsight_service import search_memory

router = APIRouter(
    prefix="/projects/{project_id}/tests",
    tags=["Testing - Test Records"]
)


# ============================================================
# REQUEST MODEL
# Used when creating a bug from a failed test
# ============================================================

class CreateBugFromTestRequest(BaseModel):
    severity: str = "MEDIUM"


# ============================================================
# CREATE TEST RECORD
# ============================================================

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

    # --------------------------------------------------------
    # Validate linked bug
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Create test record
    # --------------------------------------------------------

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


# ============================================================
# GET ALL TEST RECORDS
# ============================================================

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
        .filter(
            TestRecord.project_id == project_id
        )
        .order_by(TestRecord.id)
        .all()
    )


# ============================================================
# GET SINGLE TEST RECORD
# ============================================================

# ============================================================
# TESTING INSIGHTS
# ============================================================

@router.get(
    "/../testing-insights"
)
async def get_testing_insights(
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

    query = (
        "Testing problems, bugs, unit testing, "
        "integration testing, test failures, "
        "debugging, concurrency problems, "
        "and lessons learned from previous projects."
    )

    memories = await search_memory(query)

    return {
        "project_id": project_id,
        "insights": memories
    }



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


# ============================================================
# UPDATE TEST RECORD
# ============================================================

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

    # --------------------------------------------------------
    # Validate linked bug
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Update fields
    # --------------------------------------------------------

    update_data = test_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            test_record,
            field,
            value
        )

    db.flush()

    update_stage_progress(
        project_id,
        "TESTING",
        db
    )

    db.commit()

    db.refresh(test_record)

    return test_record


# ============================================================
# CREATE BUG FROM FAILED TEST
# ============================================================

@router.post(
    "/{test_id}/create-bug",
    response_model=TestRecordResponse
)
def create_bug_from_test(
    project_id: int,
    test_id: int,
    bug_data: CreateBugFromTestRequest,
    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # Find test record
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Only failed tests should create bugs
    # --------------------------------------------------------

    if test_record.status.upper() != "FAILED":
        raise HTTPException(
            status_code=400,
            detail="A bug can only be created from a failed test"
        )

    # --------------------------------------------------------
    # Prevent duplicate bug creation
    # --------------------------------------------------------

    if test_record.bug_id is not None:

        raise HTTPException(
            status_code=400,
            detail=(
                "A bug has already been created "
                "for this test"
            )
        )

    # --------------------------------------------------------
    # Find TESTING stage
    # --------------------------------------------------------

    testing_stage = (
        db.query(ProjectStage)
        .filter(
            ProjectStage.project_id == project_id,
            ProjectStage.stage_type == "TESTING"
        )
        .first()
    )

    # --------------------------------------------------------
    # Create bug
    # --------------------------------------------------------

    result_text = (
        test_record.result
        if test_record.result
        else "The test failed without a detailed result."
    )

    bug = Bug(
        project_id=project_id,
        stage_id=(
            testing_stage.id
            if testing_stage
            else None
        ),
        title=(
            f"Issue from failed test: "
            f"{test_record.test_name}"
        ),
        description=(
            f"The test '{test_record.test_name}' "
            f"failed.\n\n"
            f"Test type: {test_record.test_type}\n\n"
            f"Test result:\n{result_text}"
        ),
        severity=bug_data.severity,
        status="OPEN",
        solution=None
    )

    db.add(bug)

    db.flush()

    # --------------------------------------------------------
    # Link bug to test record
    # --------------------------------------------------------

    test_record.bug_id = bug.id

    db.flush()

    # --------------------------------------------------------
    # Recalculate testing stage progress
    # --------------------------------------------------------

    update_stage_progress(
        project_id,
        "TESTING",
        db
    )

    db.commit()

    db.refresh(test_record)

    return test_record


# ============================================================
# DELETE TEST RECORD
# ============================================================

@router.delete(
    "/{test_id}"
)
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