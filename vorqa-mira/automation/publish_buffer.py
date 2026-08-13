#!/usr/bin/env python3
"""Future Buffer integration placeholder.

V3 intentionally does not auto-publish. This script only inspects approved or
scheduled content and reports what would be eligible for a future Buffer queue.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APPROVED = ROOT / "content" / "approved"
CALENDAR = ROOT / "calendar" / "social_calendar.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def eligible_items() -> list[dict]:
    items = []
    for path in sorted(APPROVED.glob("*.json")):
        data = load_json(path)
        if data.get("status") in {"APPROVED", "SCHEDULED"} and data.get("human_approved") is True:
            items.append({"path": str(path), "id": data.get("id"), "status": data.get("status")})
    return items


def main() -> int:
    parser = argparse.ArgumentParser(description="Dry-run future Buffer publishing queue.")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Only print eligible items.")
    args = parser.parse_args()

    token_present = bool(os.getenv("BUFFER_API_TOKEN"))
    calendar = load_json(CALENDAR)
    items = eligible_items()

    report = {
        "auto_publish": False,
        "dry_run": args.dry_run,
        "buffer_token_present": token_present,
        "calendar_queue_count": len(calendar.get("queue", [])),
        "eligible_approved_files": items,
        "message": "No content was published. Buffer API behavior is intentionally not implemented in V3."
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
