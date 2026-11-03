import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LogoMark, Wordmark } from "../../../shared/Logo";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { Magnifier, Receipt } from "../Props";
import { Figure2, INK, OUT, Pt, REST_L, SHOULDER_L, SHOULDER_R, Stage, handFrame } from "../Rig";
import { ChatView, Checkout, Kiosk, PlacedView, ProductView, ResultsView } from "../Screens";
import { scene } from "../timeline";

const S = scene("S1");

// Times (s) from the S1 word timings in captions.json. Re-voice S1 → re-check these.
const T = {
  ai: 0.36, order: 1.46, card: 2.64, d31: 4.22, eggs: 5.38, never: 6.52, buy: 7.58, asked: 8.7, find: 9.48,
  most: 10.84, talks: 11.68, thisOne: 12.7, clicked: 13.08, buyBtn: 13.38, so: 14.44, changed: 15.96, lets: 17.36,
};

// One continuous shot on one stage; the camera does the cutting.
// close: the agent's own finger presses Buy → pull back: it holds the reporter's card, the receipt prints ($31.43) →
// rewind: what it was asked (find) vs what it did → most AI just talks (a chatbot screen) vs this one clicks Buy →
// a "?" over the jar; the camera pushes into it → logo.

// ── World layout (wide shot = 1920×1080) ──
const FIG = { left: 420, top: 160, size: 720 };
const FK = FIG.size / 900;
// The self-checkout machine stands clear of the agent (≈145 px from the jar), screen on top, printer body to the floor.
const SCREEN = { left: 890, top: 220, w: 620 };
const FLOOR = 830;
const BODY_H = FLOOR - (SCREEN.top + SCREEN.w * 0.66);
const INNER = { x: SCREEN.left + OUT + SCREEN.w * 0.03, y: SCREEN.top + OUT + SCREEN.w * 0.03 }; // top-left of the page
const SLOT = { x: SCREEN.left + SCREEN.w / 2, y: SCREEN.top + SCREEN.w * 0.66 + 36 };
const CHAT = { left: 20, top: 400, w: 440 };
const Q = { x: FIG.left + 300 * FK, y: 70 }; // the "?" above the jar

// Fingertip targets are worked out from where things really are on the page (not tuned by eye):
const BUY_TIP = { x: INNER.x + SCREEN.w * 0.17, y: INNER.y + SCREEN.w * 0.44 }; // left part of the Buy button (on it, below its top edge)
const TILE_TIP = { x: INNER.x + SCREEN.w * 0.24, y: INNER.y + SCREEN.w * 0.25 }; // the $13.19 carton (it steps closer to reach it)
const IDLE_TIP = { x: INNER.x + SCREEN.w * 0.05, y: INNER.y + SCREEN.w * 0.62 }; // hovering by the screen
const HAND_LEN = 127; // pointing hand, wrist → fingertip, in figure units (Hand size 1.25)
// For the search results the agent takes one step toward the screen (and back after), so it can reach the carton.
const STEP = 70;
const stepK = (t: number) => {
  const e = Easing.inOut(Easing.cubic);
  const into = e(Math.max(0, Math.min(1, (t - 6.75) / 0.5)));
  const back = e(Math.max(0, Math.min(1, (t - 10.45) / 0.5)));
  return into - back;
};
/** The wrist position (figure frame) that puts the pointing fingertip on a world point. */
const wristFor = (tip: Pt, figLeft = FIG.left): Pt => {
  const fx = (tip.x - figLeft) / FK;
  const fy = (tip.y - FIG.top) / FK;
  const dx = fx - SHOULDER_R.x;
  const dy = fy - SHOULDER_R.y;
  const d = Math.hypot(dx, dy);
  return { x: fx - (dx / d) * HAND_LEN, y: fy - (dy / d) * HAND_LEN };
};

