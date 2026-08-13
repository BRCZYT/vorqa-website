#!/usr/bin/env python3
"""Dependency-light tests for Mira V3.1."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
AUTOMATION = ROOT / "automation"
sys.path.insert(0, str(AUTOMATION))

from adapt_platforms import adapt
from validate_facts import validate_text, validate_path, load_truth, check_truth_sync


class MiraValidationTests(unittest.TestCase):
    def test_prohibited_claim_detection(self) -> None:
        report = validate_text("VORQA is active in 24+ countries and offers 48 hour quotation.")
        self.assertGreaterEqual(len(report["prohibited"]), 2)

    def test_verify_before_use_detection(self) -> None:
        report = validate_text("The 1,000+ supplier portfolio is an internal planning claim.")
        self.assertTrue(report["verify_before_use"])
        self.assertFalse(report["prohibited"])

    def test_geography_context_allowed(self) -> None:
        report = validate_text("Industrial buyers in Libya may require Arabic documentation.")
        self.assertFalse(report["prohibited"])
        self.assertFalse(report["verify_before_use"])

    def test_geography_operation_claim_flagged(self) -> None:
        report = validate_text("VORQA operates in Libya and Egypt with completed projects.")
        self.assertTrue(report["verify_before_use"])

    def test_partner_capability_wording(self) -> None:
        unsafe = validate_text("VORQA provides concrete batching plant solutions directly.")
        safe = validate_text("VORQA coordinates concrete batching plant solutions through specialized plant partners.")
        self.assertTrue(unsafe["verify_before_use"])
        self.assertFalse(safe["verify_before_use"])

    def test_approval_gate(self) -> None:
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as handle:
            json.dump({"status": "APPROVED", "human_approved": False, "fact_validation": {"prohibited": []}}, handle)
            temp_path = Path(handle.name)
        try:
            report = validate_path(temp_path)
            self.assertTrue(report["status_errors"])
        finally:
            temp_path.unlink(missing_ok=True)

    def test_adapt_platforms_uses_actual_input(self) -> None:
        result = adapt("Pump sourcing requires checking flow rate, material compatibility, and lead-time risk.", "Pump sourcing checklist")
        self.assertIn("Pump sourcing", result["linkedin"]["copy"])
        self.assertIn("Pump sourcing", result["instagram"]["copy"])
        self.assertIn("Pump sourcing", result["facebook"]["copy"])

    def test_content_json_schema(self) -> None:
        env = os.environ.copy()
        env["MIRA_AI_PROVIDER"] = "mock"
        with tempfile.TemporaryDirectory() as tmp:
            proc = subprocess.run(
                [
                    sys.executable,
                    str(AUTOMATION / "generate_content.py"),
                    "--topic",
                    "Temporary RFQ test",
                    "--language",
                    "EN",
                    "--persona",
                    "MIRA",
                ],
                cwd=REPO,
                env=env,
                capture_output=True,
                text=True,
                check=True,
            )
            path = Path(proc.stdout.strip())
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                for key in [
                    "id",
                    "created_at",
                    "topic",
                    "persona",
                    "master_language",
                    "master_content",
                    "sources_used",
                    "platform_targets",
                    "fact_validation",
                    "platform_adaptations",
                    "visual_brief",
                    "status",
                    "human_approved",
                    "approval",
                ]:
                    self.assertIn(key, data)
                self.assertFalse(data["human_approved"])
            finally:
                path.unlink(missing_ok=True)

    def test_instagram_facebook_not_active(self) -> None:
        truth = load_truth()
        self.assertEqual(truth["platform_status"]["instagram"], "PLANNED")
        self.assertEqual(truth["platform_status"]["facebook"], "PLANNED")

    def test_no_fake_mira_memories(self) -> None:
        files = [ROOT / "mira.html", ROOT / "vorqa_mira_linkedin_content_starter_kit.html", ROOT / "README.md", ROOT / "AGENTS.md"]
        text = "\n".join(p.read_text(encoding="utf-8") for p in files)
        self.assertNotIn("Mira Yılmaz", text)
        self.assertNotIn("baklava", text.lower())
        self.assertNotIn("last year i was at a factory", text.lower())

    def test_truth_sync_shape(self) -> None:
        self.assertFalse(check_truth_sync(load_truth()))

    def test_content_index_generation(self) -> None:
        subprocess.run([sys.executable, str(AUTOMATION / "build_content_index.py")], cwd=REPO, check=True)
        data = json.loads((ROOT / "content" / "index.json").read_text(encoding="utf-8"))
        self.assertIn("items", data)
        self.assertIn("counts", data)


if __name__ == "__main__":
    unittest.main()
