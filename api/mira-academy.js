const fs = require("fs");
const path = require("path");

const MODEL = process.env.OPENAI_MODEL || "gpt-5";
const TRUTH_PATH = path.join(__dirname, "vorqa_truth.json");
const LANGS = new Set(["EN", "TR", "AR"]);

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function clean(v, n) {
  return String(v == null ? "" : v).trim().slice(0, n);
}

function extractText(data) {
  if (typeof data?.output_text === "string") return data.output_text.trim();
  const out = [];
  for (const item of data?.output || []) {
    for (const c of item.content || []) if (c.type === "output_text" && c.text) out.push(c.text);
  }
  return out.join("\n").trim();
}

function parseJson(text) {
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(stripped);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "POST_ONLY" });
  if (!process.env.OPENAI_API_KEY) return send(res, 503, { ok: false, error: "AI_NOT_CONFIGURED" });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const topic = clean(body.topic, 220);
  const language = clean(body.language || "EN", 4).toUpperCase();
  const primary_keyword = clean(body.primary_keyword || topic, 160);
  const audience = clean(body.audience || "industrial buyers, project procurement teams, and technical decision-makers", 240);
  const source_material = clean(body.source_material || "", 6000);
  const source_class = clean(body.source_class || "PUBLIC", 32).toUpperCase();

  if (!topic) return send(res, 400, { ok: false, error: "TOPIC_REQUIRED" });
  if (!LANGS.has(language)) return send(res, 400, { ok: false, error: "UNSUPPORTED_LANGUAGE" });
  if (!["PUBLIC", "INTERNAL_SAFE"].includes(source_class)) return send(res, 400, { ok: false, error: "SOURCE_CLASS_REJECTED" });

  let truth;
  try { truth = JSON.parse(fs.readFileSync(TRUTH_PATH, "utf8")); }
  catch (_) { return send(res, 500, { ok: false, error: "TRUTH_FILE_UNAVAILABLE" }); }

  const instructions = [
    "You are Mira, VORQA AI Industry Analyst. Your primary job is to create an evergreen VORQA Academy article draft, not a social post.",
    "Write for professional B2B industrial procurement readers. Be specific, useful, technically literate and non-salesy.",
    "Do not invent customers, projects, certifications, supplier counts, capacities, response times, offices, countries served, or first-person experiences.",
    "Partner capabilities must be described as partner/supplier/network capabilities, never as VORQA-owned manufacturing.",
    "The draft must remain human-review-only. Do not claim it is published or approved.",
    "Return ONLY valid JSON, no markdown fences.",
    "JSON shape: {title,slug,meta_title,meta_description,primary_keyword,search_intent,audience,article_brief:{angle,key_questions:[],outline:[]},article_markdown,faq:[{question,answer}],internal_link_suggestions:[],social_derivative_hooks:[],review_flags:[]}",
    "article_markdown must contain a clear H1 title, short introduction, useful H2/H3 sections, a practical checklist or comparison framework where relevant, conclusion, and no fabricated numeric claims.",
    "Aim for roughly 1200-1800 words unless the topic clearly needs less.",
    `Approved facts: ${JSON.stringify(truth.approved_facts || [])}`,
    `Partner capabilities: ${JSON.stringify(truth.partner_capabilities || [])}`,
    `Verify before use: ${JSON.stringify(truth.verify_before_use || [])}`,
    `Prohibited claims: ${JSON.stringify(truth.prohibited_claims || [])}`
  ].join("\n");

  const input = JSON.stringify({ topic, language, primary_keyword, audience, source_class, source_material });

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: MODEL, reasoning: { effort: "minimal" }, instructions, input, max_output_tokens: 4200 })
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) return send(res, 502, { ok: false, error: "OPENAI_REQUEST_FAILED", upstream_status: r.status, message: data?.error?.message || null });
    const text = extractText(data);
    if (!text) return send(res, 502, { ok: false, error: "NO_TEXT_OUTPUT" });

    let draft;
    try { draft = parseJson(text); }
    catch (_) { return send(res, 502, { ok: false, error: "INVALID_MODEL_JSON", raw_preview: text.slice(0, 500) }); }

    return send(res, 200, {
      ok: true,
      workflow: "ACADEMY_FIRST",
      status: "DRAFT",
      human_approved: false,
      publish_allowed: false,
      social_adaptation_allowed: false,
      source_class,
      source_material_stored: false,
      generation: { provider: "openai", api: "responses", model: data?.model || MODEL, response_id: data?.id || null, mode: "LIVE" },
      draft
    });
  } catch (e) {
    return send(res, 500, { ok: false, error: "RUNTIME_ERROR", message: e?.message || String(e) });
  }
};
