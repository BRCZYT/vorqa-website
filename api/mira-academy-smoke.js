module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const r = await fetch("https://www.vorqaglobal.com/api/mira-academy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "How to prepare an industrial RFQ that suppliers can quote accurately",
        primary_keyword: "industrial RFQ preparation",
        language: "EN",
        source_class: "PUBLIC"
      })
    });
    const b = await r.json().catch(() => null);
    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: r.ok && Boolean(b?.ok),
      http_status: r.status,
      workflow: b?.workflow || null,
      status: b?.status || null,
      human_approved: b?.human_approved ?? null,
      publish_allowed: b?.publish_allowed ?? null,
      generation_mode: b?.generation?.mode || null,
      generation_model: b?.generation?.model || null,
      title: b?.draft?.title || null,
      slug: b?.draft?.slug || null,
      has_article: Boolean(b?.draft?.article_markdown),
      faq_count: Array.isArray(b?.draft?.faq) ? b.draft.faq.length : null,
      error: b?.error || null,
      message: b?.message || null,
      raw_preview: b?.raw_preview || null
    }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok:false, error:"SMOKE_RUNTIME", message:e?.message || String(e) }));
  }
};
