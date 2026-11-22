import React from "react";
import { useCurrentFrame, Easing } from "remotion";
import { C, F, STROKE, SHADOW, Paper, TheDot, CloudPC, Icon, Tag, Headline, useCues, useSpring, ramp, lerp, popStyle, route } from "../kit";

const K = "long_scene2" as const;

const Keyring: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const badges = ["MAIL", "TEAM CHAT", "CALENDAR", "FILES", "4,000+ APPS"];
  const swing = Math.sin((f - at) / 7) * 14 * Math.exp(-Math.max(0, f - at) / 60) + Math.sin(f / 30) * 3;
  return (
    <div style={{ position: "absolute", left: 760, top: 0, transformOrigin: "60px 0px", transform: `rotate(${swing}deg)` }}>
      <svg width={120} height={110} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={60} y1={0} x2={60} y2={30} stroke={C.paper} strokeWidth={4} />
        <circle cx={60} cy={70} r={40} fill="none" stroke="#C9A445" strokeWidth={10} />
        <circle cx={60} cy={70} r={40} fill="none" stroke={C.ink} strokeWidth={2} />
      </svg>
      {badges.map((b, i) => {
        const s = ramp(f, at + i * 8, at + i * 8 + 14, 0, 1, Easing.out(Easing.back(2)));
        const a = (-60 + i * 30) * (Math.PI / 180);
        return (
          <div key={b} style={{ position: "absolute", left: 60 + Math.sin(a) * 60, top: 110 + Math.cos(a) * 40 + i * 0, transform: `translate(-50%,0) rotate(${-a * 40}deg) scale(${s})`, transformOrigin: "50% 0" }}>
            <div style={{ width: 3, height: 26 + i * 6, background: C.paper, margin: "0 auto" }} />
            <Tag bg={i === 4 ? C.ochre : C.sand} color={C.ink} size={18}>{b}</Tag>
          </div>
        );
      })}
    </div>
  );
};

const Backpack: React.FC<{ f: number; tLaptop: number; tZip: number }> = ({ f, tLaptop, tZip }) => {
  const lap = ramp(f, tLaptop - 20, tLaptop + 20, 0, 1, Easing.inOut(Easing.cubic));
  const zip = ramp(f, tZip - 10, tZip + 25);
  return (
    <div style={{ position: "absolute", left: 1230, top: 230 }}>
      {/* laptop: closed lid sliding down into the bag opening */}
      <div style={{ position: "absolute", left: 120, top: lerp(-60, 150, lap), width: 280, zIndex: lap > 0.6 ? 0 : 2, transform: `rotate(${lerp(-8, 0, lap)}deg)` }}>
        <div style={{ height: 20, background: "#BFC3CB", border: STROKE, borderRadius: "10px 10px 2px 2px" }} />
        <div style={{ height: 16, marginTop: -3, background: "#9EA3AD", border: STROKE, borderRadius: "2px 2px 8px 8px", position: "relative" }}>
          <div style={{ position: "absolute", right: 14, top: 2, width: 8, height: 8, borderRadius: 4, background: "#555" }} />
        </div>
      </div>
      <svg width={520} height={640} style={{ position: "relative", zIndex: 1, overflow: "visible" }}>
        <path d="M 160 90 Q 160 20 260 20 Q 360 20 360 90" fill="none" stroke={C.ink} strokeWidth={16} />
        <path d="M 160 90 Q 160 20 260 20 Q 360 20 360 90" fill="none" stroke={C.green} strokeWidth={9} />
        <path d="M 70 170 Q 70 90 260 90 Q 450 90 450 170 L 470 560 Q 470 610 420 610 L 100 610 Q 50 610 50 560 Z" fill={C.green} stroke={C.ink} strokeWidth={3} />
        <rect x={130} y={380} width={260} height={170} rx={26} fill="#3FB27A" stroke={C.ink} strokeWidth={3} />
        {/* zipper track across the opening */}
        <path d="M 80 170 Q 260 140 440 170" fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="6 6" />
        {/* zip closure (dark seam follows the pull) */}
        <path d="M 80 170 Q 260 140 440 170" fill="none" stroke={C.ink} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - zip} />
        <g transform={`translate(${lerp(80, 440, zip)}, ${170 - Math.sin(Math.PI * zip) * 26})`}>
          <rect x={-10} y={-4} width={20} height={36} rx={5} fill={C.ochre} stroke={C.ink} strokeWidth={3} />
        </g>
      </svg>
    </div>
  );
};

