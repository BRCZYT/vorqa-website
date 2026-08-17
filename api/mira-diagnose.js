module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const smoke = await fetch("https://www.vorqaglobal.com/api/mira-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Why technical procurement should compare lifecycle cost, not only purchase price",
        persona: "MIRA",
        language: "EN",
        content_type: "Procurement Education",
        source_class: "PUBLIC"
      }),
    });

    let body = null;
    try { body = await smoke.json(); } catch (_) {}

    res.statusCode = 200;
    return res.end(JSON.stringify({
      ok: smoke.ok && Boolean(body?.ok),
      stage: "canonical_mira_smoke",
      http_status: smoke.status,
      generation_mode: body?.generation?.mode || null,
      generation_model: body?.generation?.model || null,
      human_approved: typeof body?.human_approved === "boolean" ? body.human_approved : null,
      fact_validation_passed: typeof body?.fact_validation?.passed === "boolean" ? body.fact_validation.passed : null,
      error: body?.error || null,
      message: body?.message || null
    }));
  } catch (error) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, stage: "runtime", message: error?.message || String(error) }));
  }
};
