import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { colors } from "./brand";

/**
 * Dot — the Unjargoned mascot, matched to the Ep 1 rig ("Dot2").
 * White dot, eyes do the acting (pills, ^^ arcs, round, or flat lines), brows / mouth /
 * sweat drop / yellow rays only when a mood needs them. The tail is a thin straight
 * yellow bar with a small gap from the body, trailing away from what Dot looks at;
 * on a move it bends as one smooth curve (capped at 70°) and never curls.
 *
 * Drawn in a unit space where the body radius is 100. Ep 1 size: radius ≈ 80 px at 1080p.
 */

type EyeShape = "pill" | "arc" | "round" | "line";
type MouthShape = "none" | "dot" | "o" | "smile" | "frown";

type Eye = {
  h: number; // height scale
  w: number; // width scale
  top: number; // top lid (pill only), 0–1 of the eye covered
  tilt: number; // lid tilt in degrees; + = outer corner droops (worried/sad), − = inner droops (smug)
};

type Brow = { on: number; lift: number; angle: number; arch: number };

export type Face = {
  eye: EyeShape;
  L: Eye;
  R: Eye;
  lookX: number; // −1…1
  lookY: number; // −1…1 (+ = down)
  mouth: MouthShape;
  mouthSize: number;
  browL: Brow;
  browR: Brow;
  sweat: number; // 0–1
  rays: number; // 0–1
  tilt: number; // body tilt, degrees
  shake: number; // panic jitter, px in unit space
};

const eye = (e: Partial<Eye> = {}): Eye => ({ h: 1, w: 1, top: 0, tilt: 0, ...e });
const noBrow: Brow = { on: 0, lift: 0, angle: 0, arch: 0 };
const face = (
  f: Partial<Omit<Face, "L" | "R" | "browL" | "browR">> & {
    L?: Partial<Eye>; R?: Partial<Eye>; both?: Partial<Eye>; browL?: Partial<Brow>; browR?: Partial<Brow>;
  },
): Face => ({
  eye: f.eye ?? "pill",
  L: eye({ ...f.both, ...f.L }),
  R: eye({ ...f.both, ...f.R }),
  lookX: f.lookX ?? 0,
  lookY: f.lookY ?? 0,
  mouth: f.mouth ?? "none",
  mouthSize: f.mouthSize ?? 1,
  browL: f.browL ? { ...noBrow, on: 1, ...f.browL } : noBrow,
  browR: f.browR ? { ...noBrow, on: 1, ...f.browR } : noBrow,
  sweat: f.sweat ?? 0,
  rays: f.rays ?? 0,
  tilt: f.tilt ?? 0,
  shake: f.shake ?? 0,
});

export const MOODS = {
  neutral: face({}),
  happy: face({ eye: "arc" }),
  relieved: face({ eye: "arc", mouth: "dot", lookY: 0.15 }),
  aha: face({ eye: "arc", mouth: "smile", rays: 1, lookY: -0.1 }),
  surprised: face({ eye: "round", mouth: "o" }),
  curious: face({ L: { h: 0.92 }, R: { h: 1.06 }, lookX: -0.55, lookY: -0.2, tilt: -6 }),
  confused: face({
    R: { h: 0.86, w: 0.88 }, mouth: "frown", lookX: -0.15,
    browL: { lift: 0, angle: -6, arch: 0.2 }, browR: { lift: 10, angle: 8, arch: 1 },
  }),
  worried: face({ both: { top: 0.2, tilt: 20 }, mouth: "o", mouthSize: 0.75, sweat: 1, lookY: 0.05 }),
  sad: face({ both: { top: 0.55, tilt: 12, h: 0.9 }, mouth: "dot", lookX: -0.35, lookY: 0.5 }),
  panic: face({ eye: "round", both: { h: 1.08, w: 1.08 }, mouth: "o", mouthSize: 1.35, sweat: 1, shake: 3 }),
  smug: face({ both: { top: 0.38, tilt: -6 }, lookX: -0.3, lookY: 0.4, mouth: "dot", tilt: 4 }),
  intrigued: face({ L: { top: 0.32, tilt: -8 }, R: { h: 1.06 }, lookX: -0.4, browR: { lift: 12, angle: 6, arch: 1 }, tilt: -5 }),
  deadpan: face({ eye: "line", mouth: "o", mouthSize: 0.7 }),
} satisfies Record<string, Face>;

