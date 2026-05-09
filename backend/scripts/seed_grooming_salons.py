"""Seed the grooming_salons table with the 4 default salons if empty."""
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
from app.models.grooming_salon import GroomingSalon  # noqa: E402


SEED = [
    {
        "name": "Pawsh Paws Grooming Studio",
        "area": "Indiranagar",
        "city": "Bengaluru",
        "state": "KA",
        "address": "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
        "phone": "+91 80 4123 1816",
        "rating_avg": 4.7,
        "rating_count": 242,
        "tint": "from-amber-200 to-amber-400",
        "hero_emoji": "✂️",
    },
    {
        "name": "Wagging Tails Pet Spa",
        "area": "Koramangala",
        "city": "Bengaluru",
        "state": "KA",
        "address": "80 Feet Rd, 4th Block, Koramangala, Bengaluru 560034",
        "phone": "+91 80 4567 2200",
        "rating_avg": 4.8,
        "rating_count": 215,
        "tint": "from-rose-200 to-rose-400",
        "hero_emoji": "🛁",
    },
    {
        "name": "Snip & Snout Pet Salon",
        "area": "HSR Layout",
        "city": "Bengaluru",
        "state": "KA",
        "address": "27th Main, Sector 2, HSR Layout, Bengaluru 560102",
        "phone": "+91 80 4321 9988",
        "rating_avg": 4.8,
        "rating_count": 182,
        "tint": "from-emerald-200 to-emerald-500",
        "hero_emoji": "💅",
    },
    {
        "name": "The Furry Tale Grooming",
        "area": "Whitefield",
        "city": "Bengaluru",
        "state": "KA",
        "address": "ITPL Main Rd, near Phoenix Marketcity, Whitefield, Bengaluru 560066",
        "phone": "+91 80 4900 7711",
        "rating_avg": 4.7,
        "rating_count": 163,
        "tint": "from-sky-200 to-sky-500",
        "hero_emoji": "✂️",
    },
]


async def main() -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(GroomingSalon.id).limit(1))
        if result.first() is not None:
            print("[seed_grooming_salons] grooming_salons table already has rows — skipping.")
            return 0
        for entry in SEED:
            db.add(GroomingSalon(**entry))
        await db.commit()
        print(f"[seed_grooming_salons] Inserted {len(SEED)} grooming salons.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
