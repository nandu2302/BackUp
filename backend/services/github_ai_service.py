from hindsight_service import client, BANK_ID


async def analyze_github_commit(
    project_name: str,
    repository: str,
    branch: str,
    commit_message: str,
    author: str
):
    prompt = f"""
You are the ProjectHindsight development-learning agent.

Analyze this GitHub commit and extract useful project experience.

Project:
{project_name}

Repository:
{repository}

Branch:
{branch}

Author:
{author}

Commit message:
{commit_message}

Return ONLY valid JSON in exactly this structure:

{{
    "title": "",
    "description": "",
    "solution": "",
    "lesson": ""
}}

Rules:

1. Do not invent technical details that are not supported by the commit message.
2. If the commit message does not reveal a problem, describe what development change was made.
3. The description should explain what happened or what changed.
4. The solution should explain the implementation/change represented by the commit.
5. The lesson should be a useful future-project lesson, but do not invent specific technical facts.
6. Keep each field concise.
"""

    response = await client.areflect(
        bank_id=BANK_ID,
        query=prompt
    )

    return response.text.strip()