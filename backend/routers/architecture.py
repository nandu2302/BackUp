from pathlib import Path
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)

from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.architecture import Architecture
from schemas.architecture import (
    ArchitectureCreate,
    ArchitectureUpdate,
    ArchitectureResponse
)
from services.stage_progress import update_stage_progress


router = APIRouter(
    prefix="/projects/{project_id}/architectures",
    tags=["Architecture"]
)


# ============================================================
# CREATE ARCHITECTURE
# ============================================================

@router.post(
    "",
    response_model=ArchitectureResponse,
    status_code=201
)
def create_architecture(
    project_id: int,
    architecture_data: ArchitectureCreate,
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

    architecture = Architecture(
        project_id=project_id,
        title=architecture_data.title,
        description=architecture_data.description,
        technology_stack=architecture_data.technology_stack,
        diagram=architecture_data.diagram,
        diagram_image_url=architecture_data.diagram_image_url
    )

    db.add(architecture)
    db.flush()

    update_stage_progress(
        project_id,
        "ARCHITECTURE",
        db
    )

    db.commit()
    db.refresh(architecture)

    return architecture


# ============================================================
# GET ALL ARCHITECTURES
# ============================================================

@router.get(
    "",
    response_model=list[ArchitectureResponse]
)
def get_architectures(
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
        db.query(Architecture)
        .filter(
            Architecture.project_id == project_id
        )
        .order_by(Architecture.id)
        .all()
    )


# ============================================================
# GET SINGLE ARCHITECTURE
# ============================================================

@router.get(
    "/{architecture_id}",
    response_model=ArchitectureResponse
)
def get_architecture(
    project_id: int,
    architecture_id: int,
    db: Session = Depends(get_db)
):
    architecture = (
        db.query(Architecture)
        .filter(
            Architecture.id == architecture_id,
            Architecture.project_id == project_id
        )
        .first()
    )

    if not architecture:
        raise HTTPException(
            status_code=404,
            detail="Architecture not found"
        )

    return architecture


# ============================================================
# UPDATE ARCHITECTURE
# ============================================================

@router.put(
    "/{architecture_id}",
    response_model=ArchitectureResponse
)
def update_architecture(
    project_id: int,
    architecture_id: int,
    architecture_data: ArchitectureUpdate,
    db: Session = Depends(get_db)
):
    architecture = (
        db.query(Architecture)
        .filter(
            Architecture.id == architecture_id,
            Architecture.project_id == project_id
        )
        .first()
    )

    if not architecture:
        raise HTTPException(
            status_code=404,
            detail="Architecture not found"
        )

    update_data = architecture_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            architecture,
            field,
            value
        )

    db.flush()

    update_stage_progress(
        project_id,
        "ARCHITECTURE",
        db
    )

    db.commit()
    db.refresh(architecture)

    return architecture


# ============================================================
# UPLOAD ARCHITECTURE DIAGRAM IMAGE
# ============================================================

@router.post(
    "/{architecture_id}/diagram-image"
)
async def upload_architecture_diagram(
    project_id: int,
    architecture_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    architecture = (
        db.query(Architecture)
        .filter(
            Architecture.id == architecture_id,
            Architecture.project_id == project_id
        )
        .first()
    )

    if not architecture:
        raise HTTPException(
            status_code=404,
            detail="Architecture not found"
        )

    # --------------------------------------------------------
    # Allowed image types
    # --------------------------------------------------------

    allowed_types = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/webp": ".webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only PNG, JPG, JPEG and WEBP "
                "images are allowed."
            )
        )

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    contents = await file.read()

    # --------------------------------------------------------
    # Maximum size = 5 MB
    # --------------------------------------------------------

    max_size = 5 * 1024 * 1024

    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 5 MB."
        )

    # --------------------------------------------------------
    # Generate unique filename
    # --------------------------------------------------------

    extension = allowed_types[file.content_type]

    filename = (
        f"architecture_{architecture_id}_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    # --------------------------------------------------------
    # Create upload directory
    # --------------------------------------------------------

    upload_dir = (
        Path("uploads") /
        "architecture"
    )

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Save image
    # --------------------------------------------------------

    file_path = upload_dir / filename

    with open(
        file_path,
        "wb"
    ) as buffer:
        buffer.write(contents)

    # --------------------------------------------------------
    # Save image URL in database
    # --------------------------------------------------------

    image_url = (
        f"/uploads/architecture/{filename}"
    )

    architecture.diagram_image_url = image_url

    db.commit()
    db.refresh(architecture)

    return {
        "message": (
            "Architecture diagram "
            "uploaded successfully."
        ),
        "diagram_image_url": image_url,
        "architecture_id": architecture.id
    }


# ============================================================
# DELETE ARCHITECTURE
# ============================================================

@router.delete(
    "/{architecture_id}"
)
def delete_architecture(
    project_id: int,
    architecture_id: int,
    db: Session = Depends(get_db)
):
    architecture = (
        db.query(Architecture)
        .filter(
            Architecture.id == architecture_id,
            Architecture.project_id == project_id
        )
        .first()
    )

    if not architecture:
        raise HTTPException(
            status_code=404,
            detail="Architecture not found"
        )

    db.delete(architecture)
    db.flush()

    update_stage_progress(
        project_id,
        "ARCHITECTURE",
        db
    )

    db.commit()

    return {
        "message": (
            "Architecture deleted successfully"
        )
    }