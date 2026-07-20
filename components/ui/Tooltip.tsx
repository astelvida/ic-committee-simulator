"use client";

import { useIC } from "@/lib/store";
import { sx } from "@/lib/css";

export default function Tooltip() {
  const tip = useIC((s) => s.tip);
  if (!tip) return null;
  return (
    <div
      style={sx(
        "position:fixed;z-index:60;left:" +
          tip.x +
          "px;top:" +
          tip.y +
          "px;transform:translate(-50%,-134%);background:var(--tx);color:#FFFFFF;padding:9px 13px;border-radius:11px;pointer-events:none;box-shadow:0 16px 40px -12px #000;animation:pop .12s;white-space:nowrap",
      )}
    >
      <div style={sx("font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55)")}>
        {tip.sub}
      </div>
      <div style={sx("font-family:var(--disp);font-size:17px;font-weight:700;line-height:1.1;margin-top:2px")}>
        {tip.val}
      </div>
      <div style={sx("font-size:11.5px;color:rgba(255,255,255,.82);margin-top:1px")}>
        {tip.title}
      </div>
    </div>
  );
}
