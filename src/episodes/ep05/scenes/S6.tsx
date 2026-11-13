import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { MoodKey } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { Figure2, INK, OUT, Pt, SHADOW, Stage } from "../../../shared/Rig";
import { AllowCard } from "../../ep04/Props";
import { Coin } from "../../ep04/Props";
import { DotActor, Place, Scene5, fly, kk, lerp, lerpPt, route } from "../Common";
import { AllowAsk, AsideFrame, PaperPlane, Phone, Slip } from "../Props";

// Times (s) from the S6 word timings in captions.json.
const T = {
  so: 0, one: 2.2, allow: 3.0, good: 4.7, risky: 7.3, paying: 8.4, sending: 9.3, deleting: 10.5, bank: 11.7,
  payment: 13.8, moment: 15.2, read: 16.5, todo: 17.5, two: 18.4, less: 19.4, babysitter: 20.9, pin: 21.9,
  agent: 22.7, reach: 23.7, using: 25.6, three: 26.6, memory: 27.9, keeps: 29.7, look: 31.2, wrote: 32.1,
  contact: 33.2, saved: 34.6, del: 35.6,
};

// Three tips, each with a big number. 1) The "Allow?" card at the agent's hand: a coin, a paper plane and a bin roll
// up and each stops at it; aside: the bank's confirm text; the card comes to the viewer — "Send $500 to…?" — Dot taps No.
// 2) The agent's tools hang on a rail; Dot unclips the bank card and pockets it; aside: a babysitter leaves, the bank
// card stays in the wallet; a hidden slip asks for "the bank", finds an empty slot and fizzles. 3) The notebook opens
// toward the viewer; one line is in another colour (the gold-star shop from S5); aside: a contacts list with one
// strange name that Dot swipes away; a small bin taps the planted line away.
const FLOOR = 880;
const P2 = T.two - 0.2, P3 = T.three - 0.2;
const FIG = { left: 260, top: 230, size: 620 };
const GATE: Pt = { x: 820, y: 560 };
const RAIL = { x: 1060, y: 300 };
const TOOLS = ["envelope", "calendar", "globe", "bank"] as const;
const toolAt = (i: number): Pt => ({ x: RAIL.x + 60 + i * 150, y: RAIL.y + 90 });