export type Mood = keyof typeof MOODS;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpEye = (a: Eye, b: Eye, t: number): Eye => ({
  h: lerp(a.h, b.h, t), w: lerp(a.w, b.w, t), top: lerp(a.top, b.top, t), tilt: lerp(a.tilt, b.tilt, t),
});
const lerpBrow = (a: Brow, b: Brow, t: number): Brow => ({
  on: lerp(a.on, b.on, t),
  lift: a.on && b.on ? lerp(a.lift, b.lift, t) : a.on ? a.lift : b.lift,
  angle: a.on && b.on ? lerp(a.angle, b.angle, t) : a.on ? a.angle : b.angle,
  arch: a.on && b.on ? lerp(a.arch, b.arch, t) : a.on ? a.arch : b.arch,
});

/** A mood change at a frame (relative to the Dot's Sequence). */
export type MoodKey = { at: number; mood: Mood };

const BLEND_FRAMES = 8;
const ease = Easing.inOut(Easing.cubic);

/** The two moods being blended at `frame`, and how far (0–1). */
const blendAt = (track: MoodKey[], frame: number) => {
  const sorted = [...track].sort((a, b) => a.at - b.at);
  let from: Mood = sorted[0]?.mood ?? "neutral";
  let to: Mood = from;
  let t = 1;
  let sinceChange = Infinity;
  for (let i = 1; i < sorted.length; i++) {
    if (frame < sorted[i].at) break;
    from = sorted[i - 1].mood;
    to = sorted[i].mood;
    sinceChange = frame - sorted[i].at;
    t = ease(Math.min(1, sinceChange / BLEND_FRAMES));
  }
  return { a: MOODS[from], b: MOODS[to], t, sinceChange };
};

/** 0 = open, 1 = shut. Natural, seeded blinks every ~2.5–4.5 s, 6 frames each. */
const blinkAt = (frame: number, seed: string): number => {
  let t = 20 + Math.floor(random(`${seed}-0`) * 40);
  for (let i = 1; t <= frame + 6 && i < 500; i++) {
    const d = frame - t;
    if (d >= 0 && d < 6) return Math.sin((d / 6) * Math.PI);
    t += 75 + Math.floor(random(`${seed}-${i}`) * 60);
  }
  return 0;
};

type Point = { x: number; y: number };

type Props = {
  /** Centre in px (ignored when `path` is given). */
  x?: number;
  y?: number;
  /** Position over time, for moves; the tail and squash follow its velocity. */
  path?: (frame: number) => Point;
  /** Body radius in px (Ep 1: ~80; close-ups up to ~110). */
  size?: number;
  /** One mood, or a track of mood changes. */
  mood?: Mood;
  track?: MoodKey[];
  /** Extra glance on top of the mood (−1…1). */
  look?: Point | ((frame: number) => Point);
  /** Tail direction at rest, degrees (0 = trailing to the right, as in Ep 1). */
  tailAngle?: number;
  /** Tail length in body radii. */
  tailLength?: number;
  /** Tail thickness in body radii. */
  tailWidth?: number;
  blinks?: boolean;
  seed?: string;
  /** Render as of this frame instead of the current one (onion-skin / sheets). */
  frame?: number;
  opacity?: number;
  /** Landing squash over time (0 = none, 0.2 = flattened), e.g. from hops(). */
  squash?: (frame: number) => number;
};

const deg = (a: number) => (a * Math.PI) / 180;
const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
const INK = colors.ink;

