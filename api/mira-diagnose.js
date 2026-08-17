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
    const response = await fetch("https://api.openai.com/v1/responses", {
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

    let body = null;
    try {
      body = await response.json();
    } catch (_) {}

    if (!response.ok) {
      const err = body && body.error ? body.error : {};
      res.statusCode = 502;
      return res.end(JSON.stringify({
        ok: false,
        stage: "openai",
        upstream_status: response.status,
        upstream_error_type: err.type || null,
        upstream_error_code: err.code || null,
        upstream_error_message: err.message || null,
        model,
      }));
    }

    const text = typeof body?.output_text === "string"
      ? body.output_text
      : (body?.output || []).flatMap(i => i.content || []).filter(c => c.type === "output_text").map(c => c.text || "").join("\n");

    res.statusCode = 200;
    return res.end(JSON.stringify({
      ok: true,
      stage: "openai",
      upstream_status: response.status,
      model: body?.model || model,
      response_id: body?.id || null,
      output_ok: String(text).trim() === "MIRA_DIAGNOSTIC_OK",
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
