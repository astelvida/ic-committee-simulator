import type { Deal, Pill } from "./types";

type PillKind = "green" | "amber" | "red" | "purple" | "mute";

const PILL_MAP: Record<PillKind, string> = {
  green:
    "color:var(--op);background:color-mix(in srgb,var(--op) 16%,transparent);border:1px solid color-mix(in srgb,var(--op) 30%,transparent)",
  amber:
    "color:var(--rg);background:color-mix(in srgb,var(--rg) 16%,transparent);border:1px solid color-mix(in srgb,var(--rg) 30%,transparent)",
  red: "color:var(--sk);background:color-mix(in srgb,var(--sk) 16%,transparent);border:1px solid color-mix(in srgb,var(--sk) 30%,transparent)",
  purple:
    "color:var(--ch);background:color-mix(in srgb,var(--ch) 16%,transparent);border:1px solid color-mix(in srgb,var(--ch) 30%,transparent)",
  mute: "color:var(--muted);background:var(--panel2);border:1px solid var(--line)",
};

export function pill(label: string, kind: PillKind = "mute"): Pill {
  return {
    label,
    style:
      "font-family:var(--mono);font-size:10px;letter-spacing:.03em;font-weight:600;padding:3px 9px;border-radius:6px;" +
      (PILL_MAP[kind] || PILL_MAP.mute),
  };
}

const P = pill;

