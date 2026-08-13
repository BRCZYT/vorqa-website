#!/usr/bin/env python3
"""Adapt a master draft for LinkedIn, Instagram, and Facebook.

Adaptations are derived from the provided master content and preserve the
topic rather than replacing it with generic RFQ copy.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from validate_facts import validate_text


PLATFORM_TARGETS = ("linkedin", "instagram", "facebook")


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def sentences(text: str) -> list[str]:
    clean = re.sub(r"\s+", " ", text.strip())
    if not clean:
        return []
    return [part.strip() for part in re.split(r"(?<=[.!?؟])\s+", clean) if part.strip()]


def topic_terms(topic: str) -> set[str]:
    stop = {"the", "and", "for", "with", "from", "how", "what", "why", "bir", "ile", "için", "في", "من", "على"}
    terms = {t.lower() for t in re.findall(r"[\wığüşöçİĞÜŞÖÇ]+", topic, flags=re.UNICODE)}
    return {t for t in terms if len(t) > 3 and t not in stop}


def continuity_score(topic: str, copy: str) -> dict:
    terms = topic_terms(topic)
    if not terms:
        return {"score": 1.0, "missing_terms": []}
    copy_lower = copy.lower()
    present = {term for term in terms if term in copy_lower}
    missing = sorted(terms - present)
    return {"score": round(len(present) / len(terms), 2), "missing_terms": missing}


def trim_words(text: str, limit: int) -> str:
    words = text.split()
    if len(words) <= limit:
        return text
    return " ".join(words[:limit]).rstrip(".,;:") + "..."


def remove_topic_heading(master: str, topic: str) -> str:
    clean = master.strip()
    pattern = re.compile(r"^\s*" + re.escape(topic.strip()) + r"\s*", re.IGNORECASE)
    clean = pattern.sub("", clean, count=1).strip()
    return clean or master.strip()


def content_body(master: str, topic: str) -> str:
    clean = remove_topic_heading(master, topic)
    lines = []
    for line in clean.splitlines():
        stripped = line.strip()
        if not stripped:
            lines.append("")
            continue
        if stripped.startswith("Mira |") or stripped == "VORQA Global Supply":
            continue
        if stripped.endswith("?") and len(stripped.split()) <= 14:
            continue
        lines.append(line)
    return "\n".join(lines).strip() or clean


def build_hashtags(topic: str, content_type: str) -> list[str]:
    tags = ["#Procurement", "#IndustrialSourcing", "#B2B"]
    if "rfq" in topic.lower() or "rfq" in content_type.lower():
        tags.append("#RFQ")
    if "Türkiye" in topic or "Turkiye" in topic or "turkiye" in topic.lower():
        tags.append("#Turkiye")
    if "supplier" in topic.lower():
        tags.append("#SupplierEvaluation")
    return tags[:5]


def visual_brief_for(topic: str, language: str, content_type: str, platform: str) -> dict:
    aspect = {"linkedin": "1200x1200 or carousel", "instagram": "1080x1350", "facebook": "1200x630"}[platform]
    return {
        "format": "carousel" if platform in {"linkedin", "instagram"} else "static post graphic",
        "aspect_ratio": aspect,
        "headline": trim_words(topic, 10),
        "supporting_text": "One clear procurement insight per slide or graphic.",
        "image_type": "branded diagram, component graphic, process visual, or typography-led industrial visual",
        "real_imagery_required": False,
        "canva_template_category": "educational-industrial",
        "language_version": language,
        "cta_placement": "final slide or caption ending",
    }


def adapt(master: str, topic: str, persona: str = "MIRA", language: str = "EN", content_type: str = "Procurement Education", cta: str | None = None) -> dict:
    body = content_body(master, topic)
    parts = sentences(body)
    first = parts[0] if parts else topic
    middle = " ".join(parts[1:4]) if len(parts) > 1 else body
    cta_text = cta or "What would you clarify first before comparing options?"
    signature = "Mira | VORQA AI Industry Analyst" if persona == "MIRA" else "VORQA Global Supply"
    hashtags = " ".join(build_hashtags(topic, content_type))

    linkedin = (
        f"{topic}\n\n"
        f"{trim_words(first, 28)}\n\n"
        f"{trim_words(middle or body, 120)}\n\n"
        f"{cta_text}\n\n"
        f"{signature}\n"
        f"{hashtags}"
    ).strip()

    instagram = (
        f"{topic}\n\n"
        f"{trim_words(first, 22)}\n\n"
        f"{trim_words(body, 55)}\n\n"
        f"{signature}\n"
        f"{hashtags}"
    ).strip()

    facebook = (
        f"{topic}\n\n"
        f"{trim_words(body, 85)}\n\n"
        "Human approval required before publishing."
    ).strip()

    result = {
        "linkedin": {
            "status": "DRAFT",
            "copy": linkedin,
            "continuity": continuity_score(topic, linkedin),
            "visual_brief": visual_brief_for(topic, language, content_type, "linkedin"),
        },
        "instagram": {
            "status": "DRAFT",
            "copy": instagram,
            "continuity": continuity_score(topic, instagram),
            "visual_brief": visual_brief_for(topic, language, content_type, "instagram"),
        },
        "facebook": {
            "status": "DRAFT",
            "copy": facebook,
            "continuity": continuity_score(topic, facebook),
            "visual_brief": visual_brief_for(topic, language, content_type, "facebook"),
        },
    }
    for platform_data in result.values():
        platform_data["notes"] = ["Derived from master_content. Human review required."]
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Add platform adaptations to a Mira draft JSON file.")
    parser.add_argument("path", help="Draft JSON path.")
    args = parser.parse_args()

    path = Path(args.path)
    data = load(path)
    data["platform_adaptations"] = adapt(
        data.get("master_content", ""),
        data.get("topic", "Industrial procurement guidance"),
        data.get("persona", "MIRA"),
        data.get("master_language") or data.get("language", "EN"),
        data.get("content_type", "Procurement Education"),
        data.get("cta"),
    )
    validation_text = json.dumps(data["platform_adaptations"], ensure_ascii=False)
    data["fact_validation"] = validate_text(validation_text + "\n" + data.get("master_content", ""))
    data["status"] = "NEEDS_REVIEW" if data["fact_validation"]["verify_before_use"] else "DRAFT"
    if data["fact_validation"]["prohibited"]:
        data["status"] = "NEEDS_REVIEW"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
