import React from "react";
import { colors } from "../../shared/brand";

// Ep 4 character rig (revamp): cut-paper look, two-bone arms (shoulder → elbow → wrist) and gloved hands built in
// their own frame — wrist at the origin, palm and fingers pointing AWAY from the wrist along the forearm, thumb on
// the chosen side. A hand is always attached to an arm; never draw a hand on its own.

export const INK = "#14161C";
export const PAPER = "#EFE6D2";
export const PAPER_SHADE = "#D9CDB3";
export const GLOVE = "#8EA7FF";
export const GLOVE_SHADE = "#6F86E0";
export const CUFF = "#DDE5FF";
export const OUT = 7; // outline width (ink) for every cut-out
export const SHADOW = "rgba(0,0,0,0.38)";

export type Pt = { x: number; y: number };
export type HandPose = "relaxed" | "open" | "point" | "grip" | "fist";

export type Bend = 1 | -1 | "auto" | "natural";

/**
 * Two-bone IK: the elbow for a shoulder→wrist chain. `bend` = +1 / −1 picks which side the elbow bows to;
 * "auto" (the default everywhere) takes the natural one: the elbow DROPS (the lower of the two solutions), as gravity
 * and the body pull it — never pointing up over a reach.
 */
export const solveElbow = (s: Pt, w: Pt, upper: number, lower: number, bend: Bend = "auto", bodyX?: number): { elbow: Pt; wrist: Pt } => {
  if (bend === "natural" && bodyX !== undefined) {
    // Natural human arm (front view):
    //  • reaching AWAY from the body (hand well outside the shoulder line) → elbow folds IN / down toward the body;
    //  • arm down by the side or holding something close → elbow points OUT, away from the body.
    const a = solveElbow(s, w, upper, lower, 1);
    const b = solveElbow(s, w, upper, lower, -1);
    const side = Math.sign(s.x - bodyX) || 1; // −1 = arm on the left of the body, +1 = right
    const reaching = (w.x - s.x) * side > 70;
    if (reaching) return a.elbow.y >= b.elbow.y ? a : b;
    return (a.elbow.x - bodyX) * side >= (b.elbow.x - bodyX) * side ? a : b;
  }
  if (bend === "auto" || bend === "natural") {
    const a = solveElbow(s, w, upper, lower, 1);
    const b = solveElbow(s, w, upper, lower, -1);
    return a.elbow.y >= b.elbow.y ? a : b;
  }
  const dx = w.x - s.x;
  const dy = w.y - s.y;
  const reach = upper + lower - 0.5;
  let d = Math.hypot(dx, dy);
  const ux = dx / (d || 1);
  const uy = dy / (d || 1);
  let wrist = w;
  if (d > reach) {
    d = reach;
    wrist = { x: s.x + ux * d, y: s.y + uy * d };
  }
  const a = (upper * upper - lower * lower + d * d) / (2 * d); // distance along the chain to the elbow's foot
  const h = Math.sqrt(Math.max(0, upper * upper - a * a));
  const fx = s.x + ux * a;
  const fy = s.y + uy * a;
  return { elbow: { x: fx - uy * h * bend, y: fy + ux * h * bend }, wrist };
};

/** Where a hand is: the wrist, the forearm angle (degrees) and a point `dist` px along the hand (e.g. inside the fist). */
export const handFrame = (shoulder: Pt, target: Pt, bend: Bend, dist: number, upper = 140, lower = 130, bodyX?: number) => {
  const { elbow, wrist } = solveElbow(shoulder, target, upper, lower, bend, bodyX);
  const ang = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
  return { wrist, angle: (ang * 180) / Math.PI, at: { x: wrist.x + Math.cos(ang) * dist, y: wrist.y + Math.sin(ang) * dist } };
};