export const Dot: React.FC<Props> = ({
  x = 960,
  y = 540,
  path,
  size = 80,
  mood = "neutral",
  track,
  look,
  tailAngle = 0,
  tailLength = 1.7,
  tailWidth = 0.3,
  blinks = true,
  seed = "dot",
  frame: frameOverride,
  opacity = 1,
  squash,
}) => {
  const current = useCurrentFrame();
  const uid = React.useId().replace(/:/g, "");
  const frame = frameOverride ?? current;
  const { a, b, t, sinceChange } = blendAt(track ?? [{ at: 0, mood }], frame);

  // Motion: position and velocity (averaged over a few frames so the tail lags).
  const pos = path ? path(frame) : { x, y };
  const prev = path ? path(frame - 4) : pos;
  const vx = (pos.x - prev.x) / 4;
  const vy = (pos.y - prev.y) / 4;
  const speed = Math.hypot(vx, vy);
  const moveAngle = (Math.atan2(vy, vx) * 180) / Math.PI;

  // Tail: leaves at the rest angle with a small gap; the tip swings behind the move (≤70°).
  const pull = Math.min(1, speed / 18);
  const bend = Math.max(-70, Math.min(70, wrap(moveAngle + 180 - tailAngle))) * pull;
  const tipAngle = tailAngle + bend;
  const start = 112 + tailWidth * 50;
  const L = tailLength * 100;
  const p0 = { x: Math.cos(deg(tailAngle)) * start, y: Math.sin(deg(tailAngle)) * start };
  const c1 = { x: Math.cos(deg(tailAngle)) * (start + L * 0.5), y: Math.sin(deg(tailAngle)) * (start + L * 0.5) };
  const tip = { x: Math.cos(deg(tipAngle)) * (start + L), y: Math.sin(deg(tipAngle)) * (start + L) };

  // Squash & stretch along the move, a little pop on each mood change, idle breathing.
  const moveStretch = 1 + Math.min(0.1, speed / 150);
  const popS = sinceChange < 10 ? 1 + 0.05 * Math.sin((sinceChange / 10) * Math.PI) : 1;
  const sq = squash ? squash(frame) : 0;
  const breathe = 1 + 0.012 * Math.sin(frame / 22);

  const blink = blinks ? blinkAt(frame, seed) : 0;
  const lookAt = typeof look === "function" ? look(frame) : look;
  const lookX = Math.max(-1, Math.min(1, lerp(a.lookX, b.lookX, t) + (lookAt?.x ?? 0)));
  const lookY = Math.max(-1, Math.min(1, lerp(a.lookY, b.lookY, t) + (lookAt?.y ?? 0)));
  const bodyTilt = lerp(a.tilt, b.tilt, t);
  const shakeAmt = lerp(a.shake, b.shake, t);
  const shake = shakeAmt ? { x: Math.sin(frame * 2.7) * shakeAmt, y: Math.cos(frame * 3.1) * shakeAmt * 0.5 } : { x: 0, y: 0 };

  // Different shapes cross over by closing the old one and opening the new one.
  const sameEye = a.eye === b.eye;
  const sameMouth = a.mouth === b.mouth;
  const L_ = lerpEye(a.L, b.L, t);
  const R_ = lerpEye(a.R, b.R, t);
  const out = Math.max(0, 1 - 2 * t);
  const inn = Math.max(0, 2 * t - 1);

  const eyeCentre = (side: -1 | 1) => ({ cx: side * 34 + lookX * 13, cy: -4 + lookY * 11 });
  // Glancing: the far eye gets a touch smaller and both tilt into the look.
  const perspective = (side: -1 | 1) => 1 - Math.max(0, side * lookX) * 0.12 + Math.max(0, -side * lookX) * 0.03;

  const drawEye = (shape: EyeShape, e: Eye, side: -1 | 1, open: number) => {
    if (open <= 0.01) return null;
    const { cx, cy } = eyeCentre(side);
    const k = perspective(side);
    const rot = lookX * 7;
    const key = `${shape}${side}`;
    const blinkable = shape === "pill" || shape === "round";
    const sy = open * (blinkable ? 1 - blink * 0.92 : 1);
    const wrap = (child: React.ReactNode) => (
      <g key={key} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${k} ${k * sy})`}>{child}</g>
    );
    if (shape === "arc") {
      const w = 25 * e.w;
      return wrap(
        <path d={`M ${-w} 8 Q 0 ${-22 * e.h} ${w} 8`} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />,
      );
    }
    if (shape === "line") {
      return wrap(<rect x={-24 * e.w} y={-4.5} width={48 * e.w} height={9} rx={4.5} fill={INK} transform={`rotate(${side * -3})`} />);
    }
    if (shape === "round") {
      return wrap(<ellipse rx={23 * e.w} ry={23 * e.h} fill={INK} />);
    }
    // Pill, with an optional top lid cut through a mask (no seams).
    const w = 34 * e.w;
    const h = 56 * e.h;
    const lidY = -h / 2 + e.top * h;
    const mask = `${uid}-m${side}`;
    return wrap(
      <>
        <mask id={mask} maskUnits="userSpaceOnUse" x={-100} y={-100} width={200} height={200}>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.45} fill="white" />
          {e.top > 0.001 ? (
            <rect x={-w * 2} y={lidY - h * 2} width={w * 4} height={h * 2} fill="black" transform={`rotate(${e.tilt * side} 0 ${lidY})`} />
          ) : null}
        </mask>
        <rect x={-w / 2 - 1} y={-h / 2 - 1} width={w + 2} height={h + 2} fill={INK} mask={`url(#${mask})`} />
      </>,
    );
  };

  const drawMouth = (shape: MouthShape, s: number, amt: number) => {
    if (amt <= 0.01 || shape === "none") return null;
    const mx = lookX * 8;
    const my = 46 + lookY * 5;
    const g = (child: React.ReactNode) => (
      <g key={shape} transform={`translate(${mx} ${my}) scale(${amt * s})`}>{child}</g>
    );
    if (shape === "dot") return g(<circle r={3.2} fill={INK} />);
    if (shape === "o") return g(<ellipse rx={9} ry={13} fill={INK} />);
    if (shape === "smile") return g(<path d="M -17 -6 L 17 -6 Q 15 12 0 13 Q -15 12 -17 -6 Z" fill={INK} />);
    return g(<path d="M -14 6 Q 0 -8 14 6" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />);
  };

  const drawBrow = (br: Brow, side: -1 | 1) => {
    if (br.on <= 0.01) return null;
    const { cx, cy } = eyeCentre(side);
    const y0 = cy - 46 - br.lift;
    return (
      <path
        key={`b${side}`}
        d={`M ${-20} 0 Q 0 ${-14 * br.arch} 20 0`}
        transform={`translate(${cx} ${y0}) rotate(${br.angle * side})`}
        fill="none"
        stroke={INK}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={Math.min(1, br.on)}
      />
    );
  };

  const sweat = lerp(a.sweat, b.sweat, t);
  const rays = lerp(a.rays, b.rays, t);
  const s = size / 100;

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }} width={1} height={1} aria-hidden>
      <g transform={`translate(${pos.x + shake.x * s} ${pos.y + shake.y * s}) scale(${s})`}>
        <path
          d={`M ${p0.x} ${p0.y} Q ${c1.x} ${c1.y} ${tip.x} ${tip.y}`}
          fill="none"
          stroke={colors.yellow}
          strokeWidth={tailWidth * 100}
          strokeLinecap="round"
        />
        {rays > 0.01 ? (
          <g opacity={Math.min(1, rays)} transform={`scale(${0.85 + 0.15 * rays})`}>
            {[-125, -90, -55].map((ang) => (
              <line
                key={ang}
                x1={Math.cos(deg(ang)) * 128}
                y1={Math.sin(deg(ang)) * 128}
                x2={Math.cos(deg(ang)) * 160}
                y2={Math.sin(deg(ang)) * 160}
                stroke={colors.yellow}
                strokeWidth={10}
                strokeLinecap="round"
              />
            ))}
          </g>
        ) : null}
        <g transform={`rotate(${moveAngle}) scale(${moveStretch} ${1 / moveStretch}) rotate(${-moveAngle})`}>
          <g transform={`rotate(${bodyTilt}) scale(${popS * (1 + sq)} ${popS * breathe * (1 - sq)})`}>
            <circle r={100} fill={colors.white} />
            {sameEye ? (
              <>
                {drawEye(b.eye, L_, -1, 1)}
                {drawEye(b.eye, R_, 1, 1)}
              </>
            ) : (
              <>
                {drawEye(a.eye, a.L, -1, out)}
                {drawEye(a.eye, a.R, 1, out)}
                {drawEye(b.eye, b.L, -1, inn)}
                {drawEye(b.eye, b.R, 1, inn)}
              </>
            )}
            {drawBrow(lerpBrow(a.browL, b.browL, t), -1)}
            {drawBrow(lerpBrow(a.browR, b.browR, t), 1)}
            {sameMouth
              ? drawMouth(b.mouth, lerp(a.mouthSize, b.mouthSize, t), 1)
              : [drawMouth(a.mouth, a.mouthSize, out), drawMouth(b.mouth, b.mouthSize, inn)]}
            {sweat > 0.01 ? (
              <path
                d="M 0 -16 Q 11 0 9 8 A 9 9 0 1 1 -9 8 Q -11 0 0 -16 Z"
                transform={`translate(70 ${-44 + (1 - sweat) * -10}) scale(${sweat})`}
                fill={colors.periwinkle}
              />
            ) : null}
          </g>
        </g>
      </g>
    </svg>
  );
};

