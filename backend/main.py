from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.projects import router as projects_router
from routers.users import router as users_router
from routers.project_members import router as project_members_router
from models.stage import ProjectStage
from routers.requirements import router as requirements_router
from routers.architecture import router as architecture_router
from routers.development import router as development_router
from routers.decisions import router as decisions_router
from routers.experiences import router as experiences_router
from routers.testing import router as testing_router
from routers.test_records import router as test_records_router
from routers.solutions import router as solutions_router
from routers.lessons import router as lessons_router
from routers.deployment import router as deployment_router
from routers.milestones import router as milestones_router
from routers.ideas import router as ideas_router
from routers.project_history import router as project_history_router
from routers.bugs import router as bugs_router
from routers.testing_insights import router as testing_insights_router
from fastapi.staticfiles import StaticFiles
from routers.deployment_insights import router as deployment_insights_router
from routers.hindsight import router as hindsight_router
from routers.github import (
    router as github_router,
    webhook_router as github_webhook_router
)






from hindsight_service import (
    get_experience_count,
    store_experience,
    search_memory,
    generate_hindsight
)

app = FastAPI(
    title="ProjectHindsight API"
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(projects_router)
app.include_router(users_router)
app.include_router(project_members_router)
app.include_router(requirements_router)
app.include_router(architecture_router)
app.include_router(development_router)
app.include_router(decisions_router)
app.include_router(experiences_router)
app.include_router(hindsight_router)
# app.include_router(testing_router)
app.include_router(test_records_router)
app.include_router(testing_insights_router)
app.include_router(solutions_router)
app.include_router(lessons_router)
app.include_router(deployment_router)
app.include_router(github_router)
app.include_router(github_webhook_router)
app.include_router(milestones_router)
app.include_router(ideas_router)
app.include_router(project_history_router)
app.include_router(bugs_router)
app.include_router(
    deployment_insights_router
)





@app.get("/")
def home():

    return {
        "message": "ProjectHindsight API is running"
    }



@app.post("/experiences")
async def add_experience(data: dict):
    return await store_experience(
        project_name=data["project_name"],
        experience_type=data["experience_type"],
        title=data["title"],
        description=data["description"],
        solution=data["solution"],
        outcome=data["outcome"],
        lesson=data["lesson"]
    )



@app.get("/memory")
async def get_memory(query: str):
    memories = await search_memory(query)
    return memories

@app.post("/historical-lesson")
async def get_historical_lesson(data: dict):

    result = await generate_hindsight(
        f"""
        A new project is facing this problem:

        {data["query"]}

        Look at previous project experiences in memory.

        Identify the most relevant historical experience
        and explain the lesson that should be applied
        to the current project.

        Give only the practical historical lesson.
        Keep it concise.
        """
    )

    return {"lesson": result}


@app.post("/revive-idea")
async def revive_idea(data: dict):

    result = await generate_hindsight(
        f"""
        A new project is considering this idea:

        {data["idea"]}

        Search previous project experiences in memory.

        Find whether this idea, technology, approach, or decision
        was previously rejected or not selected.

        If a previous rejection exists, explain:

        1. What was rejected?
        2. Why was it rejected?
        3. What project made that decision?
        4. What should the current project reconsider?

        If no relevant historical rejection exists, say:
        No previous rejected decision was found.

        Keep the response concise and practical.
        """
    )

    return {
        "result": result
    }


@app.get("/experience-count")
def experience_count():

    count = get_experience_count()

    return {
        "count": count
    }

@app.post("/hindsight")
async def get_hindsight(data: dict):

    result = await generate_hindsight(
        data["query"]
    )

    return {
        "hindsight": result
    }