# Adversarial IC — the investment committee, simulated

You're the **analyst**. You've done the work and you're recommending the deal.
Now four AI committee partners pressure-test your investment case — live, in
character, one hard question at a time. A judge then scores your defence across
five dimensions and hands down the committee's verdict.

> No fabricated numbers. Just the thesis, under load.

This is a faithful port of the **Adversarial IC** design concept into a real
**Next.js (App Router) + TypeScript** app, with the committee powered by
**Google Gemini** (called server-side so the API key never reaches the browser).

## The committee

| Partner | Mandate | Attacks |
|---|---|---|
| **The Skeptic** — Market Partner | Conviction & thesis | TAM, competition, incumbents, substitution, why-now |
| **The Operator** — Operating Partner | Data density | Unit economics, burn, runway, hiring, margin |
| **The Regulator** — Risk & Compliance | Risk acknowledgment | MDR/MHRA, EU AI Act, DORA, GDPR — article numbers |
| **The Chair** — Managing Partner (IC chair) | Thesis alignment · poise | Fund construction, ownership, follow-on, portfolio conflict |

Three sample deals ship in the pipeline (TORTUS AI, Deeploy, Noteless), or paste
your own company and take it to the table. The committee reasons **only** from
the deal memo — unknown figures are probed, never invented.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

Get a Gemini key at <https://aistudio.google.com/apikey>.

**No key?** The app still runs — it falls back to a built-in scripted committee,
so you can demo the full flow offline. Set the key to get live, in-character
partners and a real judged verdict.

### Environment

| Variable | Default | Notes |
|---|---|---|
| `GEMINI_API_KEY` | — | Server-side only. Without it, the scripted fallback runs. |
| `GEMINI_MODEL` | `gemini-flash-latest` | Rolling alias to the current flash model. Pin e.g. `gemini-3.5-flash` / `gemini-3.5-pro` if preferred. |
| `IC_USE_SEARCH` | `false` | `true` grounds turns with Google Search (relaxes the memo-only guarantee). |

## Architecture

All model calls route through one server endpoint, keeping the key private and
preserving the "memo-only, no fabricated numbers" contract.

```
app/
  layout.tsx            next/font (Space Grotesk · IBM Plex Sans · JetBrains Mono) + tokens
  globals.css           design tokens, dot-grid, keyframes
  page.tsx              -> <Committee/>
  api/model/route.ts    POST -> Gemini (@google/genai), server-side
components/
  Committee.tsx         screen switch
  screens/              Landing · Brief · Room · Report
  ui/                   Tooltip
lib/
  members.ts deals.ts   committee + pipeline data (the memo = the only facts)
  prompts.ts            turn / judge / draft / sharpen prompts
  model.ts              client callModel / askJSON  ->  /api/model
  store.ts              Zustand store + turn-loop orchestration
  charts.ts memberVM …  view-model helpers (hand-built SVG chart math)
  tts.ts voice.ts …     Web Speech synthesis + recognition, persistence, export
```

State is a Zustand store; the turn loop fetches a JSON turn then reveals it with
a client-side typewriter, exactly as the design concept does. Charts are
hand-built SVG/CSS. TTS (per-persona voices) and push-to-talk voice input use the
Web Speech API and degrade gracefully where unsupported. Sessions persist to
`localStorage` (`ic_session_v1`) with a resume banner on return.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Deploy

Deploys to Vercel as-is — set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`)
as project environment variables.