export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues(K);
  const tStrike = cue("always-on");
  const tPC = cue("Instead");
  const tComputer = cue("computer");
  const tBrowser = cue("browser");
  const tKeys = cue("You");
  const tJob1 = cue("watch");
  const tJob2 = cue("track");
  const tSplit = cue("and", 2) - 6;
  const tLaptop = cue("laptop");
  const tOff = cue("powered");

  const head = useSpring(6);
  const strike = ramp(f, tStrike - 14, tStrike + 6);
  const agent = useSpring(tStrike + 8);
  const pcIn = useSpring(tPC);
  const split = ramp(f, tSplit, tSplit + 40);
  const pcScale = lerp(lerp(0.6, 1, pcIn), 0.66, split);
  const pcX = lerp(410, 40, split);

  const brIn = ramp(f, tBrowser - 30, tBrowser);
  const noteIn = ramp(f, tComputer - 20, tComputer + 10);
  const typing = "unpaid invoices → flag\nflight prices → 7 AM".slice(0, Math.max(0, Math.floor((f - tJob1) / 2.2)));

  const flag = useSpring(tOff + 10);
  const dotR = route(f, [[0, 960, 600], [tPC - 10, 1640, 900], [tSplit + 20, 940, 600]], 24, 140);
  const dotIn = useSpring(8);

  return (
    <Paper>
      {/* headline */}
      <div style={{ position: "absolute", left: 80, top: 56, ...popStyle(head, 30), transformOrigin: "0 50%" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Headline x={0} y={0} size={70} style={{ position: "relative", opacity: lerp(1, 0.4, strike) }}>CHATBOT</Headline>
          <svg width={360} height={80} style={{ position: "absolute", left: -10, top: 0 }}>
            <path d="M 4 44 L 340 36" stroke={C.red} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
          </svg>
        </div>
        <div style={{ display: "inline-block", marginLeft: 30, verticalAlign: "top", ...popStyle(agent, 20) }}>
          <Headline x={0} y={0} size={70} style={{ position: "relative", background: C.ochre, border: STROKE, padding: "0 18px", borderRadius: 10, boxShadow: SHADOW }}>ALWAYS-ON AGENT</Headline>
        </div>
      </div>

      {/* cloud pc */}
      {f >= tPC && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: Math.min(1, pcIn * 2) }}>
          <div style={{ position: "absolute", left: pcX, top: 230, width: 1100, height: 680, transform: `scale(${pcScale})`, transformOrigin: "0 30%" }}>
            <CloudPC x={0} y={0}>
              {/* browser */}
              <div style={{ position: "absolute", left: 30, top: 30, width: 620, height: 420, background: C.white, border: STROKE, borderRadius: 10, opacity: brIn, transform: `translateY(${(1 - brIn) * 40}px)` }}>
                <div style={{ height: 44, background: C.sand, borderBottom: STROKE, display: "flex", alignItems: "flex-end", padding: "0 10px", gap: 6 }}>
                  <div style={{ background: C.white, border: STROKE, borderBottom: "none", borderRadius: "8px 8px 0 0", padding: "4px 14px", fontFamily: F.mono, fontSize: 16, fontWeight: 600 }}>inbox</div>
                  <div style={{ padding: "4px 14px", fontFamily: F.mono, fontSize: 16, opacity: 0.6 }}>flights</div>
                </div>
                <div style={{ margin: 12, height: 34, border: STROKE, borderRadius: 17, fontFamily: F.mono, fontSize: 16, display: "flex", alignItems: "center", paddingLeft: 14 }}>mail.example/inbox</div>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ margin: "10px 14px", height: 50, border: STROKE, borderRadius: 8, background: i === 1 && f > tJob1 + 30 ? C.ochre : C.paper, display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 9, background: C.ink }} />
                    <div style={{ height: 10, width: 200 + i * 40, background: C.ink, borderRadius: 5, opacity: 0.6 }} />
                  </div>
                ))}
              </div>
              {/* notepad */}
              <div style={{ position: "absolute", left: 690, top: 300, width: 330, height: 270, background: C.ochre, border: STROKE, borderRadius: 8, padding: 18, boxSizing: "border-box", opacity: noteIn, transform: `rotate(3deg) translateY(${(1 - noteIn) * 40}px)` }}>
                <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 18, marginBottom: 10 }}>STANDING JOBS</div>
                <div style={{ fontFamily: F.mono, fontSize: 20, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{typing}</div>
              </div>
              {f > tKeys - 20 && <Keyring f={f} at={tKeys - 20} />}
              {/* night clock appears in split */}
              {split > 0 && (
                <div style={{ position: "absolute", left: 30, top: 470, opacity: split }}>
                  <Tag bg={C.slate} color={C.ochre} size={34} style={{ borderColor: C.ochre }}>3:14 AM {f % 60 < 30 ? "●" : "○"}</Tag>
                </div>
              )}
              {/* unpaid invoice flag */}
              {f > tOff + 10 && (
                <div style={{ position: "absolute", left: 260, top: 160, ...popStyle(flag, 30) }}>
                  <div style={{ background: C.white, border: `4px solid ${C.red}`, borderRadius: 10, padding: "14px 22px", boxShadow: `6px 6px 0 ${C.ink}` }}>
                    <Tag bg={C.red} color={C.white} size={30}>UNPAID INVOICE</Tag>
                    <div style={{ fontFamily: F.mono, fontSize: 24, marginTop: 8, fontWeight: 600 }}>#2231 · due Fri · flagged</div>
                  </div>
                </div>
              )}
            </CloudPC>
          </div>
        </div>
      )}

      {/* standing-job cards fly into the PC */}
      {[{ t: tJob1, txt: "“watch my inbox for unpaid invoices”" }, { t: tJob2, txt: "“track flight prices every morning”" }].map((j, i) => {
        if (f < j.t - 10 || split > 0.2) return null;
        const t = ramp(f, j.t - 10, j.t + 14, 0, 1, Easing.out(Easing.back(1.4)));
        const into = ramp(f, j.t + 60, j.t + 90, 0, 1, Easing.in(Easing.cubic));
        return (
          <div key={i} style={{ position: "absolute", left: lerp(-600, 90, t) + into * 900, top: 900 - i * 110 - into * 320, transform: `scale(${1 - into * 0.6}) rotate(${-2 + i * 3}deg)`, opacity: 1 - into }}>
            <div style={{ background: C.paper, border: STROKE, boxShadow: SHADOW, borderRadius: 12, padding: "14px 26px", fontSize: 34, fontWeight: 700 }}>{j.txt}</div>
          </div>
        );
      })}

      {/* split divider + right side: the user's laptop goes in the backpack */}
      {split > 0 && (
        <>
          <div style={{ position: "absolute", left: 1150, top: lerp(1080, 200, split), width: 4, height: 800, background: C.ink, borderRadius: 2 }} />
          <div style={{ opacity: split }}>
            <Backpack f={f} tLaptop={tLaptop} tZip={tLaptop + 40} />
            {f > tOff && (
              <div style={{ position: "absolute", left: 1310, top: 870 }}>
                <Tag bg={C.ink} color={C.paper} size={34}>YOUR LAPTOP: POWERED OFF</Tag>
              </div>
            )}
            <div style={{ position: "absolute", left: 60, top: 870 }}>
              <Tag bg={C.green} color={C.white} size={30}>DOT: STILL RUNNING 24/7</Tag>
            </div>
          </div>
        </>
      )}

      {/* the dot watches over the PC */}
      <div style={popStyle(dotIn, 40)}>
        <TheDot x={dotR.x} y={dotR.y} r={lerp(64, 46, ramp(f, tPC - 10, tPC + 14))} squash={dotR.squash} look={f > tSplit ? -1 : f > tPC ? -1 : 0} accessory={f > tPC ? "clipboard" : null} />
      </div>
    </Paper>
  );
};
