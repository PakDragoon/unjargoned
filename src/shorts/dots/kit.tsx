// Reusable characters & props for the ChatGPT Dots Short (spec §4). All drawn in code, ink outlines + hard offset shadows.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DROP, HEAD, MONO, SHADOW, STROKE, W, H, easeInOut, lerp, wobble } from "./theme";

type XY = [number, number];
const abs: React.CSSProperties = { position: "absolute" };
export const Overlay: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ ...abs, left: 0, top: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);

/* ───────────── Paper background with ~3% SVG grain ───────────── */
export const Paper: React.FC<{ color?: string; children?: React.ReactNode }> = ({ color = C.paper, children }) => (
  <AbsoluteFill style={{ background: color, overflow: "hidden" }}>
    {children}
    <svg width={W} height={H} style={{ ...abs, inset: 0, opacity: 0.03, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

/* ───────────── TheDot: route, squash & stretch, dashed trail ───────────── */
export type Move = { at: number; dur: number; to: XY; arc?: number };

const posAt = (t: number, start: XY, moves: Move[]): { p: XY; moving: boolean } => {
  let cur = start;
  for (const m of moves) {
    if (t < m.at) break;
    if (t >= m.at + m.dur) {
      cur = m.to;
      continue;
    }
    const k = easeInOut((t - m.at) / m.dur);
    const arc = m.arc ?? 0;
    return { p: [lerp(cur[0], m.to[0], k), lerp(cur[1], m.to[1], k) - arc * 4 * k * (1 - k)], moving: true };
  }
  return { p: cur, moving: false };
};

export type DotPose = { x: number; y: number; rot: number; sx: number; sy: number; trail: XY[] };

/** Where TheDot is at time t (s) and how it deforms. Landing squash + take-off crouch come from the move list. */
export const dotPose = (t: number, start: XY, moves: Move[], extraSquash = 0): DotPose => {
  const { p, moving } = posAt(t, start, moves);
  let rot = 0;
  let sx = 1;
  let sy = 1;
  if (moving) {
    const a = posAt(t - 0.01, start, moves).p;
    const b = posAt(t + 0.01, start, moves).p;
    const vx = (b[0] - a[0]) / 0.02;
    const vy = (b[1] - a[1]) / 0.02;
    const speed = Math.hypot(vx, vy);
    rot = (Math.atan2(vy, vx) * 180) / Math.PI;
    const s = 1 + Math.min(0.5, speed / 3500);
    sx = s;
    sy = 1 / s;
  } else {
    let land = 0;
    let crouch = 0;
    for (const m of moves) {
      const end = m.at + m.dur;
      if (t >= end && t - end < 0.6) land = wobble(t, end, 8, 24) * 0.32;
      if (t < m.at && m.at - t < 0.12) crouch = 0.22 * (1 - (m.at - t) / 0.12);
    }
    const q = land + crouch + extraSquash;
    sy = 1 - q;
    sx = 1 + q * 0.8;
  }
  const trail: XY[] = [];
  for (let i = 0; i <= 16; i++) {
    const s = posAt(t - i * 0.022, start, moves);
    if (!s.moving && i > 0) break;
    trail.push(s.p);
  }
  // Squash anchors at the bottom of the dot when not moving (sits on surfaces).
  const y = moving ? p[1] : p[1] + 28 * (1 - sy);
  return { x: p[0], y, rot, sx, sy, trail: trail.length > 2 ? trail : [] };
};

export const TheDot: React.FC<{ pose: DotPose; r?: number; opacity?: number; trailOn?: "paper" | "slate" }> = ({
  pose,
  r = 28,
  opacity = 1,
  trailOn = "paper",
}) => (
  <Overlay style={{ opacity }}>
    {pose.trail.length > 0 && (
      <polyline
        points={pose.trail.map((q) => q.join(",")).join(" ")}
        fill="none"
        stroke={trailOn === "slate" ? C.paper : C.ink}
        strokeOpacity={0.55}
        strokeWidth={3}
        strokeDasharray="7 9"
        strokeLinecap="round"
      />
    )}
    <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.rot}) scale(${pose.sx} ${pose.sy})`} style={{ filter: trailOn === "paper" ? "drop-shadow(4px 4px 0px #141414)" : undefined }}>
      <circle r={r} fill={C.red} stroke={C.ink} strokeWidth={STROKE} />
      <ellipse cx={-r * 0.35} cy={-r * 0.38} rx={r * 0.22} ry={r * 0.13} fill="#FF8A72" transform={`rotate(-30 ${-r * 0.35} ${-r * 0.38})`} />
    </g>
  </Overlay>
);

/* ───────────── LaptopProp: hinge 0–105°, keyboard grid, ZZZ badge ───────────── */
/** (x, y) = centre of the hinge. angle in degrees: 0 = shut, 105 = open. */
export const LaptopProp: React.FC<{ x: number; y: number; angle: number; scale?: number; zzz?: number; bounce?: number }> = ({
  x,
  y,
  angle,
  scale = 1,
  zzz = 0,
  bounce = 0,
}) => {
  const L = 200;
  const K = 0.42; // depth foreshortening
  const a = (Math.max(0, angle) * Math.PI) / 180;
  const tipY = -L * Math.sin(a) + L * Math.cos(a) * K;
  const deckD = L * K;
  const hw = 205;
  const fw = 232;
  const sq = 1 - bounce * 0.08;
  const keys: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    const v0 = 12 + r * 14;
    const v1 = v0 + 10;
    for (let c = 0; c < 12; c++) {
      const u0 = -0.8 + c * 0.135;
      const w0 = lerp(hw, fw, v0 / deckD);
      const w1 = lerp(hw, fw, v1 / deckD);
      keys.push(
        <polygon
          key={`${r}-${c}`}
          points={`${u0 * w0},${v0} ${(u0 + 0.11) * w0},${v0} ${(u0 + 0.11) * w1},${v1} ${u0 * w1},${v1}`}
          fill="none"
          stroke={C.ink}
          strokeWidth={1.6}
          strokeOpacity={0.6}
        />,
      );
    }
  }
  const showScreen = angle > 75;
  return (
    <Overlay>
      <g transform={`translate(${x} ${y}) scale(${scale} ${scale * sq})`} style={{ filter: DROP }}>
        {/* base / deck */}
        <polygon points={`${-fw},${deckD} ${fw},${deckD} ${fw},${deckD + 18} ${-fw},${deckD + 18}`} fill={C.sand} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        <polygon points={`${-hw},0 ${hw},0 ${fw},${deckD} ${-fw},${deckD}`} fill={C.sand} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        {keys}
        <polygon points={`${-50},${deckD - 14} ${50},${deckD - 14} ${54},${deckD - 4} ${-54},${deckD - 4}`} fill="none" stroke={C.ink} strokeWidth={1.6} strokeOpacity={0.6} />
        {/* lid */}
        {angle <= 6 ? (
          <>
            <polygon points={`${-hw - 2},-4 ${hw + 2},-4 ${fw + 2},${deckD - 2} ${-fw - 2},${deckD - 2}`} fill={C.sand} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
            <polygon points={`${-fw - 2},${deckD - 2} ${fw + 2},${deckD - 2} ${fw + 2},${deckD + 4} ${-fw - 2},${deckD + 4}`} fill={C.ink} />
            <circle cx={0} cy={deckD * 0.45} r={9} fill="none" stroke={C.ink} strokeWidth={2.4} />
          </>
        ) : (
          <>
            <polygon points={`${-hw},0 ${hw},0 ${hw},${tipY} ${-hw},${tipY}`} fill={showScreen ? C.paper : C.sand} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
            {showScreen && (
              <g opacity={Math.min(1, (angle - 75) / 20)}>
                <rect x={-hw + 18} y={tipY + 18} width={hw * 2 - 36} height={-tipY - 36} rx={8} fill={C.sand} stroke={C.ink} strokeWidth={2} />
                {[0, 1, 2].map((i) => (
                  <rect key={i} x={-hw + 44} y={tipY + 46 + i * 34} width={[220, 300, 160][i]} height={12} rx={6} fill={C.ink} opacity={0.25} />
                ))}
              </g>
            )}
          </>
        )}
      </g>
      {zzz > 0.01 && (
        <g transform={`translate(${x + 250 * scale} ${y - 70}) scale(${zzz}) rotate(-8)`} style={{ filter: DROP }}>
          <rect x={-70} y={-30} width={140} height={60} rx={30} fill={C.yellow} stroke={C.ink} strokeWidth={STROKE} />
          <text x={0} y={11} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={30} fill={C.ink}>
            Z<tspan fontSize={24}>z</tspan>
            <tspan fontSize={18}>z</tspan>
          </text>
        </g>
      )}
    </Overlay>
  );
};

/** Little dust-puff lines that burst from the laptop's sides on the slam. p = 0..1 progress. */
export const DustPuff: React.FC<{ x: number; y: number; p: number; spread?: number }> = ({ x, y, p, spread = 250 }) => {
  if (p <= 0 || p >= 1) return null;
  const e = 1 - Math.pow(1 - p, 2);
  const o = 1 - p;
  const lines = [
    [-1, -0.5],
    [-1, 0],
    [-1, 0.5],
    [1, -0.5],
    [1, 0],
    [1, 0.5],
  ];
  return (
    <Overlay>
      {lines.map(([sx, sy], i) => {
        const x0 = x + sx * (spread + e * 30);
        const y0 = y + sy * 40 * (0.5 + e);
        return (
          <line key={i} x1={x0} y1={y0} x2={x0 + sx * (20 + e * 50)} y2={y0 + sy * (10 + e * 25)} stroke={C.ink} strokeWidth={STROKE} strokeLinecap="round" opacity={o} />
        );
      })}
    </Overlay>
  );
};

/* ───────────── CloudWindow ───────────── */
export type Rect = { cx: number; cy: number; w: number; h: number };
export const BAR = 56;
/** Interior top-left of a CloudWindow, in screen px. */
export const interior = (r: Rect) => ({ x: r.cx - r.w / 2 + STROKE, y: r.cy - r.h / 2 + BAR, w: r.w - STROKE * 2, h: r.h - BAR - STROKE });
/** Normalized interior coords (0..1) → screen px. */
export const inWin = (r: Rect, u: number, v: number): XY => {
  const i = interior(r);
  return [i.x + u * i.w, i.y + v * i.h];
};

export const CloudWindow: React.FC<{ rect: Rect; scale?: number; opacity?: number; url?: string; clock?: string; children?: React.ReactNode }> = ({
  rect,
  scale = 1,
  opacity = 1,
  url = "cloud-pc://dot-session",
  clock,
  children,
}) => (
  <div
    style={{
      ...abs,
      left: rect.cx - rect.w / 2,
      top: rect.cy - rect.h / 2,
      width: rect.w,
      height: rect.h,
      borderRadius: 24,
      border: `${STROKE}px solid ${C.ink}`,
      boxShadow: SHADOW,
      background: C.slate,
      overflow: "hidden",
      transform: `scale(${scale})`,
      opacity,
      boxSizing: "border-box",
    }}
  >
    <div style={{ height: BAR, background: C.paper, borderBottom: `${STROKE}px solid ${C.ink}`, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", boxSizing: "border-box" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: C.ink }} />
      ))}
      <div style={{ marginLeft: 12, flex: 1, height: 32, borderRadius: 16, border: `2.5px solid ${C.ink}`, background: C.sand, display: "flex", alignItems: "center", padding: "0 14px", fontFamily: MONO, fontWeight: 600, fontSize: 18, color: C.ink, overflow: "hidden", whiteSpace: "nowrap" }}>
        {url}
      </div>
      {clock && <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 18, color: C.ink, whiteSpace: "nowrap" }}>{clock}</div>}
    </div>
    <div style={{ position: "relative", width: "100%", height: rect.h - BAR - STROKE * 2 }}>{children}</div>
  </div>
);

/** Animated dashed tether between two points. */
export const Tether: React.FC<{ from: XY; to: XY; t: number; draw?: number; opacity?: number }> = ({ from, to, t, draw = 1, opacity = 1 }) => {
  if (draw <= 0) return null;
  const end: XY = [lerp(from[0], to[0], draw), lerp(from[1], to[1], draw)];
  const mx = (from[0] + end[0]) / 2 + 40;
  const my = (from[1] + end[1]) / 2;
  return (
    <Overlay style={{ opacity }}>
      <path d={`M${from[0]},${from[1]} Q${mx},${my} ${end[0]},${end[1]}`} fill="none" stroke={C.ink} strokeWidth={STROKE} strokeDasharray="12 12" strokeDashoffset={-t * 70} strokeLinecap="round" />
      <circle cx={from[0]} cy={from[1]} r={8} fill={C.yellow} stroke={C.ink} strokeWidth={STROKE} />
      <circle cx={end[0]} cy={end[1]} r={8} fill={C.yellow} stroke={C.ink} strokeWidth={STROKE} />
    </Overlay>
  );
};

/* ───────────── Badges, pills ───────────── */
export const MoonBadge: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0.01 ? null : (
    <Overlay>
      <defs>
        <mask id="crescent">
          <rect x={-60} y={-60} width={120} height={120} fill="white" />
          <circle cx={20} cy={-14} r={34} fill="black" />
        </mask>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(${(1 - s) * -30})`} style={{ filter: DROP }}>
        <circle r={74} fill={C.sand} stroke={C.ink} strokeWidth={STROKE} />
        <g mask="url(#crescent)">
          <circle r={44} fill={C.yellow} stroke={C.ink} strokeWidth={STROKE} />
        </g>
        <circle cx={20} cy={-14} r={34} fill="none" stroke={C.ink} strokeWidth={STROKE} strokeDasharray="0" clipPath="url(#cmoon)" opacity={0} />
        {[
          [44, 38, 5],
          [-40, -44, 4],
          [50, -40, 3.5],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={C.ink} />
        ))}
      </g>
    </Overlay>
  );

