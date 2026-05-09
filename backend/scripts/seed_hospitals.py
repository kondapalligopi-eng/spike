"""Seed the hospitals table with the 6 verified Bengaluru hospitals if the
table is empty. Idempotent — skips when any rows already exist.

Run via:  python scripts/seed_hospitals.py
"""
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
from app.models.hospital import Hospital  # noqa: E402


SEED = [
    {
        "name": "SKS Veterinary Hospital",
        "locality": "Indiranagar",
        "address": "17, Service Rd, Geethanjali Layout, HAL 3rd Stage, New Tippasandra, Bengaluru 560075",
        "specialties": "General, Surgery, Diagnostics, Grooming",
        "rating": "4.7",
        "phone": "+91 80 4000 0000",
        "website": "https://www.skspethospital.com/indira-nagar/",
    },
    {
        "name": "V-Care Pet Polyclinic",
        "locality": "Koramangala",
        "address": "No. 15, 1st Main, 1st Block, near Kabab Magic, Koramangala, Bengaluru",
        "specialties": "General, Dentistry, Vaccination",
        "rating": "4.6",
        "phone": "+918147006342",
        "website": "http://www.vcarepetpolyclinic.com/",
    },
    {
        "name": "V-Care Pet Polyclinic",
        "locality": "Whitefield",
        "address": "Opposite CSI Church, Whitefield, Bengaluru 560066",
        "specialties": "General, Surgery, Pet Supplies",
        "rating": "4.6",
        "phone": "+918147006341",
        "website": "http://www.vcarepetpolyclinic.com/",
    },
    {
        "name": "Vetic Pet Clinic",
        "locality": "HSR Layout",
        "address": "1070, Ground Floor, MM Heights, 24th Main Rd, near HSR Layout Police Station, Bengaluru",
        "specialties": "24x7 Care, General, Diagnostics",
        "rating": "4.8",
        "phone": "+91 80 4000 0000",
        "website": "https://vetic.in/clinics/bengaluru/hsr-bengaluru",
    },
    {
        "name": "Dr. Doodley Pet Hospital",
        "locality": "Jayanagar",
        "address": "No. 18, 1356, 4th T Block East, 32nd E Cross Road, Jayanagar, Bengaluru 560041",
        "specialties": "General, Surgery, Emergency",
        "rating": "4.7",
        "phone": "+919902356133",
        "website": "https://doodley.in/",
    },
    {
        "name": "Cessna Lifeline Veterinary Hospital",
        "locality": "Domlur",
        "address": "No. 148, Near Fiat Showroom, HCBS Amarjyothi Layout, KGA Road, Domlur, Bengaluru 560071",
        "specialties": "Multispecialty, Emergency, Surgery, Boarding",
        "rating": "4.8",
        "phone": "+917676365365",
        "website": "https://cessnalifeline.com/",
    },
]


async def main() -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Hospital.id).limit(1))
        if result.first() is not None:
            print("[seed_hospitals] Hospitals table already has rows — skipping.")
            return 0

        for entry in SEED:
            db.add(Hospital(**entry))
        await db.commit()
        print(f"[seed_hospitals] Inserted {len(SEED)} hospitals.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
