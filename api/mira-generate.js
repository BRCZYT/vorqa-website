const fs = require("fs");
const path = require("path");

const VERSION = "3.2";
const DEFAULT_MODEL = "gpt-5";
const MAX_BODY_BYTES = 24 * 1024;
const MAX_TOPIC = 180;
const MAX_CONTENT_TYPE = 120;
const MAX_SOURCE_MATERIAL = 5000;
const MAX_CTA = 240;

const SUPPORTED_PERSONAS = new Set(["MIRA", "VORQA"]);
const SUPPORTED_LANGUAGES = new Set(["EN", "TR", "AR"]);
const WEB_SOURCE_CLASSES = new Set(["PUBLIC", "INTERNAL_SAFE"]);
const SENSITIVE_SOURCE_CLASSES = new Set(["CONFIDENTIAL", "CLIENT_CONFIDENTIAL"]);

const TRUTH_PATHS = [
  path.join(__dirname, "vorqa_truth.json"),
  path.join(process.cwd(), "vorqa-mira", "context", "vorqa_truth.json"),
];

const PROHIBITED_PATTERNS = [
  ["24+ countries", /\b24\+\s+(countries|ülke|ulke)\b/i],
  ["48 hour quotation", /\b48\s*(hour|hours|saat)\s+(quotation|quote|teklif)\b|\b48\s+saat\s+teklif\b/i],
  ["turnkey EPC", /\bturnkey\s+EPC\b|\banahtar\s+teslim\s+EPC\b/i],
  ["engineering group", /\bengineering\s+group\b|\bmühendislik\s+grubu\b/i],
  ["fake Mira employee identity", /\bMira\s+Yılmaz\b|\bMira\s+Yilmaz\b/i],
  ["VORQA-owned manufacturing", /\bVORQA\b[^.\n]{0,90}\b(manufactures|manufacturing|manufacturer|üretir|uretir|imal\s+eder|üretici|uretici)\b/i],
  ["concrete plant capacity as VORQA claim", /\b60\s*[-–]\s*240\s*m(?:3|³)\s*\/?\s*h\b|\b60\s*[-–]\s*240\s*m(?:3|³)\s*\/?\s*saat\b/i],
  ["energy capacity as VORQA claim", /\b1\s*[-–]\s*50\s*MW\b/i],
  ["unsupported supplier count public claim", /\b(1,000\+|1000\+)\s+(verified\s+)?(Turkish\s+)?suppliers?\b|\b1,000\+\s+supplier\s+portfolio\b/i],
  ["unsupported certifications", /\b(all|every)\s+suppliers?\s+(are\s+)?ISO\s*9001\b|\bISO\s*9001\s+certified\s+network\b/i],
  ["FAT promises", /\b(always|guaranteed|guarantees|her zaman)\b[^.\n]{0,60}\bFAT\b|\bFAT\b[^.\n]{0,60}\b(always|guaranteed|guarantees|her zaman)\b/i],
  ["unsupported customer/project references", /\b(customer|client|project|reference|müşteri|musteri|proje|referans)\b[^.\n]{0,80}\b(named|called|for\s+[A-Z][A-Za-z0-9&.-]+|with\s+[A-Z][A-Za-z0-9&.-]+)\b/i],
  ["fake Mira memories", /\b(I|Mira)\b[^.\n]{0,80}\b(last year|at a factory|at a trade show|met a customer|worked on a project|factory story|customer meeting)\b/i],
];

const VERIFY_PATTERNS = [
  ["supplier count", /\b(1,000\+|1000\+|500\+)\s+(verified\s+)?(Turkish\s+)?suppliers?\b|\b(1,000\+|1000\+|500\+)\s+(doğrulanmış\s+)?tedarikçi\b/i],
  ["exact response time", /\b(<\s*)?48\s*(h|hour|hours|saat)\b/i],
  ["experience number", /\b(15\+|20\+|30\+)\s+(years|yıl|yil)\b/i],
  ["certification claim", /\b(ISO\s*9001|ISO\s*14001|EN\s*1090|CE|TSE)\b/i],
  ["FAT", /\bFAT\b/i],
  ["direct design/engineering", /\b(we|VORQA)\b[^.\n]{0,90}\b(design|engineer|install|commission|after-sales)\b/i],
];

