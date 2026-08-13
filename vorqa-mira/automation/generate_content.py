#!/usr/bin/env python3
"""Create a safe Mira draft skeleton from a topic.

This script does not call an AI model. It creates a structured draft that can be
expanded by a human or by a future approved generator after fact validation.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from validate_facts import PROHIBITED_PATTERNS, VERIFY_PATTERNS, iter_matches


ROOT = Path(__file__).resolve().parents[1]
DRAFTS = ROOT / "content" / "drafts"
IDEAS = ROOT / "content" / "ideas"


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:70] or "mira-draft"


def build_draft(topic: str, language: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    master = (
        f"Topic: {topic}\n\n"
        "Angle: Educational procurement guidance from Mira.\n\n"
        "Draft notes:\n"
        "- Start from a buyer-side problem or RFQ question.\n"
        "- Explain why specification clarity matters.\n"
        "- Mention VORQA only as an industrial procurement and project-supply coordination partner.\n"
        "- Add no numbers, certificates, customer names, countries, or capacities unless verified."
    )
    text_for_validation = topic + "\n" + master
    return {
        "version": "3.0",
        "id": f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{slugify(topic)}",
        "created_at": now,
        "updated_at": now,
        "status": "DRAFT",
        "human_approved": False,
        "language": language,
        "topic": topic,
        "persona": "Mira | VORQA AI Industry Analyst",
        "brand_voice_owner": "VORQA",
        "master_content": master,
        "platform_adaptations": {},
        "visual_brief": {
            "format": "educational graphic or carousel",
            "notes": [
                "Use approved VORQA brand assets.",
                "Do not show fake facilities, fake products, or invented projects.",
                "Flag any required real image source for human approval."
            ]
        },
        "fact_validation": {
            "prohibited": list(iter_matches(PROHIBITED_PATTERNS, text_for_validation)),
            "verify_before_use": list(iter_matches(VERIFY_PATTERNS, text_for_validation)),
            "human_review_required": True
        },
        "approval": {
            "approved_by": None,
            "approved_at": None,
            "notes": []
        }
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a safe Mira draft skeleton.")
    parser.add_argument("--topic", required=True, help="Content topic or idea.")
    parser.add_argument("--language", default="EN", choices=["EN", "TR", "AR"], help="Master draft language.")
    parser.add_argument("--idea", action="store_true", help="Save to content/ideas instead of drafts.")
    args = parser.parse_args()

    target_dir = IDEAS if args.idea else DRAFTS
    target_dir.mkdir(parents=True, exist_ok=True)
    draft = build_draft(args.topic, args.language)
    if args.idea:
        draft["status"] = "IDEA"
    path = target_dir / f"{draft['id']}.json"
    path.write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
