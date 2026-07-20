import { create } from "zustand";
import type {
  CustomForm,
  Deal,
  Difficulty,
  Report,
  Screen,
  SpeakerId,
  Turn,
  ViewMode,
} from "./types";
import { MEMBERS, ORDER, member } from "./members";
import { buildDeals, customDeal } from "./deals";
import {
  draftPrompts,
  judgePrompts,
  sharpenPrompts,
  turnPrompts,
} from "./prompts";
import { askJSON, callModel, cleanText } from "./model";
import { cancelTTS, loadVoices, speak } from "./tts";
import { isVoiceSupported, startVoice, stopVoice } from "./voice";
import { clearSession, persistSession, readSession } from "./persistence";
import type { SavedSession } from "./types";

// The pipeline, built once.
export const DEALS = buildDeals();

export function currentDeal(s: {
  dealId: string;
  customDeal: Deal | null;
}): Deal {
  if (s.dealId === "custom" && s.customDeal) return s.customDeal;
  return DEALS.find((d) => d.id === s.dealId) || DEALS[0];
}

// Non-reactive runtime handles (timers), mirroring the class's _timer/_tw/_mt.
const rt: {
  timer: ReturnType<typeof setInterval> | null;
  tw: ReturnType<typeof setInterval> | null;
  mt: ReturnType<typeof setInterval> | null;
  ct: ReturnType<typeof setTimeout> | null;
  t0: number;
} = { timer: null, tw: null, mt: null, ct: null, t0: 0 };

export interface Tip {
  x: number;
  y: number;
  title: string;
  val: string;
  sub: string;
}

interface TurnJSON {
  next?: SpeakerId;
  reask?: boolean;
  activity?: string;
  line?: string;
}

export interface ICState {
  // config (design-concept props)
  difficulty: Difficulty;

  // screen + selection
  screen: Screen;
  dealId: string;
  customDeal: Deal | null;
  view: ViewMode;

  // custom-deal form
  showCustom: boolean;
  cf: CustomForm;

  // room / turn loop
  transcript: Turn[];
  activeSpeaker: SpeakerId | null;
  streaming: boolean;
  streamShown: string;
  streamFull: string;
  talk: boolean;
  curActivity: string;
  input: string;
  turnCount: number;
  elapsed: number;
  busy: boolean;
  helping: "" | "draft" | "sharpen";
  open: Record<string, boolean>;

  // toggles / io
  ttsOn: boolean;
  listening: boolean;
  voiceErr: boolean;
  report: Report | null;
  tip: Tip | null;
  savedSession: SavedSession | null;
  copied: boolean;

  // lifecycle
  init: () => void;

  // nav
  chooseDeal: (id: string) => void;
  backLanding: () => void;
  enterRoom: () => void;
  runAgain: () => void;
  setCard: () => void;
  setTranscript: () => void;
  setTranscript2: () => void;
  toggle: (k: string) => void;

  // custom deal
  openCustom: () => void;
  setCf: (patch: Partial<CustomForm>) => void;
  submitCustom: () => void;

  // input + turn loop
  setInput: (v: string) => void;
  submit: () => Promise<void>;
  pass: () => void;
  draftAnswer: () => Promise<void>;
  sharpenAnswer: () => Promise<void>;
  callVote: () => Promise<void>;

  // toggles
  toggleTTS: () => void;
  toggleVoice: () => void;

  // tooltips
  showTip: (x: number, y: number, tip: { title: string; val: string; sub: string }) => void;
  tipOff: () => void;

  // session
  resumeSession: () => void;
  discardSession: () => void;

  // export
  markCopied: () => void;

  // internal
  _committeeTurn: (t: Turn[]) => Promise<void>;
}

function scrollTop() {
  try {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  } catch {
    /* ignore */
  }
}

