from pydantic import BaseModel

from schemas.project import ProjectResponse
# from schemas.user import UserResponse
from schemas.project_member import ProjectMemberResponse
from schemas.requirement import RequirementResponse
from schemas.architecture import ArchitectureResponse
from schemas.task import TaskResponse
from schemas.decision import DecisionResponse
from schemas.experience import ExperienceResponse
from schemas.bug import BugResponse
from schemas.test_record import TestRecordResponse
from schemas.solution import SolutionResponse
from schemas.lesson import LessonResponse
from schemas.deployment import DeploymentResponse
from schemas.milestone import MilestoneResponse
from schemas.stage import ProjectStageResponse


class ProjectWorkspaceResponse(BaseModel):
    project: ProjectResponse
    members: list[ProjectMemberResponse]
    stages: list[ProjectStageResponse]
    requirements: list[RequirementResponse]
    architectures: list[ArchitectureResponse]
    tasks: list[TaskResponse]
    decisions: list[DecisionResponse]
    experiences: list[ExperienceResponse]
    bugs: list[BugResponse]
    tests: list[TestRecordResponse]
    solutions: list[SolutionResponse]
    lessons: list[LessonResponse]
    deployments: list[DeploymentResponse]
    milestones: list[MilestoneResponse]