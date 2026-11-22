import React from "react";
import { useCurrentFrame, Easing } from "remotion";
import { C, F, STROKE, SHADOW, Paper, TheDot, Tag, Icon, Arm, useCues, useSpring, ramp, lerp, popStyle, route } from "../kit";

const K = "long_scene6" as const;
const GX = [270, 730, 1190, 1650]; // gate centres
const BELT_Y = 900;
const PANEL_Y = 150, PANEL_H = 560, PANEL_W = 420;
const LABELS = ["1. READ-ONLY", "2. CUSTOM RULES", "3. SENTINEL AI", "4. HUMAN APPROVAL"];

const Panel: React.FC<{ i: number; on: number; active: boolean; children?: React.ReactNode }> = ({ i, on, active, children }) => (
  <div style={{ position: "absolute", left: GX[i] - PANEL_W / 2, top: PANEL_Y, width: PANEL_W, height: PANEL_H, background: on > 0.5 ? C.paper : C.sand, border: STROKE, borderRadius: 16,
    boxShadow: active ? `8px 8px 0 ${C.ink}, 0 0 0 8px ${C.ochre}` : SHADOW, opacity: lerp(0.55, 1, on), overflow: "hidden" }}>
    <div style={{ height: 56, background: on > 0.5 ? C.ink : "#B9B2A0", color: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 600, fontSize: 24, gap: 10 }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: on > 0.5 ? C.green : "#777", border: `2px solid ${C.paper}` }} />
      {LABELS[i]}
    </div>
    <div style={{ position: "relative", height: PANEL_H - 56 }}>{children}</div>
  </div>
);

const Gate: React.FC<{ x: number; s: number; lit: boolean }> = ({ x, s, lit }) => (
  <div style={{ position: "absolute", left: x - 110, top: BELT_Y - 150, width: 220, height: 170, ...popStyle(s, 80) }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 30, height: 170, background: C.sand, border: STROKE, borderRadius: 6 }} />
    <div style={{ position: "absolute", right: 0, top: 0, width: 30, height: 170, background: C.sand, border: STROKE, borderRadius: 6 }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 32, background: lit ? C.green : C.sand, border: STROKE, borderRadius: 6 }} />
  </div>
);

