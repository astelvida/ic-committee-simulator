import { GoogleGenAI } from "@google/genai";

// Always run at request time on the Node runtime (needs the API key + fetch).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  system?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  useSearch?: boolean;
  json?: boolean;
}

// Server-side committee model. Implements the prototype's provider contract:
//   ask({ system, messages, maxTokens, useSearch }) -> text
// The Gemini key stays on the server; the browser only ever hits this route.
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  // No key → 503 so the client falls back to the built-in scripted committee.
  if (!apiKey) {
    return Response.json({ error: "no_api_key" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const { system, messages = [], maxTokens = 1024, useSearch, json } = body;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const wantSearch =
    typeof useSearch === "boolean"
      ? useSearch
      : process.env.IC_USE_SEARCH === "true";

  const ai = new GoogleGenAI({ apiKey });
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  try {
    const res = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: system,
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        // Disable "thinking" so the prototype's small token budgets aren't
        // consumed by reasoning tokens (keeps replies snappy and non-empty).
        thinkingConfig: { thinkingBudget: 0 },
        // JSON mode and Google Search grounding are mutually exclusive.
        ...(wantSearch
          ? { tools: [{ googleSearch: {} }] }
          : json
            ? { responseMimeType: "application/json" }
            : {}),
      },
    });
    return Response.json({ text: res.text ?? "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "model_error";
    return Response.json({ error: message }, { status: 502 });
  }
}
