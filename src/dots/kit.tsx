// v2 Tactile Editorial kit — built only from the Dots production spec.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { loadFont as loadSpace } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import timing from "./timing.json";

const space = loadSpace("normal", { weights: ["500", "700"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["600"], subsets: ["latin"] });

export const C = {
  paper: "#F7F4EB",
  sand: "#EAE4D3",
  ink: "#141414",
  red: "#FF4D2D",
  ochre: "#F5C84C",
  slate: "#1C1E24",
  green: "#2E9E66",
  white: "#FFFFFF",
};
export const F = { head: space.fontFamily, mono: mono.fontFamily };
export const STROKE = `3px solid ${C.ink}`;
export const SHADOW = `8px 8px 0px ${C.ink}`;
export const FPS = 60;
export const SPRING = { mass: 0.9, stiffness: 170, damping: 15 };

export type SceneKey = keyof typeof timing;
export const sceneFrames = (k: SceneKey) => (timing as any)[k].frames as number;

/** Word cue lookup: cue("froze") -> frame the word starts; cue("the", 2) -> 2nd occurrence. */
export const useCues = (k: SceneKey) => {
  const words: [string, number, number][] = (timing as any)[k].words;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'\-]/g, "");
  return (word: string, nth = 1, end = false): number => {
    let n = 0;
    for (const w of words) {
      if (norm(w[0]) === norm(word) && ++n === nth) return Math.round((end ? w[2] : w[1]) * FPS);
    }
    throw new Error(`cue not found: ${k} ${word} #${nth}`);
  };
};

/** 0→1 spring starting at frame `at`. */
export const useSpring = (at: number, cfg = SPRING) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: cfg });
};
export const ramp = (f: number, a: number, b: number, from = 0, to = 1, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Paper background with ~3% grain. */
export const Paper: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = C.paper }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 4) % 3; // grain shimmers slowly, like printed stock
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden", fontFamily: F.head, color: C.ink }}>
      {children}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none" }}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed + 1} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Absolutely-positioned cardstock prop with ink stroke and hard shadow. */
export const Card: React.FC<{
  x: number; y: number; w: number; h: number; bg?: string; children?: React.ReactNode;
  style?: React.CSSProperties; radius?: number; shadow?: boolean;
}> = ({ x, y, w, h, bg = C.sand, children, style, radius = 14, shadow = true }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: w, height: h, background: bg, border: STROKE,
    borderRadius: radius, boxShadow: shadow ? SHADOW : undefined, boxSizing: "border-box", ...style,
  }}>{children}</div>
);

export const Tag: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties }> =
  ({ children, bg = C.ink, color = C.paper, size = 22, style }) => (
    <span style={{
      fontFamily: F.mono, fontWeight: 600, fontSize: size, letterSpacing: 1, background: bg, color,
      padding: `${size * 0.3}px ${size * 0.6}px`, borderRadius: 6, border: STROKE, whiteSpace: "nowrap",
      display: "inline-block", ...style,
    }}>{children}</span>
  );

