"""
Storage service abstraction.

Current implementation: Cloudinary.
To swap to AWS S3, create an S3StorageBackend class implementing StorageBackend
and change the `storage` singleton at the bottom of this file.
"""

from __future__ import annotations

import io
from abc import ABC, abstractmethod

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class StorageBackend(ABC):
    @abstractmethod
    async def upload_image(self, file: UploadFile, folder: str = "petdogs") -> str:
        """Upload an image and return its public URL."""


class CloudinaryStorageBackend(StorageBackend):
    def __init__(self) -> None:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )

    async def upload_image(self, file: UploadFile, folder: str = "petdogs") -> str:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=(
                    f"Unsupported file type '{file.content_type}'. "
                    f"Allowed: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
                ),
            )

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB",
            )

        try:
            result = cloudinary.uploader.upload(
                io.BytesIO(contents),
                folder=folder,
                resource_type="image",
                transformation=[
                    {"quality": "auto:good"},
                    {"fetch_format": "auto"},
                ],
            )
            secure_url: str = result["secure_url"]
            return secure_url
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Image upload failed: {exc}",
            ) from exc


# ---------------------------------------------------------------------------
# S3 stub — uncomment and implement to switch storage backends
# ---------------------------------------------------------------------------
# import boto3
# from botocore.exceptions import BotoCoreError
#
# class S3StorageBackend(StorageBackend):
#     def __init__(self) -> None:
#         self.client = boto3.client(
#             "s3",
#             aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
#             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#             region_name=settings.AWS_REGION,
#         )
#         self.bucket = settings.S3_BUCKET_NAME
#
#     async def upload_image(self, file: UploadFile, folder: str = "petdogs") -> str:
#         contents = await file.read()
#         key = f"{folder}/{uuid.uuid4()}{pathlib.Path(file.filename or 'img').suffix}"
#         self.client.put_object(Bucket=self.bucket, Key=key, Body=contents,
#                                ContentType=file.content_type)
#         return f"https://{self.bucket}.s3.amazonaws.com/{key}"


# ---------------------------------------------------------------------------
# Active backend — swap class here to change storage provider
# ---------------------------------------------------------------------------
storage: StorageBackend = CloudinaryStorageBackend()
