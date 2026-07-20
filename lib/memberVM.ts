import type { Member, Report, SpeakerId, Turn } from "./types";
import { face } from "./members";

export interface MemberVM {
  id: SpeakerId;
  name: string;
  title: string;
  color: string;
  bio: string;
  evaluates: string[];
  scores: string;
  face: string;
  cardStyle: string;
  statusLabel: string;
  statusStyle: string;
  activityText: string;
  activityStyle: string;
  live: boolean;
  msg: string;
  msgStyle: string;
  isStreaming: boolean;
  voteLabel: string;
  voteStyle: string;
}

export interface MemberVMState {
  activeSpeaker: SpeakerId | null;
  streaming: boolean;
  streamShown: string;
  talk: boolean;
  curActivity: string;
  busy: boolean;
  transcript: Turn[];
  report: Report | null;
}

// Per-partner card view-model. Ported verbatim from _memberVM().
export function memberVM(
  m: Member,
  s: MemberVMState,
  forReport: boolean,
): MemberVM {
  const isActive = s.activeSpeaker === m.id;
  const speaking = isActive && s.streaming;
  const last = [...s.transcript].reverse().find((x) => x.speaker === m.id);
  let msg: string;
  let placeholder = false;
  let isStreaming = false;
  if (speaking) {
    msg = s.streamShown;
    isStreaming = true;
  } else if (last) {
    msg = last.content;
  } else {
    msg = m.placeholder;
    placeholder = true;
  }
  const faceMode = speaking ? (s.talk ? "talk1" : "talk2") : "idle";
  let activityText: string;
  let live = false;
  if (speaking) {
    activityText = s.curActivity || m.activities[0];
    live = true;
  } else if (isActive && last) {
    activityText = "made the point · standing by";
  } else if (s.busy && !s.activeSpeaker) {
    activityText = "reviewing the memo";
  } else {
    activityText = "listening";
  }
  const activityStyle =
    "font-family:var(--mono);font-size:10.5px;letter-spacing:.02em;margin-top:9px;color:" +
    (live ? m.color : "var(--faint)") +
    ";";
  const glow = isActive
    ? ";--gc:" + m.color + ";animation:glow 2.4s ease-in-out infinite"
    : "";
  const cardStyle =
    "background:" +
    (isActive
      ? "color-mix(in srgb, " + m.color + " 9%, var(--panel))"
      : "var(--panel)") +
    ";border:1px solid " +
    (isActive ? m.color : "var(--line)") +
    ";border-radius:14px;padding:16px 17px;transition:background .3s,border-color .3s;position:relative" +
    glow;
  const statusLabel = speaking ? "REASONING" : isActive ? "SPOKE" : "STANDBY";
  const statusStyle = speaking
    ? "font-family:var(--mono);font-size:9px;letter-spacing:.12em;font-weight:700;color:#FFFFFF;background:" +
      m.color +
      ";padding:3px 8px;border-radius:5px;white-space:nowrap;display:flex;align-items:center;gap:5px"
    : isActive
      ? "font-family:var(--mono);font-size:9px;letter-spacing:.12em;font-weight:600;color:" +
        m.color +
        ";border:1px solid " +
        m.color +
        ";padding:2px 7px;border-radius:5px;white-space:nowrap"
      : "font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--faint);white-space:nowrap";
  const msgStyle =
    "font-size:14px;line-height:1.56;margin-top:13px;padding-top:13px;border-top:1px solid var(--line);color:" +
    (placeholder ? "var(--faint)" : "var(--tx)") +
    ";" +
    (placeholder ? "font-style:italic;" : "");
  let voteLabel = "";
  let voteStyle = "";
  if (forReport && s.report && s.report.votes) {
    const v = s.report.votes[m.id] || "conditional";
    const norm =
      v === "invest"
        ? "back"
        : v === "pass"
          ? "pass"
          : v === "back"
            ? "back"
            : "conditional";
    const labels: Record<string, string> = {
      back: "Votes: Back it",
      conditional: "Votes: With conditions",
      pass: "Votes: Pass",
    };
    const cols: Record<string, string> = {
      back: "var(--op)",
      conditional: "var(--rg)",
      pass: "var(--sk)",
    };
    voteLabel = labels[norm];
    voteStyle =
      "font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.03em;padding:3px 9px;border-radius:6px;color:#FFFFFF;background:" +
      cols[norm];
  }
  return {
    id: m.id,
    name: m.name,
    title: m.title,
    color: m.color,
    bio: m.bio,
    evaluates: m.evaluates,
    scores: m.scores,
    face: face(m.id, faceMode),
    cardStyle,
    statusLabel,
    statusStyle,
    activityText,
    activityStyle,
    live,
    msg,
    msgStyle,
    isStreaming,
    voteLabel,
    voteStyle,
  };
}