export const useIC = create<ICState>((set, get) => {
  // ---- internal helpers (closures over set/get) --------------------------
  const cur = () => currentDeal(get());
  const hard = () => get().difficulty === "Brutal";

  const persist = () => {
    const s = get();
    if (s.screen !== "room" && s.screen !== "report") return;
    if (!s.transcript || !s.transcript.length) return;
    persistSession({
      v: 1,
      screen: s.screen,
      dealId: s.dealId,
      customDeal: s.customDeal,
      transcript: s.transcript,
      turnCount: s.turnCount,
      elapsed: s.elapsed,
      view: s.view,
      open: s.open,
      report: s.report,
      ts: Date.now(),
    });
  };

  const stopTimer = () => {
    if (rt.timer) {
      clearInterval(rt.timer);
      rt.timer = null;
    }
  };
  const startTimer = (base = 0) => {
    stopTimer();
    rt.t0 = Date.now() - base * 1000;
    rt.timer = setInterval(
      () => set({ elapsed: Math.floor((Date.now() - rt.t0) / 1000) }),
      1000,
    );
  };

  const tts = (id: SpeakerId, text: string) => {
    if (!get().ttsOn) return;
    const m = member(id);
    if (m) speak(m, text);
  };

  const finishLine = (id: SpeakerId, text: string, activity: string) => {
    if (rt.mt) clearInterval(rt.mt);
    set((s) => ({
      streaming: false,
      talk: false,
      streamShown: text,
      transcript: [...s.transcript, { speaker: id, content: text, activity: activity || "" }],
    }));
    persist();
    tts(id, text);
  };

  const speakLine = (id: SpeakerId, text: string, activity: string) => {
    if (rt.tw) clearInterval(rt.tw);
    if (rt.mt) clearInterval(rt.mt);
    set({
      activeSpeaker: id,
      streaming: true,
      streamFull: text,
      streamShown: "",
      curActivity: activity || "",
      talk: false,
    });
    rt.mt = setInterval(() => set((s) => ({ talk: !s.talk })), 230);
    const t0 = Date.now();
    const cps = 50;
    rt.tw = setInterval(() => {
      const n = Math.floor(((Date.now() - t0) / 1000) * cps);
      if (n >= text.length) {
        if (rt.tw) clearInterval(rt.tw);
        finishLine(id, text, activity);
      } else {
        set({ streamShown: text.slice(0, Math.max(1, n)) });
      }
    }, 40);
  };

  const keyword = (ans: string): SpeakerId | null => {
    let best: SpeakerId | null = null;
    let bl = 0;
    MEMBERS.forEach((m) =>
      m.keywords.forEach((k) => {
        if (ans.includes(k) && k.length > bl) {
          best = m.id;
          bl = k.length;
        }
      }),
    );
    return best;
  };

  const fallbackTurn = (t: Turn[]) => {
    const spoken = t.filter((x) => x.speaker !== "user").map((x) => x.speaker);
    let next = ORDER.find((id) => !spoken.includes(id));
    if (!next) {
      const ans = (t[t.length - 1].content || "").toLowerCase();
      next = keyword(ans) || ORDER[get().turnCount % 4];
    }
    const banks: Record<SpeakerId, string[]> = {
      skeptic: [
        "That’s a narrative, not a number. Who is the buyer, and what stops the incumbent giving this away free inside a year?",
        "You’re describing a product; I asked about a market. Where does pricing power come from once the category commoditises?",
      ],
      operator: [
        "Walk me through the burn. On the figures in the memo, what does the next twelve months of hiring do to runway?",
        "We don’t have a margin number in the memo. What’s your estimate at scale, and what is it based on?",
      ],
      regulator: [
        "“Compliant” isn’t a moat until it’s a process. Who owns the reporting obligation, with what headcount, as volume grows?",
        "Name the article. Which specific regulation gates a competitor here, and how long does replication actually take?",
      ],
      chair: [
        "Set the company aside — talk fund. What ownership do we get, and can we follow on without over-concentrating?",
        "Where does this sit against the rest of the portfolio? Is there a conflict I should worry about?",
      ],
    };
    const bank = banks[next];
    const line = bank[get().turnCount % bank.length];
    const m = member(next)!;
    set({ busy: false, turnCount: get().turnCount + 1 });
    speakLine(next, line, m.activities[get().turnCount % 4]);
  };

  const finishReport = (j: Report) => {
    stopTimer();
    cancelTTS();
    if (rt.tw) clearInterval(rt.tw);
    if (rt.mt) clearInterval(rt.mt);
    set({ busy: false, streaming: false, screen: "report", report: j });
    persist();
    scrollTop();
  };

  const fallbackReport = () => {
    const n = get().turnCount;
    const base = Math.max(4, Math.min(8, 4 + Math.round(n / 3)));
    const scores = {
      convictionClarity: base,
      riskAcknowledgment: base - 1,
      dataDensity: base,
      thesisAlignment: base,
      poiseUnderPressure: base,
    };
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const verdict =
      total >= 42
        ? "Would back the recommendation"
        : total >= 35
          ? "Back with conditions"
          : total >= 28
            ? "On the fence"
            : "Would pass";
    finishReport({
      scores,
      total,
      verdict,
      votes: {
        skeptic: "conditional",
        operator: "conditional",
        regulator: "conditional",
        chair: "conditional",
      },
      strengths: [
        "Engaged every partner’s line of attack directly.",
        "Held a consistent investment thesis under pressure.",
        "Distinguished evidenced claims from assumptions.",
      ],
      gaps: [
        "Some answers stayed qualitative where the memo offered specifics.",
        "A few risks surfaced only after a partner raised them.",
        "Fund-construction implications were left largely to the Chair.",
      ],
      roomLine:
        "A credible case; the committee wants tighter evidence before conviction.",
    });
  };

  const lastQ = (): string => {
    const t = get().transcript;
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i].speaker !== "user") return t[i].content;
    }
    return cur().opener;
  };

  // ---- public store ------------------------------------------------------
  return {
    difficulty: "Fair",

    screen: "landing",
    dealId: "tortus",
    customDeal: null,
    view: "card",

    showCustom: false,
    cf: { name: "", sector: "", stage: "", oneLiner: "" },

    transcript: [],
    activeSpeaker: null,
    streaming: false,
    streamShown: "",
    streamFull: "",
    talk: false,
    curActivity: "",
    input: "",
    turnCount: 0,
    elapsed: 0,
    busy: false,
    helping: "",
    open: { signal: true, why: true },

    ttsOn: true,
    listening: false,
    voiceErr: false,
    report: null,
    tip: null,
    savedSession: null,
    copied: false,

    init: () => {
      loadVoices();
      const ss = readSession();
      if (ss) set({ savedSession: ss });
    },

    chooseDeal: (id) => {
      set({ dealId: id, screen: "brief" });
      scrollTop();
    },

    backLanding: () => {
      stopTimer();
      cancelTTS();
      if (rt.tw) clearInterval(rt.tw);
      if (rt.mt) clearInterval(rt.mt);
      set({
        screen: "landing",
        report: null,
        streaming: false,
        busy: false,
        savedSession: readSession(),
      });
      scrollTop();
    },

    enterRoom: () => {
      clearSession();
      set({
        screen: "room",
        view: "card",
        transcript: [],
        turnCount: 0,
        elapsed: 0,
        activeSpeaker: null,
        streaming: false,
        streamShown: "",
        input: "",
        report: null,
        busy: true,
        helping: "",
        curActivity: "",
        savedSession: null,
      });
      scrollTop();
      startTimer();
      const deal = cur();
      setTimeout(() => {
        set({ busy: false });
        speakLine("skeptic", deal.opener, member("skeptic")!.activities[0]);
      }, 650);
    },

    runAgain: () => get().enterRoom(),
    setCard: () => set({ view: "card" }),
    setTranscript: () => set({ view: "transcript" }),
    setTranscript2: () => {
      set({ screen: "room", view: "transcript" });
      scrollTop();
    },
    toggle: (k) => set((s) => ({ open: { ...s.open, [k]: !s.open[k] } })),

    openCustom: () => set((s) => ({ showCustom: !s.showCustom })),
    setCf: (patch) => set((s) => ({ cf: { ...s.cf, ...patch } })),
    submitCustom: () => {
      const c = get().cf;
      const name = (c.name || "").trim() || "Your company";
      const deal = customDeal(
        name,
        c.sector || "—",
        c.stage || "—",
        (c.oneLiner || "").trim() || "A company under evaluation.",
      );
      set({ customDeal: deal, dealId: "custom", screen: "brief", showCustom: false });
      scrollTop();
    },

    setInput: (v) => set({ input: v }),

    submit: async () => {
      const ans = (get().input || "").trim();
      if (!ans || get().busy || get().streaming) return;
      const t: Turn[] = [...get().transcript, { speaker: "user", content: ans }];
      set({ transcript: t, input: "", busy: true });
      persist();
      if (get().listening) stopVoice();
      await get()._committeeTurn(t);
    },

    _committeeTurn: async (t) => {
      const deal = cur();
      const { system, user } = turnPrompts(deal, t, hard());
      const j = await askJSON<TurnJSON>(system, user, 460);
      if (j && j.next && j.line && member(j.next)) {
        set({ busy: false, turnCount: get().turnCount + 1 });
        speakLine(j.next, String(j.line).trim(), (j.activity || "").toString().trim());
      } else {
        fallbackTurn(t);
      }
    },

    pass: () => {
      if (get().busy || get().streaming) return;
      set({
        input:
          "(The analyst lets the question stand and does not answer it directly.)",
      });
      get().submit();
    },

    draftAnswer: async () => {
      if (get().busy || get().streaming || get().helping) return;
      set({ helping: "draft" });
      const deal = cur();
      const q = lastQ();
      const { system, user } = draftPrompts(deal, get().transcript, q);
      try {
        const raw = await callModel({
          system,
          messages: [{ role: "user", content: user }],
          maxTokens: 240,
        });
        set({ input: cleanText(raw), helping: "" });
      } catch {
        set({ helping: "" });
      }
    },

    sharpenAnswer: async () => {
      if (get().busy || get().streaming || get().helping) return;
      const currentInput = (get().input || "").trim();
      if (!currentInput) return get().draftAnswer();
      set({ helping: "sharpen" });
      const deal = cur();
      const q = lastQ();
      const { system, user } = sharpenPrompts(deal, get().transcript, q, currentInput);
      try {
        const raw = await callModel({
          system,
          messages: [{ role: "user", content: user }],
          maxTokens: 240,
        });
        set({ input: cleanText(raw), helping: "" });
      } catch {
        set({ helping: "" });
      }
    },

    callVote: async () => {
      if (get().busy || get().streaming) return;
      if (get().transcript.filter((x) => x.speaker === "user").length === 0) return;
      set({ busy: true });
      const deal = cur();
      const { system, user } = judgePrompts(deal, get().transcript);
      const j = await askJSON<Report>(system, user, 700);
      if (j && j.scores) finishReport(j);
      else fallbackReport();
    },

    toggleTTS: () => {
      const n = !get().ttsOn;
      if (!n) cancelTTS();
      set({ ttsOn: n });
    },

    toggleVoice: () => {
      if (!isVoiceSupported()) {
        set({ voiceErr: true });
        return;
      }
      if (get().listening) {
        stopVoice();
        return;
      }
      const curInput = get().input;
      const base = curInput ? curInput.replace(/\s+$/, "") + " " : "";
      const ok = startVoice({
        base,
        onResult: (text) => set({ input: text }),
        onEnd: () => set({ listening: false }),
      });
      if (ok) set({ listening: true, voiceErr: false });
    },

    showTip: (x, y, tip) => {
      let cx = x;
      try {
        const w = typeof window !== "undefined" ? window.innerWidth : 1200;
        cx = Math.max(96, Math.min(w - 96, x));
      } catch {
        /* ignore */
      }
      set({ tip: { x: cx, y, title: tip.title, val: tip.val, sub: tip.sub } });
    },
    tipOff: () => {
      if (get().tip) set({ tip: null });
    },

    resumeSession: () => {
      const ss = get().savedSession || readSession();
      if (!ss) return;
      const lastSpk = [...ss.transcript].reverse().find((x) => x.speaker !== "user");
      const tail = ss.transcript[ss.transcript.length - 1];
      const needAdvance = ss.screen === "room" && !!tail && tail.speaker === "user";
      set({
        screen: ss.screen,
        dealId: ss.dealId,
        customDeal: ss.customDeal || null,
        transcript: ss.transcript,
        turnCount: ss.turnCount || 0,
        elapsed: ss.elapsed || 0,
        view: ss.view || "card",
        open: ss.open || { signal: true, why: true },
        report: ss.report || null,
        activeSpeaker: lastSpk ? (lastSpk.speaker as SpeakerId) : null,
        streaming: false,
        busy: needAdvance,
        streamShown: "",
        input: "",
        helping: "",
        savedSession: null,
      });
      if (ss.screen === "room") startTimer(ss.elapsed || 0);
      if (needAdvance) get()._committeeTurn(ss.transcript);
      scrollTop();
    },
    discardSession: () => {
      clearSession();
      set({ savedSession: null });
    },

    markCopied: () => {
      set({ copied: true });
      if (rt.ct) clearTimeout(rt.ct);
      rt.ct = setTimeout(() => set({ copied: false }), 2000);
    },
  };
});
