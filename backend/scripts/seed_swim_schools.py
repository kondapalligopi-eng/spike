"""Seed the swim_schools table with the 6 default swim schools if empty."""
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
from app.models.swim_school import SwimSchool  # noqa: E402


SEED = [
    {
        "name": "Indiranagar Aquatic Pet Centre",
        "locality": "Indiranagar, Bengaluru",
        "rating": 5,
        "image_url": "/swim/swim1.jpg",
        "address": "12, 100 Feet Rd, Indiranagar, Bengaluru 560038",
        "hours": "7 am to 9 pm",
        "cost": "₹600 per 30-min session",
        "pool_type": "Heated indoor pool",
        "highlights": [
            "Climate-controlled, pH-balanced water at 28-30°C",
            "Certified canine swim coaches with small-batch sessions",
            "Life-jacket rental and post-swim towel-dry included",
            "Suitable for all breeds, including brachycephalic dogs",
        ],
    },
    {
        "name": "Whitefield Splash Academy",
        "locality": "Whitefield, Bengaluru",
        "rating": 5,
        "image_url": "/swim/swim2.jpg",
        "address": "Forum Value Mall area, Whitefield, Bengaluru 560066",
        "hours": "6:30 am to 8 pm",
        "cost": "₹500 per 30-min session",
        "pool_type": "Outdoor heated pool",
        "highlights": [
            "Year-round heated water for outdoor swim sessions",
            "Hydrotherapy programs for senior dogs and post-surgery recovery",
            "On-site rest area with shaded benches for owners",
            "Large pool with shallow zone for first-time swimmers",
        ],
    },
    {
        "name": "HSR Canine Swim Club",
        "locality": "HSR Layout, Bengaluru",
        "rating": 4,
        "image_url": "/swim/swim3.jpg",
        "address": "24th Main Rd, HSR Layout, Bengaluru 560102",
        "hours": "7 am to 8:30 pm",
        "cost": "₹550 per 30-min session",
        "pool_type": "Heated indoor pool",
        "highlights": [
            "Group play sessions on weekends",
            "Underwater treadmill for rehabilitation",
            "Parking available for members",
            "On-site pet groomer for post-swim cleanup",
        ],
    },
    {
        "name": "Sarjapur Splash & Paddle",
        "locality": "Sarjapur Road, Bengaluru",
        "rating": 4,
        "image_url": "/swim/swim4.jpg",
        "address": "Sarjapur Main Rd, near Wipro Gate, Bengaluru 560035",
        "hours": "6 am to 9 pm",
        "cost": "₹650 per 30-min session",
        "pool_type": "Heated indoor pool",
        "highlights": [
            "Spacious pool with separate beginner and advanced lanes",
            "Trainers experienced with rescue and adopted dogs",
            "Cafe on-site for owners",
            "Open-swim hours every Saturday",
        ],
    },
    {
        "name": "Koramangala Pet Pool Club",
        "locality": "Koramangala, Bengaluru",
        "rating": 4,
        "image_url": "/swim/swim5.jpg",
        "address": "5th Block, Koramangala, Bengaluru 560095",
        "hours": "7 am to 8 pm",
        "cost": "₹600 per 30-min session",
        "pool_type": "Heated indoor pool",
        "highlights": [
            "Solo and group sessions available",
            "Compact but well-equipped facility",
            "Easy access from BTM, HSR, and Indiranagar",
            "Specialised programs for puppies under 6 months",
        ],
    },
    {
        "name": "Domlur Aquatic Hub",
        "locality": "Domlur, Bengaluru",
        "rating": 4,
        "image_url": "/swim/swim6.jpg",
        "address": "KGA Road, Domlur, Bengaluru 560071",
        "hours": "6:30 am to 9 pm",
        "cost": "₹550 per 30-min session",
        "pool_type": "Heated indoor pool",
        "highlights": [
            "Vet on call for hydrotherapy referrals",
            "24x7 emergency consult line",
            "Towel-dry and brush-out post-swim",
            "Subscription packages with monthly discounts",
        ],
    },
]


async def main() -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SwimSchool.id).limit(1))
        if result.first() is not None:
            print("[seed_swim_schools] Swim_schools table already has rows — skipping.")
            return 0
        for entry in SEED:
            db.add(SwimSchool(**entry))
        await db.commit()
        print(f"[seed_swim_schools] Inserted {len(SEED)} swim schools.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