const BankCard: React.FC<{ w?: number }> = ({ w = 120 }) => (
  <svg width={w} height={w * 0.64} viewBox="0 0 150 96" aria-hidden style={{ overflow: "visible" }}>
    <rect x={3} y={3} width={144} height={90} rx={12} fill="#2B3142" stroke={INK} strokeWidth={6} />
    <rect x={20} y={30} width={30} height={22} rx={4} fill={colors.yellow} stroke={INK} strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 30} y={66} width={22} height={6} rx={3} fill="#DCE6FA" />)}
  </svg>
);
const ToolTag: React.FC<{ kind: (typeof TOOLS)[number] }> = ({ kind }) => (
  <div style={{ width: 120, height: 120, borderRadius: 20, backgroundColor: "#F4F1EA", border: `${OUT}px solid ${INK}`, boxShadow: `6px 8px 0 ${SHADOW}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    {kind === "bank" ? <BankCard w={90} /> : (
      <svg width={70} height={70} viewBox="0 0 70 70" aria-hidden>
        {kind === "envelope" ? <><rect x={4} y={14} width={62} height={42} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><path d="M 4 18 L 35 40 L 66 18" fill="none" stroke={INK} strokeWidth={5} /></> : null}
        {kind === "calendar" ? <><rect x={6} y={10} width={58} height={52} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><rect x={6} y={10} width={58} height={14} fill={colors.periwinkle} stroke={INK} strokeWidth={5} /></> : null}
        {kind === "globe" ? <><circle cx={35} cy={35} r={28} fill={colors.periwinkle} stroke={INK} strokeWidth={5} /><path d="M 7 35 H 63 M 35 7 C 20 20 20 50 35 63 C 50 50 50 20 35 7" fill="none" stroke={INK} strokeWidth={4} /></> : null}
      </svg>
    )}
  </div>
);
const Bin: React.FC<{ size?: number; lid?: number }> = ({ size = 110, lid = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ overflow: "visible", filter: `drop-shadow(5px 6px 0 ${SHADOW})` }}>
    <path d="M 20 30 L 80 30 L 72 94 L 28 94 Z" fill="#8A90A0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <g transform={`rotate(${-30 * lid} 16 26)`}><rect x={12} y={18} width={76} height={12} rx={4} fill="#5B6378" stroke={INK} strokeWidth={5} /></g>
  </svg>
);
const Shop: React.FC<{ size?: number }> = ({ size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ overflow: "visible" }} aria-hidden>
    <path d="M 4 16 L 8 6 H 32 L 36 16 Z" fill={colors.coral} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <rect x={6} y={16} width={28} height={20} fill="#F4F1EA" stroke={INK} strokeWidth={3} />
    <path d="M 34 -4 L 37 4 L 45 4 L 39 9 L 41 17 L 34 12 L 27 17 L 29 9 L 23 4 L 31 4 Z" fill={colors.yellow} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);
const Number: React.FC<{ n: string; o: number }> = ({ n, o }) => (
  <div style={{ position: "absolute", left: 70, top: 50, width: 110, height: 110, borderRadius: 55, backgroundColor: colors.yellow, border: `${OUT}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70, fontWeight: 800, color: INK, opacity: o, scale: `${o}` }}>{n}</div>
);

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" }, { at: sec(T.read), mood: "intrigued" }, { at: sec(T.todo + 0.2), mood: "smug" },
  { at: sec(T.two), mood: "curious" }, { at: sec(T.less + 0.5), mood: "smug" }, { at: sec(T.three), mood: "curious" },
  { at: sec(T.wrote), mood: "intrigued" }, { at: sec(T.del), mood: "happy" },
];
const DOT = (t: number) => route([
  [0, 1500, 800, 0], [T.read - 0.4, 1240, 700, 80], [P2 + 0.4, 1600, 560, 120], [T.less + 0.8, 1720, 820, 100],
  [P3 + 0.4, 1560, 800, 100], [T.contact + 0.2, 1660, 780, 80], [T.del - 0.5, 1480, 800, 80],
], t);

