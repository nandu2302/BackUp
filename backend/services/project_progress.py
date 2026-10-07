from sqlalchemy.orm import Session

from models.project import Project
from models.stage import ProjectStage


STAGE_ORDER = [
    "IDEA",
    "REQUIREMENTS",
    "ARCHITECTURE",
    "DEVELOPMENT",
    "TESTING",
    "DEPLOYMENT",
    "HINDSIGHT"
]


def update_project_progress(project_id: int, db: Session):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        return None

    stages = (
        db.query(ProjectStage)
        .filter(ProjectStage.project_id == project_id)
        .all()
    )

    if not stages:
        return project

    stage_map = {
        stage.stage_type: stage
        for stage in stages
    }

    # Calculate overall progress
    total_progress = sum(
        stage_map[stage_name].progress
        for stage_name in STAGE_ORDER
        if stage_name in stage_map
    )

    project.progress = round(
        total_progress / len(STAGE_ORDER)
    )

    # Find current stage
    for stage_name in STAGE_ORDER:
        stage = stage_map.get(stage_name)

        if stage and stage.progress < 100:
            project.current_stage = stage_name
            break
    else:
        # All stages completed
        project.current_stage = "HINDSIGHT"

    return project