const GEO_OPERATION_PATTERN = /\bVORQA\b[^.\n]{0,120}\b(operates?|active|served|serves|customers?|references?|projects?|deliver(?:ed|s)?|offices?|presence|completed|faaliyet|aktif|müşteri|musteri|referans|proje|teslim|ofis)\b[^.\n]{0,120}\b(Libya|Egypt|Iraq|Syria|Africa|MENA|GCC|Middle East|Mısır|Misir|Irak|Suriye|Afrika|Orta Doğu|Orta Dogu)\b/i;
const PARTNER_TERMS = ["concrete batching plant", "complete hot-dip galvanizing", "waste-to-energy", "crushing and screening", "beton santrali", "galvaniz", "atık", "atik"];
const PARTNER_SAFE_WORDS = ["partner", "supplier", "network", "coordinated", "through qualified", "through specialized", "tedarikçi", "tedarikci", "partner üzerinden", "partner uzerinden", "koordine"];
const DEFAULT_CTA = {
  EN: "What would you clarify first before comparing options?",
  TR: "Teklifleri karşılaştırmadan önce siz hangi noktayı netleştirirsiniz?",
  AR: "ما النقطة التي توضحونها أولاً قبل مقارنة العروض؟",
};
const VISUAL_BRIEF_TEXT = {
  EN: {
    supporting_text: "One clear procurement insight per slide or graphic.",
    cta_placement: "final slide or caption ending",
  },
  TR: {
    supporting_text: "Her slayt veya görselde tek ve net bir satın alma içgörüsü.",
    cta_placement: "son slayt veya açıklama sonu",
  },
  AR: {
    supporting_text: "فكرة واضحة واحدة عن المشتريات في كل شريحة أو تصميم.",
    cta_placement: "الشريحة الأخيرة أو نهاية النص",
  },
};
const INTERNAL_COPY_PATTERNS = [
  /\bhuman approval required before publishing\.?/gi,
  /\bhuman review required before publishing\.?/gi,
];

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function loadTruth() {
  for (const truthPath of TRUTH_PATHS) {
    if (fs.existsSync(truthPath)) {
      return JSON.parse(fs.readFileSync(truthPath, "utf8"));
    }
  }
  throw new Error("VORQA truth file could not be loaded.");
}

function readRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string") {
    return Promise.resolve(JSON.parse(req.body));
  }
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body too large."), { code: "BODY_TOO_LARGE" }));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(Object.assign(error, { code: "INVALID_JSON" }));
      }
    });
    req.on("error", reject);
  });
}

function cleanString(value, limit) {
  if (value == null) return "";
  return String(value).replace(/\s+\n/g, "\n").trim().slice(0, limit);
}

function validateInput(body) {
  const payload = {
    topic: cleanString(body.topic, MAX_TOPIC),
    persona: cleanString(body.persona || "MIRA", 12).toUpperCase(),
    language: cleanString(body.language || "EN", 4).toUpperCase(),
    content_type: cleanString(body.content_type || "Procurement Education", MAX_CONTENT_TYPE),
    source_class: cleanString(body.source_class || "PUBLIC", 32).toUpperCase(),
    source_material: cleanString(body.source_material, MAX_SOURCE_MATERIAL),
    cta: cleanString(body.cta, MAX_CTA),
  };

  if (!payload.topic) return { error: "INVALID_TOPIC", message: "Topic is required." };
  if (!SUPPORTED_PERSONAS.has(payload.persona)) return { error: "UNSUPPORTED_PERSONA", message: "Unsupported persona." };
  if (!SUPPORTED_LANGUAGES.has(payload.language)) return { error: "UNSUPPORTED_LANGUAGE", message: "Unsupported language." };
  if (SENSITIVE_SOURCE_CLASSES.has(payload.source_class)) {
    return {
      error: "CONFIDENTIAL_SOURCE_REJECTED",
      message: "Sensitive RFQs, prices, customer data, emails, margins, quotations and project information must not be submitted through the public Mira dashboard.",
    };
  }
  if (!WEB_SOURCE_CLASSES.has(payload.source_class)) return { error: "UNSUPPORTED_SOURCE_CLASS", message: "Unsupported source class." };
  if (String(body.source_material || "").length > MAX_SOURCE_MATERIAL) return { error: "SOURCE_MATERIAL_TOO_LONG", message: "Source notes are too long." };
  if (String(body.topic || "").length > MAX_TOPIC) return { error: "TOPIC_TOO_LONG", message: "Topic is too long." };
  if (String(body.cta || "").length > MAX_CTA) return { error: "CTA_TOO_LONG", message: "CTA is too long." };
  return { payload };
}

function excerpt(text, index, length) {
  return text.slice(Math.max(0, index - 60), Math.min(text.length, index + length + 60)).replace(/\s+/g, " ").trim();
}

