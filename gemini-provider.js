/*
 * Adversarial IC — pluggable model provider (Gemini / OpenAI-compatible).
 * ---------------------------------------------------------------------------
 * The app defaults to the built-in Claude helper (window.claude.complete, no key).
 * To route the committee through Gemini — or through opus-8 behind your own
 * gateway — load this file and set window.IC_PROVIDER BEFORE opening the room:
 *
 *   <script type="module">
 *     import { createGeminiProvider } from './gemini-provider.js';
 *     window.IC_PROVIDER = createGeminiProvider({
 *       apiKey: 'YOUR_GEMINI_KEY',
 *       model:  'gemini-2.5-flash',   // your free-tier model
 *       search: false,                // set true to allow Google Search grounding
 *     });
 *   </script>
 *
 * The app checks window.IC_PROVIDER first; if present it uses it, otherwise it
 * falls back to the built-in Claude helper. Both must satisfy this contract:
 *
 *   ask({ system, messages, maxTokens, useSearch }) -> Promise<string>
 *     system    : string   (persona / instructions)
 *     messages  : [{ role: 'user' | 'assistant', content: string }]
 *     maxTokens : number
 *     useSearch : boolean  (OPTIONAL — ground this call with live web search if
 *                           the provider supports it; ignored otherwise)
 *     returns   : the model's text response (JSON string, in this app)
 *
 * LIVE SEARCH HOOK
 * ----------------
 * Search is DORMANT by default and never used by the built-in Claude path (which
 * is deliberately memo-only). To enable it end-to-end with Gemini:
 *   1. createGeminiProvider({ ..., search: true })   // always-on, or
 *   2. set window.IC_USE_SEARCH = true               // app passes useSearch per call
 * Note: grounding lets the model reach beyond the memo, which relaxes the app's
 * "no fabricated numbers, memo-only" guarantee. Enable it consciously.
 * ---------------------------------------------------------------------------
 */

export function createGeminiProvider({ apiKey, model = 'gemini-2.5-flash', endpoint, temperature = 0.7, search = false } = {}) {
  if (!apiKey) console.warn('[IC] createGeminiProvider: no apiKey provided.');
  const base = endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return {
    supportsSearch: true,
    async ask({ system, messages, maxTokens = 1024, useSearch } = {}) {
      const contents = (messages || []).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const body = {
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      };
      if (system) body.systemInstruction = { parts: [{ text: system }] };
      // Google Search grounding (Gemini 2.x): opt-in via provider `search` or per-call `useSearch`.
      if (search || useSearch) body.tools = [{ google_search: {} }];
      const res = await fetch(`${base}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Gemini request failed: ' + res.status + ' ' + (await res.text().catch(() => '')));
      const data = await res.json();
      const cand = data?.candidates?.[0];
      const parts = cand?.content?.parts || [];
      const text = parts.map((p) => p.text || '').join('');
      // Grounding sources, when search ran — surfaced for logging/debugging only.
      const grounding = cand?.groundingMetadata;
      if (grounding && typeof window !== 'undefined' && window.IC_DEBUG_SEARCH) {
        const chunks = grounding.groundingChunks || [];
        console.info('[IC] search grounding:', chunks.map((c) => c?.web?.uri).filter(Boolean));
      }
      return text;
    },
  };
}

/*
 * OpenAI-compatible provider — use this for opus-8 (or any model) served behind
 * an OpenAI-style /chat/completions gateway.
 *
 *   window.IC_PROVIDER = createOpenAICompatProvider({
 *     apiKey: 'YOUR_KEY',
 *     model:  'opus-8',
 *     endpoint: 'https://your-gateway.example/v1/chat/completions',
 *     searchTool: { type: 'web_search' },  // OPTIONAL — your gateway's search tool spec
 *   });
 */
export function createOpenAICompatProvider({ apiKey, model = 'opus-8', endpoint, temperature = 0.7, searchTool } = {}) {
  const base = endpoint || 'https://api.openai.com/v1/chat/completions';
  return {
    supportsSearch: !!searchTool,
    async ask({ system, messages, maxTokens = 1024, useSearch } = {}) {
      const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages;
      const payload = { model, messages: msgs, max_tokens: maxTokens, temperature };
      // Live search is gateway-specific — pass the tool spec you configured when asked for it.
      if (useSearch && searchTool) payload.tools = [searchTool];
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed: ' + res.status + ' ' + (await res.text().catch(() => '')));
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || '';
    },
  };
}
