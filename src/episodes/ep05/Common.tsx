import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { colors, fontFamily } from "../../shared/brand";
import { Dot, MoodKey } from "../../shared/Dot";
import { FadeIn } from "../../shared/FadeIn";
import { LineWipeIn } from "../../shared/LineWipe";
import { HandPose, INK, OUT, Pt, SHADOW } from "../../shared/Rig";
import { SceneShell } from "../../shared/SceneShell";
import { DotArm, TOOL_ROT, dotShoulders, hoseFrame, inHand, HOSE_LEN } from "./DotArm";
import { scene } from "./timeline";

// Shared building blocks for Ep 5 scenes S2–S7 (S1 predates it).

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = Easing.inOut(Easing.cubic);
/** 0→1 eased between t0 and t1 (seconds). */
export const kk = (t: number, t0: number, t1: number) => ease(clamp01((t - t0) / Math.max(1e-6, t1 - t0)));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerpPt = (a: Pt, b: Pt, k: number): Pt => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
/** A point flying from a to b between t0 and t1 on an arc that lifts by `lift` px. */
export const fly = (a: Pt, b: Pt, t: number, t0: number, t1: number, lift = 120): Pt => {
  const k = kk(t, t0, t1);
  const p = lerpPt(a, b, k);
  return { x: p.x, y: p.y - Math.sin(k * Math.PI) * lift };
};

/** Scene wrapper: voice + transition ("wipe" = a new stop, line wipe; "fade" = soft 10-frame fade; "cut"). */
export const Scene5: React.FC<{ id: string; enter?: "wipe" | "fade" | "cut"; children: React.ReactNode }> = ({ id, enter = "fade", children }) => {
  const S = scene(id);
  const body = <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>{children}</AbsoluteFill>;
  return (
    <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
      {enter === "wipe" ? <LineWipeIn>{body}</LineWipeIn> : enter === "fade" ? <FadeIn>{body}</FadeIn> : body}
    </SceneShell>
  );
};

/** Screen-space pill label ("Stanford, 2026"). */
export const Pill: React.FC<{ o: number; x?: number; y?: number; children: React.ReactNode }> = ({ o, x = 60, y = 60, children }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: "10px 26px", borderRadius: 999, backgroundColor: colors.panel, border: `3px solid ${colors.line}`, fontSize: 36, fontWeight: 700, color: colors.subtext, opacity: o }}>
    {children}
  </div>
);

/** Absolutely placed child, centred on (x, y), with optional scale/rotation/opacity. */
export const Place: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number; z?: number; children: React.ReactNode }> = ({ x, y, s = 1, rot = 0, o = 1, z, children }) => (
  <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: `${s}`, rotate: `${rot}deg`, opacity: o, zIndex: z }}>{children}</div>
);

/* ───────────── Dot with arms ───────────── */

export type DotArmSpec = {
  /** wrist target (screen/world, same space as Dot) */ wrist?: Pt;
  /** or: put the pointing fingertip here (pose "point") */ tip?: Pt;
  pose?: HandPose; thumb?: "up" | "down"; press?: number;
  /** a tool in the fist (drawn in the pen grip) */ tool?: React.ReactNode;
  /** a flat thing held in the fist (card, note), drawn upright */ holding?: React.ReactNode;
};
const POINT_TIP = 100 * 0.8; // wrist → index fingertip at hand size 0.8 (×k)
/** Wrist that puts the pointing fingertip on `tip`. */
export const wristForPoint = (shoulder: Pt, bodyX: number, tip: Pt, r: number): Pt => {
  const k = r / 100;
  let w = tip;
  for (let i = 0; i < 20; i++) {
    const f = hoseFrame(shoulder, w, bodyX, HOSE_LEN * k);
    const a = (f.angle * Math.PI) / 180;
    w = { x: tip.x - Math.cos(a) * POINT_TIP * k, y: tip.y - Math.sin(a) * POINT_TIP * k };
  }
  return w;
};