// The pipeline. Each deal's `model` string is the ONLY set of facts the
// committee may use. Ported verbatim from the design concept _buildDeals().
export function buildDeals(): Deal[] {
  return [
    {
      id: "tortus",
      name: "TORTUS AI",
      ssi: 82,
      ssiColor: "var(--sk)",
      priority: "P0",
      sector: "Healthcare AI",
      stage: "Seed",
      hq: "London",
      oneLiner:
        "AI clinical documentation writing directly into EHRs · MHRA Class IIa · 3,500+ GP practices via X-on Health",
      tagline:
        "AI clinical documentation writing directly into EHR systems. NHS DTAC compliant, MHRA-registered Class IIa medical device. 3,500+ GP practices via X-on Health.",
      ssiConfidence: "High",
      roomSub: "Seed · £15M post-money cap on the table",
      pills: [
        P("Vertical SoR", "green"),
        P("Healthcare AI", "amber"),
        P("Seed · London", "mute"),
        P("P0", "red"),
      ],
      tiles: [
        { k: "Stage", v: "Seed" },
        { k: "Round cap", v: "£15M" },
        { k: "Headcount", v: "24" },
        { k: "Catalyst", v: "91d" },
      ],
      sideRows: [
        { k: "Founded", v: "2022" },
        { k: "Headcount", v: "24" },
        { k: "HQ", v: "London" },
        { k: "Raised to date", v: "$8.5M" },
        { k: "Seed (2024)", v: "Khosla" },
        { k: "Falsifier", v: "Clean" },
        { k: "Signal tier", v: "Highest" },
      ],
      railRows: [
        { k: "SSI", v: "82" },
        { k: "Stage", v: "Seed" },
        { k: "Sector", v: "Health AI" },
        { k: "Catalyst", v: "91d" },
        { k: "Priority", v: "P0" },
      ],
      funding: [
        { label: "Seed 2024 · Khosla", amt: 4.2 },
        { label: "MHRA programme", amt: 3.6 },
        { label: "This round (cap)", amt: 15 },
      ],
      ssiBreak: [
        { k: "Signal quality", v: 88 },
        { k: "Moat durability", v: 84 },
        { k: "Catalyst window", v: 74 },
        { k: "Team & execution", v: 80 },
      ],
      comps: [
        { name: "TORTUS (this)", v: 15, self: true },
        { name: "Health-AI Seed median", v: 30 },
        { name: "Heidi Series A (Mar 26)", v: 120 },
      ],
      why: "The investment case rests on two things: deep workflow embeddedness in the EHR (write-loop ownership, not overlay) and a regulatory moat. MHRA Class IIa registration is reported to take ~18 months and roughly €400K to replicate; once thousands of practices route through it, switching cost becomes institutional. The open question for the committee is whether that moat holds against a funded incumbent.",
      signal:
        "MHRA AI Airlock Phase 2 inclusion + £3.6M programme funding (Apr 2026, per memo). GOSH multi-site rollout expanding. The ~91-day window is the runway before the next round.",
      enrich:
        'From the memo: Heidi raised $19M Series A (Sequoia, Mar 2026). Nuance DAX list price $200/clinician/month. Epic announced "Smart Prompts" in its Apr 2026 roadmap — limited beta, no GA date. NHS Long Term Workforce Plan cites an £80M FY2026 AI-documentation budget. Figures beyond these are not on file.',
      attacks: [
        "Heidi is free for clinicians and just raised $19M. Who pays TORTUS, and why not standardise on Heidi in twelve months?",
        "On the memo figures, what does the next year of hiring do to runway — and what margin are we underwriting?",
        "Class IIa demands post-market surveillance (MDR Article 83). Who runs vigilance at 24 people as the install base grows?",
        "What ownership does this £15M cap buy, and is there conflict with other healthcare-workflow bets?",
      ],
      kill: "Epic ships native AI documentation within ~9 months → thesis breaks. MHRA Airlock reverts to Phase 1 → moat weakens. GOSH expansion stalls → signal decays. (Directional, from the memo — not scored figures.)",
      readNote:
        "memo compiled from pipeline row + market context · figures as noted",
      opener:
        "You’re recommending we lead TORTUS’s seed at the £15M cap on the table. Set price aside for a moment — who actually pays for this, and why doesn’t Heidi, now flush from a $19M Sequoia round, own this workflow inside twelve months?",
      model:
        'TORTUS AI — AI clinical documentation writing directly into EHR systems. NHS DTAC compliant, MHRA-registered Class IIa medical device. ~3,500 GP practices via X-on Health. Seed, London, 24 people, SSI 82 (High), P0. Raised $8.5M to date ($4.2M Khosla, Feb 2024). Round cap being evaluated: £15M post-money. Thesis: Vertical SoR. Catalyst ~91 days. Recent signal: MHRA AI Airlock Phase 2 + £3.6M programme funding (Apr 2026); GOSH multi-site rollout. Market context: Heidi raised $19M Series A (Sequoia, Mar 2026); Nuance DAX ~$200/clinician/month; Epic "Smart Prompts" Apr 2026 roadmap, no GA; NHS £80M FY2026 AI-documentation budget. Kill criteria (directional): Epic native docs ~9mo; MHRA Airlock reverts to Phase 1; GOSH stalls. NOTE: these are the ONLY figures on file — do not invent others; treat anything else as unknown.',
    },

    {
      id: "deeploy",
      name: "Deeploy",
      ssi: 80,
      ssiColor: "var(--sk)",
      priority: "P0",
      sector: "AI Governance",
      stage: "Series A",
      hq: "Utrecht",
      oneLiner:
        "AI governance & monitoring for ML in regulated industries · EU AI Act Article 9 aligned · deployed across EU banks",
      tagline:
        "AI governance and monitoring for ML systems in regulated industries. EU AI Act Article 9 risk-management aligned. Deployed across EU banks and insurers.",
      ssiConfidence: "High",
      roomSub: "Series A · €12M round under evaluation",
      pills: [
        P("Governed Agentic", "purple"),
        P("AI Governance", "mute"),
        P("Series A · Utrecht", "mute"),
        P("P0", "red"),
      ],
      tiles: [
        { k: "Stage", v: "Series A" },
        { k: "Round", v: "€12M" },
        { k: "Headcount", v: "38" },
        { k: "Catalyst", v: "120d" },
      ],
      sideRows: [
        { k: "Founded", v: "2019" },
        { k: "Headcount", v: "38" },
        { k: "HQ", v: "Utrecht" },
        { k: "Round", v: "€12M" },
        { k: "Catalyst", v: "120d" },
        { k: "Falsifier", v: "Clean" },
        { k: "Signal tier", v: "Highest" },
      ],
      railRows: [
        { k: "SSI", v: "80" },
        { k: "Stage", v: "Series A" },
        { k: "Sector", v: "AI Gov" },
        { k: "Catalyst", v: "120d" },
        { k: "Priority", v: "P0" },
      ],
      funding: [
        { label: "Seed 2021", amt: 3 },
        { label: "Series A (round)", amt: 12 },
      ],
      ssiBreak: [
        { k: "Signal quality", v: 82 },
        { k: "Moat durability", v: 70 },
        { k: "Catalyst window", v: 86 },
        { k: "Team & execution", v: 78 },
      ],
      comps: [
        { name: "Deeploy (this)", v: 60, self: true },
        { name: "AI-gov Series A median", v: 75 },
        { name: "Credo AI", v: 130 },
      ],
      why: "The case is that Deeploy becomes the system-of-record for model risk in regulated enterprises. The wedge is the audit relationship: once monitoring, explainability and attestation live inside a bank’s compliance workflow, replacement is a board-level event. EU AI Act enforcement is the forcing function; the risk is commoditisation by the cloud vendors.",
      signal:
        "Closed three tier-1 EU banks in Q1 2026 (per memo). EU AI Act GPAI obligations go live August 2026, pulling procurement forward across financial services.",
      enrich:
        "From the memo: Credo AI raised $30M (2025). Hyperscalers bundle basic model-monitoring free. Big-4 consultancies are building AI-Act attestation practices. Pricing and win-rate figures are not on file.",
      attacks: [
        "AI governance is crowded — Credo, Holistic, hyperscaler tooling. What can a bank not get bundled free from its cloud vendor?",
        "What’s the land-and-expand economics per bank? If it isn’t in the memo, what’s your estimate and basis?",
        "Which specific AI-Act articles does Deeploy satisfy that a competitor cannot, and how durable is that?",
        "What ownership does €12M buy, and who owns the audit relationship long term — Deeploy or the Big-4?",
      ],
      kill: "A hyperscaler ships native AI-Act attestation → moat erodes. A Big-4 partners with a rival → distribution risk. GPAI enforcement slips a year → catalyst decays.",
      readNote:
        "memo compiled from pipeline row + market context · figures as noted",
      opener:
        "You’ve put Deeploy forward at Series A, €12M. Before we get to ownership — what does Deeploy do that a bank can’t get bundled, for free, from the cloud vendor it already pays?",
      model:
        "Deeploy — AI governance and monitoring for ML systems in regulated industries. EU AI Act Article 9 aligned. Series A, Utrecht, 38 people, SSI 80 (High), P0. Round under evaluation: €12M. Thesis: Governed Agentic. Catalyst 120 days. Signal: closed 3 tier-1 EU banks Q1 2026; EU AI Act GPAI obligations live Aug 2026. Market context: Credo AI raised $30M (2025); hyperscalers bundle basic model-monitoring free; Big-4 building AI-Act attestation practices. Kill criteria (directional): hyperscaler native attestation; Big-4 partners with rival; GPAI enforcement slips. NOTE: these are the ONLY figures on file — do not invent others.",
    },

    {
      id: "noteless",
      name: "Noteless",
      ssi: 78,
      ssiColor: "var(--rg)",
      priority: "P0",
      sector: "Healthcare AI",
      stage: "Seed",
      hq: "Oslo",
      oneLiner:
        "Multilingual clinical documentation · EN/NO/SV/DE · real-time speech-to-structured-notes across Nordic health systems",
      tagline:
        "Multilingual clinical documentation. EN / NO / SV / DE. Real-time speech-to-structured-notes across Nordic health systems.",
      ssiConfidence: "Medium",
      roomSub: "Seed · €6M round under evaluation",
      pills: [
        P("Vertical SoR", "green"),
        P("Healthcare AI", "amber"),
        P("Seed · Oslo", "mute"),
        P("P0", "red"),
      ],
      tiles: [
        { k: "Stage", v: "Seed" },
        { k: "Round", v: "€6M" },
        { k: "Headcount", v: "15" },
        { k: "Catalyst", v: "70d" },
      ],
      sideRows: [
        { k: "Founded", v: "2023" },
        { k: "Headcount", v: "15" },
        { k: "HQ", v: "Oslo" },
        { k: "Round", v: "€6M" },
        { k: "Catalyst", v: "70d" },
        { k: "Falsifier", v: "Watch" },
        { k: "Signal tier", v: "High" },
      ],
      railRows: [
        { k: "SSI", v: "78" },
        { k: "Stage", v: "Seed" },
        { k: "Sector", v: "Health AI" },
        { k: "Catalyst", v: "70d" },
        { k: "Priority", v: "P0" },
      ],
      funding: [
        { label: "Pre-seed 2023", amt: 1.2 },
        { label: "Seed (round)", amt: 6 },
      ],
      ssiBreak: [
        { k: "Signal quality", v: 78 },
        { k: "Moat durability", v: 62 },
        { k: "Catalyst window", v: 82 },
        { k: "Team & execution", v: 74 },
      ],
      comps: [
        { name: "Noteless (this)", v: 24, self: true },
        { name: "Nordic Seed median", v: 28 },
        { name: "Nabla", v: 180 },
      ],
      why: "The case is that language plus Nordic procurement is a wedge the English-first incumbents under-serve, with structured output into regional EHRs (DIPS, Helseplattformen) providing stickiness. The committee’s doubt is whether language is a durable moat or a feature the funded incumbents ship in a quarter.",
      signal:
        "Live in 40 Norwegian municipalities (per memo). Helseplattformen integration in pilot. Nordic procurement cycles opening H2 2026.",
      enrich:
        "From the memo: Nabla raised $24M. Heidi expanding into EU markets. Nordic EHR landscape consolidating around Epic and DIPS, both of which could ship native scribing. Revenue and margin figures are not on file.",
      attacks: [
        "Another scribe — Nabla, Heidi, Nuance. Why is language a durable moat and not a feature they ship in a quarter?",
        "On 15 people and a €6M round, what’s the per-clinician economics? If it isn’t in the memo, what’s your estimate?",
        "If DIPS or Epic bundle native scribing, what regulatory or integration lock-in protects Noteless?",
        "Nordic TAM has a ceiling — how does this return a fund rather than a nice outcome?",
      ],
      kill: "Heidi ships Nordic languages → wedge narrows. DIPS bundles a native scribe → distribution risk. Helseplattformen pilot stalls → signal decays.",
      readNote:
        "memo compiled from pipeline row + market context · figures as noted",
      opener:
        "You’re recommending we back Noteless at seed, €6M. Convince the committee that multilingual is a durable wedge — and not a feature Heidi or Nabla ship in a single quarter.",
      model:
        "Noteless — multilingual clinical documentation (EN/NO/SV/DE), real-time speech-to-structured-notes across Nordic health systems. Seed, Oslo, 15 people, SSI 78 (Medium), P0. Round under evaluation: €6M. Thesis: Vertical SoR. Catalyst 70 days. Signal: live in 40 Norwegian municipalities; Helseplattformen integration in pilot. Market context: Nabla raised $24M; Heidi expanding to EU; Nordic EHRs consolidating around Epic/DIPS. Kill criteria (directional): Heidi ships Nordic languages; DIPS bundles native scribe; Helseplattformen pilot stalls. Anti-thesis: language may be a feature, not a moat. NOTE: these are the ONLY figures on file — do not invent others.",
    },
  ];
}