const S6Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const d = DOT(t);
  const p1 = 1 - ramp(frame, P2 - 0.3, 0.3);
  const p2 = during(frame, P2, P3, 0.3);
  const p3 = ramp(frame, P3, 0.3);

  // 1
  const rollers: [number, React.ReactNode][] = [[T.paying, <Coin size={90} />], [T.sending, <PaperPlane w={130} />], [T.deleting, <Bin size={100} />]];
  const zoom = kk(t, T.moment - 0.3, T.moment + 0.4);
  const no = during(frame, T.todo - 0.1, T.todo + 0.3, 0.05);
  const bankText = during(frame, T.bank - 0.2, T.moment - 0.3, 0.25);
  // 2
  const unclip = kk(t, T.less, T.less + 0.7);
  const slipP = fly({ x: 400, y: 200 }, toolAt(3), t, T.agent, T.reach + 0.4, 80);
  const fizz = kk(t, T.reach + 0.4, T.using);
  const sitter = during(frame, T.babysitter - 0.6, T.agent - 0.2, 0.25);
  // 3
  const bookOpen = pop(frame, P3 + 0.2);
  const lineHi = ramp(frame, T.look, 0.3);
  const contacts = during(frame, T.contact - 0.5, T.del - 0.2, 0.25);
  const swipe = kk(t, T.saved - 0.2, T.saved + 0.4);
  const binTap = kk(t, T.del, T.del + 0.5);

  return (
    <AbsoluteFill>
      <Stage spotX={960} floorY={FLOOR} />

      {/* ── 1: Allow? ── */}
      <AbsoluteFill style={{ opacity: p1 }}>
        <Number n="1" o={Math.min(1, pop(frame, T.one))} />
        <div style={{ position: "absolute", left: FIG.left, top: FIG.top }}>
          <Figure2 size={FIG.size} eyes={1} notebook={1} look={{ x: 0.9, y: 0.4 }} right={{ target: { x: 640, y: 470 }, pose: "open" }} />
        </div>
        {/* the card stands on a post across the agent's way: everything risky stops here */}
        <div style={{ position: "absolute", left: GATE.x - 10, top: GATE.y, width: 20, height: FLOOR - GATE.y, backgroundColor: colors.yellow, border: `5px solid ${INK}`, opacity: Math.min(1, pop(frame, T.allow - 0.1)) }} />
        <Place x={GATE.x} y={GATE.y} s={Math.min(1, pop(frame, T.allow - 0.1)) * (1 - zoom)}><AllowCard w={300} /></Place>
        {rollers.map(([at, node], i) => {
          const stop = { x: GATE.x + 90 + i * 150, y: FLOOR - 55 };
          const p = fly({ x: 2050, y: FLOOR - 60 }, stop, t, at - 0.6, at, 0);
          const bump = during(frame, at, at + 0.2, 0.05) * 10;
          return t > at - 0.6 && zoom < 1 ? <Place key={at} x={p.x + bump} y={p.y} rot={i === 0 ? (t - at) * 300 * (t < at ? 1 : 0) : 0}>{node}</Place> : null;
        })}
        {bankText > 0 ? <Place x={1380} y={330} s={0.9} o={bankText}><AsideFrame w={420} h={500} label="everyday"><div style={{ scale: "0.62" }}><Phone w={380} from="Your bank" text="Did you just pay $500? Reply YES or NO" /></div></AsideFrame></Place> : null}
        {zoom > 0 ? <Place x={lerp(GATE.x, 960, zoom)} y={lerp(GATE.y, 420, zoom)} s={lerp(0.55, 1.15, zoom)}><AllowAsk w={620} no={no} /></Place> : null}
      </AbsoluteFill>

      {/* ── 2: give it less ── */}
      {p2 > 0 ? (
        <AbsoluteFill style={{ opacity: p2 }}>
          <Number n="2" o={Math.min(1, pop(frame, T.two))} />
          <div style={{ position: "absolute", left: FIG.left, top: FIG.top }}><Figure2 size={FIG.size} eyes={1} notebook={1} look={{ x: 0.9, y: -0.3 }} /></div>
          <div style={{ position: "absolute", left: RAIL.x, top: RAIL.y, width: 640, height: 16, borderRadius: 8, backgroundColor: "#5B6378", border: `5px solid ${INK}` }} />
          {TOOLS.map((k, i) => {
            const home = toolAt(i);
            if (k === "bank") {
              const p = lerpPt(home, { x: d.p.x, y: d.p.y }, unclip);
              return (
                <React.Fragment key={k}>
                  <div style={{ position: "absolute", left: home.x - 62, top: home.y - 62, width: 124, height: 124, borderRadius: 20, border: `5px dashed #B9BDC8`, opacity: unclip }} />
                  {unclip < 1 ? <Place x={p.x} y={p.y} s={1 - 0.6 * unclip}><ToolTag kind={k} /></Place> : null}
                </React.Fragment>
              );
            }
            return <Place key={k} x={home.x} y={home.y}><ToolTag kind={k} /></Place>;
          })}
          {t > T.agent && fizz < 1 ? <Place x={slipP.x} y={slipP.y} s={0.6 * (1 - fizz)} o={1 - fizz} rot={fizz * 40}><Slip w={260} text="use the bank" glow={1} /></Place> : null}
          {fizz > 0 && fizz < 1 ? <div style={{ position: "absolute", left: toolAt(3).x - 40, top: toolAt(3).y - 80 - fizz * 60, fontSize: 60, opacity: 1 - fizz, color: "#B9BDC8" }}>💨</div> : null}
          {sitter > 0 ? (
            <Place x={1260} y={680} s={0.85} o={sitter}>
              <AsideFrame w={520} h={360} label="everyday">
                <div style={{ position: "relative", width: 480, height: 320 }}>
                  <div style={{ position: "absolute", left: 40, top: 40, width: 120, height: 240, backgroundColor: "#8C6A42", border: `5px solid ${INK}` }} />
                  <svg width={120} height={220} viewBox="0 0 120 220" style={{ position: "absolute", left: 180, top: 70 }} aria-hidden>
                    <circle cx={60} cy={34} r={28} fill="#D9B48F" stroke={INK} strokeWidth={5} />
                    <rect x={20} y={66} width={80} height={110} rx={24} fill={colors.mint} stroke={INK} strokeWidth={5} />
                    <path d={`M 96 80 L ${118 + Math.sin(t * 10) * 6} 30`} stroke={colors.mint} strokeWidth={14} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", left: 330, top: 150, width: 120, height: 90, backgroundColor: "#5B6378", border: `5px solid ${INK}`, borderRadius: 10 }}>
                    <div style={{ position: "absolute", left: 14, top: -26 }}><BankCard w={90} /></div>
                  </div>
                </div>
              </AsideFrame>
            </Place>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ── 3: check its memory ── */}
      {p3 > 0 ? (
        <AbsoluteFill style={{ opacity: p3 }}>
          <Number n="3" o={Math.min(1, pop(frame, T.three))} />
          <Place x={700} y={500} s={Math.min(1, bookOpen) * 1.1}>
            <div style={{ position: "relative", width: 700, height: 460, backgroundColor: "#F4F1EA", border: `${OUT}px solid ${INK}`, borderRadius: 18, boxShadow: `10px 12px 0 ${SHADOW}` }}>
              <div style={{ position: "absolute", left: 346, top: 0, bottom: 0, width: 8, backgroundColor: colors.periwinkle }} />
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: 40, top: 60 + i * 70, width: 250, height: 14, borderRadius: 7, backgroundColor: "#9C9384" }} />)}
              <div style={{ position: "absolute", left: 400, top: 60, width: 240, height: 14, borderRadius: 7, backgroundColor: "#9C9384" }} />
              <div style={{ position: "absolute", left: 390, top: 110, padding: "6px 10px", display: "flex", alignItems: "center", gap: 14, borderRadius: 10, boxShadow: lineHi > 0 ? `0 0 0 ${5 * lineHi}px ${colors.yellow}` : undefined, opacity: 1 - binTap, translate: `${binTap * 80}px ${binTap * 120}px`, scale: `${1 - 0.6 * binTap}` }}>
                <Shop size={56} />
                <div style={{ width: 150, height: 14, borderRadius: 7, backgroundColor: colors.coral }} />
              </div>
              <div style={{ position: "absolute", left: 560, top: 300 }}><Bin size={110} lid={during(frame, T.del - 0.2, T.del + 0.8, 0.15)} /></div>
            </div>
          </Place>
          {contacts > 0 ? (
            <Place x={1420} y={420} s={0.9} o={contacts}>
              <AsideFrame w={440} h={520} label="everyday">
                <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 14 }}>
                  {["Mom", "Sam", "Best Deals ⭐", "Alex"].map((n, i) => (
                    <div key={n} style={{ padding: "14px 20px", borderRadius: 14, backgroundColor: i === 2 ? "#FFF3C4" : "#F4F1EA", border: `4px solid ${INK}`, fontSize: 32, fontWeight: 700, color: INK, translate: i === 2 ? `${swipe * 500}px 0` : undefined, opacity: i === 2 ? 1 - swipe : 1 }}>{n}</div>
                  ))}
                </div>
              </AsideFrame>
            </Place>
          ) : null}
        </AbsoluteFill>
      ) : null}

      <DotActor x={d.p.x} y={d.p.y} r={80} track={TRACK} squash={d.squash} seed="e5s6"
        arms={during(frame, T.read, T.two, 0.2) + during(frame, P2 + 0.3, T.less + 1.0, 0.2)}
        L={t < T.two ? { tip: { x: 1060, y: 545 + 6 * no }, press: no } : { wrist: lerpPt(toolAt(3), { x: d.p.x - 90, y: d.p.y + 40 }, unclip), pose: "grip" }}
        look={t < T.read ? { x: -1, y: -0.2 } : t < T.two ? { x: -0.8, y: -0.6 } : t < P3 ? { x: -0.4, y: -0.8 } : { x: -1, y: -0.3 }} />
    </AbsoluteFill>
  );
};

// Scene S6 — what keeps you safe: three tips. Line wipe in. Edit only this file.
export const S6: React.FC = () => (
  <Scene5 id="S6" enter="wipe">
    <S6Content />
  </Scene5>
);
