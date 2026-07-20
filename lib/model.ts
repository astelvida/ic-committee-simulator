import type { ChatMessage } from "./types";

export interface ModelCall {
  system?: string;
  messages: ChatMessage[];
  maxTokens?: number;
  /** Ground with live web search. Undefined → server default (IC_USE_SEARCH). */
  useSearch?: boolean;
  /** Ask the server to force a JSON response (structured turns / verdict). */
  json?: boolean;
}

// All model calls route through here → the server-side Gemini endpoint, so the
// API key never reaches the browser. Mirrors the prototype's _callModel().
export async function callModel({
  system,
  messages,
  maxTokens = 520,
  useSearch,
  json,
}: ModelCall): Promise<string> {
  const res = await fetch("/api/model", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens, useSearch, json: !!json }),
  });
  if (!res.ok) throw new Error("model request failed: " + res.status);
  const data = (await res.json()) as { text?: string };
  return data.text || "";
}

export function parseJSON<T = unknown>(t: string): T | null {
  if (!t) return null;
  const s = String(t).trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b < 0) return null;
  try {
    return JSON.parse(s.slice(a, b + 1)) as T;
  } catch {
    return null;
  }
}

// Two attempts, second nudges harder for pure JSON. Mirrors _askJSON().
export async function askJSON<T = unknown>(
  system: string,
  user: string,
  maxTokens: number,
): Promise<T | null> {
  for (let i = 0; i < 2; i++) {
    try {
      const raw = await callModel({
        system,
        messages: [
          {
            role: "user",
            content: i
              ? user + "\n\nReturn ONLY the JSON object — no prose, no code fences."
              : user,
          },
        ],
        maxTokens,
        json: true,
      });
      const j = parseJSON<T>(raw);
      if (j) return j;
    } catch {
      /* retry */
    }
  }
  return null;
}

export function cleanText(t: string): string {
  return String(t || "")
    .trim()
    .replace(/^["'“]|["'”]$/g, "")
    .trim();
}
