from __future__ import annotations

import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.dog import DogSize, DogStatus
from app.models.user import User, UserRole
from app.schemas.dog import DogCreate, DogListResponse, DogResponse, DogUpdate
from app.services.dog_service import DogService
from app.services.storage_service import storage

router = APIRouter(prefix="/dogs", tags=["dogs"])

# ---------------------------------------------------------------------------
# Breeds static list (used by GET /breeds)
# ---------------------------------------------------------------------------
BREEDS: list[str] = [
    "Affenpinscher", "Afghan Hound", "Airedale Terrier", "Akita",
    "Alaskan Malamute", "American Bulldog", "American Eskimo Dog",
    "American Foxhound", "American Pit Bull Terrier", "American Staffordshire Terrier",
    "Australian Cattle Dog", "Australian Shepherd", "Australian Terrier",
    "Basset Hound", "Beagle", "Bearded Collie", "Belgian Malinois",
    "Belgian Shepherd", "Bernese Mountain Dog", "Bichon Frise",
    "Bloodhound", "Border Collie", "Border Terrier", "Boston Terrier",
    "Boxer", "Brittany", "Brussels Griffon", "Bull Terrier", "Bulldog",
    "Bullmastiff", "Cairn Terrier", "Cavalier King Charles Spaniel",
    "Chihuahua", "Chinese Crested", "Chinese Shar-Pei", "Chow Chow",
    "Cocker Spaniel", "Collie", "Dachshund", "Dalmatian",
    "Doberman Pinscher", "English Setter", "English Springer Spaniel",
    "Finnish Spitz", "French Bulldog", "German Shepherd",
    "German Shorthaired Pointer", "Golden Retriever", "Great Dane",
    "Great Pyrenees", "Greyhound", "Havanese", "Irish Setter",
    "Irish Terrier", "Irish Wolfhound", "Italian Greyhound",
    "Jack Russell Terrier", "Japanese Chin", "Keeshond", "Labrador Retriever",
    "Lhasa Apso", "Maltese", "Mastiff", "Miniature Pinscher",
    "Miniature Schnauzer", "Mixed Breed", "Newfoundland", "Norwegian Elkhound",
    "Norwich Terrier", "Old English Sheepdog", "Papillon", "Pekingese",
    "Pembroke Welsh Corgi", "Pomeranian", "Poodle (Miniature)", "Poodle (Standard)",
    "Poodle (Toy)", "Portuguese Water Dog", "Pug", "Rhodesian Ridgeback",
    "Rottweiler", "Saint Bernard", "Samoyed", "Schipperke",
    "Scottish Terrier", "Shetland Sheepdog", "Shiba Inu", "Shih Tzu",
    "Siberian Husky", "Silky Terrier", "Soft Coated Wheaten Terrier",
    "Staffordshire Bull Terrier", "Standard Schnauzer", "Vizsla",
    "Weimaraner", "West Highland White Terrier", "Whippet",
    "Yorkshire Terrier",
]


def _require_dog_ownership(dog_owner_id: uuid.UUID, current_user: User) -> None:
    if current_user.role != UserRole.admin and dog_owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this dog listing",
        )


@router.get(
    "",
    response_model=DogListResponse,
    summary="List all dogs with optional filters and pagination",
)
async def list_dogs(
    breed: str | None = Query(default=None, description="Filter by breed (partial match)"),
    age_min: int | None = Query(default=None, ge=0, description="Minimum age in months"),
    age_max: int | None = Query(default=None, ge=0, description="Maximum age in months"),
    size: DogSize | None = Query(default=None),
    dog_status: DogStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> DogListResponse:
    return await DogService.list_dogs(
        db,
        breed=breed,
        age_min=age_min,
        age_max=age_max,
        size=size,
        status=dog_status,
        page=page,
        limit=limit,
    )


@router.post(
    "",
    response_model=DogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new dog listing",
)
async def create_dog(
    payload: DogCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> DogResponse:
    dog = await DogService.create(db, payload, owner_id=current_user.id)
    return DogResponse.model_validate(dog)


@router.get(
    "/{dog_id}",
    response_model=DogResponse,
    summary="Get a single dog by ID",
)
async def get_dog(
    dog_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> DogResponse:
    dog = await DogService.get_by_id(db, dog_id)
    if dog is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    return DogResponse.model_validate(dog)


@router.put(
    "/{dog_id}",
    response_model=DogResponse,
    summary="Update a dog listing (owner or admin only)",
)
async def update_dog(
    dog_id: uuid.UUID,
    payload: DogUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> DogResponse:
    dog = await DogService.get_by_id(db, dog_id)
    if dog is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    _require_dog_ownership(dog.owner_id, current_user)
    updated_dog = await DogService.update(db, dog, payload)
    return DogResponse.model_validate(updated_dog)


@router.delete(
    "/{dog_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a dog listing (owner or admin only)",
)
async def delete_dog(
    dog_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    dog = await DogService.get_by_id(db, dog_id)
    if dog is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    _require_dog_ownership(dog.owner_id, current_user)
    await DogService.delete(db, dog)


@router.post(
    "/{dog_id}/images",
    response_model=DogResponse,
    summary="Upload an image for a dog listing (owner or admin only)",
)
async def upload_dog_image(
    dog_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WebP, GIF; max 10 MB)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> DogResponse:
    dog = await DogService.get_by_id(db, dog_id)
    if dog is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    _require_dog_ownership(dog.owner_id, current_user)

    image_url = await storage.upload_image(file, folder=f"petdogs/dogs/{dog_id}")
    updated_dog = await DogService.add_image(db, dog, image_url)
    return DogResponse.model_validate(updated_dog)