// ── Camera: [t, centreX, centreY, zoom], eased between keys ──
const CAM: [number, number, number, number][] = [
  [-1, 850, 400, 2.0], [2.3, 865, 405, 2.1], [3.3, 960, 540, 1.0], [3.75, 960, 540, 1.0],
  [4.25, SLOT.x, 790, 1.9], [5.95, SLOT.x, 780, 1.95], [6.65, 930, 410, 1.35], [10.6, 930, 400, 1.3],
  [11.25, 560, 540, 1.2], [12.55, 580, 540, 1.2], [13.05, 890, 460, 1.45], [14.25, 870, 450, 1.4],
  [14.95, Q.x, 300, 1.55], [15.95, Q.x, 290, 1.6], [16.45, Q.x, Q.y + 10, 8],
];
const cam = (t: number) => {
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [t0, x0, y0, z0] = CAM[i];
  const [t1, x1, y1, z1] = CAM[i + 1];
  const k = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, (t - t0) / (t1 - t0))));
  // zoom interpolates in log space so pushes feel even
  return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, z: Math.exp(Math.log(z0) + (Math.log(z1) - Math.log(z0)) * k) };
};

// ── Arm keys (figure frame) ──
const IDLE_R: Pt = wristFor(IDLE_TIP);
const PRESS: Pt = wristFor(BUY_TIP);
const TAP: Pt = wristFor(TILE_TIP, FIG.left + STEP);
const RAISED_L: Pt = { x: 112, y: 196 };
type Key = [number, Pt];
const RIGHT_KEYS: Key[] = [
  [-0.4, IDLE_R], [0.42, PRESS], [0.8, PRESS], [1.5, IDLE_R],
  [7.55, IDLE_R], [7.95, TAP], [8.3, TAP], [8.9, IDLE_R],
  [12.75, IDLE_R], [T.buyBtn, PRESS], [13.75, PRESS], [14.4, IDLE_R],
];
const LEFT_KEYS: Key[] = [[-1, REST_L.target], [2.45, REST_L.target], [3.05, RAISED_L], [6.4, RAISED_L], [7.0, REST_L.target]];
const along = (keys: Key[], t: number): Pt => {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [t0, a] = keys[i];
  const [t1, b] = keys[i + 1];
  const k = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, (t - t0) / (t1 - t0))));
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
};

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.d31), mood: "panic" },
  { at: sec(T.never), mood: "neutral" },
  { at: sec(T.find), mood: "surprised" },
  { at: sec(T.most), mood: "curious" },
  { at: sec(T.buyBtn), mood: "surprised" },
  { at: sec(T.so), mood: "intrigued" },
  { at: sec(T.lets), mood: "happy" },
];
// Dot lives in screen space (the camera doesn't scale it): hops in after the pull-back, jumps on "$31".
const ROUTE = hops([
  { at: 0, x: 2080, y: 930 },
  { at: sec(3.4), x: 1700, y: 930 },
  { at: sec(T.d31 + 0.05), x: 1640, y: 890 },
  { at: sec(T.never), x: 1790, y: 950 },
  { at: sec(T.find - 0.2), x: 1780, y: 930 },
  { at: sec(T.so + 0.1), x: 1640, y: 330 }, // up in the empty corner, looking at the "?"
  { at: sec(T.lets + 0.2), x: 1580, y: 860 },
]);
const LOOK = glances([
  { at: 0, x: -0.9, y: -0.3 },
  { at: sec(3.9), x: -0.9, y: -0.1 },
  { at: sec(T.asked), x: -0.9, y: -0.8 },
  { at: sec(T.most), x: -1, y: -0.4 },
  { at: sec(T.so), x: -1, y: -0.2 },
  { at: sec(16.3), x: -0.9, y: -0.5 },
]);

/** The reporter's bank card (plain, no brand): charcoal — a different colour from the glove — with a gold chip.
 *  Held between thumb and fingers, so most of it sticks out past the fist. */
const HeldCard: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-74} y={-46} width={148} height={92} rx={12} fill="#2B3142" stroke={INK} strokeWidth={OUT * 0.8} />
    <rect x={-74} y={-30} width={148} height={14} fill="#14161C" opacity={0.6} />
    <rect x={-54} y={-6} width={30} height={22} rx={4} fill={colors.yellow} stroke={INK} strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-54 + i * 30} y={26} width={22} height={6} rx={3} fill="#DCE6FA" opacity={0.85} />)}
  </g>
);

