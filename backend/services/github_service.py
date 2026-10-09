import httpx


GITHUB_API = "https://api.github.com"


async def get_repository(
    owner: str,
    repo: str,
    access_token: str
):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {access_token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}",
            headers=headers
        )

    if response.status_code != 200:
        raise Exception(
            f"GitHub repository request failed: {response.text}"
        )

    return response.json()


async def get_commits(
    owner: str,
    repo: str,
    access_token: str,
    branch: str = "main",
    per_page: int = 30
):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {access_token}",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    params = {
        "sha": branch,
        "per_page": per_page
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/commits",
            headers=headers,
            params=params
        )

    if response.status_code != 200:
        raise Exception(
            f"GitHub commits request failed: {response.text}"
        )

    return response.json()