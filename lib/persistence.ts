import type { SavedSession } from "./types";

// Session persistence via localStorage. Ported from _readSession / _persist /
// _clearSession. Key: ic_session_v1.
const KEY = "ic_session_v1";

export function readSession(): SavedSession | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as SavedSession;
    if (!j || !j.dealId || !Array.isArray(j.transcript) || !j.transcript.length)
      return null;
    return j;
  } catch {
    return null;
  }
}

export function persistSession(snap: SavedSession): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage)
      window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
