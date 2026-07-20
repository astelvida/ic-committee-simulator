import type { Member } from "./types";
import { MEMBERS } from "./members";

// Per-persona text-to-speech via the Web Speech API. Ported from _tts /
// _pickVoice / _cancelTTS. All browser-guarded — a no-op where unsupported.

let voices: SpeechSynthesisVoice[] = [];

export function loadVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const load = () => {
    voices = window.speechSynthesis.getVoices() || [];
  };
  load();
  window.speechSynthesis.onvoiceschanged = load;
}

function pickVoice(m: Member): SpeechSynthesisVoice | null {
  const vs = voices || [];
  if (!vs.length) return null;
  const en = vs.filter((v) => /en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : vs;
  const f =
    /(female|woman|samantha|victoria|karen|moira|tessa|fiona|serena|zira|libby|sonia|amelie|aria)/i;
  const ma =
    /(male|man|daniel|alex|fred|arthur|george|rishi|david|guy|thomas|oliver)/i;
  let match = pool.find((v) =>
    m.voice.gender === "female" ? f.test(v.name) : ma.test(v.name),
  );
  if (!match) {
    const idx = MEMBERS.indexOf(m);
    match = pool[idx % pool.length];
  }
  return match || null;
}

export function speak(m: Member, text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[—–]/g, ", "));
    u.pitch = m.voice.pitch;
    u.rate = m.voice.rate;
    u.volume = 1;
    const v = pickVoice(m);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function cancelTTS(): void {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis)
      window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
