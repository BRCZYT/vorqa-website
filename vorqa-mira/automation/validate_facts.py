#!/usr/bin/env python3
"""Validate Mira content against the VORQA truth rules.

This is a lightweight local guardrail. It catches known prohibited claims and
items that require verification before public use. It does not replace human
approval.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
TRUTH_FILE = ROOT / "context" / "VORQA_TRUTH.md"

PROHIBITED_PATTERNS = {
    "24+ countries": r"\b24\+\s+countries\b|\b24\+\s+ülke\b|\b24\+\s*دول",
    "48 hour quotation": r"\b48\s*(hour|hours|saat)\s+(quotation|quote|teklif)\b|\b48\s+saat\s+teklif\b",
    "turnkey EPC as VORQA model": r"\bturnkey\s+EPC\b|\banahtar\s+teslim\s+EPC\b",
    "VORQA as engineering group": r"\bengineering\s+group\b|\bmühendislik\s+grubu\b",
    "VORQA-owned manufacturing": r"\bVORQA\b[^.\n]{0,80}\b(manufactures|manufacturing|üretir|imal\s+eder)\b",
    "direct commissioning promise": r"\bVORQA\b[^.\n]{0,80}\b(commissions|commissioned|devreye\s+alır|kurulum\s+yapar)\b",
    "concrete plant capacity range": r"\b60\s*[-–]\s*240\s*m(?:3|³)\s*/?\s*h\b|\b60\s*[-–]\s*240\s*m(?:3|³)\s*/?\s*saat\b",
    "energy capacity range": r"\b1\s*[-–]\s*50\s*MW\b",
    "every supplier ISO 9001": r"\b(all|every)\s+suppliers?\s+(are\s+)?ISO\s*9001\b|\btüm\s+tedarikçiler\b[^.\n]{0,50}\bISO\s*9001\b",
    "always performs FAT": r"\b(always|her zaman)\b[^.\n]{0,50}\bFAT\b|\bFAT\b[^.\n]{0,50}\b(always|her zaman)\b",
    "invented group companies": r"\b(group\s+companies|grup\s+şirketleri)\b",
}

VERIFY_PATTERNS = {
    "supplier count": r"\b(1,000\+|1000\+|500\+)\s+(verified\s+)?(Turkish\s+)?suppliers?\b|\b(1,000\+|1000\+|500\+)\s+(doğrulanmış\s+)?tedarikçi\b",
    "exact response time": r"\b(<\s*)?48\s*(h|hour|hours|saat|س)\b",
    "experience number": r"\b(15\+|20\+|30\+)\s+(years|yıl)\b",
    "certification claim": r"\b(ISO\s*9001|ISO\s*14001|EN\s*1090|CE|TSE)\b",
    "FAT": r"\bFAT\b",
    "customer/project reference": r"\b(Borusan|Avrasya|Kazakistan|CESA|GALVA)\b",
    "specific geography claim": r"\b(Libya|Egypt|Iraq|Syria|MENA and Africa|Africa)\b|\b(Libya|Mısır|Irak|Suriye|Afrika)\b",
    "direct design/engineering": r"\b(we|VORQA)\b[^.\n]{0,80}\b(design|engineer|install|commission|after-sales)\b",
}

STATUS_VALUES = {"IDEA", "DRAFT", "NEEDS_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "REJECTED"}


def read_text(path: Path) -> str:
    if path.suffix.lower() == ".json":
        data = json.loads(path.read_text(encoding="utf-8"))
        return json.dumps(data, ensure_ascii=False, indent=2)
    return path.read_text(encoding="utf-8")


def iter_matches(patterns: dict[str, str], text: str) -> Iterable[dict[str, str]]:
    for label, pattern in patterns.items():
        for match in re.finditer(pattern, text, flags=re.IGNORECASE | re.UNICODE):
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 50)
            excerpt = " ".join(text[start:end].split())
            yield {"label": label, "match": match.group(0), "excerpt": excerpt}


def validate_status(path: Path) -> list[str]:
    if path.suffix.lower() != ".json":
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    status = data.get("status")
    if status and status not in STATUS_VALUES:
        return [f"Unknown status: {status}"]
    if status in {"APPROVED", "SCHEDULED", "PUBLISHED"} and not data.get("human_approved"):
        return [f"Status {status} requires human_approved: true"]
    return []


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate VORQA Mira content facts.")
    parser.add_argument("paths", nargs="*", help="Files to validate. Reads stdin when omitted.")
    parser.add_argument("--json", action="store_true", help="Emit JSON report.")
    args = parser.parse_args()

    if not TRUTH_FILE.exists():
        print(f"Missing truth file: {TRUTH_FILE}", file=sys.stderr)
        return 2

    reports = []
    if args.paths:
        for raw in args.paths:
            path = Path(raw)
            text = read_text(path)
            reports.append(
                {
                    "path": str(path),
                    "status_errors": validate_status(path),
                    "prohibited": list(iter_matches(PROHIBITED_PATTERNS, text)),
                    "verify_before_use": list(iter_matches(VERIFY_PATTERNS, text)),
                }
            )
    else:
        text = sys.stdin.read()
        reports.append(
            {
                "path": "<stdin>",
                "status_errors": [],
                "prohibited": list(iter_matches(PROHIBITED_PATTERNS, text)),
                "verify_before_use": list(iter_matches(VERIFY_PATTERNS, text)),
            }
        )

    failed = any(r["status_errors"] or r["prohibited"] for r in reports)

    if args.json:
        print(json.dumps({"ok": not failed, "reports": reports}, ensure_ascii=False, indent=2))
    else:
        for report in reports:
            print(f"\n{report['path']}")
            if not report["status_errors"] and not report["prohibited"] and not report["verify_before_use"]:
                print("  OK: no warnings")
                continue
            for err in report["status_errors"]:
                print(f"  STATUS ERROR: {err}")
            for item in report["prohibited"]:
                print(f"  PROHIBITED: {item['label']} -> {item['excerpt']}")
            for item in report["verify_before_use"]:
                print(f"  VERIFY: {item['label']} -> {item['excerpt']}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