/** Dot (centre x,y, radius r) with optional arms. Arms default to hanging relaxed when `arms` > 0. */
export const DotActor: React.FC<{
  x: number; y: number; r?: number; mood?: MoodKey["mood"]; track?: MoodKey[]; look?: Pt; arms?: number;
  L?: DotArmSpec; R?: DotArmSpec; squash?: number; seed?: string; tailAngle?: number; opacity?: number;
}> = ({ x, y, r = 80, mood = "neutral", track, look, arms = 0, L, R, squash = 0, seed = "d5", tailAngle = 200, opacity = 1 }) => {
  const sh = dotShoulders({ x, y }, r);
  const k = r / 100;
  const arm = (side: "L" | "R", spec: DotArmSpec | undefined) => {
    const s = side === "L" ? sh.L : sh.R;
    const dir = side === "L" ? -1 : 1;
    const pose = spec?.pose ?? "relaxed";
    const wrist = spec?.tip ? wristForPoint(s, x, spec.tip, r) : spec?.wrist ?? { x: s.x + dir * 28 * k, y: s.y + 90 * k };
    return (
      <DotArm
        shoulder={s} wrist={wrist} bodyX={x} r={r} grow={arms} pose={spec?.tip ? "point" : pose}
        thumb={spec?.thumb ?? (side === "L" ? "down" : "up")} press={spec?.press ?? 0}
        held={spec?.tool || spec?.holding ? (f) => {
          const g = inHand(f, 30 * k);
          return spec?.tool
            ? <g transform={`translate(${g.x} ${g.y}) rotate(${f.angle + TOOL_ROT})`}>{spec.tool}</g>
            : <g transform={`translate(${g.x} ${g.y})`}>{spec?.holding}</g>;
        } : undefined}
      />
    );
  };
  return (
    <>
      {arms > 0 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }} aria-hidden>
          {arm("L", L)}
          {arm("R", R)}
        </svg>
      ) : null}
      <Dot x={x} y={y} size={r} mood={mood} track={track} look={look} squash={() => squash} blinks seed={seed} tailAngle={tailAngle} tailLength={1.2} tailWidth={0.24} opacity={opacity} />
    </>
  );
};

/** Dot route through stops [t, x, y, hopLift?]; returns position + a landing squash. */
export type RouteKey = [number, number, number, number?];
export const route = (keys: RouteKey[], t: number, dur = 0.5): { p: Pt; squash: number } => {
  let p: Pt = { x: keys[0][1], y: keys[0][2] };
  let squash = 0;
  for (let i = 1; i < keys.length; i++) {
    const [at, x, y, lift = 90] = keys[i];
    const t0 = at - dur;
    if (t < t0) break;
    const k = kk(t, t0, at);
    const prev = { x: keys[i - 1][1], y: keys[i - 1][2] };
    p = { x: lerp(prev.x, x, k), y: lerp(prev.y, y, k) - Math.sin(k * Math.PI) * lift };
    const d = t - at;
    if (d >= 0 && d < 0.27 && lift > 0) squash = 0.16 * Math.sin((d / 0.27) * Math.PI);
  }
  return { p, squash };
};

/* ───────────── Small props ───────────── */