/** Ease helper for Dot paths: a smooth move from a to b between two frames. */
export const moveBetween =
  (a: Point, b: Point, from: number, to: number) =>
  (frame: number): Point => {
    const k = interpolate(frame, [from, to], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
  };

/** A stop on Dot's route: be at (x, y) from frame `at` (the hop ends there). */
export type Stop = { at: number; x: number; y: number };

/**
 * Dot hops between stops: each hop takes `dur` frames, ends on its stop's frame, arcs up by `lift` px,
 * and lands with a short squash. Returns props for <Dot path squash />.
 */
export const hops = (stops: Stop[], dur = 16, lift = 90) => {
  const sorted = [...stops].sort((a, b) => a.at - b.at);
  const path = (frame: number): Point => {
    let pos = { x: sorted[0].x, y: sorted[0].y };
    for (let i = 1; i < sorted.length; i++) {
      const s = sorted[i];
      const start = s.at - dur;
      if (frame < start) break;
      const t = Math.min(1, (frame - start) / dur);
      const e = Easing.inOut(Easing.cubic)(t);
      const prev = sorted[i - 1];
      pos = { x: lerp(prev.x, s.x, e), y: lerp(prev.y, s.y, e) - Math.sin(t * Math.PI) * lift };
    }
    return pos;
  };
  const squash = (frame: number) => {
    let k = 0;
    for (let i = 1; i < sorted.length; i++) {
      const d = frame - sorted[i].at;
      if (d >= 0 && d < 8) k = Math.max(k, 0.16 * Math.sin((d / 8) * Math.PI) * (1 - d / 10));
    }
    return k;
  };
  return { path, squash };
};

/** Glance changes over time: [{ at: frame, x, y }], eased over 6 frames. */
export const glances = (keys: { at: number; x: number; y: number }[]) => (frame: number): Point => {
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  let cur = { x: sorted[0].x, y: sorted[0].y };
  for (let i = 1; i < sorted.length; i++) {
    if (frame < sorted[i].at) break;
    const t = Easing.inOut(Easing.cubic)(Math.min(1, (frame - sorted[i].at) / 6));
    cur = { x: lerp(cur.x, sorted[i].x, t), y: lerp(cur.y, sorted[i].y, t) };
  }
  return cur;
};
