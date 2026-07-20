"use client";

import { useIC, currentDeal } from "@/lib/store";
import { MEMBERS } from "@/lib/members";
import { memberVM } from "@/lib/memberVM";
import { fmt } from "@/lib/format";
import { briefMarkdown, copyBrief, downloadBrief } from "@/lib/exportBrief";
import { sx } from "@/lib/css";
import type { Scores } from "@/lib/types";

const DIMS: [keyof Scores, string][] = [
  ["convictionClarity", "Conviction clarity"],
  ["riskAcknowledgment", "Risk acknowledgment"],
  ["dataDensity", "Data density"],
  ["thesisAlignment", "Thesis alignment"],
  ["poiseUnderPressure", "Poise under pressure"],
];

const btnGhost =
  "background:transparent;color:var(--tx);border:1px solid var(--line);padding:12px 22px;border-radius:9px;font-size:14px;font-weight:600;font-family:var(--sans);cursor:pointer";

export default function Report() {
  const s = useIC();
  const deal = currentDeal(s);
  const report = s.report;
  const committee = MEMBERS.map((m) => memberVM(m, s, true));

  if (!report) return null;

  const total =
    report.total != null
      ? report.total
      : Object.values(report.scores).reduce((a, b) => a + (Number(b) || 0), 0);
  const vcol =
    total >= 42
      ? "var(--op)"
      : total >= 35
        ? "var(--rg)"
        : total >= 28
          ? "var(--acc)"
          : "var(--sk)";
  const scoreRows = DIMS.map(([k, label]) => {
    const v = Math.max(0, Math.min(10, Math.round(report.scores[k] || 0)));
    const color = v >= 8 ? "var(--op)" : v <= 5 ? "var(--sk)" : "var(--acc)";
    return { label, val: v + "/10", pct: v * 10, color };
  });
  const meta = fmt(s.elapsed) + " · " + s.turnCount + " exchanges";

  const md = () =>
    briefMarkdown({
      deal,
      report,
      transcript: s.transcript,
      elapsed: s.elapsed,
      turnCount: s.turnCount,
    });

  const onCopy = () => {
    copyBrief(md()).then((ok) => {
      if (ok) s.markCopied();
    });
  };
  const onDownload = () => downloadBrief(deal.name, md());

  return (
    <div style={sx("max-width:960px;margin:0 auto;padding:34px 26px 90px;width:100%")}>
      <div style={sx("display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:24px")}>
        <div>
          <div style={sx("font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)")}>
            IC verdict · {meta}
          </div>
          <h1 style={sx("font-family:var(--disp);font-size:clamp(30px,4.4vw,46px);font-weight:700;margin-top:8px")}>
            {deal.name} — your call
          </h1>
          <div style={sx("font-size:15px;color:var(--muted);margin-top:8px;font-style:italic;max-width:58ch")}>
            “{report.roomLine}”
          </div>
        </div>
        <div style={sx("text-align:right")}>
          <div>
            <span style={sx("font-family:var(--disp);font-size:66px;font-weight:700;line-height:1")}>{total}</span>
            <span style={sx("font-family:var(--mono);font-size:15px;color:var(--faint)")}> / 50</span>
          </div>
          <div style={sx("display:inline-block;margin-top:8px;font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 11px;border-radius:6px;color:#FFFFFF;background:" + vcol)}>
            {report.verdict}
          </div>
        </div>
      </div>

      <div style={sx("margin-top:28px")}>
        <div style={sx("font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:14px")}>
          How your case scored
        </div>
        {scoreRows.map((row) => (
          <div key={row.label} style={sx("display:grid;grid-template-columns:180px minmax(0,1fr) 48px;gap:14px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line)")}>
            <span style={sx("font-size:14px")}>{row.label}</span>
            <div style={sx("height:11px;background:var(--panel2);border-radius:5px;overflow:hidden")}>
              <div style={sx("height:100%;border-radius:5px;transform-origin:left;animation:barin .5s ease-out;width:" + row.pct + "%;background:" + row.color)} />
            </div>
            <span style={sx("font-family:var(--mono);font-size:13.5px;font-weight:700;text-align:right")}>{row.val}</span>
          </div>
        ))}
      </div>

      <div style={sx("margin-top:30px")}>
        <div style={sx("font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:14px")}>
          How the committee voted
        </div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px")}>
          {committee.map((m) => (
            <div key={m.id} style={sx("background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;display:flex;gap:12px;align-items:flex-start;position:relative;overflow:hidden")}>
              <div style={sx("position:absolute;inset:0 auto 0 0;width:3px;background:" + m.color)} />
              <pre style={sx("font-size:12px;line-height:1.13;white-space:pre;flex-shrink:0", { color: m.color })}>
                {m.face}
              </pre>
              <div>
                <div style={sx("font-family:var(--disp);font-size:16px;font-weight:700")}>{m.name}</div>
                <div style={sx("font-family:var(--mono);font-size:8.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);margin:3px 0 8px")}>
                  {m.title}
                </div>
                <span style={sx(m.voteStyle)}>{m.voteLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-top:30px")}>
        <div>
          <div style={sx("font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--op);margin-bottom:11px")}>
            Held up
          </div>
          {report.strengths.map((x, i) => (
            <div key={i} style={sx("font-size:14px;line-height:1.5;padding:8px 0;border-bottom:1px solid var(--line)")}>
              <span style={sx("color:var(--op);font-family:var(--mono)")}>+ </span>
              {x}
            </div>
          ))}
        </div>
        <div>
          <div style={sx("font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--sk);margin-bottom:11px")}>
            Exposed
          </div>
          {report.gaps.map((x, i) => (
            <div key={i} style={sx("font-size:14px;line-height:1.5;padding:8px 0;border-bottom:1px solid var(--line)")}>
              <span style={sx("color:var(--sk);font-family:var(--mono)")}>− </span>
              {x}
            </div>
          ))}
        </div>
      </div>

      <div style={sx("display:flex;gap:10px;margin-top:34px;flex-wrap:wrap")}>
        <button
          style={sx("background:var(--acc);color:#FFFFFF;border:none;padding:12px 22px;border-radius:9px;font-size:14px;font-weight:700;font-family:var(--sans);cursor:pointer")}
          onClick={s.runAgain}
        >
          Run it again
        </button>
        <button
          style={sx("background:transparent;color:var(--tx);border:1px solid var(--line2);padding:12px 22px;border-radius:9px;font-size:14px;font-weight:600;font-family:var(--sans);cursor:pointer")}
          onClick={s.setTranscript2}
        >
          Read the transcript
        </button>
        <button style={sx(btnGhost)} onClick={onCopy}>
          {s.copied ? "Copied ✓" : "⧉ Copy brief"}
        </button>
        <button style={sx(btnGhost)} onClick={onDownload}>
          ⇩ Download .md
        </button>
        <button style={sx(btnGhost)} onClick={s.backLanding}>
          Evaluate another deal
        </button>
      </div>
    </div>
  );
}