/** One finger: a rounded capsule from the knuckle line (x = 48), optionally curled (0 straight … 1 tucked to a knuckle). */
const Finger: React.FC<{ y: number; len: number; w: number; curl: number; spread: number }> = ({ y, len, w, curl, spread }) => {
  const L = curl > 0.5 ? 27 : Math.max(w, len * (1 - 0.72 * curl)); // curled = a knuckle showing past the palm's front edge
  return (
    <g transform={`translate(44 ${y}) rotate(${spread})`}>
      <rect x={-w / 2} y={-w / 2} width={L + w / 2} height={w} rx={w / 2} fill={GLOVE} stroke={INK} strokeWidth={OUT * 0.8} />
    </g>
  );
};

/**
 * A gloved cartoon hand, back of the hand toward the viewer. Local frame: wrist at (0,0), fingers point toward +x.
 * `thumb` = which side (local y) the thumb is on: "up" = −y, "down" = +y. At size 1 it is ~110 px long, 60 px wide
 * (about 1.6× the default arm width).
 */
export const Hand: React.FC<{ pose?: HandPose; thumb?: "up" | "down"; size?: number; press?: number }> = ({ pose = "relaxed", thumb = "up", size = 1.25, press = 0 }) => {
  const t = thumb === "up" ? -1 : 1;
  // index finger sits nearest the thumb
  const base = pose === "point" ? [-13, -2, 8, 18] : [-20, -7, 6, 19]; // pointing index comes from the front edge, not the side
  const ys = (t === -1 ? base : base.map((v) => -v)).map((y) => y * (1 - 0.04 * press));
  const lens = [46, 52, 48, 38];
  const curls: number[] =
    pose === "point" ? [0, 1, 1, 1] : pose === "grip" ? [0.85, 0.9, 0.9, 0.9] : pose === "fist" ? [1, 1, 1, 1] : pose === "open" ? [0, 0, 0, 0] : [0.15, 0.2, 0.25, 0.3];
  const spreads = pose === "open" ? [-16, -5, 5, 16].map((v) => v * (t === -1 ? 1 : -1)) : pose === "relaxed" ? [-3, 0, 2, 5].map((v) => v * (t === -1 ? 1 : -1)) : [0, 0, 0, 0];
  const thumbAng = pose === "grip" || pose === "fist" ? 18 : pose === "open" ? 68 : pose === "point" ? 28 : 42;
  const order = [3, 2, 1, 0]; // draw the little finger first so the index overlaps it
  return (
    <g transform={`scale(${size})`}>
      {/* thumb (tucked under the palm edge) */}
      <g transform={`translate(26 ${t * 20}) rotate(${t * thumbAng})`}>
        <rect x={-8} y={-9} width={38} height={18} rx={9} fill={GLOVE} stroke={INK} strokeWidth={OUT * 0.8} />
      </g>
      {order.map((i) => (
        <Finger key={i} y={ys[i]} len={lens[i] * (i === 0 && pose === "point" ? 1.25 : 1)} w={i === 0 && pose === "point" ? 21 : 18} curl={curls[i]} spread={spreads[i]} />
      ))}
      {/* back of the hand */}
      <rect x={6} y={-29} width={56} height={58} rx={24} fill={GLOVE} stroke={INK} strokeWidth={OUT * 0.8} />
      <path d="M 18 -16 Q 36 -22 52 -14" stroke={CUFF} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.75} />
      {/* glove cuff at the wrist */}
      <rect x={-12} y={-23} width={24} height={46} rx={10} fill={CUFF} stroke={INK} strokeWidth={OUT * 0.8} />
    </g>
  );
};

/**
 * An arm from the shoulder to a target wrist position (IK), drawn as a paper sleeve (upper + forearm), with the hand
 * oriented along the forearm. `hand` 0 → an empty dashed slot at the wrist; 1 → the glove is on.
 */
