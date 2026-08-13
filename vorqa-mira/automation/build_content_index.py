#!/usr/bin/env python3
"""Build content/index.json for the static Mira dashboard."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
INDEX = CONTENT / "index.json"
FOLDERS = {
    "ideas": "IDEA",
    "drafts": "DRAFT",
    "approved": "APPROVED",
    "published": "PUBLISHED",
}


def read_item(path: Path, fallback_status: str) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    return {
        "id": data.get("id", path.stem),
        "path": str(path.relative_to(ROOT)).replace("\\", "/"),
        "topic": data.get("topic", path.stem),
        "status": data.get("status", fallback_status),
        "persona": data.get("persona", ""),
        "content_type": data.get("content_type", ""),
        "master_language": data.get("master_language") or data.get("language", ""),
        "platform_targets": data.get("platform_targets", []),
        "human_approved": data.get("human_approved") is True,
        "fact_validation": data.get("fact_validation", {}),
        "generation": data.get("generation", {}),
        "updated_at": data.get("updated_at") or data.get("created_at"),
    }


def build_index() -> dict:
    items = []
    for folder, fallback_status in FOLDERS.items():
        for path in sorted((CONTENT / folder).glob("*.json")):
            items.append(read_item(path, fallback_status))
    counts = {status: 0 for status in ["IDEA", "DRAFT", "NEEDS_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "REJECTED"]}
    for item in items:
        counts[item["status"]] = counts.get(item["status"], 0) + 1
    return {
        "version": "3.1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "items": items,
        "counts": counts,
    }


def main() -> int:
    INDEX.write_text(json.dumps(build_index(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(INDEX)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
