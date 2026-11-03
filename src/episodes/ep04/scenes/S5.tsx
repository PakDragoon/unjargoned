import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { AllowCard, Coin, Figure, HandShape, HelperBox, Receipt, ToolIcon } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S5");

// Times (s) from the S5 word timings in captions.json. Re-voice S5 → re-check these.
const T = {
  youAsk: 4.62, clock: 5.44, so: 5.9, happens: 7.28, email: 8.48, arriving: 8.82,
  works: 10.54, risky: 12.34, paying: 13.34, sending: 14.42, deleting: 15.9, stops: 17.94, first: 19.48,
  remember: 20.66, onlyAsk: 22.06, helper: 23.28, hold: 23.76, yes: 25.36,
  broke: 27.5, eggs: 28.04, openai: 29.06, buying: 33.46, thatTime: 34.46, didnt: 35.98, newer: 37.52, world: 40.66,
};

// Phases: three wake-ups round the figure → the loop runs; risky things stop at "Allow?" cards → pull back: the gate
// sits on the helper box, the brain's "Buy, please" waits → flashback: the $31 receipt with the card missing →
// the card snaps back in, and the strip's "Allow?" card fills (open loop closed).
const P = { wake: [0, 9.9], risky: [9.9, 20.4], gate: [20.4, 26.25], flash: [26.25, 37.2], back: [37.2, 99] } as const;

const FIG_C = { left: 760, top: 300, size: 600 }; // centred (wake-ups)
const FIG_L = { left: 150, top: 330, size: 600 }; // left (other phases)
const LOOP = { x: 860, y: 600, r: 160 };
const LANES = [330, 560, 790]; // coin, paper plane, bin
const CARD_X = 1120;
const HB = { left: 920, top: 640, w: 300 };

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.youAsk), mood: "happy" },
  { at: sec(T.works), mood: "neutral" },
  { at: sec(T.paying), mood: "curious" },
  { at: sec(T.first - 0.6), mood: "smug" },
  { at: sec(T.remember), mood: "curious" },
  { at: sec(P.flash[0] + 0.2), mood: "worried" },
  { at: sec(T.newer + 0.1), mood: "relieved" },
];

// Route: hops to each wake-up object → watches the lanes → presses "Yes" on the coin card → by the helper →
// worried by the flashback → relieved beside the card.
const ROUTE = hops([
  { at: 0, x: 1650, y: 930 },
  { at: sec(T.youAsk - 0.1), x: 470, y: 620 },
  { at: sec(T.clock + 0.1), x: 1580, y: 560 },
  { at: sec(T.email - 0.1), x: 1650, y: 920 },
  { at: sec(T.paying - 0.6), x: 1700, y: 960 },
  { at: sec(T.first - 0.6), x: 1300, y: 470 }, // on the coin card's Yes
  { at: sec(T.remember + 0.3), x: 1420, y: 900 },
  { at: sec(P.flash[0] + 0.4), x: 1600, y: 900 },
  { at: sec(T.newer + 0.4), x: 1450, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.4 },
  { at: sec(T.youAsk - 0.1), x: 0.5, y: -0.6 },
  { at: sec(T.clock + 0.1), x: -0.3, y: -0.8 },
  { at: sec(T.email - 0.1), x: -0.8, y: -0.5 },
  { at: sec(T.paying - 0.6), x: -0.8, y: -0.8 },
  { at: sec(T.first - 0.6), x: -0.6, y: -0.3 },
  { at: sec(T.remember + 0.3), x: -0.8, y: -0.6 },
  { at: sec(P.flash[0] + 0.4), x: -0.9, y: -0.6 },
  { at: sec(T.newer + 0.4), x: -0.7, y: -0.7 },
]);