export const Arm: React.FC<{
  shoulder: Pt; target: Pt; upper?: number; lower?: number; bend?: Bend; width?: number;
  pose?: HandPose; thumb?: "up" | "down"; hand?: number; handSize?: number; press?: number; color?: string; bodyX?: number;
}> = ({ shoulder, target, upper = 140, lower = 130, bend = "auto", bodyX, width = 34, pose = "relaxed", thumb = "up", hand = 1, handSize = 1.25, press = 0, color = PAPER }) => {
  const { elbow, wrist } = solveElbow(shoulder, target, upper, lower, bend, bodyX);
  const ang = (Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) * 180) / Math.PI;
  const path = `M ${shoulder.x} ${shoulder.y} L ${elbow.x} ${elbow.y} L ${wrist.x} ${wrist.y}`;
  const hp = Math.max(0, hand);
  return (
    <g>
      <path d={path} fill="none" stroke={INK} strokeWidth={width + OUT * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      {/* empty slot (dashed) until the hand arrives */}
      <circle cx={wrist.x + Math.cos((ang * Math.PI) / 180) * 48 * handSize} cy={wrist.y + Math.sin((ang * Math.PI) / 180) * 48 * handSize} r={46 * handSize} fill="none" stroke={colors.subtext} strokeWidth={5} strokeDasharray="12 10" opacity={Math.max(0, 1 - hp * 2) * 0.9} />
      <g transform={`translate(${wrist.x} ${wrist.y}) rotate(${ang}) scale(${hp})`}>
        <Hand pose={pose} thumb={thumb} size={handSize} press={press} />
      </g>
    </g>
  );
};

/* ───────────── Head (brain in a jar), figure and stage — cut-paper style ───────────── */

const BRAIN_Y = "#FFC93C";
const BRAIN_D = "#D9A21F";

/** The jar head: lid with goggle-eyes (optional), glass, yellow brain with its guess slot. Drawn in a 260×300 box. */
export const HeadJar: React.FC<{ eyes?: number; look?: Pt; guess?: string; wrong?: number; glow?: number }> = ({ eyes = 0, look = { x: 0, y: 0 }, guess = "", wrong = 0, glow = 0 }) => (
  <g>
    {glow > 0 ? <ellipse cx={130} cy={170} rx={150} ry={150} fill={BRAIN_Y} opacity={0.18 * glow} /> : null}
    {/* glass */}
    <rect x={22} y={58} width={216} height={232} rx={58} fill="#DCE6FA" fillOpacity={0.62} stroke={INK} strokeWidth={OUT} />
    {/* brain */}
    <g transform="translate(34 104)">
      {[[60, 70, 50], [104, 52, 54], [148, 72, 46], [80, 106, 44], [128, 108, 44]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={BRAIN_Y} stroke={INK} strokeWidth={OUT * 0.8} />
      ))}
      {[[60, 70, 50], [104, 52, 54], [148, 72, 46], [80, 106, 44], [128, 108, 44]].map(([cx, cy, r], i) => (
        <circle key={`f${i}`} cx={cx} cy={cy} r={r - OUT * 0.4} fill={BRAIN_Y} />
      ))}
      <path d="M 100 18 C 92 48, 112 70, 100 100 M 40 64 C 58 54, 66 76, 80 68 M 128 44 C 140 58, 160 50, 168 64 M 58 106 C 70 98, 76 114, 88 106" fill="none" stroke={BRAIN_D} strokeWidth={6} strokeLinecap="round" />
      <rect x={56} y={118} width={88} height={40} rx={11} fill={INK} stroke={wrong > 0.5 ? "#FF8A5C" : BRAIN_D} strokeWidth={5} />
      <text x={100} y={146} textAnchor="middle" fontFamily="inherit" fontWeight={800} fontSize={24} fill={wrong > 0.5 ? "#FF8A5C" : BRAIN_Y}>{guess}</text>
    </g>
    {/* glass shine */}
    <path d="M 46 96 Q 40 150 48 214" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.35} fill="none" />
    {/* lid */}
    <rect x={30} y={20} width={200} height={48} rx={14} fill="#5B6378" stroke={INK} strokeWidth={OUT} />
    {[64, 98, 132, 166, 200].map((x) => <line key={x} x1={x} y1={28} x2={x} y2={60} stroke={INK} strokeWidth={4} opacity={0.35} />)}
    {/* goggle-eyes on a strap round the lid */}
    <g style={{ transform: `scale(${Math.max(0, eyes)})`, transformOrigin: "130px 44px", transformBox: "view-box" }} opacity={Math.min(1, eyes * 3)}>
      <rect x={24} y={36} width={212} height={16} rx={8} fill="#3A3F4D" stroke={INK} strokeWidth={4} />
      {[86, 174].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={44} r={34} fill="#FFFFFF" stroke={INK} strokeWidth={OUT} />
          <circle cx={cx + look.x * 12} cy={44 + look.y * 12} r={14} fill={INK} />
          <circle cx={cx + look.x * 12 - 5} cy={44 + look.y * 12 - 5} r={4.5} fill="#FFFFFF" />
        </g>
      ))}
    </g>
    {/* empty dashed goggle slots until the eyes arrive */}
    {[86, 174].map((cx) => <circle key={cx} cx={cx} cy={44} r={34} fill="none" stroke="#B9BDC8" strokeWidth={4} strokeDasharray="10 8" opacity={Math.max(0, 1 - eyes * 2) * 0.8} />)}
  </g>
);

