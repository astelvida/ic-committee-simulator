"use client";

import type { KeyboardEvent } from "react";
import { useIC, currentDeal } from "@/lib/store";
import { MEMBERS, member } from "@/lib/members";
import { memberVM } from "@/lib/memberVM";
import { memoSections } from "@/lib/memo";
import { fmt } from "@/lib/format";
import { sx } from "@/lib/css";

const tabBase =
  "font-family:var(--mono);font-size:11px;padding:6px 12px;cursor:pointer;font-weight:600;";

export default function Room() {
  const s = useIC();
  const deal = currentDeal(s);
  const committee = MEMBERS.map((m) => memberVM(m, s, false));
  const sections = memoSections(deal);
  const db = deal;

  const isCard = s.view === "card";
  const isTranscript = s.view === "transcript";
  const thinking = s.busy && !s.streaming;
  const helpDisabled = s.busy || s.streaming || !!s.helping;
  const passDis = s.busy || s.streaming;
  const sendDis = s.busy || s.streaming;

  const cardTabStyle =
    (s.view === "card"
      ? tabBase + "background:var(--tx);color:#FFFFFF;"
      : tabBase + "background:var(--panel);color:var(--muted);");
  const txTabStyle =
    (s.view === "transcript"
      ? tabBase + "background:var(--tx);color:#FFFFFF;"
      : tabBase + "background:var(--panel);color:var(--muted);");
  const helpStyle =
    "font-family:var(--mono);font-size:11px;padding:7px 11px;border-radius:8px;border:1px solid var(--line2);color:var(--acc);background:transparent;font-weight:600;cursor:" +
    (helpDisabled ? "wait" : "pointer") +
    ";opacity:" +
    (helpDisabled ? ".55" : "1");
  const passStyle =
    "font-family:var(--mono);font-size:11px;padding:7px 11px;border-radius:8px;border:1px solid var(--line2);color:var(--muted);background:transparent;font-weight:600;cursor:" +
    (passDis ? "not-allowed" : "pointer") +
    ";opacity:" +
    (passDis ? ".5" : "1");
  const micStyle =
    "font-family:var(--mono);font-size:11px;padding:8px 11px;border-radius:8px;cursor:pointer;font-weight:600;border:1px solid " +
    (s.listening ? "var(--sk)" : "var(--line2)") +
    ";color:" +
    (s.listening ? "#FFFFFF" : "var(--tx)") +
    ";background:" +
    (s.listening ? "var(--sk)" : "transparent");
  const sendStyle =
    "background:var(--acc);color:#FFFFFF;border:none;padding:9px 17px;border-radius:9px;font-size:13.5px;font-weight:700;font-family:var(--sans);cursor:" +
    (sendDis ? "not-allowed" : "pointer") +
    ";opacity:" +
    (sendDis ? ".5" : "1");
  const ttsBtnStyle =
    "font-family:var(--mono);font-size:11px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;cursor:pointer;font-weight:600;background:" +
    (s.ttsOn ? "var(--panel)" : "transparent") +
    ";color:" +
    (s.ttsOn ? "var(--tx)" : "var(--faint)");

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      s.submit();
    }
  };

  return (
    <div style={sx("display:flex;flex-direction:column;min-height:100vh")}>
      <div style={sx("display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 22px;border-bottom:1px solid var(--line);background:var(--bg);position:sticky;top:0;z-index:6;flex-wrap:wrap")}>
        <div style={sx("display:flex;align-items:center;gap:12px")}>
          <div style={sx("display:flex;align-items:center;gap:6px")}>
            <span style={sx("width:9px;height:9px;border-radius:50%;background:var(--sk);animation:livedot 1.6s infinite")} />
            <span style={sx("font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--sk);font-weight:600")}>
              Live
            </span>
          </div>
          <div>
            <div style={sx("font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)")}>
              IC session · {deal.name}
            </div>
            <div style={sx("font-weight:600;font-size:14px;margin-top:1px")}>{deal.roomSub}</div>
          </div>
        </div>
        <div style={sx("display:flex;align-items:center;gap:8px;flex-wrap:wrap")}>
          <div style={sx("display:flex;border:1px solid var(--line2);border-radius:8px;overflow:hidden")}>
            <span style={sx(cardTabStyle)} onClick={s.setCard}>
              Committee
            </span>
            <span style={sx(txTabStyle)} onClick={s.setTranscript}>
              Transcript
            </span>
          </div>
          <span style={sx("font-family:var(--mono);font-size:12px;padding:6px 10px;background:var(--panel);border:1px solid var(--line);border-radius:8px;font-weight:600")}>
            ⏱ {fmt(s.elapsed)}
          </span>
          <span style={sx("font-family:var(--mono);font-size:11px;padding:6px 9px;background:var(--panel);border:1px solid var(--line);border-radius:8px;color:var(--muted)")}>
            turn {s.turnCount}
          </span>
          <span style={sx(ttsBtnStyle)} onClick={s.toggleTTS}>
            {s.ttsOn ? "🔊 voices" : "🔇 muted"}
          </span>
          <button
            style={sx("background:var(--tx);color:#FFFFFF;border:none;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;font-family:var(--sans);cursor:pointer")}
            onClick={s.callVote}
          >
            Call the vote
          </button>
          <span style={sx("font-size:22px;color:var(--faint);cursor:pointer;padding:0 4px")} onClick={s.backLanding}>
            ×
          </span>
        </div>
      </div>

      <div style={sx("display:flex;gap:16px;flex-wrap:wrap;padding:18px 22px 0;flex:1;align-content:flex-start;max-width:1240px;margin:0 auto;width:100%")}>
        <div style={sx("flex:1 1 480px;min-width:290px;display:flex;flex-direction:column;order:1")}>
          {isCard && (
            <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px")}>
              {committee.map((m) => (
                <div key={m.id} style={sx(m.cardStyle)}>
                  <div style={sx("display:flex;gap:14px;align-items:flex-start")}>
                    <pre style={sx("font-size:13.5px;line-height:1.15;white-space:pre;flex-shrink:0", { color: m.color })}>
                      {m.face}
                    </pre>
                    <div style={sx("flex:1;min-width:0")}>
                      <div style={sx("display:flex;justify-content:space-between;align-items:flex-start;gap:8px")}>
                        <div>
                          <div style={sx("font-family:var(--disp);font-size:19px;font-weight:700;line-height:1.02")}>
                            {m.name}
                          </div>
                          <div style={sx("font-family:var(--mono);font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);margin-top:3px")}>
                            {m.title}
                          </div>
                        </div>
                        <span style={sx(m.statusStyle)}>{m.statusLabel}</span>
                      </div>
                      <div style={sx(m.activityStyle)}>
                        {m.activityText}
                        {m.live && <span style={sx("animation:caret 1s step-end infinite")}>▋</span>}
                      </div>
                    </div>
                  </div>
                  <div style={sx(m.msgStyle)}>
                    {m.msg}
                    {m.isStreaming && (
                      <span style={sx("animation:caret 1s step-end infinite;color:" + m.color)}>▋</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isTranscript && (
            <div style={sx("background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px 20px")}>
              {s.transcript.map((x, i) => {
                const isUser = x.speaker === "user";
                const m = isUser ? null : member(x.speaker);
                const who = isUser ? "You · analyst" : m ? m.name + " · " + m.title : x.speaker;
                const whoStyle =
                  "font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;" +
                  (isUser
                    ? "color:var(--tx);font-weight:700"
                    : "font-weight:600;color:" + (m ? m.color : "var(--faint)"));
                return (
                  <div key={i} style={sx("padding:14px 0;border-bottom:1px solid var(--line)")}>
                    <div style={sx(whoStyle)}>{who}</div>
                    <div style={sx("font-size:14.5px;line-height:1.6;margin-top:6px")}>{x.content}</div>
                  </div>
                );
              })}
              {s.transcript.length === 0 && (
                <div style={sx("padding:26px 0;font-size:13.5px;color:var(--faint);font-family:var(--mono)")}>
                  // no exchanges yet — the committee is about to open.
                </div>
              )}
            </div>
          )}

          {thinking && (
            <div style={sx("margin-top:16px;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 16px;animation:rise .3s")}>
              <div style={sx("font-family:var(--mono);font-size:12px;color:var(--muted);display:flex;align-items:center;gap:9px")}>
                <span>⣷ the committee is reasoning</span>
                <span style={sx("animation:dot 1.4s infinite")}>●</span>
                <span style={sx("animation:dot 1.4s infinite .2s")}>●</span>
                <span style={sx("animation:dot 1.4s infinite .4s")}>●</span>
              </div>
              <div style={sx("height:3px;margin-top:10px;border-radius:3px;background:linear-gradient(90deg,transparent,var(--acc),transparent);background-size:200% 100%;animation:shimmer 1.3s linear infinite")} />
            </div>
          )}

          <div style={sx("flex:1")} />

          <div style={sx("position:sticky;bottom:0;background:var(--bg);padding:14px 0 20px;margin-top:16px")}>
            <div style={sx("background:var(--panel);border:1px solid var(--line2);border-radius:13px;padding:13px 15px")}>
              <div style={sx("display:flex;justify-content:space-between;align-items:center;margin-bottom:6px")}>
                <span style={sx("font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)")}>
                  Your case · turn {s.turnCount + 1} · you are the analyst
                </span>
                <span style={sx("font-family:var(--mono);font-size:10px;color:var(--faint)")}>
                  {(s.input || "").length} chars
                </span>
              </div>
              <textarea
                value={s.input}
                onChange={(e) => s.setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="State the investment case. Cite the memo, flag assumptions, never bluff a number…"
                rows={3}
                style={sx("width:100%;border:none;background:transparent;resize:none;font-size:15px;line-height:1.55;color:var(--tx);outline:none;min-height:64px")}
              />
              <div style={sx("display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:9px;border-top:1px solid var(--line);gap:8px;flex-wrap:wrap")}>
                <div style={sx("display:flex;gap:7px;align-items:center;flex-wrap:wrap")}>
                  <span style={sx(helpStyle)} onClick={s.draftAnswer} title="Draft an evidence-grounded answer (no fabricated numbers)">
                    {s.helping === "draft" ? "✎ drafting…" : "✎ Draft for me"}
                  </span>
                  <span style={sx(helpStyle)} onClick={s.sharpenAnswer} title="Tighten what you wrote">
                    {s.helping === "sharpen" ? "↑ sharpening…" : "↑ Sharpen"}
                  </span>
                  <span style={sx(passStyle)} onClick={s.pass} title="Let the question stand — answering isn't mandatory">
                    ↷ Pass
                  </span>
                </div>
                <div style={sx("display:flex;gap:8px;align-items:center")}>
                  <span style={sx(micStyle)} onClick={s.toggleVoice}>
                    {s.listening ? "● listening…" : "🎙 speak"}
                  </span>
                  <button style={sx(sendStyle)} onClick={s.submit}>
                    Respond →
                  </button>
                </div>
              </div>
            </div>
            <div style={sx("display:flex;justify-content:space-between;margin-top:6px")}>
              <span style={sx("font-family:var(--mono);font-size:10px;color:var(--faint)")}>
                ⏎ send · ⇧⏎ newline
              </span>
              {s.voiceErr && (
                <span style={sx("font-family:var(--mono);font-size:10px;color:var(--sk)")}>
                  voice input unsupported here — type instead
                </span>
              )}
            </div>
          </div>
        </div>

        {/* memo on the right */}
        <div style={sx("flex:0 0 340px;min-width:270px;order:2")}>
          <div style={sx("background:var(--panel);border:1px solid var(--line);border-radius:13px;position:sticky;top:78px;max-height:calc(100vh - 96px);overflow:auto")}>
            <div style={sx("padding:14px 16px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--panel2);border-bottom:1px solid var(--line);z-index:1")}>
              <div>
                <div style={sx("font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--acc);font-weight:600")}>
                  Investment memo
                </div>
                <div style={sx("font-family:var(--disp);font-size:18px;font-weight:700;margin-top:2px")}>{deal.name}</div>
              </div>
              <div style={sx("font-family:var(--disp);font-size:30px;font-weight:700;color:" + deal.ssiColor)}>
                {deal.ssi}
              </div>
            </div>
            <div style={sx("padding:12px 16px;border-bottom:1px solid var(--line)")}>
              {db.railRows.map((r, i) => (
                <div key={i} style={sx("display:flex;justify-content:space-between;gap:6px;padding:4px 0;font-size:12.5px")}>
                  <span style={sx("color:var(--muted)")}>{r.k}</span>
                  <span style={sx("font-weight:600;text-align:right")}>{r.v}</span>
                </div>
              ))}
            </div>
            {sections.map((m) => {
              const isOpen = !!s.open[m.key];
              return (
                <div key={m.key} style={sx("border-bottom:1px solid var(--line)")}>
                  <div style={sx("display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 16px;cursor:pointer")} onClick={() => s.toggle(m.key)}>
                    <span style={sx("font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--tx);font-weight:600")}>
                      {m.title}
                    </span>
                    <span style={sx("font-family:var(--mono);font-size:14px;font-weight:700;color:" + m.accent)}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </div>
                  {isOpen && (
                    <div style={sx("padding:2px 16px 14px 15px;margin-left:12px;font-size:12.5px;line-height:1.58;color:var(--tx);white-space:pre-line;animation:rise .2s;border-left:2px solid " + m.accent)}>
                      {m.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
