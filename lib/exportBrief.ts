import type { Deal, Report, Turn } from "./types";
import { MEMBERS, member } from "./members";
import { fmt } from "./format";

const DIMS: [keyof Report["scores"], string][] = [
  ["convictionClarity", "Conviction clarity"],
  ["riskAcknowledgment", "Risk acknowledgment"],
  ["dataDensity", "Data density"],
  ["thesisAlignment", "Thesis alignment"],
  ["poiseUnderPressure", "Poise under pressure"],
];

const VOTE_LABELS: Record<string, string> = {
  back: "Back it",
  conditional: "With conditions",
  pass: "Pass",
  invest: "Back it",
};

// Build the downloadable verdict brief. Ported verbatim from _briefMarkdown().
export function briefMarkdown(args: {
  deal: Deal;
  report: Report | null;
  transcript: Turn[];
  elapsed: number;
  turnCount: number;
}): string {
  const { deal, report: r, transcript, elapsed, turnCount } = args;
  if (!r) return "";
  const total =
    r.total != null
      ? r.total
      : DIMS.reduce((a, d) => a + (Number(r.scores[d[0]]) || 0), 0);
  const L: string[] = [];
  L.push("# " + deal.name + " — IC verdict");
  L.push("");
  L.push("**" + total + " / 50 · " + (r.verdict || "") + "**");
  L.push("");
  L.push("_" + fmt(elapsed) + " · " + turnCount + " exchanges · analyst defense_");
  L.push("");
  if (r.roomLine) {
    L.push("> " + r.roomLine);
    L.push("");
  }
  L.push("## Scores");
  DIMS.forEach((d) => {
    const v = Math.max(0, Math.min(10, Math.round(r.scores[d[0]] || 0)));
    L.push("- " + d[1] + ": " + v + "/10");
  });
  L.push("");
  L.push("## Committee votes");
  MEMBERS.forEach((m) => {
    const v = (r.votes && r.votes[m.id]) || "conditional";
    L.push("- " + m.name + " (" + m.title + "): " + (VOTE_LABELS[v] || v));
  });
  L.push("");
  L.push("## Held up");
  (r.strengths || []).forEach((x) => L.push("- " + x));
  L.push("");
  L.push("## Exposed");
  (r.gaps || []).forEach((x) => L.push("- " + x));
  L.push("");
  L.push("## Transcript");
  transcript.forEach((x) => {
    if (x.speaker === "user") {
      L.push("**You · analyst:** " + x.content);
    } else {
      const m = member(x.speaker);
      L.push("**" + (m ? m.name + " · " + m.title : x.speaker) + ":** " + x.content);
    }
    L.push("");
  });
  return L.join("\n");
}

export function copyBrief(md: string): Promise<boolean> {
  if (!md) return Promise.resolve(false);
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      return navigator.clipboard
        .writeText(md)
        .then(() => true)
        .catch(() => false);
    }
  } catch {
    /* ignore */
  }
  return Promise.resolve(false);
}

export function downloadBrief(dealName: string, md: string): void {
  if (!md) return;
  try {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "IC-" +
      String(dealName || "deal")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "") +
      "-verdict.md";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
        a.remove();
      } catch {
        /* ignore */
      }
    }, 120);
  } catch {
    /* ignore */
  }
}
