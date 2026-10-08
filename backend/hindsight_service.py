import os
from dotenv import load_dotenv
from hindsight_client import Hindsight
import json

load_dotenv()

HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")

COUNT_FILE = "experience_count.json"

client = Hindsight(
    base_url=HINDSIGHT_BASE_URL,
    api_key=HINDSIGHT_API_KEY
)

BANK_ID = "project-hindsight"


async def store_experience(
    project_name,
    experience_type,
    title,
    description,
    solution,
    lesson
):

    content = f"""
    Project Experience Record

    Project: {project_name}

    Experience Type: {experience_type}

    Title: {title}

    What happened:
    {description}

    Solution / Decision:
    {solution}

    Lesson for future projects:
    {lesson}
    """

    await client.aretain(
        bank_id=BANK_ID,
        content=content
    )

    increase_experience_count()

    return {
        "success": True,
        "message": "Experience stored in Hindsight"
    }

# def store_experience(project_name, experience_type, title, description, solution, lesson):

#     content = f"""
#     Project: {project_name}

#     Experience Type: {experience_type}

#     Title: {title}

#     What happened:
#     {description}

#     Solution:
#     {solution}

#     Lesson for future projects:
#     {lesson}
#     """

#     client.retain(
#         bank_id=BANK_ID,
#         content=content
#     )

#     return {
#         "success": True,
#         "message": "Experience stored in Hindsight"
#     }


async def search_memory(query):
    result = await client.arecall(
        bank_id=BANK_ID,
        query=query
    )

    memories = []

    for memory in result.results:
        memories.append({
            "type": memory.type,
            "text": memory.text
        })

    return memories


async def generate_hindsight(query):

    response = await client.areflect(
        bank_id=BANK_ID,
        query=query
    )

    return response.text


def get_experience_count():

    if not os.path.exists(COUNT_FILE):
        return 0

    with open(COUNT_FILE, "r") as file:
        data = json.load(file)

    return data.get("count", 0)


def increase_experience_count():

    count = get_experience_count()

    count += 1

    with open(COUNT_FILE, "w") as file:
        json.dump(
            {"count": count},
            file,
            indent=4
        )

    return count

# def get_experience_count():

#     result = client.list_memories(
#         bank_id=BANK_ID,
#         limit=100
#     )

#     print("LIST MEMORIES RESULT:")
#     print(result)

#     print("ITEMS:")
#     print(result.items)

#     for memory in result.items:
#         print("--------------------------------")
#         print("MEMORY:")
#         print(memory)
#         print("FACT TYPE:", getattr(memory, "fact_type", None))
#         print("TYPE:", getattr(memory, "type", None))
#         print("TEXT:", getattr(memory, "text", None))

#     return len(result.items)

# def get_experience_count():

#     result = client.list_memories(
#         bank_id=BANK_ID,
#         limit=100
#     )

#     count = 0

#     for memory in result.items:

#         if memory.fact_type == "experience":
#             count += 1

#     return count