module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const model = process.env.OPENAI_MODEL || "gpt-5";
  const configured = Boolean(process.env.OPENAI_API_KEY);

  if (!configured) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ ok: false, stage: "config", api_key_present: false, model }));
  }

  try {
    const direct = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: "Reply with exactly: MIRA_DIAGNOSTIC_OK",
        max_output_tokens: 32,
      }),
    });

    let directBody = null;
    try { directBody = await direct.json(); } catch (_) {}

    if (!direct.ok) {
      const err = directBody && directBody.error ? directBody.error : {};
      res.statusCode = 502;
      return res.end(JSON.stringify({
        ok: false,
        stage: "openai_direct",
        upstream_status: direct.status,
        upstream_error_type: err.type || null,
        upstream_error_code: err.code || null,
        upstream_error_message: err.message || null,
        model,
      }));
    }

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

    let smokeBody = null;
    try { smokeBody = await smoke.json(); } catch (_) {}

    res.statusCode = 200;
    return res.end(JSON.stringify({
      ok: direct.ok && smoke.ok,
      stage: "full_mira_smoke",
      direct_openai_status: direct.status,
      direct_model: directBody?.model || model,
      mira_status: smoke.status,
      mira_ok: Boolean(smokeBody?.ok),
      mira_error: smokeBody?.error || null,
      mira_message: smokeBody?.message || null,
      generation_mode: smokeBody?.generation?.mode || null,
      generation_model: smokeBody?.generation?.model || null,
      human_approved: typeof smokeBody?.human_approved === "boolean" ? smokeBody.human_approved : null,
      fact_validation_passed: typeof smokeBody?.fact_validation?.passed === "boolean" ? smokeBody.fact_validation.passed : null
    }));
  } catch (error) {
    res.statusCode = 500;
    return res.end(JSON.stringify({
      ok: false,
      stage: "network_or_runtime",
      error_name: error?.name || null,
      error_message: error?.message || String(error),
      model,
    }));
  }
};