export const Pill: React.FC<{
  x: number;
  y: number;
  text: React.ReactNode;
  s?: number;
  rot?: number;
  bg?: string;
  color?: string;
  size?: number;
  mono?: boolean;
  pad?: string;
}> = ({ x, y, text, s = 1, rot = 0, bg = C.paper, color = C.ink, size = 34, mono = false, pad = "12px 26px" }) =>
  s <= 0.01 ? null : (
    <div style={{ ...abs, left: x, top: y, transform: `translate(-50%, -50%) scale(${s}) rotate(${rot}deg)` }}>
      <div
        style={{
          background: bg,
          color,
          border: `${STROKE}px solid ${C.ink}`,
          boxShadow: SHADOW,
          borderRadius: 999,
          padding: pad,
          fontFamily: mono ? MONO : HEAD,
          fontWeight: mono ? 600 : 700,
          fontSize: size,
          letterSpacing: mono ? "0.02em" : "-0.02em",
          whiteSpace: "nowrap",
          lineHeight: 1.1,
        }}
      >
        {text}
      </div>
    </div>
  );

/** Tactile card (sand, ink outline, hard shadow). */
export const Card: React.FC<{ x: number; y: number; w: number; h: number; s?: number; rot?: number; bg?: string; children?: React.ReactNode; radius?: number; style?: React.CSSProperties }> = ({
  x,
  y,
  w,
  h,
  s = 1,
  rot = 0,
  bg = C.sand,
  children,
  radius = 18,
  style,
}) =>
  s <= 0.01 ? null : (
    <div
      style={{
        ...abs,
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        background: bg,
        border: `${STROKE}px solid ${C.ink}`,
        boxShadow: SHADOW,
        borderRadius: radius,
        transform: `scale(${s}) rotate(${rot}deg)`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );

/* ───────────── Icons (drawn, no real logos) ───────────── */
const svgBox = (w: number, h: number, children: React.ReactNode) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", display: "block" }}>
    {children}
  </svg>
);
export const EnvelopeIcon: React.FC<{ w?: number; flap?: number; unread?: boolean }> = ({ w = 120, flap = 0, unread = false }) => {
  const h = w * 0.68;
  return svgBox(
    w,
    h,
    <>
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={8} fill={C.paper} stroke={C.ink} strokeWidth={STROKE} />
      <polyline points={`4,6 ${w / 2},${h * (0.58 - flap * 0.5)} ${w - 4},6`} fill="none" stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
      {unread && <circle cx={w - 6} cy={6} r={w * 0.11} fill={C.red} stroke={C.ink} strokeWidth={STROKE} />}
    </>,
  );
};
export const CalendarIcon: React.FC<{ w?: number; mark?: number; markCell?: number }> = ({ w = 120, mark = 0, markCell = 9 }) => {
  const h = w * 0.95;
  const cells: React.ReactNode[] = [];
  const cw = (w - 20) / 4;
  const ch = (h - w * 0.32 - 16) / 3;
  for (let i = 0; i < 12; i++) {
    const cx = 10 + (i % 4) * cw;
    const cy = w * 0.32 + 6 + Math.floor(i / 4) * ch;
    cells.push(
      <rect key={i} x={cx + 3} y={cy + 3} width={cw - 6} height={ch - 6} rx={3} fill={i === markCell && mark > 0 ? C.red : "none"} fillOpacity={Math.min(1, mark * 1.5)} stroke={C.ink} strokeWidth={1.8} />,
    );
    if (i === markCell && mark > 0)
      cells.push(
        <ellipse key="ring" cx={cx + cw / 2} cy={cy + ch / 2} rx={cw * 0.75} ry={ch * 0.75} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray={`${mark * 200} 400`} transform={`rotate(-90 ${cx + cw / 2} ${cy + ch / 2})`} />,
      );
  }
  return svgBox(
    w,
    h,
    <>
      <rect x={2} y={6} width={w - 4} height={h - 8} rx={8} fill={C.paper} stroke={C.ink} strokeWidth={STROKE} />
      <rect x={2} y={6} width={w - 4} height={w * 0.26} rx={8} fill={C.red} stroke={C.ink} strokeWidth={STROKE} />
      <line x1={w * 0.3} y1={0} x2={w * 0.3} y2={18} stroke={C.ink} strokeWidth={STROKE + 1} strokeLinecap="round" />
      <line x1={w * 0.7} y1={0} x2={w * 0.7} y2={18} stroke={C.ink} strokeWidth={STROKE + 1} strokeLinecap="round" />
      {cells}
    </>,
  );
};
export const BagIcon: React.FC<{ w?: number }> = ({ w = 110 }) => {
  const h = w * 1.05;
  return svgBox(
    w,
    h,
    <>
      <path d={`M${w * 0.32},${h * 0.32} C${w * 0.32},${h * 0.02} ${w * 0.68},${h * 0.02} ${w * 0.68},${h * 0.32}`} fill="none" stroke={C.ink} strokeWidth={STROKE + 1} strokeLinecap="round" />
      <path d={`M${w * 0.1},${h * 0.28} L${w * 0.9},${h * 0.28} L${w * 0.97},${h - 3} L${w * 0.03},${h - 3} Z`} fill={C.yellow} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
      <circle cx={w * 0.32} cy={h * 0.42} r={4} fill={C.ink} />
      <circle cx={w * 0.68} cy={h * 0.42} r={4} fill={C.ink} />
    </>,
  );
};
export const Check: React.FC<{ x: number; y: number; s: number; size?: number }> = ({ x, y, s, size = 54 }) =>
  s <= 0.01 ? null : (
    <div style={{ ...abs, left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${s}) rotate(${(1 - s) * 40}deg)` }}>
      {svgBox(
        size,
        size,
        <>
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill={C.green} stroke={C.ink} strokeWidth={STROKE} />
          <polyline points={`${size * 0.27},${size * 0.52} ${size * 0.44},${size * 0.68} ${size * 0.74},${size * 0.34}`} fill="none" stroke={C.paper} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </>,
      )}
    </div>
  );

export const StopHand: React.FC<{ size?: number }> = ({ size = 90 }) =>
  svgBox(
    size,
    size,
    <g transform={`scale(${size / 100})`}>
      <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill={C.red} stroke={C.ink} strokeWidth={STROKE * 1.2} strokeLinejoin="round" />
      <path
        d="M36 72 L33 44 Q33 38 38 38 Q42 38 42 44 L42 30 Q42 25 46.5 25 Q51 25 51 30 L51 27 Q51 22 55.5 22 Q60 22 60 27 L60 31 Q60 26 64.5 26 Q69 26 69 31 L69 58 Q69 78 52 80 Q40 80 36 72 Z"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </g>,
  );

/* ───────────── Flip clock "24 / 7" ───────────── */
export const FlipClock: React.FC<{ t: number; s?: number; tick?: number }> = ({ t, s = 1, tick = 0.5 }) => {
  const ph = (t % tick) / tick; // flap progress for the right panel each tick
  const flap = ph < 0.35 ? ph / 0.35 : 1;
  const panel = (txt: string, flips: boolean, key: string) => (
    <div key={key} style={{ position: "relative", width: 74, height: 92, background: C.ink, borderRadius: 10, border: `${STROKE}px solid ${C.ink}`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 600, fontSize: 56, color: C.paper }}>{txt}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, height: 3, background: C.slate }} />
      {flips && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 46,
            background: "#2A2D35",
            transformOrigin: "50% 100%",
            transform: `perspective(200px) rotateX(${-flap * 180}deg)`,
            opacity: flap < 1 ? 0.9 : 0,
          }}
        />
      )}
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 10, background: C.sand, border: `${STROKE}px solid ${C.ink}`, borderRadius: 16, boxShadow: SHADOW, transform: `scale(${s})`, transformOrigin: "100% 0%" }}>
      {panel("24", false, "a")}
      <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 44, color: C.ink }}>/</div>
      {panel("7", true, "b")}
    </div>
  );
};
