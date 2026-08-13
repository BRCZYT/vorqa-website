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
    def run_endpoint_case(self, script: str, env: dict[str, str] | None = None) -> dict:
        proc = subprocess.run(
            ["node", "-e", script],
            cwd=REPO,
            env=env or os.environ.copy(),
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        return json.loads(proc.stdout.strip())

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

    def test_confidential_source_material_not_persisted(self) -> None:
        raw = "CONFIDENTIAL-RFQ-ALPHA customer ACME price 12345 private@example.com"
        env = os.environ.copy()
        env["MIRA_AI_PROVIDER"] = "mock"
        proc = subprocess.run(
            [
                sys.executable,
                str(AUTOMATION / "generate_content.py"),
                "--topic",
                "Confidential RFQ learning",
                "--source-class",
                "CONFIDENTIAL",
                "--source-material",
                raw,
            ],
            cwd=REPO,
            env=env,
            capture_output=True,
            text=True,
            check=True,
        )
        path = Path(proc.stdout.strip())
        try:
            text = path.read_text(encoding="utf-8")
            data = json.loads(text)
            self.assertEqual(data["source_class"], "CONFIDENTIAL")
            self.assertFalse(data["source_material_stored"])
            self.assertIsNone(data["source_summary"])
            self.assertNotIn(raw, text)
            self.assertNotIn("private@example.com", text)
        finally:
            path.unlink(missing_ok=True)

    def test_client_confidential_source_material_not_in_json_or_index(self) -> None:
        raw = "CLIENT-CONFIDENTIAL-BETA RFQ pump quotation margin 42% client@example.com +90 555 111 2233"
        env = os.environ.copy()
        env["MIRA_AI_PROVIDER"] = "mock"
        proc = subprocess.run(
            [
                sys.executable,
                str(AUTOMATION / "generate_content.py"),
                "--topic",
                "Client confidential RFQ learning",
                "--source-class",
                "CLIENT_CONFIDENTIAL",
                "--source-material",
                raw,
            ],
            cwd=REPO,
            env=env,
            capture_output=True,
            text=True,
            check=True,
        )
        path = Path(proc.stdout.strip())
        try:
            text = path.read_text(encoding="utf-8")
            data = json.loads(text)
            self.assertEqual(data["source_class"], "CLIENT_CONFIDENTIAL")
            self.assertFalse(data["source_material_stored"])
            self.assertIsNone(data["source_summary"])
            self.assertNotIn(raw, text)
            self.assertNotIn("client@example.com", text)

            subprocess.run([sys.executable, str(AUTOMATION / "build_content_index.py")], cwd=REPO, check=True)
            index_text = (ROOT / "content" / "index.json").read_text(encoding="utf-8")
            self.assertNotIn(raw, index_text)
            self.assertNotIn("client@example.com", index_text)
        finally:
            path.unlink(missing_ok=True)
            subprocess.run([sys.executable, str(AUTOMATION / "build_content_index.py")], cwd=REPO, check=True)

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

    def test_browser_confidential_source_rejected(self) -> None:
        script = r"""
const handler = require("./api/mira-generate.js");
const req = { method: "POST", body: { topic: "RFQ", persona: "MIRA", language: "EN", source_class: "CONFIDENTIAL" } };
const res = { statusCode: 0, headers: {}, setHeader(k,v){ this.headers[k]=v; }, end(body){ console.log(JSON.stringify({statusCode:this.statusCode, body:JSON.parse(body), headers:this.headers})); } };
handler(req, res);
"""
        result = self.run_endpoint_case(script)
        self.assertEqual(result["statusCode"], 400)
        self.assertEqual(result["body"]["error"], "CONFIDENTIAL_SOURCE_REJECTED")
        self.assertEqual(result["headers"]["Cache-Control"], "no-store")

    def test_browser_client_confidential_source_rejected(self) -> None:
        script = r"""
const handler = require("./api/mira-generate.js");
const req = { method: "POST", body: { topic: "RFQ", persona: "MIRA", language: "EN", source_class: "CLIENT_CONFIDENTIAL" } };
const res = { statusCode: 0, headers: {}, setHeader(k,v){ this.headers[k]=v; }, end(body){ console.log(JSON.stringify({statusCode:this.statusCode, body:JSON.parse(body)})); } };
handler(req, res);
"""
        result = self.run_endpoint_case(script)
        self.assertEqual(result["statusCode"], 400)
        self.assertEqual(result["body"]["error"], "CONFIDENTIAL_SOURCE_REJECTED")

    def test_browser_missing_openai_key_controlled_failure(self) -> None:
        env = os.environ.copy()
        env.pop("OPENAI_API_KEY", None)
        script = r"""
const handler = require("./api/mira-generate.js");
delete process.env.OPENAI_API_KEY;
const req = { method: "POST", body: { topic: "Public RFQ guidance", persona: "MIRA", language: "EN", source_class: "PUBLIC" } };
const res = { statusCode: 0, headers: {}, setHeader(k,v){ this.headers[k]=v; }, end(body){ console.log(JSON.stringify({statusCode:this.statusCode, body:JSON.parse(body)})); } };
handler(req, res);
"""
        result = self.run_endpoint_case(script, env=env)
        self.assertEqual(result["statusCode"], 503)
        self.assertEqual(result["body"]["error"], "AI_NOT_CONFIGURED")
        self.assertIn("AI generation is not configured", result["body"]["message"])

    def test_browser_endpoint_post_only(self) -> None:
        script = r"""
const handler = require("./api/mira-generate.js");
const req = { method: "GET", body: {} };
const res = { statusCode: 0, headers: {}, setHeader(k,v){ this.headers[k]=v; }, end(body){ console.log(JSON.stringify({statusCode:this.statusCode, body:JSON.parse(body), headers:this.headers})); } };
handler(req, res);
"""
        result = self.run_endpoint_case(script)
        self.assertEqual(result["statusCode"], 405)
        self.assertEqual(result["headers"]["Allow"], "POST")

    def test_browser_endpoint_rejects_unsupported_persona_and_language(self) -> None:
        script = r"""
const handler = require("./api/mira-generate.js");
async function run(body){
  return await new Promise(resolve => {
    const req = { method: "POST", body };
    const res = { statusCode: 0, setHeader(){}, end(payload){ resolve({statusCode:this.statusCode, body:JSON.parse(payload)}); } };
    handler(req, res);
  });
}
(async () => {
  const persona = await run({ topic: "RFQ", persona: "ALICE", language: "EN", source_class: "PUBLIC" });
  const language = await run({ topic: "RFQ", persona: "MIRA", language: "DE", source_class: "PUBLIC" });
  console.log(JSON.stringify({ persona, language }));
})();
"""
        result = self.run_endpoint_case(script)
        self.assertEqual(result["persona"]["body"]["error"], "UNSUPPORTED_PERSONA")
        self.assertEqual(result["language"]["body"]["error"], "UNSUPPORTED_LANGUAGE")

    def test_browser_endpoint_validation_status_and_platforms(self) -> None:
        env = os.environ.copy()
        env["OPENAI_API_KEY"] = "unit-test-placeholder"
        env["OPENAI_MODEL"] = "gpt-5"
        script = r"""
const handler = require("./api/mira-generate.js");
global.fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({
    id: "resp_test",
    model: "gpt-5",
    output_text: "VORQA is active in 24+ countries and offers 48 hour quotation."
  })
});
const req = { method: "POST", body: { topic: "Public RFQ guidance", persona: "MIRA", language: "EN", content_type: "RFQ Guidance", source_class: "PUBLIC", source_material: "Public educational notes.", cta: "Review before publishing." } };
const res = { statusCode: 0, headers: {}, setHeader(k,v){ this.headers[k]=v; }, end(body){ console.log(JSON.stringify({statusCode:this.statusCode, body:JSON.parse(body), raw:body})); } };
handler(req, res);
"""
        result = self.run_endpoint_case(script, env=env)
        body = result["body"]
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(body["status"], "NEEDS_REVIEW")
        self.assertFalse(body["human_approved"])
        self.assertFalse(body["source_material_stored"])
        self.assertTrue(body["fact_validation"]["prohibited"])
        self.assertEqual(body["platform_adaptations"]["linkedin"]["platform_status"], "ACTIVE")
        self.assertEqual(body["platform_adaptations"]["instagram"]["platform_status"], "PLANNED")
        self.assertEqual(body["platform_adaptations"]["facebook"]["platform_status"], "PLANNED")
        for platform in ("linkedin", "instagram", "facebook"):
            copy = body["platform_adaptations"][platform]["copy"]
            self.assertNotIn("Human approval required before publishing.", copy)
            self.assertNotIn("Human review required before publishing.", copy)
        self.assertNotIn("unit-test-placeholder", result["raw"])

    def test_browser_endpoint_removes_internal_instructions_from_platform_copy(self) -> None:
        env = os.environ.copy()
        env["OPENAI_API_KEY"] = "unit-test-placeholder"
        script = r"""
const handler = require("./api/mira-generate.js");
global.fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({
    id: "resp_clean",
    model: "gpt-5",
    output_text: "Public RFQ guidance. Human approval required before publishing."
  })
});
const req = { method: "POST", body: { topic: "Public RFQ guidance", persona: "MIRA", language: "EN", content_type: "RFQ Guidance", source_class: "PUBLIC" } };
const res = { statusCode: 0, headers: {}, setHeader(k,v){ this.headers[k]=v; }, end(body){ console.log(JSON.stringify(JSON.parse(body))); } };
handler(req, res);
"""
        body = self.run_endpoint_case(script, env=env)
        copies = [body["platform_adaptations"][platform]["copy"] for platform in ("linkedin", "instagram", "facebook")]
        for copy in copies:
            self.assertNotIn("Human approval required before publishing.", copy)
            self.assertNotIn("Human review required before publishing.", copy)
        self.assertIn("Human approval required before publishing.", body["platform_adaptations"]["linkedin"]["notes"][0])

    def test_browser_endpoint_default_cta_is_language_aware(self) -> None:
        script = r"""
const { adaptPlatforms } = require("./api/mira-generate.js")._private;
const truth = { platform_status: { linkedin: "ACTIVE", instagram: "PLANNED", facebook: "PLANNED" } };
const base = { topic: "RFQ guidance", persona: "MIRA", content_type: "RFQ Guidance", source_class: "PUBLIC", source_material: "" };
const tr = adaptPlatforms("Satın alma ekipleri kapsamı netleştirmelidir.", {...base, language: "TR", cta: ""}, truth);
const ar = adaptPlatforms("ينبغي توضيح نطاق الطلب قبل المقارنة.", {...base, language: "AR", cta: ""}, truth);
const custom = adaptPlatforms("Buyers should clarify scope.", {...base, language: "TR", cta: "Custom CTA stays."}, truth);
console.log(JSON.stringify({ tr, ar, custom }));
"""
        result = self.run_endpoint_case(script)
        english = "What would you clarify first before comparing options?"
        for platform in ("linkedin", "instagram", "facebook"):
            self.assertNotIn(english, result["tr"][platform]["copy"])
            self.assertNotIn(english, result["ar"][platform]["copy"])
            self.assertIn("Custom CTA stays.", result["custom"][platform]["copy"])
        self.assertIn("Teklifleri karşılaştırmadan önce", result["tr"]["linkedin"]["copy"])
        self.assertIn("ما النقطة التي توضحونها", result["ar"]["linkedin"]["copy"])
        self.assertNotIn("Teklifleri karşılaştırmadan önce", result["custom"]["linkedin"]["copy"])
        self.assertNotEqual(result["tr"]["linkedin"]["visual_brief"]["supporting_text"], "One clear procurement insight per slide or graphic.")
        self.assertNotEqual(result["ar"]["linkedin"]["visual_brief"]["cta_placement"], "final slide or caption ending")

    def test_no_browser_side_api_keys_or_direct_openai_calls(self) -> None:
        html = (ROOT / "mira.html").read_text(encoding="utf-8")
        self.assertNotIn("OPENAI_API_KEY", html)
        self.assertNotIn("localStorage", html)
        self.assertNotIn("api.openai.com", html)
        self.assertNotIn("anthropic-dangerous-allow-browser", html)


if __name__ == "__main__":
    unittest.main()
