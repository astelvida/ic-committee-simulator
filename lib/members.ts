import type { Member, SpeakerId } from "./types";

// The four committee partners. Fixed order via ORDER / _ids().
// Ported verbatim from the design concept.
export const MEMBERS: Member[] = [
  {
    id: "skeptic",
    name: "The Skeptic",
    title: "Market Partner",
    color: "var(--sk)",
    hair: "▚▚▚▚▚▚▚",
    bio: "Ex public-markets short-seller. Twelve years pricing overhyped categories. Assumes the market is smaller and the competition faster than the deck says — until shown otherwise.",
    evaluates: [
      "Is the market real, large and winnable?",
      "Who is the buyer, and why now?",
      "Substitution and incumbent risk",
    ],
    scores: "Conviction & Thesis",
    activities: [
      "challenging the thesis",
      "stress-testing the TAM",
      "scanning the competitive set",
      "pricing substitution risk",
    ],
    keywords: [
      "tam",
      "market",
      "competitor",
      "competition",
      "incumbent",
      "substitut",
      "moat",
      "why now",
      "pricing",
      "demand",
      "category",
    ],
    voice: { pitch: 1.12, rate: 1.02, gender: "female" },
    persona:
      "The Skeptic — Market Partner (ex public-markets short-seller). Attacks market thesis, TAM, competition, incumbents, substitution risk, why-now timing. Cites real comparables. Concedes a clean, evidenced answer.",
    placeholder: "Reviewing the memo · sizing the market.",
  },
  {
    id: "operator",
    name: "The Operator",
    title: "Operating Partner",
    color: "var(--op)",
    hair: "▓▓▓▓▓▓▓",
    bio: "Built and exited two companies, then ran ops at scale. Lives in the numbers. Treats every qualitative claim as a rounding error until it is attached to a figure with a source.",
    evaluates: [
      "Unit economics and gross margin",
      "Burn, runway and the hiring plan",
      "Ship velocity and execution risk",
    ],
    scores: "Data Density",
    activities: [
      "interrogating the unit economics",
      "tracing the burn",
      "probing the hiring plan",
      "checking gross margin",
    ],
    keywords: [
      "burn",
      "runway",
      "hire",
      "hiring",
      "headcount",
      "margin",
      "gross",
      "unit econ",
      "ship",
      "velocity",
      "tech debt",
      "cost",
      "revenue",
      "arr",
      "cash",
    ],
    voice: { pitch: 0.82, rate: 0.98, gender: "male" },
    persona:
      "The Operator — Operating Partner (built and exited two companies). Attacks unit economics, burn, runway, hiring, gross margin, ship velocity. Demands specific numbers, dates and names; never accepts a vibe.",
    placeholder: "Doing the math on the burn · waiting for a real figure.",
  },
  {
    id: "regulator",
    name: "The Regulator",
    title: "Risk & Compliance Partner",
    color: "var(--rg)",
    hair: "∿∿∿∿∿∿∿",
    bio: "Former medicines and AI regulator. Reads the deal for the failure mode a founder never mentions. Believes a compliance claim is theatre until it has a process, an owner and a headcount behind it.",
    evaluates: [
      "Regulatory exposure and the real moat",
      "Legal, safety and technical risk",
      "Cost of compliance as you scale",
    ],
    scores: "Risk Acknowledgment",
    activities: [
      "reviewing the regulatory exposure",
      "checking the compliance moat",
      "naming the article numbers",
      "testing the risk controls",
    ],
    keywords: [
      "regulat",
      "compliance",
      "mdr",
      "mhra",
      "gdpr",
      "ai act",
      "dora",
      "iso",
      "certif",
      "article",
      "audit",
      "vigilance",
      "surveillance",
      "class ii",
    ],
    voice: { pitch: 1.2, rate: 0.95, gender: "female" },
    persona:
      'The Regulator — Risk & Compliance Partner (former medicines/AI regulator). Attacks the compliance moat with specific article numbers (MDR Article 83, EU AI Act Articles 9-15, DORA, GDPR, MHRA, ISO/IEC). Treats "we are compliant" as theatre until proven with named process and headcount.',
    placeholder: "Cross-checking the claims against the article numbers.",
  },
  {
    id: "chair",
    name: "The Chair",
    title: "Managing Partner · IC Chair",
    color: "var(--ch)",
    hair: "▔▔▔▔▔▔▔",
    bio: "Chairs the committee. Thinks in fund construction, not single deals. Will kill a good company that is a bad allocation, and cares as much about ownership and follow-on as about the pitch.",
    evaluates: [
      "Fund construction and ownership",
      "Follow-on capacity and concentration",
      "Portfolio conflict and signaling",
    ],
    scores: "Thesis Alignment · Poise",
    activities: [
      "weighing fund construction",
      "checking portfolio conflict",
      "sizing ownership and follow-on",
      "forming a recommendation",
    ],
    keywords: [
      "portfolio",
      "conflict",
      "cannibal",
      "co-invest",
      "ownership",
      "follow-on",
      "fund",
      "lp",
      "signal",
      "concentrat",
      "allocation",
      "stake",
    ],
    voice: { pitch: 0.72, rate: 0.92, gender: "male" },
    persona:
      "The Chair — Managing Partner and IC chair, the most institutional voice. Attacks fund construction, ownership, follow-on capacity, portfolio conflict and signaling risk. Cares about the fund, not just the deal.",
    placeholder: "Weighing this against the rest of the portfolio.",
  },
];

export const ORDER: SpeakerId[] = ["skeptic", "operator", "regulator", "chair"];

export function member(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

/** ASCII avatar face for a member in idle / talking states. */
export function face(id: string, mode: "idle" | "talk1" | "talk2"): string {
  const m = member(id);
  const eyes = "•   •";
  const mouth = mode === "talk1" ? " ○ " : mode === "talk2" ? " ▪ " : "───";
  return [
    "┌───────┐",
    "│" + ((m && m.hair) || "▚▚▚▚▚▚▚") + "│",
    "│ " + eyes + " │",
    "│   ╵   │",
    "│  " + mouth + "  │",
    "└───────┘",
  ].join("\n");
}