const AlarmClock: React.FC<{ size?: number; ring?: number }> = ({ size = 170, ring = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ transform: `rotate(${Math.sin(ring * 40) * 8 * Math.min(1, ring)}deg)` }}>
    <circle cx={26} cy={18} r={11} fill={colors.coral} /><circle cx={74} cy={18} r={11} fill={colors.coral} />
    <circle cx={50} cy={55} r={38} fill={colors.white} stroke={colors.coral} strokeWidth={7} />
    <line x1={50} y1={55} x2={50} y2={28} stroke={colors.ink} strokeWidth={6} strokeLinecap="round" />
    <line x1={50} y1={55} x2={36} y2={70} stroke={colors.ink} strokeWidth={7} strokeLinecap="round" />
    <circle cx={50} cy={55} r={4} fill={colors.ink} />
  </svg>
);
const MiniCard: React.FC<{ kind: "sun" | "note" }> = ({ kind }) => (
  <div style={{ width: 120, height: 92, borderRadius: 16, backgroundColor: kind === "sun" ? "#DDE6FF" : "#F3EBDD", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(0,0,0,0.35)" }}>
    {kind === "sun" ? (
      <svg width={64} height={64} viewBox="0 0 64 64" aria-hidden><circle cx={32} cy={32} r={14} fill={colors.yellow} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={32 + 20 * Math.cos(i * 0.785)} y1={32 + 20 * Math.sin(i * 0.785)} x2={32 + 28 * Math.cos(i * 0.785)} y2={32 + 28 * Math.sin(i * 0.785)} stroke={colors.yellow} strokeWidth={5} strokeLinecap="round" />)}</svg>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 9, width: 76 }}>{[100, 80, 90].map((w) => <div key={w} style={{ height: 8, width: `${w}%`, borderRadius: 4, backgroundColor: "rgba(20,22,28,0.3)" }} />)}</div>
    )}
  </div>
);
const PaperPlane: React.FC<{ size?: number }> = ({ size = 110 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
    <path d="M 6 48 L 94 10 L 66 90 L 48 60 Z" fill={colors.white} />
    <path d="M 48 60 L 94 10 L 40 72 Z" fill="#C9D3EA" />
  </svg>
);
const Bin: React.FC<{ size?: number }> = ({ size = 110 }) => (
  <svg width={size} height={size} viewBox="0 0 100 110" aria-hidden>
    <rect x={14} y={26} width={72} height={80} rx={12} fill={colors.subtext} />
    <rect x={6} y={12} width={88} height={16} rx={8} fill={colors.white} />
    {[34, 50, 66].map((x) => <rect key={x} x={x - 3} y={40} width={6} height={54} rx={3} fill={colors.ink} opacity={0.5} />)}
  </svg>
);

const S5Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const f = (r: readonly [number, number], d = 0.3) => during(frame, r[0], r[1], d);

  // figure: centred for the wake-ups, then slides left
  const left = ramp(frame, P.risky[0] - 0.1, 0.6);
  const fig = { left: interpolate(left, [0, 1], [FIG_C.left, FIG_L.left]), top: interpolate(left, [0, 1], [FIG_C.top, FIG_L.top]) };
  const figO = f([-1, P.gate[1]]);

  // wake-ups
  const bubble = pop(frame, T.youAsk - 0.1);
  const clock = pop(frame, T.clock - 0.1);
  const flyOut = ramp(frame, T.so, 0.6);
  const env = interpolate(t, [T.email - 0.2, T.email + 0.3], [-260, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x });
  const sort = ramp(frame, T.arriving + 0.2, 0.5);

  // risky: loop runner stops at "stops"
  const runT = Math.min(t, T.stops) - P.risky[0];
  const runner = { x: LOOP.x + LOOP.r * Math.cos(runT * 5 - Math.PI / 2), y: LOOP.y + LOOP.r * Math.sin(runT * 5 - Math.PI / 2) };
  const items = [T.paying, T.sending, T.deleting].map((at) => interpolate(t, [at - 0.5, at + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const cards = [T.paying, T.sending, T.deleting].map((at) => pop(frame, at + 0.1));
  const yes = ramp(frame, T.first - 0.45, 0.2);

  // gate on the helper
  const waitBubble = interpolate(t, [T.onlyAsk - 0.2, T.hold], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const gatePulse = during(frame, T.hold, T.yes + 0.5, 0.2);

  // flashback
  const rw = during(frame, P.flash[0] - 0.05, P.flash[0] + 0.5, 0.08);
  const thud = during(frame, T.didnt, T.didnt + 0.35, 0.05);
  const missing = ramp(frame, T.thatTime, 0.3);

  // back: card snaps in solid, strip fills
  const snap = pop(frame, T.newer - 0.05);
  const fill = ramp(frame, T.newer + 0.6, 0.5);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <QuestionStrip active={fill > 0.99 ? -1 : 2} answered={fill > 0.99 ? 3 : 2} allowFill={fill} />

      {/* The figure (all parts), hands parked on the helper during the gate */}
      <div style={{ position: "absolute", left: fig.left, top: fig.top, opacity: figO }}>
        <Figure size={600} hands={1} eyes={1} notebook={1} handsAway={t >= P.gate[0]} look={t < P.risky[0] ? { x: 0, y: 0.3 } : { x: 1, y: 0 }} />
      </div>

      {/* 1 · Wake-ups: you ask · a clock · something happens */}
      <AbsoluteFill style={{ opacity: f(P.wake) }}>
        <div style={{ position: "absolute", left: 330, top: 300, transform: `scale(${Math.min(1, bubble)})`, opacity: Math.min(1, bubble), transformOrigin: "100% 100%" }}>
          <div style={{ position: "relative", padding: "22px 34px", borderRadius: 34, backgroundColor: colors.lineStrong, fontSize: 46, fontWeight: 700 }}>
            Check my emails?
            <div style={{ position: "absolute", right: 30, bottom: -22, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `26px solid ${colors.lineStrong}` }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 1320, top: 260, transform: `scale(${Math.min(1, clock)})`, opacity: Math.min(1, clock) }}>
          <AlarmClock ring={during(frame, T.clock, T.so + 0.4, 0.1) * (t - T.clock)} />
          <div style={{ position: "absolute", left: 30, top: 180, fontSize: 50, fontWeight: 800, color: colors.white }}>7:00</div>
        </div>
        <div style={{ position: "absolute", left: 1320 + 220 * flyOut, top: 300 - 90 * flyOut, opacity: Math.min(1, flyOut * 2) }}><MiniCard kind="sun" /></div>
        <div style={{ position: "absolute", left: 1330 + 230 * flyOut, top: 330 + 70 * flyOut, opacity: Math.min(1, flyOut * 2) }}><MiniCard kind="note" /></div>
        {/* inbox tray: an envelope drops in and the tray sorts into two piles */}
        <div style={{ position: "absolute", left: 1270, top: 760, opacity: ramp(frame, T.happens, 0.3) }}>
          <div style={{ position: "absolute", left: 30, top: env - 40, opacity: t > T.email - 0.2 ? 1 - sort : 0 }}><ToolIcon kind="envelope" size={110} /></div>
          {[0, 1].map((pile) => (
            <div key={pile} style={{ position: "absolute", left: pile * 110 - 10 + 30 * (1 - sort), top: 30, opacity: sort }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", top: -i * 12, width: 90, height: 56, borderRadius: 8, backgroundColor: pile ? colors.periwinkle : colors.white, border: `3px solid ${colors.ink}` }} />)}
            </div>
          ))}
          <svg width={240} height={110} viewBox="0 0 240 110" style={{ position: "absolute", left: -20, top: 40 }} aria-hidden>
            <path d="M 0 0 L 240 0 L 220 100 L 20 100 Z" fill={colors.lineStrong} stroke={colors.subtext} strokeWidth={5} />
          </svg>
        </div>
      </AbsoluteFill>

      {/* 2 · The loop runs; paying, sending, deleting each stop at an "Allow?" card */}
      <AbsoluteFill style={{ opacity: f(P.risky) }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <circle cx={LOOP.x} cy={LOOP.y} r={LOOP.r} fill="none" stroke={colors.yellow} strokeWidth={12} opacity={0.9} />
          <circle cx={runner.x} cy={runner.y} r={20} fill={colors.yellow} />
        </svg>
        {LANES.map((y, i) => (
          <React.Fragment key={y}>
            <div style={{ position: "absolute", left: CARD_X, top: y - 70, transform: `scale(${Math.min(1, cards[i])})`, opacity: Math.min(1, cards[i]) }}>
              <AllowCard w={230} yes={i === 0 ? yes : 0} />
            </div>
            <div style={{ position: "absolute", left: interpolate(items[i], [0, 1], [1960, CARD_X + 270]), top: y - 55, transform: `rotate(${i === 0 ? (1 - items[i]) * 720 : 0}deg)` }}>
              {i === 0 ? <Coin size={110} /> : i === 1 ? <PaperPlane size={110} /> : <Bin size={110} />}
            </div>
          </React.Fragment>
        ))}
      </AbsoluteFill>

      {/* 3 · The gate: the "Allow?" card sits on the helper; the brain's request waits in front of it */}
      <AbsoluteFill style={{ opacity: f(P.gate) }}>
        <div style={{ position: "absolute", left: HB.left, top: HB.top }}>
          <HelperBox w={HB.w} />
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <HandShape cx={HB.left + 115} cy={HB.top + 270} r={30} />
          <HandShape cx={HB.left + 210} cy={HB.top + 270} r={30} flip />
        </svg>
        <div style={{ position: "absolute", left: HB.left + 25, top: HB.top - 170, transform: `scale(${1 + 0.06 * gatePulse})`, boxShadow: gatePulse > 0 ? `0 0 ${40 * gatePulse}px rgba(255,201,60,0.6)` : "none", borderRadius: 20 }}>
          <AllowCard w={250} />
        </div>
        <div style={{ position: "absolute", left: interpolate(waitBubble, [0, 1], [430, 620]), top: interpolate(waitBubble, [0, 1], [300, 520]), opacity: ramp(frame, T.onlyAsk - 0.3, 0.2), transform: `scale(${Math.min(1, pop(frame, T.onlyAsk - 0.3))})` }}>
          <div style={{ padding: "16px 28px", borderRadius: 28, backgroundColor: colors.white, color: colors.ink, fontSize: 42, fontWeight: 700, whiteSpace: "nowrap" }}>Buy, please</div>
        </div>
      </AbsoluteFill>

      {/* 4 · Flashback: the $31 receipt, with the card missing (dashed) */}
      <AbsoluteFill style={{ opacity: f(P.flash, 0.25) }}>
        <AbsoluteFill style={{ filter: "grayscale(0.55) sepia(0.25)" }}>
          <div style={{ position: "absolute", left: 470, top: 230, transform: "rotate(-4deg)" }}>
            <Receipt w={380} />
          </div>
          <div style={{ position: "absolute", left: 1040, top: 360, transform: `translateX(${Math.sin(frame * 2.4) * 12 * thud}px)` }}>
            <AllowCard w={440} empty={1} showButtons={false} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 36, border: `8px dashed ${colors.coral}`, opacity: missing }} />
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", inset: 30, borderRadius: 30, border: `6px solid rgba(255,255,255,0.35)` }} />
        <AbsoluteFill style={{ opacity: rw }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: -200 + ((frame * 140 + i * 377) % 2300), top: 80 + i * 110, width: 320, height: 10, borderRadius: 5, backgroundColor: colors.white, opacity: 0.25 }} />
          ))}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* 5 · The card snaps back in, solid */}
      <AbsoluteFill style={{ opacity: f(P.back, 0.15), alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${Math.min(1.08, snap)})`, filter: `drop-shadow(0 0 ${30 * ramp(frame, T.newer, 0.4)}px rgba(94,230,184,0.6))` }}>
          <AllowCard w={520} />
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s5" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S5 — third stop: who switches it on, and when does it stop to ask? Edit only this file for S5 changes.
export const S5: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S5Content />
    </LineWipeIn>
  </SceneShell>
);
