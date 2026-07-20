import type { Deal } from "./types";

export interface MemoSectionDef {
  key: string;
  title: string;
  body: string;
  accent: string;
}

// "Funding & comparables" body text. Ported from _fundingText().
export function fundingText(d: Deal): string {
  const f = (d.funding || []).map((x) => "£" + x.amt + "M · " + x.label).join("\n");
  const c = (d.comps || []).map((x) => "$" + x.v + "M · " + x.name).join("\n");
  return [f && "Rounds (from memo)\n" + f, c && "Comparable rounds\n" + c]
    .filter(Boolean)
    .join("\n\n");
}

// Collapsible memo section definitions (bodies only; open state lives in store).
// Ported from renderVals()'s secDefs.
export function memoSections(deal: Deal): MemoSectionDef[] {
  const defs: MemoSectionDef[] = [
    { key: "why", title: "Why it’s on the table", body: deal.why, accent: "var(--ch)" },
    { key: "signal", title: "Recent signal", body: deal.signal, accent: "var(--sk)" },
    { key: "enrich", title: "Market context", body: deal.enrich, accent: "var(--acc)" },
    { key: "funding", title: "Funding & comparables", body: fundingText(deal), accent: "var(--op)" },
    {
      key: "attacks",
      title: "Where they’ll press",
      body: (deal.attacks || []).map((a) => "— " + a).join("\n\n"),
      accent: "var(--rg)",
    },
    { key: "kill", title: "Kill criteria", body: deal.kill, accent: "var(--faint)" },
  ];
  return defs.filter((d) => d.body);
}
