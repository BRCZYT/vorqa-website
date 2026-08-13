#!/usr/bin/env python3
"""Adapt a Mira master draft for LinkedIn, Instagram, and Facebook.

The adaptation is conservative and template-based. It does not publish content.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from validate_facts import PROHIBITED_PATTERNS, VERIFY_PATTERNS, iter_matches


ACTIVE_PLATFORMS = ("linkedin", "instagram", "facebook")


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_text(text: str) -> dict:
    return {
        "prohibited": list(iter_matches(PROHIBITED_PATTERNS, text)),
        "verify_before_use": list(iter_matches(VERIFY_PATTERNS, text)),
        "human_review_required": True
    }


def adapt(master: str, topic: str) -> dict:
    safe_note = "Final copy must be reviewed against VORQA_TRUTH.md before approval."
    return {
        "linkedin": {
            "status": "DRAFT",
            "copy": (
                f"{topic}\n\n"
                "A good industrial RFQ does more than ask for a price. It explains the requirement, the operating context, "
                "the compliance points, and the delivery constraints clearly enough for suppliers to respond on the same basis.\n\n"
                "That is where technical-commercial comparison becomes useful: not to choose the cheapest option, but to make "
                "the risks visible before the purchase decision.\n\n"
                "What is the one specification detail you always check before comparing offers?\n\n"
                "Mira | VORQA AI Industry Analyst\n"
                "#Procurement #IndustrialSourcing #SupplyChain #Turkiye #B2B"
            ),
            "notes": [safe_note]
        },
        "instagram": {
            "status": "DRAFT",
            "copy": (
                f"{topic}\n\n"
                "Before comparing prices, compare the requirement.\n\n"
                "Clear specifications help suppliers quote on the same basis and help buyers see risk earlier.\n\n"
                "Mira | VORQA AI Industry Analyst\n"
                "#Procurement #IndustrialSourcing #B2B"
            ),
            "visual_brief": [
                "Carousel: 5 slides.",
                "Slide 1: RFQ clarity question.",
                "Slides 2-4: requirement, compliance, lead-time.",
                "Slide 5: human-approved VORQA CTA."
            ],
            "notes": [safe_note]
        },
        "facebook": {
            "status": "DRAFT",
            "copy": (
                f"{topic}\n\n"
                "For industrial procurement, a clear requirement makes supplier comparison easier and reduces avoidable surprises. "
                "Mira content should educate buyers before the commercial conversation starts.\n\n"
                "Human approval required before publishing."
            ),
            "notes": [safe_note]
        }
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Add platform adaptations to a Mira draft JSON file.")
    parser.add_argument("path", help="Draft JSON path.")
    parser.add_argument("--in-place", action="store_true", default=True, help="Update the file in place.")
    args = parser.parse_args()

    path = Path(args.path)
    data = load(path)
    data["platform_adaptations"] = adapt(data.get("master_content", ""), data.get("topic", "Industrial procurement guidance"))
    validation_text = json.dumps(data["platform_adaptations"], ensure_ascii=False)
    data["fact_validation"] = validate_text(validation_text + "\n" + data.get("master_content", ""))
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    if data.get("status") == "IDEA":
        data["status"] = "DRAFT"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
