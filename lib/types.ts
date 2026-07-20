// Core domain types for the Adversarial IC simulator.
// Ported from the design concept (Adversarial IC.dc.html).

export type SpeakerId = "skeptic" | "operator" | "regulator" | "chair";
export type Speaker = SpeakerId | "user";
export type Screen = "landing" | "brief" | "room" | "report";
export type ViewMode = "card" | "transcript";

export interface Voice {
  pitch: number;
  rate: number;
  gender: "male" | "female";
}

export interface Member {
  id: SpeakerId;
  name: string;
  title: string;
  color: string;
  hair: string;
  bio: string;
  evaluates: string[];
  scores: string;
  activities: string[];
  keywords: string[];
  voice: Voice;
  persona: string;
  placeholder: string;
}

export interface Pill {
  label: string;
  style: string;
}
export interface KV {
  k: string;
  v: string;
}
export interface FundingRound {
  label: string;
  amt: number;
}
export interface SsiBreak {
  k: string;
  v: number;
}
export interface Comp {
  name: string;
  v: number;
  self?: boolean;
}

export interface Deal {
  id: string;
  name: string;
  ssi: number | string;
  ssiColor: string;
  priority: string;
  sector: string;
  stage: string;
  hq: string;
  oneLiner: string;
  tagline: string;
  ssiConfidence: string;
  roomSub: string;
  pills: Pill[];
  tiles: KV[];
  sideRows: KV[];
  railRows: KV[];
  funding: FundingRound[] | null;
  ssiBreak: SsiBreak[] | null;
  comps: Comp[] | null;
  why: string;
  signal: string;
  enrich: string;
  attacks: string[];
  kill: string;
  readNote: string;
  opener: string;
  /** The ONLY facts the committee may use. */
  model: string;
}

export interface CustomForm {
  name: string;
  sector: string;
  stage: string;
  oneLiner: string;
}

export interface Turn {
  speaker: Speaker;
  content: string;
  activity?: string;
}

export interface Scores {
  convictionClarity: number;
  riskAcknowledgment: number;
  dataDensity: number;
  thesisAlignment: number;
  poiseUnderPressure: number;
}

export type Vote = "back" | "conditional" | "pass" | "invest";

export interface Report {
  scores: Scores;
  total: number;
  verdict: string;
  votes: Partial<Record<SpeakerId, Vote | string>>;
  strengths: string[];
  gaps: string[];
  roomLine: string;
}

export interface SavedSession {
  v: number;
  screen: Screen;
  dealId: string;
  customDeal: Deal | null;
  transcript: Turn[];
  turnCount: number;
  elapsed: number;
  view: ViewMode;
  open: Record<string, boolean>;
  report: Report | null;
  ts: number;
}

/** Chat message shape sent to the model endpoint. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Difficulty prop, mirroring the design concept. */
export type Difficulty = "Fair" | "Brutal";
