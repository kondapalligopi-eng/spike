"""Seed the parks table with the 6 default Bengaluru parks if empty."""
from __future__ import annotations

import asyncio
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.dirname(_HERE)
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

from sqlalchemy import select  # noqa: E402

from app.database import AsyncSessionLocal  # noqa: E402
from app.models.park import Park  # noqa: E402


_DEFAULT_HIGHLIGHTS = [
    "Neighborhood park with on and off-leash dog play areas",
    "Restrooms and shaded benches available",
    "Street parking only",
    "Popular spot to socialize with other dog owners",
]


SEED = [
    {
        "name": "Cubbon Park",
        "locality": "Sampangi Rama Nagar, Bengaluru",
        "rating": 5,
        "image_url": "/parks/cubbon-park.jpg",
        "address": "Kasturba Road, Sampangi Rama Nagar, Bengaluru, Karnataka 560001",
        "hours": "5 am to 8 pm",
        "cost": "Free to use, may need to pay for parking",
        "off_leash": "Yes, in designated areas only",
        "features": "Walking trails, Playground, Restrooms",
        "phone": None,
        "website": None,
        "highlights": _DEFAULT_HIGHLIGHTS,
    },
    {
        "name": "Lalbagh Botanical Garden",
        "locality": "Mavalli, Bengaluru",
        "rating": 5,
        "image_url": "/parks/lalbagh.jpg",
        "address": "Mavalli, Bengaluru, Karnataka 560004",
        "hours": "6 am to 7 pm",
        "cost": "₹20 entry; free under 12",
        "off_leash": "On-leash only",
        "features": "Glass house, Lake, Walking trails",
        "phone": None,
        "website": None,
        "highlights": _DEFAULT_HIGHLIGHTS,
    },
    {
        "name": "Agara Lake Park",
        "locality": "HSR Layout, Bengaluru",
        "rating": 4,
        "image_url": "/parks/agara.jpg",
        "address": "HSR Layout, Bengaluru, Karnataka 560102",
        "hours": "5 am to 9 pm",
        "cost": "Free to use",
        "off_leash": "On-leash only",
        "features": "Lakeside walk, Jogging track",
        "phone": None,
        "website": None,
        "highlights": _DEFAULT_HIGHLIGHTS,
    },
    {
        "name": "Indiranagar Defence Colony Park",
        "locality": "Indiranagar, Bengaluru",
        "rating": 4,
        "image_url": "/parks/indiranagar.jpg",
        "address": "Defence Colony, Indiranagar, Bengaluru 560038",
        "hours": "5 am to 8 pm",
        "cost": "Free to use",
        "off_leash": "Yes, in designated areas",
        "features": "Off-leash zone, Playground, Restrooms",
        "phone": None,
        "website": None,
        "highlights": _DEFAULT_HIGHLIGHTS,
    },
    {
        "name": "Bellandur Lake Park",
        "locality": "Bellandur, Bengaluru",
        "rating": 4,
        "image_url": "/parks/bellandur.jpg",
        "address": "Bellandur, Bengaluru, Karnataka 560103",
        "hours": "6 am to 7 pm",
        "cost": "Free to use",
        "off_leash": "On-leash only",
        "features": "Lake views, Walking trails",
        "phone": None,
        "website": None,
        "highlights": _DEFAULT_HIGHLIGHTS,
    },
    {
        "name": "Whitefield Memorial Park",
        "locality": "Whitefield, Bengaluru",
        "rating": 4,
        "image_url": "/parks/whitefield.jpg",
        "address": "Whitefield, Bengaluru, Karnataka 560066",
        "hours": "5 am to 9 pm",
        "cost": "Free to use",
        "off_leash": "Yes, in designated areas",
        "features": "Walking trails, Benches, Off-leash zone",
        "phone": None,
        "website": None,
        "highlights": _DEFAULT_HIGHLIGHTS,
    },
]


async def main() -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Park.id).limit(1))
        if result.first() is not None:
            print("[seed_parks] Parks table already has rows — skipping.")
            return 0
        for entry in SEED:
            db.add(Park(**entry))
        await db.commit()
        print(f"[seed_parks] Inserted {len(SEED)} parks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
