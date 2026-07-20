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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Transient: model overloaded / rate-limited — retry, then fall through.
const RETRYABLE = /(\b429\b|\b503\b|UNAVAILABLE|overloaded|high demand|RESOURCE_EXHAUSTED)/i;
// Model gone (deprecated / no access) — skip straight to the next model.
const NOT_FOUND = /(\b404\b|NOT_FOUND|no longer available)/i;

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
    // JSON mode and Google Search grounding are mutually exclusive.
    ...(wantSearch
      ? { tools: [{ googleSearch: {} }] }
      : json
        ? { responseMimeType: "application/json" }
        : {}),
  };

  let lastError = "model_error";
  for (const model of modelChain()) {
    // Up to 2 attempts per model, short backoff between, for transient 503/429.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({ model, contents, config });
        return Response.json({ text: res.text ?? "", model });
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (NOT_FOUND.test(lastError)) break; // model gone → next model
        if (RETRYABLE.test(lastError) && attempt === 0) {
          await sleep(600);
          continue; // retry same model once
        }
        break; // non-retryable or exhausted → next model
      }
    }
  }
  // Every model failed → 502 so the client falls back to the scripted committee.
  return Response.json({ error: lastError }, { status: 502 });
}