function collectMatches(patterns, text, kind) {
  const matches = [];
  for (const [label, pattern] of patterns) {
    const found = pattern.exec(text);
    if (found) {
      matches.push({ kind, label, match: found[0], excerpt: excerpt(text, found.index, found[0].length) });
    }
  }
  return matches;
}

function validateText(text) {
  const prohibited = collectMatches(PROHIBITED_PATTERNS, text, "prohibited");
  const verify_before_use = collectMatches(VERIFY_PATTERNS, text, "verify_before_use");
  const geo = GEO_OPERATION_PATTERN.exec(text);
  if (geo) {
    verify_before_use.push({
      kind: "verify_before_use",
      label: "unsupported VORQA geography/operations claim",
      match: geo[0],
      excerpt: excerpt(text, geo.index, geo[0].length),
    });
  }

  const lower = text.toLowerCase();
  for (const term of PARTNER_TERMS) {
    const idx = lower.indexOf(term);
    if (idx === -1) continue;
    const window = lower.slice(Math.max(0, idx - 120), idx + term.length + 120);
    if (window.includes("vorqa") && !PARTNER_SAFE_WORDS.some((safe) => window.includes(safe))) {
      verify_before_use.push({
        kind: "verify_before_use",
        label: "partner capability needs partner/supplier wording",
        match: term,
        excerpt: excerpt(text, idx, term.length),
      });
    }
  }

  return {
    prohibited,
    verify_before_use,
    passed: prohibited.length === 0 && verify_before_use.length === 0,
    human_review_required: true,
  };
}

function words(text) {
  return cleanString(text, 20000).split(/\s+/).filter(Boolean);
}

function trimWords(text, limit) {
  const parts = words(text);
  if (parts.length <= limit) return text.trim();
  return parts.slice(0, limit).join(" ").replace(/[.,;:]$/, "") + "...";
}

function defaultCta(language) {
  return DEFAULT_CTA[language] || DEFAULT_CTA.EN;
}

function cleanPlatformCopy(text) {
  let clean = text;
  for (const pattern of INTERNAL_COPY_PATTERNS) {
    clean = clean.replace(pattern, "");
  }
  return clean
    .split(/\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, lines) => line.trim() || (index > 0 && index < lines.length - 1))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildHashtags(topic, contentType) {
  const tags = ["#Procurement", "#IndustrialSourcing", "#B2B"];
  const lower = `${topic} ${contentType}`.toLowerCase();
  if (lower.includes("rfq")) tags.push("#RFQ");
  if (lower.includes("supplier")) tags.push("#SupplierEvaluation");
  if (lower.includes("turkiye") || lower.includes("türkiye")) tags.push("#Turkiye");
  return tags.slice(0, 5).join(" ");
}

function visualBrief(topic, language, contentType, platform) {
  const aspect = { linkedin: "1200x1200 or carousel", instagram: "1080x1350", facebook: "1200x630" }[platform];
  const localized = VISUAL_BRIEF_TEXT[language] || VISUAL_BRIEF_TEXT.EN;
  return {
    format: platform === "facebook" ? "static post graphic" : "carousel",
    aspect_ratio: aspect,
    headline: trimWords(topic, 10),
    supporting_text: localized.supporting_text,
    image_type: "branded industrial process visual, component graphic, or typography-led educational visual",
    real_imagery_required: false,
    canva_template_category: "educational-industrial",
    language_version: language,
    content_type: contentType,
    cta_placement: localized.cta_placement,
  };
}

function adaptPlatforms(master, payload, truth) {
  const signature = payload.persona === "MIRA" ? "Mira | VORQA AI Industry Analyst" : "VORQA Global Supply";
  const hashtags = buildHashtags(payload.topic, payload.content_type);
  const cta = payload.cta || defaultCta(payload.language);
  const first = trimWords(master, 36);
  const body = trimWords(master, 110);
  const statuses = truth.platform_status || {};

  return {
    linkedin: {
      platform_status: statuses.linkedin || "ACTIVE",
      copy: cleanPlatformCopy(`${payload.topic}\n\n${first}\n\n${cta}\n\n${signature}\n${hashtags}`),
      visual_brief: visualBrief(payload.topic, payload.language, payload.content_type, "linkedin"),
      notes: ["LinkedIn is active. Human approval required before publishing."],
    },
    instagram: {
      platform_status: statuses.instagram || "PLANNED",
      copy: cleanPlatformCopy(`${payload.topic}\n\n${trimWords(body, 65)}\n\n${cta}\n\n${signature}\n${hashtags}`),
      visual_brief: visualBrief(payload.topic, payload.language, payload.content_type, "instagram"),
      notes: ["Planned-account adaptation only. Do not imply an active Instagram account."],
    },
    facebook: {
      platform_status: statuses.facebook || "PLANNED",
      copy: cleanPlatformCopy(`${payload.topic}\n\n${trimWords(body, 85)}\n\n${cta}`),
      visual_brief: visualBrief(payload.topic, payload.language, payload.content_type, "facebook"),
      notes: ["Planned-account adaptation only. Do not imply an active Facebook account."],
    },
  };
}

