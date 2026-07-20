"use client";

import type { MouseEvent } from "react";
import { useIC, currentDeal } from "@/lib/store";
import { dealBrief, type Bar, type TipPayload } from "@/lib/charts";
import { memoSections } from "@/lib/memo";
import { sx } from "@/lib/css";
import Tooltip from "@/components/ui/Tooltip";

const tileStyle =
  "background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 20px;box-shadow:0 1px 0 var(--line2);animation:rise .5s both";
const tileLabel =
  "font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:12px";

export default function Brief() {
  const deal = useIC((s) => currentDeal(s));
  const open = useIC((s) => s.open);
  const backLanding = useIC((s) => s.backLanding);
  const enterRoom = useIC((s) => s.enterRoom);
  const toggle = useIC((s) => s.toggle);
  const showTip = useIC((s) => s.showTip);
  const tipOff = useIC((s) => s.tipOff);

  const db = dealBrief(deal);
  const sections = memoSections(deal);

  const hoverTip = (t: TipPayload) => (e: MouseEvent) =>
    showTip(e.clientX, e.clientY, t);

  const renderBar = (b: Bar, big = false) => (
    <div
      key={b.label}
      onMouseEnter={hoverTip(b.tip)}
      onMouseLeave={tipOff}
      style={sx(
        big
          ? "display:grid;grid-template-columns:190px minmax(0,1fr) 66px;gap:14px;align-items:center;margin-bottom:11px;cursor:default"
          : "margin-bottom:11px;cursor:default",
      )}
    >
      {big ? (
        <>
          <span style={sx("font-size:13px;" + (b.emph || ""))}>{b.label}</span>
          <div style={sx("height:16px;background:var(--panel2);border-radius:5px;overflow:hidden")}>
            <div
              style={sx(
                "height:100%;border-radius:5px;transform-origin:left;animation:barin .9s ease-out;width:" +
                  b.pct +
                  "%;background:" +
                  b.color,
              )}
            />
          </div>
          <span style={sx("font-family:var(--mono);font-size:12.5px;font-weight:700;text-align:right")}>
            {b.valLabel}
          </span>
        </>
      ) : (
        <>
          <div style={sx("display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px")}>
            <span style={sx("color:var(--muted)")}>{b.label}</span>
            <span style={sx("font-family:var(--mono);font-weight:700")}>{b.valLabel}</span>
          </div>
          <div style={sx("height:10px;background:var(--panel2);border-radius:5px;overflow:hidden")}>
            <div
              style={sx(
                "height:100%;border-radius:5px;transform-origin:left;animation:barin .8s ease-out;width:" +
                  b.pct +
                  "%;background:" +
                  b.color,
              )}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={sx("max-width:1200px;margin:0 auto;padding:24px 24px 96px;width:100%")}>
      <div style={sx("font-family:var(--mono);font-size:13px;color:var(--muted);cursor:pointer;margin-bottom:16px")} onClick={backLanding}>
        ← pipeline
      </div>
      <Tooltip />

      {/* HERO BANNER */}
      <div style={sx("position:relative;border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--panel);animation:rise .4s ease-out")}>
        <div style={sx("position:absolute;inset:0;background:radial-gradient(680px 340px at 88% -30%, color-mix(in srgb,var(--acc) 26%,transparent), transparent 70%);pointer-events:none")} />
        <div style={sx("position:relative;display:flex;justify-content:space-between;align-items:center;gap:26px;flex-wrap:wrap;padding:30px 34px")}>
          <div style={sx("flex:1;min-width:260px")}>
            <div style={sx("font-family:var(--mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);font-weight:700")}>
              Investment memo · analyst brief
            </div>
            <h1 style={sx("font-family:var(--disp);font-size:clamp(40px,6.5vw,72px);font-weight:700;letter-spacing:-.03em;line-height:.94;margin:10px 0 12px")}>
              {deal.name}
            </h1>
            <div style={sx("font-size:16.5px;color:var(--muted);line-height:1.55;max-width:58ch")}>
              {deal.tagline}
            </div>
            <div style={sx("display:flex;gap:7px;flex-wrap:wrap;margin-top:18px")}>
              {deal.pills.map((p, i) => (
                <span key={i} style={sx(p.style)}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
          {db.hasCharts ? (
            <div style={sx("text-align:center;flex-shrink:0")}>
              <div style={sx("position:relative;width:168px;height:168px")}>
                <svg viewBox="0 0 120 120" width="168" height="168" style={{ display: "block" }}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--panel2)" strokeWidth="13" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={deal.ssiColor}
                    strokeWidth="13"
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    strokeDasharray={db.viz.gaugeArr}
                    style={{ animation: "drawring 1.2s cubic-bezier(.2,.8,.2,1)" }}
                  />
                </svg>
                <div style={sx("position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none")}>
                  <div style={sx("font-family:var(--disp);font-size:40px;font-weight:700;color:var(--tx);line-height:1")}>
                    {deal.ssi}
                  </div>
                  <div style={sx("font-family:var(--mono);font-size:8px;letter-spacing:1px;color:var(--faint);margin-top:2px")}>
                    SSI / 100
                  </div>
                </div>
              </div>
              <div style={sx("font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:4px")}>
                {deal.ssiConfidence} confidence
              </div>
            </div>
          ) : (
            <div style={sx("font-family:var(--disp);font-size:60px;font-weight:700;color:var(--faint);flex-shrink:0")}>
              {deal.ssi}
            </div>
          )}
        </div>
        <div style={sx("position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));border-top:1px solid var(--line)")}>
          {db.tiles.map((t, i) => (
            <div key={i} style={sx("padding:15px 20px;border-right:1px solid var(--line)")}>
              <div style={sx("font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)")}>
                {t.k}
              </div>
              <div style={sx("font-family:var(--disp);font-size:26px;font-weight:700;margin-top:3px")}>
                {t.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BENTO CHARTS */}
      {db.hasCharts && (
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-top:14px")}>
          <div style={sx(tileStyle + ";animation-delay:.04s")}>
            <div style={sx(tileLabel)}>SSI composition</div>
            <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: "300px", display: "block", margin: "2px auto 0" }}>
              <polygon points="100,22 178,100 100,178 22,100" fill="none" stroke="var(--line)" />
              <polygon points="100,48.5 151.5,100 100,151.5 48.5,100" fill="none" stroke="var(--line)" />
              <polygon points="100,74.3 125.7,100 100,125.7 74.3,100" fill="none" stroke="var(--line)" />
              <line x1="100" y1="100" x2="100" y2="22" stroke="var(--line)" />
              <line x1="100" y1="100" x2="178" y2="100" stroke="var(--line)" />
              <line x1="100" y1="100" x2="100" y2="178" stroke="var(--line)" />
              <line x1="100" y1="100" x2="22" y2="100" stroke="var(--line)" />
              <polygon
                points={db.viz.radarPoly}
                fill={"color-mix(in srgb, " + deal.ssiColor + " 22%, transparent)"}
                stroke={deal.ssiColor}
                strokeWidth="2"
                style={{ transformOrigin: "center", animation: "pop .6s .2s both" }}
              />
            </svg>
            <div style={sx("display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;margin-top:10px")}>
              {db.ssiBars.map((b) => (
                <div
                  key={b.label}
                  onMouseEnter={hoverTip(b.tip)}
                  onMouseLeave={tipOff}
                  style={sx("display:flex;align-items:center;gap:7px;font-size:11.5px;cursor:default")}
                >
                  <span style={sx("width:8px;height:8px;border-radius:2px;flex-shrink:0;background:" + b.color)} />
                  <span style={sx("color:var(--muted)")}>{b.label}</span>
                  <span style={sx("margin-left:auto;font-family:var(--mono);font-weight:700")}>{b.valLabel}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={sx(tileStyle + ";animation-delay:.1s")}>
            <div style={sx(tileLabel)}>Funding to date · £M</div>
            {db.fundingBars.map((b) => renderBar(b))}
            <div style={sx("margin-top:15px;padding-top:14px;border-top:1px dashed var(--line)")}>
              <div style={sx(tileLabel)}>Round timeline</div>
              <div style={sx("position:relative;height:60px")}>
                <div style={sx("position:absolute;left:4%;right:4%;top:24px;height:2px;background:var(--line)")} />
                {db.viz.timeline.map((p, i) => (
                  <div key={i}>
                    <div
                      onMouseEnter={hoverTip(p.tip)}
                      onMouseLeave={tipOff}
                      style={sx(
                        "position:absolute;top:24px;left:" +
                          p.left +
                          "%;width:" +
                          p.size +
                          "px;height:" +
                          p.size +
                          "px;transform:translate(-50%,-50%);border-radius:50%;border:2px solid var(--panel);animation:pop .5s both;cursor:default;background:" +
                          p.color,
                      )}
                    />
                    <div style={sx("position:absolute;top:40px;left:" + p.left + "%;transform:translateX(-50%);font-family:var(--mono);font-size:8.5px;font-weight:700;color:var(--muted);white-space:nowrap")}>
                      {p.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={sx(tileStyle + ";grid-column:1/-1;animation-delay:.16s")}>
            <div style={sx(tileLabel)}>This round vs comparable rounds · $M</div>
            {db.compBars.map((b) => renderBar(b, true))}
          </div>
        </div>
      )}

      {/* NARRATIVE */}
      <div style={sx("display:grid;grid-template-columns:230px minmax(0,1fr);gap:24px;margin-top:14px")} className="memo-cols">
        <div style={sx(tileStyle + ";height:fit-content")}>
          <div style={sx(tileLabel)}>Row data</div>
          {db.sideRows.map((r, i) => (
            <div key={i} style={sx("display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);font-size:12.5px")}>
              <span style={sx("color:var(--muted)")}>{r.k}</span>
              <span style={sx("font-weight:600;text-align:right")}>{r.v}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={sx(tileLabel)}>Detail · tap to expand ▾</div>
          {sections.map((m) => {
            const isOpen = !!open[m.key];
            return (
              <div key={m.key} style={sx("border:1px solid var(--line);border-radius:12px;margin-bottom:9px;overflow:hidden;background:var(--panel)")}>
                <div style={sx("display:flex;justify-content:space-between;align-items:center;gap:8px;padding:14px 17px;cursor:pointer")} onClick={() => toggle(m.key)}>
                  <span style={sx("font-family:var(--mono);font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--tx);font-weight:600")}>
                    {m.title}
                  </span>
                  <span style={sx("font-family:var(--mono);font-size:18px;font-weight:700;line-height:1;color:" + m.accent)}>
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
                {isOpen && (
                  <div style={sx("padding:2px 17px 15px 16px;margin-left:12px;font-size:13.5px;line-height:1.62;color:var(--tx);white-space:pre-line;animation:rise .2s;border-left:2px solid " + m.accent)}>
                    {m.body}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={sx("display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:20px;padding:20px 24px;border:1px solid var(--line);border-radius:16px;background:var(--panel)")}>
        <span style={sx("font-family:var(--mono);font-size:11.5px;color:var(--faint)")}>{deal.readNote}</span>
        <button
          style={sx("background:var(--acc);color:#FFFFFF;border:none;padding:14px 30px;border-radius:11px;font-size:15px;font-weight:700;font-family:var(--sans);cursor:pointer")}
          onClick={enterRoom}
        >
          Enter the committee →
        </button>
      </div>
    </div>
  );
}
