# Adversarial IC — project notes

Single-file interactive prototype. A VC **investment committee simulator**: the user is the *analyst* recommending a deal and defends the investment case, live, against four AI partners. Analyst POV throughout — never a founder pitch. Aesthetic: bold light (warm paper `--bg`, dot-grid, saturated per-partner colors), Space Grotesk / IBM Plex Sans / JetBrains Mono.

## Files
- `Adversarial IC.dc.html` — the entire app (one Design Component: template + `class Component extends DCLogic`). Edit via `dc_*` / `str_replace_edit`.
- `gemini-provider.js` — optional model routing (Gemini / OpenAI-compatible / opus-8). Not loaded by default.
- `support.js` — DC runtime. **Never edit.**

## Architecture (all inside the DC logic class)
- `MEMBERS` — the 4 partners (Skeptic / Operator / Regulator / Chair): persona, keywords, TTS voice, activities. Fixed order via `_ids()`.
- `DEALS` — built in `_buildDeals()`; each deal's `model` string is **the only facts the committee may use**. Custom deals via `_customDeal()`.
- Screens (single `screen` state): `landing → brief → room → report`, each an `<sc-if>` block.
- Turn loop: `submit()` → `_committeeTurn()` (shared prompt via `_turnPrompts()`) → `_askJSON()` → `_speakLine()` (typewriter + avatar + TTS) → `_finishLine()`. Fallbacks: `_fallbackTurn`, `_fallbackReport`.
- Verdict: `callVote()` → judge JSON → `_finishReport()` → report screen.

## Hard rules (do not regress)
- **No fabricated numbers.** Every prompt confines the model to the deal `model` string; unknown figures must be probed, not invented. Preserve this in any new prompt.
- Works identically on Claude (default `window.claude.complete`) and any `window.IC_PROVIDER`. Route ALL model calls through `_callModel()`.
- Inline styles only; palette lives in `:root` vars in `<helmet>` (`--sk/--op/--rg/--ch` = partner colors, `--acc` = accent prop, `--bg/--panel/--line/--tx/--muted/--faint`).

## Features wired
- **Session persistence** — localStorage key `ic_session_v1` (`_persist` / `_readSession` / `_clearSession`). Landing shows a Resume/Discard banner; resume restores room or report and re-triggers a partner turn if the analyst had the last word. Timer resumes via `_startTimer(base)`.
- **Chart tooltips** — on the brief screen only (`_tip` / `_tipOff`, `s.tip`; each chart datum carries an `onEnter`). Fixed-position dark tooltip, clamped to viewport.
- **Verdict export** — `copyBrief` (clipboard) / `downloadBrief` (.md file) built from `_briefMarkdown()`.
- **Optional live search** — set `window.IC_USE_SEARCH=true` with a Gemini provider (`createGeminiProvider({search:true})`) to ground turns via `useSearch` on `_callModel`. Dormant for Claude; relaxes the memo-only guarantee, so enable consciously.

## Extending
- **Add a deal** → push to `_buildDeals()`; include `model`, `opener`, `funding/ssiBreak/comps` (drive the charts), `attacks`, `kill`.
- **Add a partner** → add to `MEMBERS` and `_ids()`. Scores are `/50` across 5 dimensions (not per-partner) — revisit judge/report copy if you change the count.
- **Tweaks (props)** — `difficulty` (Fair/Brutal), `ttsDefault`, `accent`.

## Conventions
- Keep edits targeted; copy a file to a `v2` before a big redesign.
- Charts are hand-built SVG/CSS; dynamic text uses HTML overlays (SVG can't read reactive holes). Gauge uses a precomputed `stroke-dasharray`.
