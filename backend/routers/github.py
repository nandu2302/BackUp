from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.github_integration import GitHubIntegration
from models.github_commit import GitHubCommit
from models.experience import Experience
from hindsight_service import store_experience
import hashlib
import hmac
import json
from services.github_ai_service import analyze_github_commit



from services.github_service import (
    get_repository,
    get_commits
)


router = APIRouter(
    prefix="/projects/{project_id}/github",
    tags=["GitHub"]
)

webhook_router = APIRouter(
    prefix="/github",
    tags=["GitHub Webhook"]
)


@router.post("/connect")
async def connect_github_repository(
    project_id: int,
    owner: str,
    repo: str,
    access_token: str,
    branch: str = "main",
    webhook_secret: str | None = None,
    db: Session = Depends(get_db)
):
    # Check project
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

    # Verify repository with GitHub
    try:
        repository = await get_repository(
            owner=owner,
            repo=repo,
            access_token=access_token
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    # Check whether this repository is already connected
    integration = (
        db.query(GitHubIntegration)
        .filter(
            GitHubIntegration.project_id == project_id
        )
        .first()
    )

    if integration:
        integration.repository_owner = owner
        integration.repository_name = repo
        integration.branch = branch
        integration.access_token = access_token

        if webhook_secret:
            integration.webhook_secret = webhook_secret

        integration.is_active = True
    else:
        integration = GitHubIntegration(
            project_id=project_id,
            repository_owner=owner,
            repository_name=repo,
            branch=branch,
            access_token=access_token,
            webhook_secret=webhook_secret,
            is_active=True
        )

        db.add(integration)

    db.commit()
    db.refresh(integration)

    return {
        "success": True,
        "message": "GitHub repository connected successfully",
        "project_id": project_id,
        "repository": repository.get("full_name"),
        "branch": branch
    }


@router.get("/status")
def github_status(
    project_id: int,
    db: Session = Depends(get_db)
):
    integration = (
        db.query(GitHubIntegration)
        .filter(
            GitHubIntegration.project_id == project_id,
            GitHubIntegration.is_active == True
        )
        .first()
    )

    if not integration:
        return {
            "connected": False
        }

    return {
        "connected": True,
        "repository_owner": integration.repository_owner,
        "repository_name": integration.repository_name,
        "branch": integration.branch,
        "last_synced_at": integration.last_synced_at
    }


@router.post("/sync")
async def sync_github_commits(
    project_id: int,
    db: Session = Depends(get_db)
):
    integration = (
        db.query(GitHubIntegration)
        .filter(
            GitHubIntegration.project_id == project_id,
            GitHubIntegration.is_active == True
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail="GitHub repository is not connected"
        )

    if not integration.access_token:
        raise HTTPException(
            status_code=400,
            detail="GitHub access token is missing"
        )

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

    try:
        commits = await get_commits(
            owner=integration.repository_owner,
            repo=integration.repository_name,
            access_token=integration.access_token,
            branch=integration.branch
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    new_commits = 0
    skipped_commits = 0
    experiences_created = 0
    new_commit_data = []

    for commit_data in commits:

        sha = commit_data.get("sha")

        if not sha:
            continue

        existing_commit = (
            db.query(GitHubCommit)
            .filter(
                GitHubCommit.project_id == project_id,
                GitHubCommit.commit_sha == sha
            )
            .first()
        )

        if existing_commit:
            skipped_commits += 1
            continue

        commit_info = commit_data.get("commit", {})
        author = commit_info.get("author") or {}

        commit_message = commit_info.get(
            "message",
            ""
        ).strip()

        git_commit = GitHubCommit(
            project_id=project_id,
            integration_id=integration.id,
            commit_sha=sha,
            commit_message=commit_message,
            author_name=author.get("name"),
            author_email=author.get("email"),
            branch=integration.branch,
            commit_url=commit_data.get("html_url"),
            committed_at=None
        )

        db.add(git_commit)

        experience = Experience(
            project_id=project_id,
            project_name=project.name,
            type="DEVELOPMENT",
            title=f"GitHub Commit: {commit_message[:150]}",
            description=(
                f"A GitHub commit was made in the project repository.\n\n"
                f"Commit message: {commit_message}\n\n"
                f"Author: {author.get('name', 'Unknown')}\n\n"
                f"Branch: {integration.branch}\n\n"
                f"Commit SHA: {sha}"
            ),
            solution=commit_message,
            outcome=None,
            lesson=(
                "Review this development change as part of the "
                "project's historical experience."
            ),
            source="GITHUB_COMMIT"
        )

        db.add(experience)

        new_commit_data.append(commit_data)

        new_commits += 1
        experiences_created += 1

    integration.last_synced_at = __import__(
        "datetime"
    ).datetime.utcnow()

    db.commit()

    # Send ONLY newly discovered commits to Hindsight
    hindsight_errors = 0

    for commit_data in new_commit_data:

        commit_info = commit_data.get("commit", {})
        author = commit_info.get("author") or {}

        commit_message = commit_info.get(
            "message",
            ""
        ).strip()

        sha = commit_data.get("sha")

        try:
            await store_experience(
                project_name=project.name,
                experience_type="DEVELOPMENT",
                title=f"GitHub Commit: {commit_message[:150]}",
                description=(
                    f"GitHub commit made in repository "
                    f"{integration.repository_owner}/"
                    f"{integration.repository_name}.\n\n"
                    f"Commit message: {commit_message}\n\n"
                    f"Author: {author.get('name', 'Unknown')}\n\n"
                    f"Branch: {integration.branch}\n\n"
                    f"Commit SHA: {sha}"
                ),
                solution=commit_message,
                lesson=(
                    "Review this development change as part of the "
                    "project's historical experience."
                )
            )

        except Exception as e:
            hindsight_errors += 1
            print(
                "Hindsight GitHub commit storage failed:",
                e
            )

    return {
        "success": True,
        "message": "GitHub commits synchronized",
        "new_commits": new_commits,
        "skipped_commits": skipped_commits,
        "experiences_created": experiences_created,
        "hindsight_errors": hindsight_errors
    }


@webhook_router.post("/webhook")
async def github_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    signature = request.headers.get(
        "X-Hub-Signature-256"
    )

    if not signature:
        raise HTTPException(
            status_code=401,
            detail="Missing GitHub webhook signature"
        )

    body = await request.body()

    payload = json.loads(body)

    repository = payload.get("repository")

    if not repository:
        raise HTTPException(
            status_code=400,
            detail="Repository information missing"
        )

    repo_full_name = repository.get(
        "full_name",
        ""
    )

    if "/" not in repo_full_name:
        raise HTTPException(
            status_code=400,
            detail="Invalid repository information"
        )

    owner, repo_name = repo_full_name.split(
        "/",
        1
    )

    integration = (
        db.query(GitHubIntegration)
        .filter(
            GitHubIntegration.repository_owner == owner,
            GitHubIntegration.repository_name == repo_name,
            GitHubIntegration.is_active == True
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail="GitHub repository is not connected to any project"
        )

    if not integration.webhook_secret:
        raise HTTPException(
            status_code=400,
            detail="Webhook secret is not configured"
        )

    expected_signature = (
        "sha256="
        + hmac.new(
            integration.webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
    )

    if not hmac.compare_digest(
        signature,
        expected_signature
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid GitHub webhook signature"
        )

    event = request.headers.get(
        "X-GitHub-Event"
    )

    if event != "push":
        return {
            "success": True,
            "message": f"GitHub event '{event}' ignored"
        }

    commits = payload.get(
        "commits",
        []
    )

    project_id = integration.project_id

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

    new_commits = 0
    skipped_commits = 0
    hindsight_errors = 0

    for commit_data in commits:

        sha = commit_data.get("id")

        if not sha:
            continue

        existing_commit = (
            db.query(GitHubCommit)
            .filter(
                GitHubCommit.project_id == project_id,
                GitHubCommit.commit_sha == sha
            )
            .first()
        )

        if existing_commit:
            skipped_commits += 1
            continue

        commit_message = (
            commit_data.get(
                "message",
                ""
            ).strip()
        )

        author = commit_data.get(
            "author"
        ) or {}

        git_commit = GitHubCommit(
            project_id=project_id,
            integration_id=integration.id,
            commit_sha=sha,
            commit_message=commit_message,
            author_name=author.get("name"),
            author_email=author.get("email"),
            branch=integration.branch,
            commit_url=(
                f"https://github.com/"
                f"{owner}/{repo_name}/commit/{sha}"
            ),
            committed_at=None
        )

        db.add(git_commit)

        experience = Experience(
            project_id=project_id,
            project_name=project.name,
            type="DEVELOPMENT",
            title=f"GitHub Commit: {commit_message[:150]}",
            description=(
                f"A GitHub commit was automatically captured "
                f"from {owner}/{repo_name}.\n\n"
                f"Commit message: {commit_message}\n\n"
                f"Author: {author.get('name', 'Unknown')}\n\n"
                f"Branch: {integration.branch}\n\n"
                f"Commit SHA: {sha}"
            ),
            solution=commit_message,
            outcome=None,
            lesson=(
                "Review this development change as part of "
                "the project's historical experience."
            ),
            source="GITHUB_COMMIT"
        )

        db.add(experience)

        new_commits += 1

        try:
            await store_experience(
                project_name=project.name,
                experience_type="DEVELOPMENT",
                title=f"GitHub Commit: {commit_message[:150]}",
                description=(
                    f"A GitHub commit was automatically captured "
                    f"from {owner}/{repo_name}.\n\n"
                    f"Commit message: {commit_message}\n\n"
                    f"Author: {author.get('name', 'Unknown')}\n\n"
                    f"Branch: {integration.branch}\n\n"
                    f"Commit SHA: {sha}"
                ),
                solution=commit_message,
                lesson=(
                    "Review this development change as part of "
                    "the project's historical experience."
                )
            )

        except Exception as e:
            hindsight_errors += 1

            print(
                "Hindsight GitHub webhook storage failed:",
                e
            )

    integration.last_synced_at = (
        __import__("datetime").datetime.utcnow()
    )

    db.commit()

    return {
        "success": True,
        "message": "GitHub push processed successfully",
        "new_commits": new_commits,
        "skipped_commits": skipped_commits,
        "hindsight_errors": hindsight_errors
    }



@webhook_router.post("/webhook")
async def github_global_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    signature = request.headers.get(
        "X-Hub-Signature-256"
    )

    if not signature:
        raise HTTPException(
            status_code=401,
            detail="Missing GitHub webhook signature"
        )

    body = await request.body()

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON payload"
        )

    repository = payload.get("repository")

    if not repository:
        raise HTTPException(
            status_code=400,
            detail="Repository information missing"
        )

    repo_full_name = repository.get(
        "full_name",
        ""
    )

    if "/" not in repo_full_name:
        raise HTTPException(
            status_code=400,
            detail="Invalid repository information"
        )

    owner, repo_name = repo_full_name.split(
        "/",
        1
    )

    integration = (
        db.query(GitHubIntegration)
        .filter(
            GitHubIntegration.repository_owner == owner,
            GitHubIntegration.repository_name == repo_name,
            GitHubIntegration.is_active == True
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Repository is not connected to ProjectHindsight"
        )

    if not integration.webhook_secret:
        raise HTTPException(
            status_code=400,
            detail="Webhook secret is not configured"
        )

    expected_signature = (
        "sha256="
        + hmac.new(
            integration.webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
    )

    if not hmac.compare_digest(
        signature,
        expected_signature
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid GitHub webhook signature"
        )

    event = request.headers.get(
        "X-GitHub-Event"
    )

    # We only process push events
    if event != "push":
        return {
            "success": True,
            "message": f"GitHub event '{event}' ignored"
        }

    commits = payload.get(
        "commits",
        []
    )

    project = (
        db.query(Project)
        .filter(
            Project.id == integration.project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    new_commits = 0
    skipped_commits = 0
    hindsight_errors = 0

    for commit_data in commits:

        sha = commit_data.get("id")

        if not sha:
            continue

        # Prevent duplicate commits
        existing_commit = (
            db.query(GitHubCommit)
            .filter(
                GitHubCommit.project_id == project.id,
                GitHubCommit.commit_sha == sha
            )
            .first()
        )

        if existing_commit:
            skipped_commits += 1
            continue

        commit_message = (
            commit_data.get(
                "message",
                ""
            ).strip()
        )

        author = commit_data.get(
            "author"
        ) or {}

        # Save GitHub commit
        git_commit = GitHubCommit(
            project_id=project.id,
            integration_id=integration.id,
            commit_sha=sha,
            commit_message=commit_message,
            author_name=author.get("name"),
            author_email=author.get("email"),
            branch=integration.branch,
            commit_url=(
                f"https://github.com/"
                f"{owner}/{repo_name}/commit/{sha}"
            ),
            committed_at=None
        )

        db.add(git_commit)

        # Save Project Experience
                # Analyze the commit using AI
        try:
            ai_result = await analyze_github_commit(
                project_name=project.name,
                repository=repo_full_name,
                branch=integration.branch,
                commit_message=commit_message,
                author=author.get("name", "Unknown")
            )

            # Clean AI response
            ai_text = ai_result.strip()

            # Remove Markdown code fences if Hindsight returns them
            if ai_text.startswith("```"):
                ai_text = ai_text.replace("```json", "", 1)
                ai_text = ai_text.replace("```", "")
                ai_text = ai_text.strip()

            try:
                ai_data = json.loads(ai_text)

            except json.JSONDecodeError:
                # Try extracting JSON object from surrounding text
                start = ai_text.find("{")
                end = ai_text.rfind("}")

                if start != -1 and end != -1 and end > start:
                    try:
                        ai_data = json.loads(ai_text[start:end + 1])
                    except json.JSONDecodeError:
                        ai_data = {
                            "title": f"GitHub Commit: {commit_message[:150]}",
                            "description": ai_text,
                            "solution": commit_message,
                            "lesson": "Review this development change as part of the project's historical experience."
                        }
                else:
                    ai_data = {
                        "title": f"GitHub Commit: {commit_message[:150]}",
                        "description": ai_text,
                        "solution": commit_message,
                        "lesson": "Review this development change as part of the project's historical experience."
                    }

        except Exception as e:
            print(
                "GitHub AI analysis failed:",
                e
            )

            ai_data = {
                "title": f"GitHub Commit: {commit_message[:150]}",
                "description": (
                    f"A GitHub commit was automatically captured "
                    f"from {repo_full_name}.\n\n"
                    f"Commit message: {commit_message}"
                ),
                "solution": commit_message,
                "lesson": (
                    "Review this development change as part "
                    "of the project's historical experience."
                )
            }

        # Create Experience using AI-generated information
        experience = Experience(
            project_id=project.id,
            project_name=project.name,
            type="DEVELOPMENT",
            title=ai_data.get(
                "title",
                f"GitHub Commit: {commit_message[:150]}"
            ),
            description=ai_data.get(
                "description",
                commit_message
            ),
            solution=ai_data.get(
                "solution",
                commit_message
            ),
            outcome=None,
            lesson=ai_data.get(
                "lesson",
                "Review this development change."
            ),
            source="GITHUB_COMMIT"
        )

        db.add(experience)

        # Save to Hindsight
        try:
            await store_experience(
                project_name=project.name,
                experience_type="DEVELOPMENT",
                title=ai_data.get(
                    "title",
                    f"GitHub Commit: {commit_message[:150]}"
                ),
                description=ai_data.get(
                    "description",
                    commit_message
                ),
                solution=ai_data.get(
                    "solution",
                    commit_message
                ),
                lesson=ai_data.get(
                    "lesson",
                    "Review this development change."
                )
            )

        except Exception as e:
            hindsight_errors += 1

            print(
                "Hindsight GitHub webhook storage failed:",
                e
            )

        new_commits += 1

    integration.last_synced_at = (
        __import__("datetime").datetime.utcnow()
    )

    db.commit()

    return {
        "success": True,
        "message": "GitHub push processed successfully",
        "project_id": project.id,
        "repository": repo_full_name,
        "new_commits": new_commits,
        "skipped_commits": skipped_commits,
        "hindsight_errors": hindsight_errors
    }