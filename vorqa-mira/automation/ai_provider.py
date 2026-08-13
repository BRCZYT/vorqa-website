#!/usr/bin/env python3
"""Provider-neutral AI generation for Mira.

Environment variables:
  MIRA_AI_PROVIDER=openai|anthropic|mock|disabled
  MIRA_AI_MODE=LIVE|MOCK|DISABLED|AUTO
  OPENAI_API_KEY=...
  ANTHROPIC_API_KEY=...

No secrets are read from browser code or stored in content JSON.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass


OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")


@dataclass
class AIResult:
    mode: str
    provider: str
    text: str
    model: str | None = None
    error: str | None = None


def resolve_provider() -> str:
    return os.getenv("MIRA_AI_PROVIDER", "mock").strip().lower()


def resolve_mode(provider: str) -> str:
    requested = os.getenv("MIRA_AI_MODE", "AUTO").strip().upper()
    if requested in {"LIVE", "MOCK", "DISABLED"}:
        return requested
    if provider == "disabled":
        return "DISABLED"
    if provider == "mock":
        return "MOCK"
    if provider == "openai" and os.getenv("OPENAI_API_KEY"):
        return "LIVE"
    if provider == "anthropic" and os.getenv("ANTHROPIC_API_KEY"):
        return "LIVE"
    return "MOCK"


def mock_generate(prompt: str, topic: str, language: str, persona: str, content_type: str, source_material: str, cta: str | None) -> str:
    signature = "Mira | VORQA AI Industry Analyst" if persona == "MIRA" else "VORQA Global Supply"
    cta_line = cta or "What would you clarify first before comparing supplier offers?"
    if language == "TR":
        return (
            f"{topic}\n\n"
            "Endüstriyel tedarikte iyi bir karar, yalnızca fiyat karşılaştırmasıyla verilmez. "
            "Teknik uygunluk, kapsam netliği, dokümantasyon ihtiyacı, termin varsayımları ve koordinasyon sorumlulukları birlikte değerlendirilmelidir.\n\n"
            "Bu yaklaşım, alıcının riskleri satın alma kararından önce görmesine yardımcı olur."
            f"\n\n{cta_line}\n\n{signature}"
        )
    if language == "AR":
        return (
            f"{topic}\n\n"
            "في المشتريات الصناعية، لا يكفي مقارنة السعر وحده. يجب فهم الملاءمة الفنية، وضوح النطاق، متطلبات التوثيق، افتراضات مدة التوريد، ومسؤوليات التنسيق.\n\n"
            "هذا يساعد المشتري على رؤية المخاطر قبل اتخاذ قرار الشراء."
            f"\n\n{cta_line}\n\n{signature}"
        )
    return (
        f"{topic}\n\n"
        "A sound industrial procurement decision is not made by comparing price alone. "
        "Technical fit, scope clarity, documentation needs, lead-time assumptions, and coordination responsibilities should be reviewed together.\n\n"
        "That makes supplier comparison more useful because it shows risk before the purchase decision."
        f"\n\n{cta_line}\n\n{signature}"
    )


def call_openai(prompt: str) -> AIResult:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return AIResult(mode="DISABLED", provider="openai", text="", model=OPENAI_MODEL, error="OPENAI_API_KEY is not set")
    payload = {
        "model": OPENAI_MODEL,
        "input": prompt,
        "max_output_tokens": 900,
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        return AIResult(mode="LIVE", provider="openai", text="", model=OPENAI_MODEL, error=str(exc))
    text = data.get("output_text")
    if not text:
        parts = []
        for item in data.get("output", []):
            for content in item.get("content", []):
                if content.get("type") in {"output_text", "text"}:
                    parts.append(content.get("text", ""))
        text = "\n".join(part for part in parts if part)
    return AIResult(mode="LIVE", provider="openai", text=text.strip(), model=OPENAI_MODEL)


def call_anthropic(prompt: str) -> AIResult:
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        return AIResult(mode="DISABLED", provider="anthropic", text="", model=ANTHROPIC_MODEL, error="ANTHROPIC_API_KEY is not set")
    payload = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": 900,
        "messages": [{"role": "user", "content": prompt}],
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        return AIResult(mode="LIVE", provider="anthropic", text="", model=ANTHROPIC_MODEL, error=str(exc))
    text = "\n".join(block.get("text", "") for block in data.get("content", []) if block.get("type") == "text")
    return AIResult(mode="LIVE", provider="anthropic", text=text.strip(), model=ANTHROPIC_MODEL)


def generate(prompt: str, topic: str, language: str, persona: str, content_type: str, source_material: str = "", cta: str | None = None) -> AIResult:
    provider = resolve_provider()
    mode = resolve_mode(provider)
    if mode == "DISABLED":
        return AIResult(mode="DISABLED", provider=provider, text="", error="AI generation is disabled")
    if mode == "MOCK":
        return AIResult(
            mode="MOCK",
            provider="mock",
            text=mock_generate(prompt, topic, language, persona, content_type, source_material, cta),
            model="local-template",
        )
    if provider == "openai":
        return call_openai(prompt)
    if provider == "anthropic":
        return call_anthropic(prompt)
    return AIResult(mode="DISABLED", provider=provider, text="", error=f"Unsupported MIRA_AI_PROVIDER: {provider}")
