#!/usr/bin/env python3
"""Generate AI-assisted Mira/VORQA draft JSON safely."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

import ai_provider
from adapt_platforms import adapt
from validate_facts import validate_text


ROOT = Path(__file__).resolve().parents[1]
DRAFTS = ROOT / "content" / "drafts"
IDEAS = ROOT / "content" / "ideas"
CONTEXT = ROOT / "context"

CONTENT_TYPES = {
    "Procurement Education",
    "RFQ Guidance",
    "Technical-Commercial Comparison",
    "Supplier Evaluation",
    "Sourcing from Türkiye",
    "Product/Supply Category Insight",
    "Market Intelligence",
    "Industry Terminology",
    "VORQA Corporate",
    "Partner Capability",
    "Case / RFQ Learning",
}

SOURCE_CLASSES = {"PUBLIC", "INTERNAL_SAFE", "CONFIDENTIAL", "CLIENT_CONFIDENTIAL"}
SENSITIVE_SOURCE_CLASSES = {"CONFIDENTIAL", "CLIENT_CONFIDENTIAL"}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:70] or "mira-draft"


def read_context_files() -> dict[str, str]:
    names = [
        "VORQA_TRUTH.md",
        "BRAND_RULES.md",
        "LANGUAGE_RULES.md",
        "PLATFORM_RULES.md",
        "MENA_CULTURE.md",
        "SALES_RULES.md",
        "CONTENT_TYPES.md",
        "MARKET_INTELLIGENCE.md",
    ]
    return {name: (CONTEXT / name).read_text(encoding="utf-8") for name in names if (CONTEXT / name).exists()}


def build_prompt(args: argparse.Namespace, context: dict[str, str]) -> str:
    persona_rule = "Mira is an AI analyst persona, not a real employee." if args.persona == "MIRA" else "Use the VORQA corporate voice."
    source_rule = (
        "Source material is approved for drafting." if args.source_class in {"PUBLIC", "INTERNAL_SAFE"} else
        "Source material is confidential; summarize only as private notes and do not expose details."
    )
    context_digest = "\n\n".join(f"## {name}\n{text[:3500]}" for name, text in context.items())
    return f"""
You are generating a safe VORQA Mira content draft.

Persona: {args.persona}
Language: {args.language}
Content type: {args.content_type}
Platform goal: {args.platform_goal}
Topic: {args.topic}
Optional CTA: {args.cta or "None"}
Visual intent: {args.visual_intent or "None"}
Source class: {args.source_class}
Source material:
{args.source_material or "None supplied"}

Rules:
- {persona_rule}
- {source_rule}
- Use only APPROVED facts from VORQA_TRUTH without verification.
- Partner capabilities must be described as partner/supplier/network capabilities.
- Do not invent numbers, customers, projects, certifications, countries, capacities, response times, or supplier counts.
- Never create APPROVED content automatically.
- Output only the draft body, no meta commentary.