// A manually-entered deal: the committee has NO external data and reasons only
// from the one-line thesis. Ported verbatim from _customDeal().
export function customDeal(
  name: string,
  sector: string,
  stage: string,
  oneLiner: string,
): Deal {
  return {
    id: "custom",
    name,
    ssi: "—",
    ssiColor: "var(--faint)",
    priority: "NEW",
    sector,
    stage,
    hq: "—",
    ssiConfidence: "Unrated",
    roomSub: stage,
    oneLiner,
    tagline: oneLiner,
    pills: [P(sector, "mute"), P(stage, "mute"), P("Your evaluation", "purple")],
    tiles: [
      { k: "Sector", v: sector },
      { k: "Stage", v: stage },
      { k: "SSI", v: "—" },
      { k: "Source", v: "You" },
    ],
    sideRows: [
      { k: "Company", v: name },
      { k: "Sector", v: sector },
      { k: "Stage", v: stage },
      { k: "Source", v: "Manual" },
    ],
    railRows: [
      { k: "Deal", v: name.slice(0, 12) },
      { k: "Sector", v: sector.slice(0, 9) },
      { k: "Stage", v: stage.slice(0, 9) },
    ],
    funding: null,
    ssiBreak: null,
    comps: null,
    why: "Entered manually. The committee has no external data on this company — it reasons only from your one-line thesis and whatever you cite. The burden of proof is entirely on your investment case.",
    signal:
      "No memo data available. Any figure the committee uses must come from you; unsupported numbers will be treated as unknown or as an assumption.",
    enrich:
      "No market context on file for a manual deal. Expect the partners to ask for comparables, pricing and regulatory facts rather than assume them.",
    kill: "Undefined. Expect the partners to probe for the failure modes you have not named.",
    readNote: "Manual evaluation · no external data · reasons from your thesis",
    attacks: [
      "Who actually buys this, and why won’t the incumbent do it for free?",
      "What are the unit economics, and what is that based on?",
      "What regulation or risk touches this, and is the moat real?",
      "Why is this the right use of the fund’s capital right now?",
    ],
    opener:
      "You’ve brought " +
      name +
      " to the committee. You told us: “" +
      oneLiner +
      ".” We have no data on file beyond that — so start with the weakest link in the investment case: who is the buyer, and why now?",
    model:
      name +
      " — " +
      oneLiner +
      " Sector: " +
      sector +
      ". Stage/round: " +
      stage +
      ". This is a manually-entered deal: there is NO external data, funding history, or metrics on file. Reason only from this one-liner; do NOT invent numbers. If the analyst cites a figure, you may use it; otherwise treat all figures as unknown and ask for them.",
  };
}
