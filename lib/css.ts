import type { CSSProperties } from "react";

// Parse an inline CSS declaration string ("a:b;c:d") into a React style object.
// Lets us reuse the design concept's exact inline styles verbatim, including
// CSS custom properties (e.g. --gc for the glow animation).
export function sx(cssText: string, extra?: CSSProperties): CSSProperties {
  const out: Record<string, string> = {};
  String(cssText || "")
    .split(";")
    .forEach((decl) => {
      const i = decl.indexOf(":");
      if (i < 0) return;
      const prop = decl.slice(0, i).trim();
      const val = decl.slice(i + 1).trim();
      if (!prop) return;
      const key = prop.startsWith("--")
        ? prop
        : prop.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
      out[key] = val;
    });
  return { ...(out as CSSProperties), ...(extra || {}) };
}