/** A coral cross stamped over something; p 0→1 draws it. */
export const Cross: React.FC<{ size: number; p: number }> = ({ size, p }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%", overflow: "visible" }} aria-hidden>
    {[["M 12 12 L 88 88", 0], ["M 88 12 L 12 88", 0.5]].map(([d, at]) => {
      const q = clamp01((p - (at as number)) * 2);
      return q > 0 ? <path key={d as string} d={d as string} stroke={colors.coral} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${q} 1`} fill="none" /> : null;
    })}
  </svg>
);

const card = (w: number, h: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ width: w, height: h, borderRadius: w * 0.08, border: `${OUT}px solid ${INK}`, boxSizing: "border-box", boxShadow: `8px 10px 0 ${SHADOW}`, ...extra });

export const CodeWindow: React.FC<{ w?: number }> = ({ w = 300 }) => (
  <div style={{ ...card(w, w * 0.72, { backgroundColor: "#2B3142", overflow: "hidden" }) }}>
    <div style={{ height: w * 0.12, backgroundColor: "#3A3F4D", display: "flex", gap: w * 0.03, alignItems: "center", paddingLeft: w * 0.05 }}>
      {[colors.coral, colors.yellow, colors.mint].map((c) => <div key={c} style={{ width: w * 0.045, height: w * 0.045, borderRadius: "50%", backgroundColor: c }} />)}
    </div>
    <div style={{ padding: w * 0.07, fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: w * 0.075, color: colors.mint, lineHeight: 1.5 }}>
      {"{ if (x) {"}<br />&nbsp;&nbsp;{"run();"}<br />{"} }"}
    </div>
  </div>
);

export const Padlock: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 100 110" style={{ overflow: "visible", filter: `drop-shadow(6px 8px 0 ${SHADOW})` }} aria-hidden>
    <path d="M 28 50 V 34 C 28 6 72 6 72 34 V 50" fill="none" stroke={INK} strokeWidth={16} />
    <path d="M 28 50 V 34 C 28 6 72 6 72 34 V 50" fill="none" stroke="#B9BDC8" strokeWidth={8} />
    <rect x={14} y={48} width={72} height={56} rx={10} fill={colors.yellow} stroke={INK} strokeWidth={6} />
    <circle cx={50} cy={72} r={7} fill={INK} />
    <rect x={47} y={74} width={6} height={16} rx={3} fill={INK} />
  </svg>
);

export const KeyShape: React.FC<{ size?: number; color?: string }> = ({ size = 200, color = "#B9BDC8" }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 120 60" style={{ overflow: "visible", filter: `drop-shadow(6px 8px 0 ${SHADOW})` }} aria-hidden>
    <circle cx={28} cy={30} r={22} fill={color} stroke={INK} strokeWidth={6} />
    <circle cx={22} cy={30} r={7} fill={colors.ink} />
    <path d="M 48 24 H 114 V 36 H 104 V 46 H 94 V 36 H 84 V 44 H 74 V 36 H 48 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

/** A white speech bubble with words or grey lines. */
export const Speech: React.FC<{ w?: number; children?: React.ReactNode; tail?: "left" | "right"; tag?: string; fontSize?: number }> = ({ w = 320, children, tail = "left", tag, fontSize }) => (
  <div style={{ position: "relative", width: w, padding: w * 0.07, borderRadius: w * 0.1, backgroundColor: colors.white, border: `${OUT}px solid ${INK}`, boxSizing: "border-box", boxShadow: `8px 10px 0 ${SHADOW}`, fontSize: fontSize ?? w * 0.085, fontWeight: 700, color: INK, lineHeight: 1.2 }}>
    {children ?? (
      <div style={{ display: "flex", flexDirection: "column", gap: w * 0.04 }}>
        {[0.9, 0.65].map((lw) => <div key={lw} style={{ width: `${lw * 100}%`, height: w * 0.05, borderRadius: 6, backgroundColor: "#B9BDC8" }} />)}
      </div>
    )}
    <div style={{ position: "absolute", [tail]: w * 0.14, bottom: -w * 0.09, width: 0, height: 0, borderLeft: `${w * 0.06}px solid transparent`, borderRight: `${w * 0.06}px solid transparent`, borderTop: `${w * 0.1}px solid ${INK}` }} />
    {tag ? <div style={{ position: "absolute", right: -w * 0.06, top: -w * 0.1, padding: `${w * 0.01}px ${w * 0.05}px`, borderRadius: 999, backgroundColor: colors.periwinkle, border: `4px solid ${INK}`, fontSize: w * 0.065, fontWeight: 800 }}>{tag}</div> : null}
  </div>
);

/** A generic web page card (browser bar + grey lines + optional children). */
export const WebPage: React.FC<{ w?: number; h?: number; children?: React.ReactNode }> = ({ w = 520, h = 380, children }) => (
  <div style={{ ...card(w, h, { backgroundColor: "#F7F2E6", overflow: "hidden", position: "relative" }) }}>
    <div style={{ height: h * 0.11, backgroundColor: "#E2DCCB", display: "flex", alignItems: "center", gap: w * 0.015, paddingLeft: w * 0.03, borderBottom: `4px solid ${INK}` }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: w * 0.022, height: w * 0.022, borderRadius: "50%", backgroundColor: "#9C9384" }} />)}
      <div style={{ marginLeft: w * 0.03, width: w * 0.55, height: h * 0.05, borderRadius: 999, backgroundColor: "#FFFFFF" }} />
    </div>
    <div style={{ padding: w * 0.06, display: "flex", flexDirection: "column", gap: h * 0.045 }}>
      <div style={{ width: "55%", height: h * 0.06, borderRadius: 6, backgroundColor: "#9C9384" }} />
      {[0.92, 0.8, 0.88, 0.6].map((lw, i) => <div key={i} style={{ width: `${lw * 100}%`, height: h * 0.03, borderRadius: 4, backgroundColor: "#CFC8BA" }} />)}
    </div>
    {children}
  </div>
);

/** Big headline text (screen space). */
export const Headline: React.FC<{ o: number; y?: number; children: React.ReactNode; size?: number }> = ({ o, y = 140, children, size = 84 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontSize: size, fontWeight: 800, color: colors.white, opacity: o, lineHeight: 1.1, padding: "0 120px" }}>{children}</div>
);
