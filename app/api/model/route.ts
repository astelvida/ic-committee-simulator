import { GoogleGenAI } from "@google/genai";
import type { GenerateContentConfig } from "@google/genai";

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

// Build the fallback chain: the configured/primary model first, then lighter
// alternates. If the primary is overloaded (503) or retired (404), the request
// falls through automatically instead of failing the turn.
function modelChain(): string[] {
  const primary = process.env.GEMINI_MODEL || "gemini-flash-latest";
  return [primary, "gemini-flash-lite-latest", "gemini-2.0-flash"].filter(
    (m, i, a) => a.indexOf(m) === i,
  );
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
  const wantSearch =
    typeof useSearch === "boolean"
      ? useSearch
      : process.env.IC_USE_SEARCH === "true";

  const ai = new GoogleGenAI({ apiKey });
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));
  const config: GenerateContentConfig = {
    systemInstruction: system,
    maxOutputTokens: maxTokens,
    temperature: 0.7,
    // Disable "thinking" so the prototype's small token budgets aren't
    // consumed by reasoning tokens (keeps replies snappy and non-empty).
    thinkingConfig: { thinkingBudget: 0 },
    // Bound each call and disable the SDK's default 5-attempt 503 backoff, so an
    // overloaded model fails fast and we fall through to the next one in ~1s
    // instead of the client hanging for 30s+.
    httpOptions: { timeout: 12000, retryOptions: { attempts: 1 } },
    // JSON mode and Google Search grounding are mutually exclusive.
    ...(wantSearch
      ? { tools: [{ googleSearch: {} }] }
      : json
        ? { responseMimeType: "application/json" }
        : {}),
  };

  let lastError = "model_error";
  // One attempt per model; any error (503 overloaded / 404 retired / timeout)
  // falls through to the next model in the chain.
  for (const model of modelChain()) {
    try {
      const res = await ai.models.generateContent({ model, contents, config });
      return Response.json({ text: res.text ?? "", model });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  // Every model failed → 502 so the client falls back to the scripted committee.
  return Response.json({ error: lastError }, { status: 502 });
}
