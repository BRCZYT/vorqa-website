const miraHandler = require("./mira-generate");

module.exports = async function handler(req, res) {
  const originalFetch = global.fetch;

  global.fetch = async function patchedFetch(url, options = {}) {
    if (String(url) === "https://api.openai.com/v1/responses" && options && options.body) {
      try {
        const body = JSON.parse(options.body);
        body.reasoning = { effort: "minimal" };
        body.max_output_tokens = Math.max(Number(body.max_output_tokens || 0), 1800);
        return originalFetch(url, { ...options, body: JSON.stringify(body) });
      } catch (_) {
        return originalFetch(url, options);
      }
    }
    return originalFetch(url, options);
  };

  try {
    return await miraHandler(req, res);
  } finally {
    global.fetch = originalFetch;
  }
};
