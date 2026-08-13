#!/usr/bin/env python3
"""Layered VORQA Mira fact validation.

Layer 1 is regex-based known-risk detection.
Layer 2 uses the machine-readable truth model in context/vorqa_truth.json.
This does not replace human approval.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
TRUTH_MD = ROOT / "context" / "VORQA_TRUTH.md"
TRUTH_JSON = ROOT / "context" / "vorqa_truth.json"

STATUS_VALUES = {"IDEA", "DRAFT", "NEEDS_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "REJECTED"}

PROHIBITED_PATTERNS = {
    "24+ countries": r"\b24\+\s+countries\b|\b24\+\s+ülke\b|\b24\+\s*دول",
    "48 hour quotation": r"\b48\s*(hour|hours|saat)\s+(quotation|quote|teklif)\b|\b48\s+saat\s+teklif\b",
    "turnkey EPC as VORQA model": r"\bturnkey\s+EPC\b|\banahtar\s+teslim\s+EPC\b",
    "VORQA as engineering group": r"\bengineering\s+group\b|\bmühendislik\s+grubu\b",
    "VORQA-owned manufacturing": r"\bVORQA\b[^.\n]{0,90}\b(manufactures|manufacturing|manufacturer|üretir|imal\s+eder|üretici)\b",
    "direct commissioning promise": r"\bVORQA\b[^.\n]{0,90}\b(commissions|commissioned|devreye\s+alır|kurulum\s+yapar)\b",
    "concrete plant capacity range": r"\b60\s*[-–]\s*240\s*m(?:3|³)\s*/?\s*h\b|\b60\s*[-–]\s*240\s*m(?:3|³)\s*/?\s*saat\b",
    "energy capacity range": r"\b1\s*[-–]\s*50\s*MW\b",
    "every supplier ISO 9001": r"\b(all|every)\s+suppliers?\s+(are\s+)?ISO\s*9001\b|\btüm\s+tedarikçiler\b[^.\n]{0,60}\bISO\s*9001\b",
    "always performs FAT": r"\b(always|her zaman)\b[^.\n]{0,60}\bFAT\b|\bFAT\b[^.\n]{0,60}\b(always|her zaman)\b",
    "invented group companies": r"\b(group\s+companies|grup\s+şirketleri)\b",
    "fake Mira employee": r"\bMira\s+Yılmaz\b",
    "fake Mira memory language": r"\b(I|Mira)\b[^.\n]{0,80}\b(last year|at a factory|at a trade show|met a customer|worked on a project)\b",
}

VERIFY_PATTERNS = {
    "supplier count": r"\b(1,000\+|1000\+|500\+)\s+(verified\s+)?(Turkish\s+)?suppliers?\b|\b(1,000\+|1000\+|500\+)\s+(doğrulanmış\s+)?tedarikçi\b|\b1,000\+\s+supplier\s+portfolio\b",
    "exact response time": r"\b(<\s*)?48\s*(h|hour|hours|saat|س)\b",
    "experience number": r"\b(15\+|20\+|30\+)\s+(years|yıl)\b",
    "certification claim": r"\b(ISO\s*9001|ISO\s*14001|EN\s*1090|CE|TSE)\b",
    "FAT": r"\bFAT\b",
    "customer/project reference": r"\b(Borusan|Avrasya|Kazakistan|CESA|GALVA)\b",
    "direct design/engineering": r"\b(we|VORQA)\b[^.\n]{0,90}\b(design|engineer|install|commission|after-sales)\b",
}

VORQA_GEO_CLAIM = re.compile(
    r"\bVORQA\b[^.\n]{0,120}\b("
    r"operates?|active|served|serves|customers?|references?|projects?|deliver(?:ed|s)?|offices?|presence|completed"
    r"|faaliyet|aktif|müşteri|referans|proje|teslim|ofis"
    r")\b[^.\n]{0,120}\b("
    r"Libya|Egypt|Iraq|Syria|Africa|MENA|GCC|Middle East|Mısır|Irak|Suriye|Afrika|Orta Doğu"
    r")\b",
    re.IGNORECASE | re.UNICODE,
)

PARTNER_TERMS = (
    "concrete batching plant",
    "complete hot-dip galvanizing",
    "waste-to-energy",
    "crushing and screening",
    "beton santrali",
    "galvaniz",
    "atık",
)
PARTNER_SAFE_WORDS = (
    "partner",
    "supplier",
    "network",
    "coordinated",
    "through qualified",
    "through specialized",
    "tedarikçi",
    "partner üzerinden",
    "koordine",
)


def load_truth() -> dict:
    if not TRUTH_JSON.exists():
        raise FileNotFoundError(f"Missing truth JSON: {TRUTH_JSON}")
    return json.loads(TRUTH_JSON.read_text(encoding="utf-8"))


def check_truth_sync(truth: dict) -> list[str]:
    if not TRUTH_MD.exists():
        return [f"Missing truth Markdown: {TRUTH_MD}"]
    md = TRUTH_MD.read_text(encoding="utf-8")
    errors = []
    for section, key in (
        ("[APPROVED]", "approved_facts"),
        ("[PARTNER_CAPABILITY]", "partner_capabilities"),
        ("[VERIFY_BEFORE_USE]", "verify_before_use"),
        ("[PROHIBITED]", "prohibited_claims"),
    ):
        if section not in md:
            errors.append(f"Markdown missing section {section}")
        if not truth.get(key):
            errors.append(f"Truth JSON missing {key}")
    platform_status = truth.get("platform_status", {})
    for platform, status in platform_status.items():
        display = platform.replace("_", " ").title().replace("Business", "Business")
        if status not in md:
            errors.append(f"Markdown missing platform status {platform}: {status}")
    return errors


def read_text(path: Path) -> str:
    if path.suffix.lower() == ".json":
        data = json.loads(path.read_text(encoding="utf-8"))
        return json.dumps(data, ensure_ascii=False, indent=2)
    return path.read_text(encoding="utf-8")


def excerpt(text: str, start: int, end: int) -> str:
    return " ".join(text[max(0, start - 60):min(len(text), end + 60)].split())


def iter_regex_matches(patterns: dict[str, str], text: str, kind: str) -> Iterable[dict[str, str]]:
    for label, pattern in patterns.items():
        for match in re.finditer(pattern, text, flags=re.IGNORECASE | re.UNICODE):
            yield {"kind": kind, "label": label, "match": match.group(0), "excerpt": excerpt(text, match.start(), match.end())}


def iter_context_matches(text: str) -> Iterable[dict[str, str]]:
    for match in VORQA_GEO_CLAIM.finditer(text):
        yield {
            "kind": "verify_before_use",
            "label": "unsupported VORQA geography/operations claim",
            "match": match.group(0),
            "excerpt": excerpt(text, match.start(), match.end()),
        }


def iter_partner_warnings(text: str) -> Iterable[dict[str, str]]:
    lower = text.lower()
    for term in PARTNER_TERMS:
        idx = lower.find(term)
        if idx == -1:
            continue
        window = lower[max(0, idx - 120):idx + len(term) + 120]
        if "vorqa" in window and not any(word in window for word in PARTNER_SAFE_WORDS):
            yield {
                "kind": "verify_before_use",
                "label": "partner capability needs partner/supplier wording",
                "match": term,
                "excerpt": excerpt(text, idx, idx + len(term)),
            }


def validate_status(path: Path) -> list[str]:
    if path.suffix.lower() != ".json":
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    status = data.get("status")
    errors = []
    if status and status not in STATUS_VALUES:
        errors.append(f"Unknown status: {status}")
    if status in {"APPROVED", "SCHEDULED", "PUBLISHED"} and data.get("human_approved") is not True:
        errors.append(f"Status {status} requires human_approved: true")
    validation = data.get("fact_validation", {})
    prohibited = validation.get("prohibited") or []
    if status in {"APPROVED", "SCHEDULED", "PUBLISHED"} and prohibited:
        errors.append(f"Status {status} cannot contain prohibited fact-validation items")
    return errors


def validate_text(text: str) -> dict:
    prohibited = list(iter_regex_matches(PROHIBITED_PATTERNS, text, "prohibited"))
    verify = list(iter_regex_matches(VERIFY_PATTERNS, text, "verify_before_use"))
    verify.extend(iter_context_matches(text))
    verify.extend(iter_partner_warnings(text))
    return {
        "prohibited": prohibited,
        "verify_before_use": verify,
        "passed": not prohibited and not verify,
        "human_review_required": True,
    }


def validate_path(path: Path) -> dict:
    text = read_text(path)
    report = {"path": str(path), "status_errors": validate_status(path)}
    report.update(validate_text(text))
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate VORQA Mira content facts.")
    parser.add_argument("paths", nargs="*", help="Files to validate. Reads stdin when omitted.")
    parser.add_argument("--json", action="store_true", help="Emit JSON report.")
    parser.add_argument("--check-sync", action="store_true", help="Check VORQA_TRUTH.md and vorqa_truth.json structure sync.")
    args = parser.parse_args()

    truth = load_truth()
    sync_errors = check_truth_sync(truth) if args.check_sync else []

    reports = []
    if args.paths:
        for raw in args.paths:
            reports.append(validate_path(Path(raw)))
    else:
        reports.append({"path": "<stdin>", "status_errors": [], **validate_text(sys.stdin.read())})

    failed = bool(sync_errors) or any(r["status_errors"] or r["prohibited"] for r in reports)

    if args.json:
        print(json.dumps({"ok": not failed, "sync_errors": sync_errors, "reports": reports}, ensure_ascii=False, indent=2))
    else:
        for err in sync_errors:
            print(f"SYNC ERROR: {err}")
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