function buildInstructions(truth) {
  return [
    "You are Mira, explicitly the VORQA AI Industry Analyst, or the VORQA corporate voice when persona is VORQA.",
    "Generate one MASTER social media post only. Do not generate platform adaptations.",
    "Use approved facts normally.",
    "Use partner capabilities only with partner, supplier, network, coordinated, or through qualified/specialized partner wording.",
    "Do not silently present verify-before-use claims as facts.",
    "Never intentionally generate prohibited claims.",
    "Do not invent customers, projects, countries, certificates, capacities, supplier counts, response times, meetings, memories, factory stories, trade-show stories, testimonials, or first-person experiences.",
    "Mira is AI. Never write Mira Yilmaz or Mira Yılmaz.",
    "Return plain text only.",
    `Approved facts: ${JSON.stringify(truth.approved_facts || [])}`,
    `Partner capabilities: ${JSON.stringify(truth.partner_capabilities || [])}`,
    `Verify before use: ${JSON.stringify(truth.verify_before_use || [])}`,
    `Prohibited claims: ${JSON.stringify(truth.prohibited_claims || [])}`,
  ].join("\n");
}

function buildUserInput(payload) {
  return JSON.stringify({
    topic: payload.topic,
    persona: payload.persona,
    language: payload.language,
    content_type: payload.content_type,
    source_class: payload.source_class,
    source_material: payload.source_material,
    cta: payload.cta,
  });
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text.trim();
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

async function callOpenAI(payload, truth) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      instructions: buildInstructions(truth),
      input: buildUserInput(payload),
      max_output_tokens: 1200,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with HTTP ${response.status}.`);
  }
  const data = await response.json();
  const text = extractOutputText(data);
  if (!text) throw new Error("OpenAI returned no text output.");
  return { text, response_id: data.id || null, model: data.model || process.env.OPENAI_MODEL || DEFAULT_MODEL };
}

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED", message: "POST only." });
  }

  let body;
  try {
    body = await readRequestBody(req);
  } catch (error) {
    const code = error.code === "BODY_TOO_LARGE" ? "BODY_TOO_LARGE" : "INVALID_JSON";
    return sendJson(res, code === "BODY_TOO_LARGE" ? 413 : 400, { ok: false, error: code, message: error.message });
  }

  const validation = validateInput(body);
  if (validation.error) {
    const statusCode = validation.error === "CONFIDENTIAL_SOURCE_REJECTED" ? 400 : 400;
    return sendJson(res, statusCode, { ok: false, error: validation.error, message: validation.message });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 503, { ok: false, error: "AI_NOT_CONFIGURED", message: "AI generation is not configured." });
  }

  let truth;
  try {
    truth = loadTruth();
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: "TRUTH_FILE_UNAVAILABLE", message: "VORQA truth file could not be loaded." });
  }

  let generated;
  try {
    generated = await callOpenAI(validation.payload, truth);
  } catch (error) {
    return sendJson(res, 502, { ok: false, error: "OPENAI_REQUEST_FAILED", message: error.message });
  }

  const platform_adaptations = adaptPlatforms(generated.text, validation.payload, truth);
  const fact_validation = validateText(`${generated.text}\n${JSON.stringify(platform_adaptations)}`);
  const status = fact_validation.passed ? "DRAFT" : "NEEDS_REVIEW";

  return sendJson(res, 200, {
    ok: true,
    version: VERSION,
    topic: validation.payload.topic,
    persona: validation.payload.persona,
    content_type: validation.payload.content_type,
    master_language: validation.payload.language,
    source_class: validation.payload.source_class,
    source_material_stored: false,
    master_content: generated.text,
    platform_adaptations,
    fact_validation,
    status,
    human_approved: false,
    generation: {
      provider: "openai",
      api: "responses",
      model: generated.model,
      response_id: generated.response_id,
      mode: "LIVE",
    },
  });
}

module.exports = handler;
module.exports._private = {
  adaptPlatforms,
  buildInstructions,
  cleanPlatformCopy,
  defaultCta,
  extractOutputText,
  validateInput,
  validateText,
};
