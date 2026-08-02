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
      const { input, tone, language } = await request.json();

      const prompt = `
You are an expert writing assistant.

Rewrite the following text into TWO alternative versions.

Tone: ${tone}
Output language: ${language}

Rules:
- Fix all grammar and spelling mistakes.
- Do NOT use asterisks (*), markdown, or any special formatting characters. Plain text only.
- Keep the same meaning as the original text.
- Output ONLY the two options, formatted exactly like this:

Option 1:
<first rewritten version>

---------------

Option 2:
<second rewritten version>

Text:
${input}
`;

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