/** Rubber-stamp drop: scales from 1.6 to 1 with a slight rotation, at frame `at`. */
export const Stamp: React.FC<{ at: number; x: number; y: number; rot?: number; color?: string; size?: number; children: React.ReactNode }> =
  ({ at, x, y, rot = -6, color = C.red, size = 56, children }) => {
    const s = useSpring(at, { mass: 0.6, stiffness: 260, damping: 14 });
    const f = useCurrentFrame();
    if (f < at) return null;
    return (
      <div style={{
        position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(1.7, 1, s)})`,
        opacity: Math.min(1, s * 3), fontFamily: F.head, fontWeight: 700, fontSize: size, color, border: `6px solid ${color}`,
        padding: "6px 22px", borderRadius: 10, whiteSpace: "nowrap", background: "rgba(247,244,235,0.85)", letterSpacing: 2,
      }}>{children}</div>
    );
  };

/** TheDot — vermilion agent persona with squash & stretch. */
export const TheDot: React.FC<{
  x: number; y: number; r?: number; squash?: number; look?: number; accessory?: "hat" | "clipboard" | "glass" | null;
  blink?: boolean; mood?: "happy" | "worried" | "focus"; mouthOpen?: number;
}> = ({ x, y, r = 32, squash = 0, look = 0, accessory = null, blink = true, mood = "happy", mouthOpen = 0 }) => {
  const f = useCurrentFrame();
  const sx = 1 + squash * 0.25, sy = 1 - squash * 0.25;
  const blinking = blink && f % 150 > 143;
  const ex = look * r * 0.22;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2,
      transform: `scale(${sx},${sy})`, transformOrigin: "50% 100%" }}>
      <svg width={r * 2 + 8} height={r * 2 + 8} viewBox={`-4 -4 ${r * 2 + 8} ${r * 2 + 8}`} style={{ position: "absolute", left: -4, top: -4, overflow: "visible" }}>
        <circle cx={r + 5} cy={r + 5} r={r} fill={C.ink} />
        <circle cx={r} cy={r} r={r - 1.5} fill={C.red} stroke={C.ink} strokeWidth={3} />
        {[-1, 1].map((s) => (
          blinking
            ? <line key={s} x1={r + s * r * 0.32 + ex - r * 0.1} x2={r + s * r * 0.32 + ex + r * 0.1} y1={r * 0.85} y2={r * 0.85} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
            : <ellipse key={s} cx={r + s * r * 0.32 + ex} cy={r * 0.85} rx={r * 0.1} ry={mood === "focus" ? r * 0.07 : r * 0.16} fill={C.ink} />
        ))}
        {mouthOpen > 0.02 && <path d={`M ${r * 0.7 + ex} ${r * 1.22} Q ${r + ex} ${r * (1.26 + 0.42 * mouthOpen)} ${r * 1.3 + ex} ${r * 1.22} Z`} fill={C.ink} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />}
        {mood === "happy" && mouthOpen <= 0.02 && <path d={`M ${r * 0.72 + ex} ${r * 1.25} Q ${r + ex} ${r * 1.5} ${r * 1.28 + ex} ${r * 1.25}`} stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />}
        {mood === "worried" && <path d={`M ${r * 0.75 + ex} ${r * 1.4} Q ${r + ex} ${r * 1.2} ${r * 1.25 + ex} ${r * 1.4}`} stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />}
        {mood === "focus" && <line x1={r * 0.8 + ex} x2={r * 1.2 + ex} y1={r * 1.32} y2={r * 1.32} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />}
        {accessory === "hat" && (
          <g>
            <path d={`M ${r * 0.25} ${r * 0.28} Q ${r} ${-r * 0.55} ${r * 1.75} ${r * 0.28} Z`} fill={C.ochre} stroke={C.ink} strokeWidth={3} />
            <rect x={r * 0.05} y={r * 0.22} width={r * 1.9} height={r * 0.16} rx={3} fill={C.ochre} stroke={C.ink} strokeWidth={3} />
          </g>
        )}
      </svg>
      {accessory === "clipboard" && (
        <div style={{ position: "absolute", left: r * 1.5, top: r * 0.8, width: r * 0.9, height: r * 1.15, background: C.sand, border: STROKE, borderRadius: 4, transform: "rotate(10deg)" }}>
          <div style={{ margin: "4px auto", width: "50%", height: 5, background: C.ink, borderRadius: 2 }} />
        </div>
      )}
      {accessory === "glass" && (
        <svg width={r * 1.6} height={r * 1.6} style={{ position: "absolute", left: r * 1.4, top: r * 0.6, overflow: "visible" }}>
          <line x1={r * 0.7} y1={r * 0.7} x2={r * 1.3} y2={r * 1.3} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <circle cx={r * 0.45} cy={r * 0.45} r={r * 0.42} fill="rgba(255,255,255,0.6)" stroke={C.ink} strokeWidth={4} />
        </svg>
      )}
    </div>
  );
};

/** Hop path helper: position and squash for a hop from a to b between frames t0..t1. */
export const hop = (f: number, t0: number, t1: number, a: [number, number], b: [number, number], height = 120) => {
  const t = ramp(f, t0, t1, 0, 1, Easing.inOut(Easing.quad));
  const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t) - Math.sin(Math.PI * t) * height;
  const land = f > t1 ? Math.max(0, 1 - (f - t1) / 10) : 0;
  const takeoff = f < t0 && f > t0 - 8 ? (f - (t0 - 8)) / 8 : 0;
  const squash = f >= t0 && f <= t1 ? -0.35 * Math.sin(Math.PI * t) : (land + takeoff) * 0.6 * Math.sin(Math.PI * Math.min(1, land + takeoff));
  return { x, y, squash };
};

/** Chain of hops. stops: [frame, x, y]. Idle float between hops. */
export const route = (f: number, stops: [number, number, number][], dur = 22, height = 110) => {
  let cur = { x: stops[0][1], y: stops[0][2], squash: 0 };
  for (let i = 1; i < stops.length; i++) {
    const [t, x, y] = stops[i];
    if (f >= t) {
      cur = hop(f, t, t + dur, [stops[i - 1][1], stops[i - 1][2]], [x, y], height);
    }
  }
  const idle = Math.sin(f / 18) * 4;
  return { ...cur, y: cur.y + idle };
};

/** CloudPC — monitor + browser window floating on a cloud base. Content rendered inside the slate screen. */
export const CloudPC: React.FC<{
  x: number; y: number; scale?: number; children?: React.ReactNode; w?: number; h?: number; title?: string; screenBg?: string;
}> = ({ x, y, scale = 1, children, w = 1100, h = 680, title = "CLOUD PC // ALWAYS-ON SESSION", screenBg = C.slate }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 40) * 6;
  const led = f % 60 < 40;
  return (
    <div style={{ position: "absolute", left: x, top: y + bob, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "50% 50%" }}>
      {/* cloud base */}
      <svg width={w + 240} height={200} style={{ position: "absolute", left: -120, top: h - 70, overflow: "visible" }}>
        <path d={`M 80 150 C 10 150 10 70 90 74 C 100 20 200 10 240 52 C 280 0 400 0 430 50 C ${w * 0.5} 10 ${w * 0.62} 20 ${w * 0.66} 60 C ${w * 0.75} 10 ${w * 0.92} 20 ${w * 0.95} 70 C ${w + 60} 40 ${w + 120} 60 ${w + 150} 90 C ${w + 240} 90 ${w + 240} 150 ${w + 160} 150 Z`}
          fill={C.white} stroke={C.ink} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: C.sand, border: STROKE, borderRadius: 22, boxShadow: SHADOW, overflow: "hidden" }}>
        <div style={{ height: 54, borderBottom: STROKE, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, background: C.paper }}>
          {[C.red, C.ochre, C.green].map((c, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: c, border: STROKE }} />)}
          <div style={{ flex: 1, textAlign: "center", fontFamily: F.mono, fontWeight: 600, fontSize: 22, letterSpacing: 2 }}>{title}</div>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: led ? C.green : "#9ccfb2", border: STROKE }} />
        </div>
        <div style={{ position: "absolute", left: 18, top: 72, right: 18, bottom: 18, background: screenBg, borderRadius: 12, border: STROKE, overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/** Small drawn icons (no brand marks). */
export const Icon: React.FC<{ kind: "mail" | "alarm" | "calendar" | "folder" | "bell" | "lock" | "file" | "coffee" | "doc"; size?: number; color?: string }> =
  ({ kind, size = 90, color = C.paper }) => {
    const s = size;
    const st = { stroke: C.ink, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
        {kind === "mail" && <g><rect x="8" y="22" width="84" height="58" rx="6" fill={color} {...st} /><path d="M10 26 L50 56 L90 26" fill="none" {...st} /><circle cx="86" cy="22" r="10" fill={C.red} {...st} /></g>}
        {kind === "alarm" && <g><circle cx="50" cy="56" r="34" fill={color} {...st} /><circle cx="22" cy="20" r="11" fill={C.red} {...st} /><circle cx="78" cy="20" r="11" fill={C.red} {...st} /><path d="M50 56 L50 34 M50 56 L64 64" fill="none" {...st} /></g>}
        {kind === "calendar" && <g><rect x="12" y="18" width="76" height="70" rx="6" fill={color} {...st} /><rect x="12" y="18" width="76" height="20" rx="6" fill={C.red} {...st} /><path d="M30 10 V26 M70 10 V26" {...st} /><path d="M26 52 H40 M46 52 H60 M66 52 H76 M26 68 H40 M46 68 H60" {...st} /></g>}
        {kind === "folder" && <g><path d="M8 26 H38 L46 36 H92 V82 H8 Z" fill={C.ochre} {...st} /></g>}
        {kind === "file" && <g><path d="M22 8 H62 L80 26 V92 H22 Z" fill={color} {...st} /><path d="M62 8 V26 H80" fill="none" {...st} /><path d="M32 46 H70 M32 58 H70 M32 70 H58" {...st} /><text x="51" y="40" textAnchor="middle" fontSize="14" fontFamily={F.mono} fontWeight={600}>PDF</text></g>}
        {kind === "bell" && <g><path d="M20 72 Q20 36 50 30 Q80 36 80 72 Z" fill={C.ochre} {...st} /><rect x="10" y="72" width="80" height="12" rx="4" fill={C.sand} {...st} /><circle cx="50" cy="24" r="6" fill={C.ink} /></g>}
        {kind === "lock" && <g><path d="M30 46 V32 Q30 12 50 12 Q70 12 70 32 V46" fill="none" stroke={C.ink} strokeWidth={8} /><rect x="20" y="44" width="60" height="46" rx="8" fill={C.ochre} {...st} /><circle cx="50" cy="64" r="6" fill={C.ink} /><rect x="47" y="64" width="6" height="14" fill={C.ink} /></g>}
        {kind === "coffee" && <g><path d="M20 40 H72 V76 Q72 90 58 90 H34 Q20 90 20 76 Z" fill={C.white} {...st} /><path d="M72 48 Q90 48 88 62 Q86 74 72 72" fill="none" {...st} /><path d="M36 30 Q32 22 38 14 M52 30 Q48 22 54 14" fill="none" {...st} /></g>}
        {kind === "doc" && <g><rect x="18" y="8" width="64" height="84" rx="4" fill={color} {...st} /><path d="M30 28 H70 M30 42 H70 M30 56 H70 M30 70 H54" {...st} /></g>}
      </svg>
    );
  };

/** Text written on as if typed. */
export const typed = (text: string, f: number, start: number, cps = 18) =>
  text.slice(0, Math.max(0, Math.floor(((f - start) / FPS) * cps)));

/** Mouse pointer arrow. */
export const Pointer: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <svg width={60} height={70} style={{ position: "absolute", left: x, top: y, overflow: "visible", transform: `scale(${1 - press * 0.15})` }}>
    <path d="M0 0 L0 48 L13 37 L22 58 L32 54 L23 33 L40 33 Z" fill={C.white} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
  </svg>
);

/** Spring-in transform helper for prop entrances (pop from below). */
export const popStyle = (s: number, dy = 60): React.CSSProperties => ({
  transform: `translateY(${(1 - s) * dy}px) scale(${lerp(0.6, 1, s)})`, opacity: Math.min(1, s * 2),
});

/** Scene fade in/out wrapper (soft cut from cream). */
export const SceneFade: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(ramp(f, 0, 12), ramp(f, total - 14, total, 1, 0));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Caption-free headline in brand type. */
export const Headline: React.FC<{ x: number; y: number; size?: number; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ x, y, size = 64, children, style }) => (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: F.head, fontWeight: 700, fontSize: size, color: C.ink, letterSpacing: -1, lineHeight: 1.05, ...style }}>{children}</div>
  );

/** Two-bone arm: shoulder -> elbow -> wrist. `len` = upper arm, `len2` = forearm (shorter when it points at the camera).
 *  side: +1 / -1 picks which way the elbow folds (choose the one that puts the elbow out and down). Mitten hand at the wrist. */
export const Arm: React.FC<{ sx: number; sy: number; wx: number; wy: number; side?: 1 | -1; len?: number; len2?: number; sleeve?: string; finger?: boolean }> =
  ({ sx, sy, wx, wy, side = 1, len = 120, len2, sleeve = C.red, finger = false }) => {
    const l1 = len, l2 = len2 ?? len;
    const dx = wx - sx, dy = wy - sy;
    const d = Math.max(Math.abs(l1 - l2) + 1, Math.min(Math.hypot(dx, dy), (l1 + l2) * 0.995));
    const a = Math.atan2(dy, dx);
    const k = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const ex = sx + Math.cos(a + side * k) * l1, ey = sy + Math.sin(a + side * k) * l1;
    const hx = sx + Math.cos(a) * d, hy = sy + Math.sin(a) * d;
    const fa = Math.atan2(hy - ey, hx - ex);
    return (
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        <polyline points={`${sx},${sy} ${ex},${ey} ${hx},${hy}`} fill="none" stroke={C.ink} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={`${sx},${sy} ${ex},${ey} ${hx},${hy}`} fill="none" stroke={sleeve} strokeWidth={23} strokeLinecap="round" strokeLinejoin="round" />
        <g transform={`translate(${hx},${hy}) rotate(${(fa * 180) / Math.PI})`}>
          {finger && <rect x={8} y={-7} width={34} height={14} rx={7} fill={C.sand} stroke={C.ink} strokeWidth={3} />}
          <ellipse cx={8} cy={0} rx={19} ry={16} fill={C.sand} stroke={C.ink} strokeWidth={3} />
        </g>
      </svg>
    );
  };

/** Simple editorial bust (head + torso). Arms are drawn separately with <Arm>. */
export const Bust: React.FC<{ x: number; y: number; shirt?: string; tilt?: number; eyes?: "open" | "calm" | "stress"; look?: number }> =
  ({ x, y, shirt = C.ochre, tilt = 0, eyes = "open", look = 0 }) => {
    const f = useCurrentFrame();
    const blink = f % 170 > 163;
    return (
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        <g transform={`translate(${x},${y}) rotate(${tilt})`}>
          <path d="M -110 200 Q -110 70 0 70 Q 110 70 110 200 Z" fill={shirt} stroke={C.ink} strokeWidth={3} />
          <rect x={-18} y={40} width={36} height={38} fill={C.sand} stroke={C.ink} strokeWidth={3} />
          <circle cx={6} cy={-2} r={62} fill={C.ink} />
          <circle cx={0} cy={-8} r={62} fill={C.sand} stroke={C.ink} strokeWidth={3} />
          <path d="M -60 -26 Q -50 -80 0 -72 Q 56 -78 62 -22 Q 40 -50 -10 -46 Q -40 -48 -60 -26 Z" fill={C.ink} />
          {eyes === "calm" || blink
            ? <g stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round"><path d="M -30 -2 Q -22 4 -14 -2" /><path d="M 14 -2 Q 22 4 30 -2" /></g>
            : <g fill={C.ink}><circle cx={-22 + look * 7} cy={-4} r={6} /><circle cx={22 + look * 7} cy={-4} r={6} /></g>}
          {eyes === "stress"
            ? <path d="M -16 28 Q 0 18 16 28" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            : <path d="M -16 22 Q 0 34 16 22" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />}
        </g>
      </svg>
    );
  };
