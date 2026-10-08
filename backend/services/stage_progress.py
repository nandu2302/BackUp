from datetime import datetime

from sqlalchemy.orm import Session

from models.stage import ProjectStage
from models.idea import Idea
from models.requirement import Requirement
from models.architecture import Architecture
from models.task import Task
from models.test_record import TestRecord
from models.bug import Bug
from models.deployment import Deployment
# from models.experience import Experience
from services.project_progress import update_project_progress

def clamp_progress(value: float) -> int:
    return max(0, min(100, round(value)))


def update_stage_progress(
    project_id: int,
    stage_type: str,
    db: Session
):
    stage = (
        db.query(ProjectStage)
        .filter(
            ProjectStage.project_id == project_id,
            ProjectStage.stage_type == stage_type
        )
        .first()
    )

    if not stage:
        return None

    progress = 0

    # ---------------------------------------------------------
    # IDEA
    # ---------------------------------------------------------
    if stage_type == "IDEA":

        ideas = (
            db.query(Idea)
            .filter(Idea.project_id == project_id)
            .all()
        )

        if ideas:
            selected = sum(
                1
                for idea in ideas
                if idea.status.upper() == "SELECTED"
            )

            proposed = sum(
                1
                for idea in ideas
                if idea.status.upper() == "PROPOSED"
            )

            if selected > 0:
                progress = 100
            elif proposed > 0:
                progress = 50
            else:
                progress = 0

    # ---------------------------------------------------------
    # REQUIREMENTS
    # ---------------------------------------------------------
    elif stage_type == "REQUIREMENTS":

        requirements = (
            db.query(Requirement)
            .filter(Requirement.project_id == project_id)
            .all()
        )

        if requirements:
            total_progress = sum(
                requirement.progress
                for requirement in requirements
            )

            progress = total_progress / len(requirements)

    # ---------------------------------------------------------
    # ARCHITECTURE
    # ---------------------------------------------------------
    elif stage_type == "ARCHITECTURE":

        architecture_count = (
            db.query(Architecture)
            .filter(
                Architecture.project_id == project_id
            )
            .count()
        )

        print(
        "ARCHITECTURE COUNT:",
        architecture_count,
        "PROJECT:",
        project_id
        )

        progress = 100 if architecture_count > 0 else 0

    # ---------------------------------------------------------
    # DEVELOPMENT
    # ---------------------------------------------------------
    elif stage_type == "DEVELOPMENT":

        tasks = (
            db.query(Task)
            .filter(Task.project_id == project_id)
            .all()
        )

        if tasks:
            completed_tasks = sum(
                1
                for task in tasks
                if task.status.upper() == "COMPLETED"
            )

            progress = (
                completed_tasks / len(tasks)
            ) * 100

    # ---------------------------------------------------------
    # TESTING
    # ---------------------------------------------------------
    elif stage_type == "TESTING":

        tests = (
            db.query(TestRecord)
            .filter(TestRecord.project_id == project_id)
            .all()
        )

        bugs = (
            db.query(Bug)
            .filter(Bug.project_id == project_id)
            .all()
        )

        test_progress = 0

        if tests:
            completed_tests = sum(
                1
                for test in tests
                if test.status.upper() == "PASSED"
            )

            test_progress = (
                completed_tests / len(tests)
            ) * 100

        bug_progress = 100

        if bugs:
            resolved_bugs = sum(
                1
                for bug in bugs
                if bug.status.upper()
                in ["RESOLVED", "CLOSED"]
            )

            bug_progress = (
                resolved_bugs / len(bugs)
            ) * 100

        if tests and bugs:
            progress = (
                test_progress + bug_progress
            ) / 2

        elif tests:
            progress = test_progress

        elif bugs:
            progress = bug_progress

    # ---------------------------------------------------------
    # DEPLOYMENT
    # ---------------------------------------------------------
    # ---------------------------------------------------------
    # ---------------------------------------------------------
    # ---------------------------------------------------------
    # DEPLOYMENT
    # ---------------------------------------------------------
    elif stage_type == "DEPLOYMENT":

        deployments = (
            db.query(Deployment)
            .filter(
                Deployment.project_id == project_id
            )
            .all()
        )

        if deployments:

            successful_deployments = sum(
                1
                for deployment in deployments
                if deployment.status.upper()
                in ["SUCCESS", "DEPLOYED"]
            )

            progress = (
                successful_deployments / len(deployments)
            ) * 100

        else:
            progress = 0

    # ---------------------------------------------------------
    # HINDSIGHT
    # ---------------------------------------------------------
    # elif stage_type == "HINDSIGHT":

    #     hindsight_count = (
    #         db.query(Experience)
    #         .filter(
    #             Experience.project_id == project_id,
    #             Experience.type == "HINDSIGHT"
    #         )
    #         .count()
    #     )

    #     progress = (
    #         100
    #         if hindsight_count > 0
    #         else 0
    #     )

    # ---------------------------------------------------------
    # Save progress
    # ---------------------------------------------------------

    stage.progress = clamp_progress(progress)

    # Automatically maintain stage status
    if stage.progress >= 100:
        stage.status = "COMPLETED"

        if stage.completed_at is None:
            stage.completed_at = datetime.utcnow()

    elif stage.progress > 0:
        stage.status = "IN_PROGRESS"

        if stage.started_at is None:
            stage.started_at = datetime.utcnow()

        stage.completed_at = None

    else:
        stage.status = "NOT_STARTED"
        stage.started_at = None
        stage.completed_at = None

    # Update the project's overall progress
    update_project_progress(project_id, db)

    return stage