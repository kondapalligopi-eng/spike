"""Shared bounds for the public directory list endpoints."""
from __future__ import annotations

#: Hard ceiling on rows returned by a single directory list request.
#:
#: This is a guard against unbounded growth and bulk pulls, NOT a page size.
#: The directory pages (Hospital, Park, Swimming, Grooming) build their locality
#: and specialty dropdowns from the whole result set and then filter client-side,
#: so the default has to cover every row — lowering it below the real row count
#: would silently empty those dropdowns and hide listings with no error anywhere.
#:
#: It currently sits far above the actual data (low tens of rows per directory).
#: Before this can be lowered to a true page size, search and faceting have to
#: move server-side.
MAX_LIST_LIMIT = 500