export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues(K);
  const tCage = cue("cage");
  const tFirst = cue("First");
  const tSend = cue("send");
  const tLocked = cue("locked");
  const tRead = cue("read");
  const tSecond = cue("Second");
  const tSep = cue("separate");
  const tInspect = cue("inspects");
  const tCatch = cue("catching");
  const tNinety = cue("ninety-plus");
  const tFinal = cue("finally");
  const tWallet = cue("Wallet");
  const tPause = cue("pauses");
  const tTap = cue("control");

  const stageOn = [tFirst, tSecond, tSep, tFinal].map((t) => ramp(f, t - 10, t + 10));
  const active = f >= tFinal ? 3 : f >= tSep ? 2 : f >= tSecond ? 1 : f >= tFirst ? 0 : -1;
  const beltMove = f < tPause ? f * 3 : tPause * 3;

  const dot = route(f, [[0, -80, BELT_Y - 48], [tCage + 20, 120, BELT_Y - 48], [tFirst, GX[0], BELT_Y - 48], [tSecond, GX[1], BELT_Y - 48], [tSep + 20, GX[2], BELT_Y - 48], [tFinal + 10, GX[3] - 40, BELT_Y - 48]], 26, 130);

  // stage 1
  const lockA = useSpring(tLocked - 6);
  const lockB = useSpring(tLocked + 6);
  // stage 3: laser scan + injection tag to chute
  const scan = ramp(f, tInspect, tCatch, 0, 1, Easing.inOut(Easing.sin));
  const caught = ramp(f, tCatch, tCatch + 36, 0, 1, Easing.in(Easing.quad));
  const blocked = useSpring(tNinety);
  // stage 4
  const wallet = useSpring(tWallet - 20);
  const spot = ramp(f, tPause - 10, tPause + 20);
  const tapP = ramp(f, tTap - 30, tTap, 0, 1, Easing.inOut(Easing.cubic));
  const approved = f > tTap + 4;

  return (
    <Paper>
      {/* title */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontSize: 54, fontWeight: 700, opacity: ramp(f, 10, 30) * (1 - ramp(f, tFirst - 20, tFirst)) }}>
        A cage around the Dot: <span style={{ background: C.ochre, padding: "0 12px", border: STROKE, borderRadius: 8 }}>4 gates</span>
      </div>

      {/* panels */}
      <Panel i={0} on={stageOn[0]} active={active === 0}>
        <div style={{ position: "absolute", left: 40, top: 50 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            {["SEND", "DELETE"].map((b, k) => (
              <div key={b} style={{ position: "relative", width: 200, padding: "16px 0", textAlign: "center", background: C.green, color: C.white, fontSize: 34, fontWeight: 700, border: STROKE, borderRadius: 10, opacity: f > tSend - 20 ? 1 : 0.4 }}>
                {b}
                <div style={{ position: "absolute", right: -46, top: -10, transform: `translateY(${(1 - (k ? lockB : lockA)) * -120}px)`, opacity: (k ? lockB : lockA) > 0.05 ? 1 : 0 }}><Icon kind="lock" size={80} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 120, top: 300 }}>
          {f > tRead - 30 && <div style={popStyle(ramp(f, tRead - 30, tRead - 10, 0, 1, Easing.out(Easing.back(2))), 30)}><Icon kind="doc" size={120} color={C.ochre} /></div>}
        </div>
        {f > tRead && <div style={{ position: "absolute", left: 30, bottom: 26 }}><Tag bg={C.ochre} color={C.ink} size={22}>READ + PRIVATE NOTES ONLY</Tag></div>}
      </Panel>

      <Panel i={1} on={stageOn[1]} active={active === 1}>
        <div style={{ position: "absolute", left: 40, top: 40, right: 40, background: C.white, border: STROKE, borderRadius: 8, padding: 20, fontSize: 23, fontWeight: 700, lineHeight: 1.7 }}>
          {["No emails after 10 PM", "Never pay without me", "Only these 4 apps"].map((r, k) => (
            <div key={k} style={{ opacity: ramp(f, tSecond + k * 14, tSecond + 10 + k * 14) }}>☑ {r}</div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 40, bottom: 30 }}><Tag bg={C.sand} color={C.ink} size={20}>YOUR HOUSE RULES</Tag></div>
      </Panel>

      <Panel i={2} on={stageOn[2]} active={active === 2}>
        {/* sentinel shield */}
        <svg width={170} height={190} style={{ position: "absolute", left: 20, top: 24, overflow: "visible" }}>
          <path d="M 85 6 L 160 36 L 160 100 Q 160 160 85 184 Q 10 160 10 100 L 10 36 Z" fill="#8E96A3" stroke={C.ink} strokeWidth={4} />
          <path d="M 85 26 L 140 48 L 140 100 Q 140 145 85 164 Q 30 145 30 100 L 30 48 Z" fill="#B5BCC7" stroke={C.ink} strokeWidth={3} />
          {[-1, 1].map((k) => <rect key={k} x={85 + k * 24 - 9} y={86} width={18} height={10} rx={3} fill={C.ink} />)}
        </svg>
        <div style={{ position: "absolute", left: 30, top: 222 }}><Tag bg={C.ink} color={C.paper} size={20}>SENTINEL / AUTO-REVIEW</Tag></div>
        {/* envelope being scanned */}
        <div style={{ position: "absolute", left: 210, top: 60, opacity: ramp(f, tSep, tSep + 20) }}>
          <svg width={180} height={130} style={{ overflow: "visible" }}>
            <rect x={4} y={4} width={170} height={118} rx={8} fill={C.paper} stroke={C.ink} strokeWidth={3} />
            <path d="M 6 8 L 89 70 L 172 8" fill="none" stroke={C.ink} strokeWidth={3} />
          </svg>
          {/* laser */}
          {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: -10, top: scan * 130, width: 200, height: 6, background: C.red, boxShadow: `0 0 0 2px ${C.ink}` }} />}
          {/* injection tag pulled out to the chute */}
          {f > tInspect + 30 && caught < 1 && (
            <div style={{ position: "absolute", left: lerp(10, 40, caught), top: lerp(84, 330, caught), transform: `rotate(${caught * 40}deg)`, opacity: 1 - caught * 0.5 }}>
              <Tag bg={C.red} color={C.white} size={20}>INJECTION</Tag>
            </div>
          )}
        </div>
        {/* trash chute */}
        <div style={{ position: "absolute", left: 210, top: 300, width: 180, height: 150 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 180, height: 26, background: C.ink, borderRadius: 6 }} />
          <div style={{ position: "absolute", left: 14, top: 22, width: 152, height: 120, background: C.sand, border: STROKE, borderTop: "none", borderRadius: "0 0 10px 10px", display: "grid", placeItems: "center", fontFamily: F.mono, fontWeight: 600, fontSize: 18 }}>TRASH</div>
        </div>
        {f > tNinety && <div style={{ position: "absolute", left: 30, top: 300, ...popStyle(blocked, 30) }}><Tag bg={C.green} color={C.white} size={22}>90%+<br />BLOCKED</Tag></div>}
      </Panel>

      <Panel i={3} on={stageOn[3]} active={active === 3}>
        {/* phone */}
        <div style={{ position: "absolute", left: 110, top: 30, width: 200, height: 380, background: C.ink, borderRadius: 30, border: STROKE, padding: 12, boxSizing: "border-box" }}>
          <div style={{ width: "100%", height: "100%", background: approved ? "#DDF1E5" : C.paper, borderRadius: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ margin: "18px 12px", ...popStyle(wallet, 30), opacity: f > tWallet - 20 ? 1 : 0, textAlign: "center" }}>
              <div style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600 }}>CHATGPT WALLET</div>
              <div style={{ fontSize: 40, fontWeight: 700 }}>$31.00</div>
            </div>
            {/* fingerprint approve */}
            <div style={{ position: "absolute", left: 38, bottom: 30, width: 100, height: 100, borderRadius: 50, border: STROKE, background: approved ? C.green : C.ochre, display: "grid", placeItems: "center", opacity: f > tWallet ? 1 : 0.2 }}>
              <svg width={60} height={60} viewBox="0 0 60 60">
                {[10, 18, 26].map((r) => <path key={r} d={`M ${30 - r} 34 Q ${30 - r} ${34 - r} 30 ${34 - r} Q ${30 + r} ${34 - r} ${30 + r} 34`} fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />)}
                <line x1={30} y1={30} x2={30} y2={52} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", fontFamily: F.mono, fontSize: 15, fontWeight: 700 }}>{approved ? "✓ APPROVED" : "TAP TO APPROVE"}</div>
          </div>
        </div>
        {f > tPause && !approved && <div style={{ position: "absolute", left: 16, bottom: 30 }}><Tag bg={C.ink} color={C.ochre} size={22}>❚❚ PAUSED</Tag></div>}
        {approved && <div style={{ position: "absolute", left: 16, bottom: 30 }}><Tag bg={C.green} color={C.white} size={22}>YOU ✓</Tag></div>}
      </Panel>

      {/* conveyor belt */}
      <div style={{ position: "absolute", left: 40, right: 40, top: BELT_Y, height: 60, background: C.ink, borderRadius: 30, overflow: "hidden", opacity: ramp(f, tCage - 20, tCage) }}>
        <div style={{ position: "absolute", inset: "10px 30px", background: `repeating-linear-gradient(90deg, #444 0 30px, #2a2a2a 30px 60px)`, backgroundPositionX: beltMove, borderRadius: 20 }} />
      </div>
      {GX.map((x, i) => <Gate key={i} x={x} s={ramp(f, tCage + i * 8, tCage + i * 8 + 20, 0, 1, Easing.out(Easing.back(1.6)))} lit={stageOn[i] > 0.5} />)}

      <TheDot x={dot.x} y={dot.y} r={44} squash={dot.squash} accessory={f > tFirst && f < tSecond ? "glass" : null} look={f >= tPause ? 0 : 1} mood={f >= tPause && !approved ? "focus" : "happy"} blink={f < tPause} />

      {/* spotlight: everything else dims while waiting for the human */}
      {spot > 0 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: spot * (approved ? 0.4 : 1),
          background: `radial-gradient(ellipse 300px 420px at ${GX[3]}px 400px, transparent 70%, rgba(20,20,20,0.55) 100%)` }} />
      )}

      {/* human arm reaching up from the bottom to tap approve */}
      {tapP > 0 && (() => {
        const bx = 1653, by = 521; // fingerprint button centre
        const wx = lerp(bx + 200, bx + 14, tapP), wy = lerp(1200, by + 40, tapP);
        return <Arm sx={1960} sy={1260} wx={wx} wy={wy} side={1} len={400} sleeve={C.ochre} finger />;
      })()}
    </Paper>
  );
};