Context:
{context_digest}
""".strip()


def build_visual_brief(topic: str, language: str, content_type: str, visual_intent: str | None) -> dict:
    return {
        "format": "carousel or static educational graphic",
        "aspect_ratio": {
            "linkedin": "1200x1200 or carousel",
            "instagram": "1080x1350 preferred feed portrait",
            "facebook": "1200x630"
        },
        "headline": topic,
        "supporting_text": "Use concise educational wording from the approved/adapted copy.",
        "image_type": visual_intent or "branded diagram, component graphic, process visual, or typography-led industrial visual",
        "real_imagery_required": False,
        "canva_template_category": content_type.lower().replace(" ", "-").replace("/", "-"),
        "language_version": language,
        "cta_placement": "caption ending or final carousel slide",
        "warnings": [
            "Do not use invented or non-approved project images.",
            "If real industrial imagery is used, confirm source and approval before publishing."
        ]
    }


def should_store_source_material(source_class: str) -> bool:
    return source_class not in SENSITIVE_SOURCE_CLASSES


def persisted_source_fields(args: argparse.Namespace) -> dict:
    if should_store_source_material(args.source_class):
        return {
            "source_class": args.source_class,
            "source_material_stored": bool(args.source_material),
            "source_material": args.source_material,
            "source_summary": args.source_material[:500] if args.source_material else None,
        }
    return {
        "source_class": args.source_class,
        "source_material_stored": False,
        "source_summary": None,
    }


def confidential_snippets(source_material: str) -> list[str]:
    snippets = []
    clean = source_material.strip()
    if clean:
        snippets.append(clean)
    for line in source_material.splitlines():
        stripped = line.strip()
        if len(stripped) >= 8:
            snippets.append(stripped)
    return sorted(set(snippets), key=len, reverse=True)


def redact_confidential_echo(text: str, source_material: str) -> str:
    redacted = text
    for snippet in confidential_snippets(source_material):
        redacted = redacted.replace(snippet, "[redacted confidential source detail]")
    return redacted


def redact_confidential_adaptations(adaptations: dict, source_material: str) -> dict:
    encoded = json.dumps(adaptations, ensure_ascii=False)
    encoded = redact_confidential_echo(encoded, source_material)
    return json.loads(encoded)


def create_draft(args: argparse.Namespace) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    context = read_context_files()
    prompt = build_prompt(args, context)
    ai = ai_provider.generate(prompt, args.topic, args.language, args.persona, args.content_type, args.source_material, args.cta)
    master = ai.text
    if not master:
        master = (
            f"{args.topic}\n\n"
            "AI generation is unavailable. Add a human-written draft here, then run fact validation and platform adaptation."
        )
    if args.source_class in SENSITIVE_SOURCE_CLASSES:
        master = redact_confidential_echo(master, args.source_material)
    platform_targets = [p.strip().lower() for p in args.platform_targets.split(",") if p.strip()]
    platform_adaptations = adapt(master, args.topic, args.persona, args.language, args.content_type, args.cta)
    platform_adaptations = {k: v for k, v in platform_adaptations.items() if k in platform_targets}
    if args.source_class in SENSITIVE_SOURCE_CLASSES:
        platform_adaptations = redact_confidential_adaptations(platform_adaptations, args.source_material)
    validation = validate_text(master + "\n" + json.dumps(platform_adaptations, ensure_ascii=False))
    status = "NEEDS_REVIEW" if validation["verify_before_use"] or validation["prohibited"] else "DRAFT"
    draft = {
        "version": "3.1",
        "id": f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{slugify(args.topic)}",
        "created_at": now,
        "updated_at": now,
        "topic": args.topic,
        "persona": args.persona,
        "persona_label": "Mira | VORQA AI Industry Analyst" if args.persona == "MIRA" else "VORQA Global Supply",
        "content_type": args.content_type,
        "platform_goal": args.platform_goal,
        "master_language": args.language,
        "master_content": master,
        "sources_used": sorted(context.keys()),
        "platform_targets": platform_targets,
        "fact_validation": validation,
        "platform_adaptations": platform_adaptations,
        "visual_brief": build_visual_brief(args.topic, args.language, args.content_type, args.visual_intent),
        "generation": {
            "mode": ai.mode,
            "provider": ai.provider,
            "model": ai.model,
            "error": ai.error,
        },
        "status": status,
        "human_approved": False,
        "approval": {
            "approved_by": None,
            "approved_at": None,
            "notes": []
        }
    }
    draft.update(persisted_source_fields(args))
    return draft


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a safe AI-assisted Mira/VORQA draft.")
    parser.add_argument("--topic", required=True)
    parser.add_argument("--platform-goal", default="education")
    parser.add_argument("--language", default="EN", choices=["EN", "TR", "AR"])
    parser.add_argument("--persona", default="MIRA", choices=["VORQA", "MIRA"])
    parser.add_argument("--content-type", default="Procurement Education", choices=sorted(CONTENT_TYPES))
    parser.add_argument("--source-material", default="")
    parser.add_argument("--source-class", default="PUBLIC", choices=sorted(SOURCE_CLASSES))
    parser.add_argument("--cta", default="")
    parser.add_argument("--visual-intent", default="")
    parser.add_argument("--platform-targets", default="linkedin,instagram,facebook")
    parser.add_argument("--idea", action="store_true", help="Save as IDEA into content/ideas.")
    args = parser.parse_args()

    target_dir = IDEAS if args.idea else DRAFTS
    target_dir.mkdir(parents=True, exist_ok=True)
    draft = create_draft(args)
    if args.idea:
        draft["status"] = "IDEA"
    path = target_dir / f"{draft['id']}.json"
    path.write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
