import type { Deal, KV, Pill } from "./types";

export interface TipPayload {
  title: string;
  val: string;
  sub: string;
}
export interface Bar {
  label: string;
  valLabel: string;
  pct: number;
  color: string;
  emph?: string;
  tip: TipPayload;
}
export interface TimelinePoint {
  label: string;
  val: string;
  left: string;
  size: number;
  color: string;
  tip: TipPayload;
}
export interface DealViz {
  num: boolean;
  gaugeArr: string;
  radarPoly: string;
  timeline: TimelinePoint[];
}
export interface DealBrief {
  name: string;
  tagline: string;
  ssi: number | string;
  ssiColor: string;
  ssiConfidence: string;
  pills: Pill[];
  tiles: KV[];
  sideRows: KV[];
  railRows: KV[];
  roomSub: string;
  readNote: string;
  hasCharts: boolean;
  noCharts: boolean;
  fundingBars: Bar[];
  ssiBars: Bar[];
  compBars: Bar[];
  viz: DealViz;
}

const clamp = (p: number) => Math.max(3, Math.min(100, Math.round(p)));
const COLS = ["var(--sk)", "var(--op)", "var(--rg)", "var(--ch)"];

// Hand-built SVG/CSS chart math, ported verbatim from _dealBrief().
export function dealBrief(d: Deal): DealBrief {
  const funding = d.funding || [];
  const fundingBars: Bar[] = funding.map((f, i) => {
    const mx = Math.max(...(funding.length ? funding : [{ amt: 1 }]).map((x) => x.amt));
    return {
      label: f.label,
      valLabel: "£" + f.amt + "M",
      pct: clamp((f.amt / mx) * 100),
      color: i === funding.length - 1 ? "var(--acc)" : "var(--line2)",
      tip: {
        title: f.label,
        val: "£" + f.amt + "M",
        sub: i === funding.length - 1 ? "Round on the table" : "Capital raised",
      },
    };
  });

  const ssiBreak = d.ssiBreak || [];
  const ssiBars: Bar[] = ssiBreak.map((b, i) => ({
    label: b.k,
    valLabel: String(b.v),
    pct: clamp(b.v),
    color: COLS[i % COLS.length],
    tip: { title: b.k, val: b.v + " / 100", sub: "Signal sub-score" },
  }));

  const comps = d.comps || [];
  const compBars: Bar[] = comps.map((c) => {
    const mx = Math.max(...(comps.length ? comps : [{ v: 1 }]).map((x) => x.v));
    return {
      label: c.name,
      valLabel: "$" + c.v + "M",
      pct: clamp((c.v / mx) * 100),
      color: c.self ? "var(--acc)" : "var(--line2)",
      emph: c.self ? "font-weight:700;color:var(--acc)" : "color:var(--tx)",
      tip: {
        title: c.name,
        val: "$" + c.v + "M",
        sub: c.self ? "This round" : "Comparable round",
      },
    };
  });

  const num = typeof d.ssi === "number";
  const C = 327;
  const rb = ssiBreak.slice(0, 4);
  const cx = 100,
    cy = 100,
    R = 78;
  const ang = [-90, 0, 90, 180];
  const radarPoly = rb
    .map((b, i) => {
      const a = (ang[i] * Math.PI) / 180;
      const r = R * (b.v / 100);
      return (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1);
    })
    .join(" ");

  const mxa = Math.max(...funding.map((x) => x.amt).concat([1]));
  const timeline: TimelinePoint[] = funding.map((f, i) => ({
    label: f.label,
    val: "£" + f.amt + "M",
    left: (funding.length > 1 ? (i / (funding.length - 1)) * 100 : 50).toFixed(1),
    size: 16 + Math.round((f.amt / mxa) * 32),
    color: i === funding.length - 1 ? "var(--acc)" : "var(--line2)",
    tip: { title: f.label, val: "£" + f.amt + "M", sub: "Round timeline" },
  }));

  const hasCharts = !!(d.funding && d.funding.length);
  const gaugeDash = num ? Math.round((Number(d.ssi) / 100) * C) : 0;
  const viz: DealViz = {
    num,
    gaugeArr: gaugeDash + " " + C,
    radarPoly,
    timeline,
  };

  return {
    name: d.name,
    tagline: d.tagline,
    ssi: d.ssi,
    ssiColor: d.ssiColor,
    ssiConfidence: d.ssiConfidence,
    pills: d.pills,
    tiles: d.tiles,
    sideRows: d.sideRows,
    railRows: d.railRows,
    roomSub: d.roomSub,
    readNote: d.readNote,
    hasCharts,
    noCharts: !hasCharts,
    fundingBars,
    ssiBars,
    compBars,
    viz,
  };
}
