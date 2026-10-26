import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { colors } from "./brand";

/**
 * Dot — the Unjargoned mascot: the white dot at the end of the logo's line.
 * Pill eyes do the acting; a mouth appears only when a mood needs it.
 * The tail is the logo's yellow line: straight at rest, it trails Dot's motion
 * as one smooth curve (bend capped at 70°) and never curls.
 *
 * Geometry is drawn in a unit space where the body radius is 100.
 */

type Eye = {
  h: number; // height scale (1 = rest)
  w: number; // width scale
  top: number; // top lid, 0–1 of the eye covered
  tilt: number; // top-lid tilt in degrees; + = outer corner droops (sad), − = inner droops (smug/cross)
  bottom: number; // bottom lid (cheek push), 0–1; makes the happy ^ shape
};

export type Face = {
  L: Eye;
  R: Eye;
  lookX: number; // −1…1
  lookY: number; // −1…1 (+ = down)
  mouth: number; // 0 = none, 1 = big "O"
  tilt: number; // body tilt in degrees
  stretch: number; // >1 taller, <1 squashed
};

const eye = (e: Partial<Eye> = {}): Eye => ({ h: 1, w: 1, top: 0, tilt: 0, bottom: 0, ...e });
const face = (f: Partial<Omit<Face, "L" | "R">> & { L?: Partial<Eye>; R?: Partial<Eye>; both?: Partial<Eye> }): Face => ({
  L: eye({ ...f.both, ...f.L }),
  R: eye({ ...f.both, ...f.R }),
  lookX: f.lookX ?? 0,
  lookY: f.lookY ?? 0,
  mouth: f.mouth ?? 0,
  tilt: f.tilt ?? 0,
  stretch: f.stretch ?? 1,
});

export const MOODS = {
  neutral: face({}),
  happy: face({ both: { bottom: 0.6, h: 0.95 }, stretch: 1.03 }),
  relieved: face({ both: { top: 0.48, tilt: 4, bottom: 0.32 }, lookY: 0.2, stretch: 0.96 }),
  aha: face({ both: { h: 1.18, w: 1.08 }, lookY: -0.45, stretch: 1.07 }),
  surprised: face({ both: { h: 1.22, w: 0.88 }, mouth: 0.75, stretch: 1.08 }),
  curious: face({ L: { h: 0.9, top: 0.12 }, R: { h: 1.12 }, lookX: 0.5, lookY: -0.25, tilt: 9 }),
  confused: face({ L: { top: 0.38, tilt: -14 }, R: { h: 1.1, top: 0.08, tilt: 12 }, lookX: -0.3, lookY: -0.35, tilt: -10 }),
  worried: face({ both: { top: 0.2, tilt: 26, h: 1.12, w: 0.92 }, lookX: -0.55, lookY: -0.1, mouth: 0.3, stretch: 0.97 }),
  sad: face({ both: { top: 0.42, tilt: 20, h: 0.85 }, lookY: 0.7, tilt: -5, stretch: 0.92 }),
  panic: face({ both: { h: 1.26, w: 0.78 }, mouth: 1, stretch: 1.1 }),
  smug: face({ both: { top: 0.5, tilt: -9, bottom: 0.22 }, lookX: 0.5, tilt: 8 }),
  intrigued: face({ L: { top: 0.42, tilt: -10, bottom: 0.18 }, R: { h: 1.1 }, lookX: 0.35, lookY: -0.1, tilt: 6 }),
} satisfies Record<string, Face>;

export type Mood = keyof typeof MOODS;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpEye = (a: Eye, b: Eye, t: number): Eye => ({
  h: lerp(a.h, b.h, t),
  w: lerp(a.w, b.w, t),
  top: lerp(a.top, b.top, t),
  tilt: lerp(a.tilt, b.tilt, t),
  bottom: lerp(a.bottom, b.bottom, t),
});
export const blendFace = (a: Face, b: Face, t: number): Face => ({
  L: lerpEye(a.L, b.L, t),
  R: lerpEye(a.R, b.R, t),
  lookX: lerp(a.lookX, b.lookX, t),
  lookY: lerp(a.lookY, b.lookY, t),
  mouth: lerp(a.mouth, b.mouth, t),
  tilt: lerp(a.tilt, b.tilt, t),
  stretch: lerp(a.stretch, b.stretch, t),
});

/** A mood change at a frame (relative to the Dot's Sequence). */
export type MoodKey = { at: number; mood: Mood };

const BLEND_FRAMES = 8;
const ease = Easing.inOut(Easing.cubic);

/** Face at `frame` from a mood track, blending over BLEND_FRAMES at each change. */
const faceAt = (track: MoodKey[], frame: number): { face: Face; sinceChange: number } => {
  const sorted = [...track].sort((a, b) => a.at - b.at);
  let current: Face = MOODS[sorted[0]?.mood ?? "neutral"];
  let sinceChange = Infinity;
  for (let i = 1; i < sorted.length; i++) {
    const k = sorted[i];
    if (frame < k.at) break;
    const t = ease(Math.min(1, (frame - k.at) / BLEND_FRAMES));
    current = blendFace(current, MOODS[k.mood], t);
    sinceChange = frame - k.at;
  }
  return { face: current, sinceChange };
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
  /** Body radius in px. */
  size?: number;
  /** One mood, or a track of mood changes. */
  mood?: Mood;
  track?: MoodKey[];
  /** Extra glance on top of the mood (−1…1). */
  look?: Point;
  /** Tail direction at rest, degrees (180 = trailing to the left, like the logo). */
  tailAngle?: number;
  /** Tail length in body radii. */
  tailLength?: number;
  /** Tail thickness in body radii (the logo line is ~1.0; 0.64 reads cleaner at video size). */
  tailWidth?: number;
  blinks?: boolean;
  seed?: string;
  /** Render as of this frame instead of the current one (onion-skin / sheets). */
  frame?: number;
  opacity?: number;
};