export type ArmSpec = { target: Pt; pose?: HandPose; thumb?: "up" | "down"; bend?: Bend; press?: number; hand?: number };
// Figure frame: 600×900. Shoulders sit at the top corners of the torso.
export const SHOULDER_L: Pt = { x: 226, y: 338 };
export const SHOULDER_R: Pt = { x: 374, y: 338 };
export const REST_L: ArmSpec = { target: { x: 186, y: 600 }, pose: "relaxed", thumb: "up", bend: 1 };
export const REST_R: ArmSpec = { target: { x: 414, y: 600 }, pose: "relaxed", thumb: "down", bend: -1 };

/**
 * The agent, built like a person, as a paper cut-out: jar head, paper body (no face), arms on the IK rig, a pocket.
 * Arm targets are in the figure's own 600×900 frame. `notebook` pops the notebook into the pocket.
 * The whole figure casts one offset paper shadow; a soft contact shadow sits on the floor.
 */
export const Figure2: React.FC<{
  size?: number; left?: ArmSpec; right?: ArmSpec; eyes?: number; look?: Pt; notebook?: number; guess?: string; wrong?: number; glow?: number;
  /** behind-the-arm props (e.g. a held card), in the figure frame */ children?: React.ReactNode;
}> = ({ size = 640, left = REST_L, right = REST_R, eyes = 0, look, notebook = 0, guess, wrong, glow, children }) => {
  const arm = (s: Pt, a: ArmSpec) => (
    <Arm shoulder={s} target={a.target} pose={a.pose ?? "relaxed"} thumb={a.thumb ?? "up"} bend={a.bend ?? "natural"} bodyX={300} press={a.press ?? 0} hand={a.hand ?? 1} upper={140} lower={130} width={38} />
  );
  return (
    <svg width={(size * 600) / 900} height={size} viewBox="0 0 600 900" aria-hidden style={{ overflow: "visible" }}>
      <ellipse cx={300} cy={858} rx={190} ry={24} fill="#000" opacity={0.35} />
      <g style={{ filter: `drop-shadow(8px 10px 0 ${SHADOW})` }}>
        {/* legs + feet */}
        {[[262, 236], [338, 364]].map(([x, fx]) => (
          <g key={x}>
            <path d={`M ${x} 610 L ${x + (fx > 300 ? 6 : -6)} 820`} stroke={INK} strokeWidth={52 + OUT * 2} strokeLinecap="round" />
            <path d={`M ${x} 610 L ${x + (fx > 300 ? 6 : -6)} 820`} stroke={PAPER} strokeWidth={52} strokeLinecap="round" />
            <ellipse cx={fx} cy={842} rx={46} ry={20} fill="#5B6378" stroke={INK} strokeWidth={OUT} />
          </g>
        ))}
        {/* torso */}
        <path d="M 222 326 C 222 308 238 298 256 298 L 344 298 C 362 298 378 308 378 326 L 396 594 C 398 616 382 632 360 632 L 240 632 C 218 632 202 616 204 594 Z" fill={PAPER} stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
        <path d="M 340 312 C 356 316 364 330 364 346 L 380 590 C 381 606 372 616 360 618 L 340 618 Z" fill={PAPER_SHADE} opacity={0.7} />
        <path d="M 236 340 L 230 560" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
        {/* pocket */}
        <path d="M 304 420 L 372 420 L 368 486 C 367 496 360 502 350 502 L 326 502 C 316 502 309 496 308 486 Z" fill={PAPER_SHADE} stroke={INK} strokeWidth={OUT * 0.7} />
        <path d="M 312 432 L 364 432" stroke={INK} strokeWidth={3} strokeDasharray="6 6" opacity={0.5} />
        {/* notebook in the pocket */}
        <g style={{ transform: `translateY(${(1 - Math.min(1, notebook)) * -60}px)`, opacity: Math.min(1, notebook * 3) }}>
          <rect x={316} y={382} width={46} height={64} rx={6} fill="#8EA7FF" stroke={INK} strokeWidth={5} />
          <rect x={348} y={382} width={7} height={64} fill={BRAIN_Y} />
        </g>
        <path d="M 304 420 L 372 420 L 370 446 L 306 446 Z" fill={PAPER_SHADE} stroke={INK} strokeWidth={OUT * 0.7} opacity={Math.min(1, notebook * 3)} />
        {children}
        {/* head */}
        <g transform="translate(170 22)">
          <HeadJar eyes={eyes} look={look} guess={guess} wrong={wrong} glow={glow} />
        </g>
        {/* arms (in front of the torso) */}
        {arm(SHOULDER_L, left)}
        {arm(SHOULDER_R, right)}
      </g>
    </svg>
  );
};

