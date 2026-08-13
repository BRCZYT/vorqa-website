#!/usr/bin/env python3
"""Inspect future Buffer publishing eligibility.

Live Buffer publishing remains disabled in V3.1. This script separates queue
inspection, validation, and future API-readiness without posting anything.
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


def has_clean_validation(data: dict) -> bool:
    validation = data.get("fact_validation", {})
    return not validation.get("prohibited")


def inspect_approved_files() -> list[dict]:
    items = []
    for path in sorted(APPROVED.glob("*.json")):
        data = load_json(path)
        status_ok = data.get("status") in {"APPROVED", "SCHEDULED"}
        approval_ok = data.get("human_approved") is True
        validation_ok = has_clean_validation(data)
        items.append(
            {
                "path": str(path),
                "id": data.get("id"),
                "status": data.get("status"),
                "human_approved": data.get("human_approved") is True,
                "fact_validation_clean": validation_ok,
                "eligible": status_ok and approval_ok and validation_ok,
            }
        )
    return items


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect future Buffer publishing queue.")
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--publish", action="store_true", help="Rejected in V3.1; live publishing is disabled.")
    args = parser.parse_args()

    calendar = load_json(CALENDAR)
    items = inspect_approved_files()
    report = {
        "live_publishing_enabled": False,
        "requested_publish": args.publish,
        "buffer_token_present": bool(os.getenv("BUFFER_API_TOKEN")),
        "calendar_queue_count": len(calendar.get("queue", [])),
        "eligible_items": [item for item in items if item["eligible"]],
        "all_items": items,
        "message": "No content was published. V3.1 supports queue inspection only."
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 2 if args.publish else 0


if __name__ == "__main__":
    raise SystemExit(main())