const S1Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = cam(t);

  // arms
  const right = along(RIGHT_KEYS, t);
  const left = along(LEFT_KEYS, t);
  const card = handFrame(SHOULDER_L, left, "natural", 118, 140, 130, 300); // beyond the knuckles: the card sticks out of the fist
  // arm down → the card lies along the fingers; raised → it turns to face the camera
  const raised = Math.max(0, Math.min(1, (REST_L.target.y - left.y) / (REST_L.target.y - RAISED_L.y)));
  const press1 = during(frame, 0.38, 0.85, 0.06);
  const press2 = during(frame, T.buyBtn - 0.04, 13.8, 0.06);
  const tapP = during(frame, 7.9, 8.35, 0.06);

  // screen state
  const rewinding = t >= 6.2 && t < 6.7;
  const placedP = t < 6.2 ? pop(frame, T.order - 0.1) : pop(frame, 13.6);
  const screen =
    t < T.order - 0.1 ? "product" : t < 6.45 ? "placed" : t < 12.3 ? "results" : t < 13.6 ? "product" : "placed";
  const typed = "eggs".slice(0, Math.floor(interpolate(t, [6.75, 7.25], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  // receipt prints (3.6–4.2), retracts on the rewind (6.2–6.5)
  const L = 300 * (t < 6.2 ? ramp(frame, 3.55, 0.6) : 1 - ramp(frame, 6.2, 0.3));

  // request bubble + "?" + logo
  const ask = during(frame, T.asked - 0.15, 10.35, 0.2); // gone before the pan
  const q = pop(frame, T.so);
  const logo = ramp(frame, 16.25, 0.25);
  const shake = rewinding ? Math.sin(frame * 3.1) * 10 : 0;

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
      {/* ── the world, seen through the camera ── */}
      <AbsoluteFill style={{ transformOrigin: "0 0", translate: `${960 - c.x * c.z + shake}px ${540 - c.y * c.z}px`, scale: `${c.z}` }}>
        <Stage spotX={920} floorY={FLOOR} />

        {/* a chatbot's screen: it can only talk */}
        <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
          <Kiosk w={CHAT.w}>
            <div style={{ position: "absolute", inset: 0, backgroundColor: "#232838", opacity: 1 - ramp(frame, T.most - 0.35, 0.25) }}>
              <div style={{ position: "absolute", left: "12%", top: "14%", width: "30%", height: 10, borderRadius: 5, backgroundColor: "#FFFFFF", opacity: 0.08, rotate: "-20deg" }} />
            </div>
            {t >= T.most - 0.3 ? (
              <ChatView w={CHAT.w} shown={interpolate(t, [T.most + 0.1, T.talks + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} text="Here are some cheap eggs…" />
            ) : null}
          </Kiosk>
        </div>

        {/* the self-checkout: screen on top, receipt printer in the body */}
        <div style={{ position: "absolute", left: SCREEN.left, top: SCREEN.top }}>
          <Checkout w={SCREEN.w} bodyH={BODY_H} feed={L} receipt={<Receipt w={SCREEN.w * 0.3} />}>
            {screen === "product" ? (
              <ProductView w={SCREEN.w} press={t < 6 ? press1 : press2} ripple={t < 6 ? ramp(frame, 0.42, 0.5) : ramp(frame, T.buyBtn, 0.5)} />
            ) : screen === "placed" ? (
              <PlacedView w={SCREEN.w} p={placedP} />
            ) : (
              <ResultsView w={SCREEN.w} typed={typed} tiles={pop(frame, 7.2)} tap={t >= 8.0 ? 1 : 0} skip={ramp(frame, 8.35, 0.3)} />
            )}
            {rewinding ? <div style={{ position: "absolute", inset: 0, backgroundColor: colors.white, opacity: 0.5 * (1 - Math.abs(Math.sin(frame * 1.7))) }} /> : null}
          </Checkout>
        </div>

        {/* the agent */}
        <div style={{ position: "absolute", left: FIG.left + STEP * stepK(t), top: FIG.top - 14 * Math.abs(Math.sin(Math.PI * stepK(t))) }}>
          <Figure2
            size={FIG.size}
            eyes={1}
            notebook={1}
            look={t >= T.so ? { x: 0, y: -1 } : t >= T.most && t < T.thisOne ? { x: -1, y: 0.2 } : { x: 0.9, y: 0.3 }}
            left={{ target: left, pose: "grip", thumb: "up" }}
            right={{ target: right, pose: "point", thumb: "up", press: Math.max(press1, press2, tapP) }}
          >
            <HeldCard x={card.at.x} y={card.at.y} rot={card.angle + 90 * raised} />
          </Figure2>
        </div>

        {/* "?" over the jar — the camera pushes into it */}
        <div style={{ position: "absolute", left: Q.x, top: Q.y, translate: "-50% -50%", scale: `${Math.min(1.05, q)}`, opacity: Math.min(1, q * 2), fontSize: 150, fontWeight: 800, color: colors.yellow, lineHeight: 1, WebkitTextStroke: `6px ${INK}`, paintOrder: "stroke" }}>?</div>
      </AbsoluteFill>

      {/* ── screen-space overlays ── */}
      <div style={{ position: "absolute", left: 60, bottom: 60, padding: "10px 26px", borderRadius: 999, backgroundColor: colors.panel, border: `3px solid ${colors.line}`, fontSize: 36, fontWeight: 700, color: colors.subtext, opacity: during(frame, T.d31 + 0.3, 6.1, 0.25) }}>
        USA, 2025
      </div>
      {/* what he asked: a message from the reporter (off-screen left) */}
      <div style={{ position: "absolute", left: 90, top: 90, opacity: ask, scale: `${Math.min(1, pop(frame, T.asked - 0.15))}`, transformOrigin: "0 100%" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
        {/* the reporter: a plain avatar (no face), named by role only */}
        <svg width={96} height={96} viewBox="0 0 96 96" aria-hidden style={{ flex: "none" }}>
          <circle cx={48} cy={48} r={44} fill="#5B6378" stroke={INK} strokeWidth={OUT} />
          <circle cx={48} cy={38} r={15} fill="#DCE6FA" />
          <path d="M 20 80 C 24 60, 72 60, 76 80" fill="#DCE6FA" />
        </svg>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, padding: "22px 36px 22px 24px", borderRadius: 36, backgroundColor: colors.white, color: colors.ink, border: `${OUT}px solid ${INK}`, fontSize: 54, fontWeight: 700 }}>
          <div style={{ scale: `${1 + 0.15 * during(frame, T.find, T.find + 0.5, 0.15)}` }}><Magnifier size={90} /></div>
          Find me cheap eggs
          <div style={{ position: "absolute", left: -28, bottom: 18, width: 0, height: 0, borderTop: "18px solid transparent", borderBottom: "18px solid transparent", borderRight: `30px solid ${INK}` }} />
        </div>
        </div>
      </div>
      {/* tape-rewind streaks */}
      <AbsoluteFill style={{ opacity: rewinding ? 1 : 0 }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 2100 - ((frame * 160 + i * 377) % 2400), top: 80 + i * 110, width: 340, height: 10, borderRadius: 5, backgroundColor: colors.white, opacity: 0.3 }} />
        ))}
        <svg style={{ position: "absolute", left: 80, top: 60 }} width={120} height={70} viewBox="0 0 120 70" aria-hidden>
          <path d="M 58 5 L 8 35 L 58 65 Z M 112 5 L 62 35 L 112 65 Z" fill={colors.yellow} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </svg>
      </AbsoluteFill>
      {/* logo: the "?" opens into it */}
      <AbsoluteFill style={{ backgroundColor: colors.ink, opacity: logo, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ scale: `${Math.min(1.1, pop(frame, 16.3))}` }}><LogoMark size={260} /></div>
          <div style={{ opacity: ramp(frame, 16.6, 0.3), translate: `${interpolate(ramp(frame, 16.6, 0.4), [0, 1], [-40, 0])}px 0px` }}>
            <Wordmark fontSize={150} />
          </div>
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s1" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S1 — hook: the agent itself places the $31 egg order. Frame 0 is already moving (no fade-in). Edit only this file for S1 changes.
export const S1: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <S1Content />
  </SceneShell>
);