/** The stage: dark room, a floor plane, a warm spotlight pool, soft out-of-focus paper shapes for depth. */
export const Stage: React.FC<{ spotX?: number; floorY?: number }> = ({ spotX = 960, floorY = 820 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
    <defs>
      <radialGradient id="spot" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFE7B0" stopOpacity={0.16} />
        <stop offset="100%" stopColor="#FFE7B0" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE7B0" stopOpacity={0.07} />
        <stop offset="100%" stopColor="#FFE7B0" stopOpacity={0} />
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill="#14161C" />
    {/* out-of-focus background paper */}
    <g filter="url(#blur)" opacity={0.5}>
      <rect x={120} y={140} width={260} height={360} rx={30} fill="#232838" transform="rotate(-6 250 320)" />
      <rect x={1540} y={110} width={300} height={220} rx={30} fill="#232838" transform="rotate(5 1690 220)" />
      <circle cx={1700} cy={560} r={90} fill="#1E2230" />
    </g>
    <rect x={0} y={floorY} width={1920} height={1080 - floorY} fill="#1B1F2A" />
    <line x1={0} y1={floorY} x2={1920} y2={floorY} stroke="#262B3A" strokeWidth={4} />
    <path d={`M ${spotX - 260} 0 L ${spotX + 260} 0 L ${spotX + 560} ${floorY + 120} L ${spotX - 560} ${floorY + 120} Z`} fill="url(#cone)" />
    <ellipse cx={spotX} cy={floorY + 60} rx={620} ry={110} fill="url(#spot)" />
  </svg>
);
