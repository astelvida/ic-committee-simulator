// Push-to-talk voice input via the Web Speech API (SpeechRecognition).
// Ported from toggleVoice(). Browser-guarded; the store owns listening state.

interface SpeechRecognitionAlt {
  transcript: string;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlt;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceSupported(): boolean {
  return !!getCtor();
}

let rec: SpeechRecognitionLike | null = null;

export function stopVoice(): void {
  if (rec) {
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  }
}

export function startVoice(opts: {
  base: string;
  onResult: (text: string) => void;
  onEnd: () => void;
}): boolean {
  const Ctor = getCtor();
  if (!Ctor) return false;
  const r = new Ctor();
  r.lang = "en-GB";
  r.interimResults = true;
  r.continuous = false;
  rec = r;
  r.onresult = (ev) => {
    let s = "";
    for (let i = 0; i < ev.results.length; i++) s += ev.results[i][0].transcript;
    opts.onResult(opts.base + s);
  };
  r.onend = () => opts.onEnd();
  r.onerror = () => opts.onEnd();
  try {
    r.start();
    return true;
  } catch {
    opts.onEnd();
    return false;
  }
}
