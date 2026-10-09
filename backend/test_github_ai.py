import asyncio

from services.github_ai_service import analyze_github_commit


async def main():
    result = await analyze_github_commit(
        project_name="Smart Shopping Ticket Booking System",
        repository="nandu2302/BackUp",
        branch="main",
        commit_message="Fix GitHub webhook experience capture",
        author="nandu2302"
    )

    print("\nAI RESULT:\n")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())