export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);
    if (url.pathname === "/api/generate" && request.method === "POST") {
      const { text, tone, language } = await request.json();

      if (!text || !tone || !language) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const prompt = `You are an expert writing assistant.

Rewrite the following text in the tone: ${tone}
Output language: ${language}

Rules:
- Keep the same meaning, improve grammar, clarity and readability.
- No spelling mistakes.
- Plain text only: no markdown, no asterisks, no bullet symbols, no bold/italic formatting.
- Provide exactly 2 alternative versions.
- Separate the two versions with a line containing only: -------

Text:
${text}`;

      const MODEL = "gemini-3.5-flash-lite";

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};