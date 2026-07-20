"use client";

import { useIC, DEALS } from "@/lib/store";
import { MEMBERS, face } from "@/lib/members";
import { fmt } from "@/lib/format";
import { sx } from "@/lib/css";

const inpStyle =
  "border:1px solid var(--line2);background:var(--bg);border-radius:9px;padding:10px 12px;font-size:13.5px;color:var(--tx);outline:none;font-family:var(--sans)";

function prioStyle(p: string): string {
  const red = p && /P0/.test(p);
  const nu = p === "NEW";
  return (
    "font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.03em;padding:3px 8px;border-radius:6px;color:#FFFFFF;background:" +
    (nu ? "var(--ch)" : red ? "var(--sk)" : "var(--faint)")
  );
}

export default function Landing() {
  const savedSession = useIC((s) => s.savedSession);
  const showCustom = useIC((s) => s.showCustom);
  const cf = useIC((s) => s.cf);
  const chooseDeal = useIC((s) => s.chooseDeal);
  const openCustom = useIC((s) => s.openCustom);
  const submitCustom = useIC((s) => s.submitCustom);
  const setCf = useIC((s) => s.setCf);
  const resumeSession = useIC((s) => s.resumeSession);
  const discardSession = useIC((s) => s.discardSession);

  const hasSaved = !!savedSession;
  let savedLabel = "";
  let savedSub = "";
  if (savedSession) {
    savedLabel =
      savedSession.dealId === "custom"
        ? savedSession.customDeal?.name || "Your company"
        : DEALS.find((d) => d.id === savedSession.dealId)?.name || "Deal";
    savedSub =
      (savedSession.screen === "report"
        ? "Verdict ready"
        : (savedSession.turnCount || 0) + " exchanges") +
      " · " +
      fmt(savedSession.elapsed || 0);
  }

  return (
    <>
      <div
        style={sx(
          "width:100%;background:radial-gradient(1100px 500px at 78% -8%, color-mix(in srgb,var(--acc) 15%,transparent), transparent 70%)",
        )}
      >
        <div style={sx("max-width:1200px;margin:0 auto;padding:26px 26px 70px;width:100%")}>
          <div
            style={sx(
              "display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px",
            )}
          >
            <div style={sx("font-family:var(--mono);font-size:13px;letter-spacing:.14em;color:var(--acc);font-weight:600")}>
              ◆ ic://committee
            </div>
            <div style={sx("font-family:var(--mono);font-size:12px;letter-spacing:.08em;color:var(--faint)")}>
              v3 · gemini ready · no login
            </div>
          </div>

          {hasSaved && (
            <div
              style={sx(
                "margin-top:22px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;background:var(--panel);border:1px solid var(--acc);border-radius:13px;padding:14px 18px;box-shadow:0 16px 44px -24px var(--acc);animation:rise .3s",
              )}
            >
              <div style={sx("display:flex;align-items:center;gap:13px;min-width:0")}>
                <span
                  style={sx(
                    "width:9px;height:9px;border-radius:50%;background:var(--acc);animation:livedot 1.6s infinite;flex-shrink:0",
                  )}
                />
                <div style={sx("min-width:0")}>
                  <div style={sx("font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)")}>
                    Session in progress
                  </div>
                  <div style={sx("font-weight:600;font-size:15px;margin-top:1px")}>
                    {savedLabel}{" "}
                    <span style={sx("color:var(--faint);font-weight:400;font-family:var(--mono);font-size:12px")}>
                      · {savedSub}
                    </span>
                  </div>
                </div>
              </div>
              <div style={sx("display:flex;gap:8px;flex-shrink:0")}>
                <button
                  style={sx(
                    "background:var(--acc);color:#FFFFFF;border:none;padding:9px 18px;border-radius:9px;font-size:13.5px;font-weight:700;font-family:var(--sans);cursor:pointer",
                  )}
                  onClick={resumeSession}
                >
                  Resume →
                </button>
                <button
                  style={sx(
                    "background:transparent;color:var(--muted);border:1px solid var(--line2);padding:9px 15px;border-radius:9px;font-size:13.5px;font-weight:600;font-family:var(--sans);cursor:pointer",
                  )}
                  onClick={discardSession}
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          <div
            style={sx(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:40px;align-items:center;margin-top:40px",
            )}
          >
            <div>
              <div style={sx("font-family:var(--mono);font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);font-weight:600;margin-bottom:18px")}>
                The investment committee, simulated
              </div>
              <h1 style={sx("font-family:var(--disp);font-size:clamp(48px,7.2vw,88px);font-weight:700;line-height:.94;letter-spacing:-.03em")}>
                Take your call
                <br />
                <span style={sx("color:var(--acc)")}>to the table.</span>
              </h1>
              <p style={sx("font-size:19px;color:var(--muted);max-width:52ch;margin-top:22px;line-height:1.55")}>
                You&apos;re the analyst. You&apos;ve done the work and you&apos;re
                recommending the deal. Now four partners pressure-test your
                investment case — live, in character, one hard question at a time.{" "}
                <span style={sx("color:var(--tx)")}>
                  No fabricated numbers. Just the thesis, under load.
                </span>
              </p>
              <div style={sx("display:flex;gap:12px;flex-wrap:wrap;margin-top:28px")}>
                <a
                  href="#deals"
                  style={sx(
                    "background:var(--acc);color:#FFFFFF;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:700;font-family:var(--sans)",
                  )}
                >
                  Open a deal ↓
                </a>
                <span
                  style={sx(
                    "border:1px solid var(--line2);color:var(--tx);padding:14px 22px;border-radius:10px;font-size:15px;font-weight:600;font-family:var(--sans);cursor:pointer",
                  )}
                  onClick={openCustom}
                >
                  Evaluate your own company +
                </span>
              </div>
            </div>

            {/* terminal window with committee */}
            <div
              style={sx(
                "border:1px solid var(--line2);border-radius:14px;overflow:hidden;background:var(--panel);box-shadow:0 30px 80px -40px #000",
              )}
            >
              <div
                style={sx(
                  "display:flex;align-items:center;gap:8px;padding:11px 15px;border-bottom:1px solid var(--line);background:var(--panel2)",
                )}
              >
                <span style={sx("width:11px;height:11px;border-radius:50%;background:#FF5F57")} />
                <span style={sx("width:11px;height:11px;border-radius:50%;background:#FEBC2E")} />
                <span style={sx("width:11px;height:11px;border-radius:50%;background:#28C840")} />
                <span style={sx("font-family:var(--mono);font-size:12px;color:var(--faint);margin-left:8px")}>
                  ic://committee/session — 4 partners
                </span>
              </div>
              <div style={sx("padding:22px 20px")}>
                <div style={sx("font-family:var(--mono);font-size:12.5px;color:var(--op);margin-bottom:18px")}>
                  ❯ convening the investment committee
                  <span style={sx("animation:caret 1s step-end infinite")}>▋</span>
                </div>
                <div style={sx("display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap")}>
                  {MEMBERS.map((m) => (
                    <div key={m.id} style={sx("text-align:center;flex:1;min-width:76px")}>
                      <pre style={sx("font-size:13px;line-height:1.15;white-space:pre", { color: m.color })}>
                        {face(m.id, "idle")}
                      </pre>
                      <div style={sx("font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;font-weight:700;margin-top:6px", { color: m.color })}>
                        {m.name.replace("The ", "")}
                      </div>
                      <div style={sx("font-family:var(--mono);font-size:8.5px;color:var(--faint);margin-top:2px")}>
                        {m.title.split(" ")[0]}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={sx(
                    "margin-top:18px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--faint)",
                  )}
                >
                  <span>
                    status: <span style={sx("color:var(--op)")}>ready</span>
                  </span>
                  <span>awaiting analyst ▸</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEAL TABLE */}
      <div id="deals" style={sx("max-width:1200px;margin:0 auto;padding:34px 26px 24px;width:100%;scroll-margin-top:18px")}>
        <div style={sx("display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px")}>
          <h2 style={sx("font-family:var(--disp);font-size:clamp(26px,3.4vw,38px);font-weight:600;letter-spacing:-.02em")}>
            Pick a deal to evaluate
          </h2>
          <span style={sx("font-family:var(--mono);font-size:12px;color:var(--faint)")}>
            // pipeline · sorted by SSI
          </span>
        </div>

        <div style={sx("margin-top:20px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--panel)")}>
          <div
            style={sx(
              "display:grid;grid-template-columns:60px minmax(0,2.4fr) 1.1fr .8fr .8fr 108px;gap:12px;padding:12px 20px;background:var(--panel2);color:var(--faint);font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--line)",
            )}
          >
            <span>SSI</span>
            <span>Company</span>
            <span className="tbl-hide">Sector</span>
            <span className="tbl-hide">Stage</span>
            <span>Priority</span>
            <span style={sx("text-align:right")}>Action</span>
          </div>
          {DEALS.map((d) => (
            <div
              key={d.id}
              style={sx(
                "display:grid;grid-template-columns:60px minmax(0,2.4fr) 1.1fr .8fr .8fr 108px;gap:12px;padding:16px 20px;align-items:center;border-top:1px solid var(--line);cursor:pointer;transition:background .12s",
              )}
              onClick={() => chooseDeal(d.id)}
            >
              <div
                style={sx(
                  "width:42px;height:42px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:16px;font-weight:700;color:#FFFFFF;background:" +
                    d.ssiColor,
                )}
              >
                {d.ssi}
              </div>
              <div style={sx("min-width:0")}>
                <div style={sx("font-family:var(--disp);font-size:20px;font-weight:600;line-height:1.05")}>
                  {d.name}
                </div>
                <div style={sx("font-size:13px;color:var(--muted);line-height:1.4;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>
                  {d.oneLiner || d.tagline}
                </div>
              </div>
              <div style={sx("font-family:var(--mono);font-size:12.5px;color:var(--muted)")} className="tbl-hide">
                {d.sector}
              </div>
              <div style={sx("font-family:var(--mono);font-size:12.5px;color:var(--muted)")} className="tbl-hide">
                {d.stage}
              </div>
              <div>
                <span style={sx(prioStyle(d.priority))}>{d.priority}</span>
              </div>
              <div style={sx("text-align:right;font-family:var(--mono);font-size:13px;font-weight:700;color:var(--acc)")}>
                Evaluate →
              </div>
            </div>
          ))}
          <div style={sx("border-top:1px solid var(--line);padding:15px 20px;background:var(--panel2)")}>
            {showCustom ? (
              <div style={sx("animation:rise .25s")}>
                <div style={sx("font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:12px")}>
                  New evaluation — the committee convenes on your thesis
                </div>
                <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px")}>
                  <input
                    value={cf.name}
                    onChange={(e) => setCf({ name: e.target.value })}
                    placeholder="Company name"
                    style={sx(inpStyle)}
                  />
                  <input
                    value={cf.sector}
                    onChange={(e) => setCf({ sector: e.target.value })}
                    placeholder="Sector (e.g. Fintech AI)"
                    style={sx(inpStyle)}
                  />
                  <input
                    value={cf.stage}
                    onChange={(e) => setCf({ stage: e.target.value })}
                    placeholder="Stage / round (e.g. Seed · €5M)"
                    style={sx(inpStyle)}
                  />
                </div>
                <textarea
                  value={cf.oneLiner}
                  onChange={(e) => setCf({ oneLiner: e.target.value })}
                  placeholder="One line: what does it do, and why is this the investment?"
                  rows={2}
                  style={sx(inpStyle + ";width:100%;margin-top:10px;resize:none")}
                />
                <div style={sx("display:flex;gap:8px;margin-top:10px")}>
                  <button
                    style={sx(
                      "background:var(--acc);color:#FFFFFF;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;font-family:var(--sans);cursor:pointer",
                    )}
                    onClick={submitCustom}
                  >
                    Build the memo →
                  </button>
                  <button
                    style={sx(
                      "background:transparent;border:1px solid var(--line2);color:var(--muted);padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;font-family:var(--sans);cursor:pointer",
                    )}
                    onClick={openCustom}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={sx("display:flex;align-items:center;gap:10px;cursor:pointer")} onClick={openCustom}>
                <span style={sx("font-family:var(--mono);font-size:18px;color:var(--acc);font-weight:700")}>+</span>
                <span style={sx("font-size:14.5px;font-weight:600;color:var(--tx)")}>
                  Evaluate your own company
                </span>
                <span style={sx("font-size:13px;color:var(--faint)")}>
                  — paste a deal and take it to the committee
                </span>
              </div>
            )}
          </div>
        </div>

        {/* committee dossier */}
        <div style={sx("margin-top:52px")}>
          <div style={sx("display:flex;align-items:baseline;gap:12px;margin-bottom:6px")}>
            <h2 style={sx("font-family:var(--disp);font-size:clamp(22px,3vw,30px);font-weight:600;letter-spacing:-.02em")}>
              The committee
            </h2>
            <span style={sx("font-family:var(--mono);font-size:12px;color:var(--faint)")}>
              // four partners, four mandates
            </span>
          </div>
          <p style={sx("font-size:15px;color:var(--muted);max-width:64ch;margin-bottom:22px")}>
            Each partner owns a distinct part of the diligence. They disagree on
            purpose — clearing all four is what a real IC decision requires.
          </p>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px")}>
            {MEMBERS.map((m) => (
              <div
                key={m.id}
                style={sx(
                  "background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;position:relative;overflow:hidden",
                )}
              >
                <div style={sx("position:absolute;inset:0 auto 0 0;width:3px;background:" + m.color)} />
                <div style={sx("display:flex;gap:14px;align-items:flex-start")}>
                  <pre style={sx("font-size:13px;line-height:1.15;white-space:pre;flex-shrink:0", { color: m.color })}>
                    {face(m.id, "idle")}
                  </pre>
                  <div style={sx("min-width:0")}>
                    <div style={sx("font-family:var(--disp);font-size:21px;font-weight:700;line-height:1")}>
                      {m.name}
                    </div>
                    <div style={sx("font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;margin-top:5px", { color: m.color })}>
                      {m.title}
                    </div>
                  </div>
                </div>
                <div style={sx("font-size:13.5px;color:var(--muted);line-height:1.5;margin-top:13px")}>
                  {m.bio}
                </div>
                <div style={sx("margin-top:13px;padding-top:12px;border-top:1px solid var(--line)")}>
                  <div style={sx("font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:7px")}>
                    Evaluates
                  </div>
                  {m.evaluates.map((e, i) => (
                    <div key={i} style={sx("font-size:12.5px;color:var(--tx);line-height:1.45;padding:2px 0")}>
                      <span style={sx("font-family:var(--mono)", { color: m.color })}>▸ </span>
                      {e}
                    </div>
                  ))}
                </div>
                <div style={sx("margin-top:11px;font-family:var(--mono);font-size:11px;color:var(--faint)")}>
                  scores: <span style={sx("color:var(--muted)")}>{m.scores}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={sx("height:40px")} />
      </div>
    </>
  );
}
