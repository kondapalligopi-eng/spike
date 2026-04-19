"""Tests for dog CRUD endpoints."""
from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

DOG_PAYLOAD: dict[str, Any] = {
    "name": "Buddy",
    "breed": "Golden Retriever",
    "age_months": 18,
    "size": "medium",
    "gender": "male",
    "color": "Golden",
    "description": "A friendly and playful dog.",
    "is_vaccinated": True,
    "is_neutered": False,
}


async def _create_dog(
    client: AsyncClient,
    headers: dict[str, str],
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    resp = await client.post(
        "/api/v1/dogs",
        json=payload or DOG_PAYLOAD,
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


async def test_create_dog_success(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/v1/dogs", json=DOG_PAYLOAD, headers=auth_headers
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Buddy"
    assert data["breed"] == "Golden Retriever"
    assert data["status"] == "available"
    assert data["images"] == []
    assert "id" in data
    assert "owner_id" in data


async def test_create_dog_unauthenticated(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/dogs", json=DOG_PAYLOAD)
    assert resp.status_code == 401


async def test_create_dog_missing_required_field(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    bad_payload = {k: v for k, v in DOG_PAYLOAD.items() if k != "breed"}
    resp = await client.post("/api/v1/dogs", json=bad_payload, headers=auth_headers)
    assert resp.status_code == 422


async def test_create_dog_invalid_size_enum(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    bad = {**DOG_PAYLOAD, "size": "humongous"}
    resp = await client.post("/api/v1/dogs", json=bad, headers=auth_headers)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------


async def test_list_dogs(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    await _create_dog(client, auth_headers)
    resp = await client.get("/api/v1/dogs")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "pages" in data
    assert isinstance(data["items"], list)


async def test_list_dogs_filter_by_breed(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    await _create_dog(client, auth_headers)
    resp = await client.get("/api/v1/dogs?breed=golden")
    assert resp.status_code == 200
    items = resp.json()["items"]
    for dog in items:
        assert "golden" in dog["breed"].lower()


async def test_list_dogs_pagination(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    for i in range(3):
        await _create_dog(
            client, auth_headers, {**DOG_PAYLOAD, "name": f"Dog{i}"}
        )
    resp = await client.get("/api/v1/dogs?page=1&limit=2")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) <= 2
    assert data["limit"] == 2


async def test_get_dog_by_id(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    dog = await _create_dog(client, auth_headers)
    resp = await client.get(f"/api/v1/dogs/{dog['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == dog["id"]


async def test_get_dog_not_found(client: AsyncClient) -> None:
    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(f"/api/v1/dogs/{fake_id}")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


async def test_update_dog_success(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    dog = await _create_dog(client, auth_headers)
    resp = await client.put(
        f"/api/v1/dogs/{dog['id']}",
        json={"name": "Max", "age_months": 24},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Max"
    assert data["age_months"] == 24


async def test_update_dog_not_owner(
    client: AsyncClient,
    auth_headers: dict[str, str],
) -> None:
    # Create a dog as the primary user
    dog = await _create_dog(client, auth_headers)

    # Register and login as a second user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "other@example.com",
            "password": "Other1234",
            "full_name": "Other User",
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": "Other1234"},
    )
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    resp = await client.put(
        f"/api/v1/dogs/{dog['id']}",
        json={"name": "Stolen"},
        headers=other_headers,
    )
    assert resp.status_code == 403


async def test_update_dog_unauthenticated(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    dog = await _create_dog(client, auth_headers)
    resp = await client.put(f"/api/v1/dogs/{dog['id']}", json={"name": "X"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------


async def test_delete_dog_success(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    dog = await _create_dog(client, auth_headers)
    resp = await client.delete(
        f"/api/v1/dogs/{dog['id']}", headers=auth_headers
    )
    assert resp.status_code == 204

    # Confirm it is gone
    get_resp = await client.get(f"/api/v1/dogs/{dog['id']}")
    assert get_resp.status_code == 404


async def test_delete_dog_not_owner(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    dog = await _create_dog(client, auth_headers)

    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "delother@example.com",
            "password": "Other1234",
            "full_name": "Del Other",
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "delother@example.com", "password": "Other1234"},
    )
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    resp = await client.delete(
        f"/api/v1/dogs/{dog['id']}", headers=other_headers
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Breeds list
# ---------------------------------------------------------------------------


async def test_list_breeds(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/breeds")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "Golden Retriever" in data


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


async def test_health_check(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
