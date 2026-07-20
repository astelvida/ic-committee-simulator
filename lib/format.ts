// mm:ss timer formatting, ported from _fmt().
export function fmt(s: number): string {
  return (
    String(Math.floor(s / 60)).padStart(2, "0") +
    ":" +
    String(s % 60).padStart(2, "0")
  );
}