const deg = (a: number) => (a * Math.PI) / 180;
const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

export const Dot: React.FC<Props> = ({
  x = 960,
  y = 540,
  path,
  size = 84,
  mood = "neutral",
  track,
  look,
  tailAngle = 180,
  tailLength = 2.4,
  tailWidth = 0.64,
  blinks = true,
  seed = "dot",
  frame: frameOverride,
  opacity = 1,
}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const { face: f, sinceChange } = faceAt(track ?? [{ at: 0, mood }], frame);

  // Motion: position, velocity (averaged over a few frames so the tail lags naturally).
  const pos = path ? path(frame) : { x, y };
  const prev = path ? path(frame - 4) : pos;
  const vx = (pos.x - prev.x) / 4;
  const vy = (pos.y - prev.y) / 4;
  const speed = Math.hypot(vx, vy);
  const moveAngle = (Math.atan2(vy, vx) * 180) / Math.PI;

  // Tail: base leaves at the rest angle; the tip swings to trail behind the move (≤70°).
  const pull = Math.min(1, speed / 18);
  const behind = moveAngle + 180;
  const bend = Math.max(-70, Math.min(70, wrap(behind - tailAngle))) * pull;
  const tipAngle = tailAngle + bend;
  const L = tailLength * 100;
  const c1 = { x: Math.cos(deg(tailAngle)) * L * 0.55, y: Math.sin(deg(tailAngle)) * L * 0.55 };
  const tip = { x: Math.cos(deg(tipAngle)) * L, y: Math.sin(deg(tipAngle)) * L };

  // Squash & stretch along the move, a little pop on each mood change, and idle breathing.
  const moveStretch = 1 + Math.min(0.22, speed / 60);
  const pop = sinceChange < 10 ? 1 + 0.06 * Math.sin((sinceChange / 10) * Math.PI) : 1;
  const breathe = 1 + 0.012 * Math.sin(frame / 22);
  const sy = f.stretch * breathe * pop;
  const sx = (1 / f.stretch) * pop;

  const blink = blinks ? blinkAt(frame, seed) : 0;
  const lookX = Math.max(-1, Math.min(1, f.lookX + (look?.x ?? 0)));
  const lookY = Math.max(-1, Math.min(1, f.lookY + (look?.y ?? 0)));
  const s = size / 100;
  const id = `dot-${React.useId().replace(/:/g, "")}`;

  const renderEye = (e: Eye, side: -1 | 1) => {
    const w = 32 * e.w;
    const h = 66 * e.h;
    const cx = side * 37 + lookX * 13;
    const cy = -10 + lookY * 12;
    const top = cy - h / 2;
    const bottom = cy + h / 2;
    const lidY = top + e.top * h;
    // Mirror the tilt so "+" always droops the outer corner.
    const lidRot = e.tilt * side;
    const mask = `${id}-eye${side}`;
    // Lids cut the eye through a mask (no white overdraw, so no grey seams).
    return (
      <g key={side} transform={`translate(${cx} ${cy}) scale(1 ${1 - blink * 0.92}) translate(${-cx} ${-cy})`}>
        <mask id={mask} maskUnits="userSpaceOnUse" x={-200} y={-200} width={400} height={400}>
          <rect x={cx - w / 2} y={top} width={w} height={h} rx={w / 2} fill="white" />
          {e.top > 0.001 ? (
            <rect
              x={cx - w * 2}
              y={lidY - h * 2}
              width={w * 4}
              height={h * 2}
              fill="black"
              transform={`rotate(${lidRot} ${cx} ${lidY})`}
            />
          ) : null}
          {e.bottom > 0.001 ? <circle cx={cx} cy={bottom - e.bottom * h + w * 1.4} r={w * 1.4} fill="black" /> : null}
        </mask>
        <g mask={`url(#${mask})`}>
          <rect x={cx - w / 2 - 1} y={top - 1} width={w + 2} height={h + 2} fill={colors.ink} />
          <circle cx={cx + w * 0.18} cy={top + w * 0.5} r={w * 0.16} fill={colors.white} />
        </g>
      </g>
    );
  };

  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }}
      width={1}
      height={1}
      aria-hidden
    >
      <g transform={`translate(${pos.x} ${pos.y}) scale(${s})`}>
        <path
          d={`M 0 0 Q ${c1.x} ${c1.y} ${tip.x} ${tip.y}`}
          fill="none"
          stroke={colors.yellow}
          strokeWidth={tailWidth * 100}
          strokeLinecap="round"
        />
        <g transform={`rotate(${moveAngle}) scale(${moveStretch} ${1 / moveStretch}) rotate(${-moveAngle})`}>
          <g transform={`rotate(${f.tilt}) scale(${sx} ${sy})`}>
            <circle r={100} fill={colors.white} />
            {renderEye(f.L, -1)}
            {renderEye(f.R, 1)}
            {f.mouth > 0.05 ? (
              <ellipse
                cx={lookX * 6}
                cy={50 + lookY * 4}
                rx={17 * f.mouth}
                ry={22 * f.mouth}
                fill={colors.ink}
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
    const t = interpolate(frame, [from, to], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  };
