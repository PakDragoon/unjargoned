import React from "react";
import { colors } from "../../shared/brand";

// Ep 3's recurring props (the exam analogy runs through S2, S3b, S5 and S6). Scene-specific drawings stay in the scene.
export const PAPER = "#F3EBDD";
export const PEN = "#3B5BDB"; // student's handwriting
export const RED = "#E0533B"; // marker's red pen / stamps on paper
export const GREEN = "#1F9D74"; // tick on paper

/** A hand-drawn strike-through that grows left→right over its parent (parent must be position: relative). */
export const Strike: React.FC<{ p: number; color?: string; width?: number }> = ({ p, color = colors.coral, width = 12 }) => (
  <span
    style={{
      position: "absolute", left: -10, top: "52%", height: width, borderRadius: width / 2, backgroundColor: color,
      width: `calc(${p * 100}% + ${p * 20}px)`, transform: "rotate(-3deg)",
    }}
  />
);

/** Tick or cross as drawn by a marker; `p` draws the stroke. */
export const Mark: React.FC<{ kind: "tick" | "cross"; p: number; size?: number; color?: string }> = ({ kind, p, size = 84, color }) => (
  <svg width={size} height={size} viewBox="0 0 84 84" aria-hidden style={{ opacity: p > 0 ? 1 : 0 }}>
    {kind === "tick" ? (
      <path d="M 12 44 L 34 66 L 74 18" fill="none" stroke={color ?? GREEN} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    ) : (
      <path d="M 16 16 L 68 68 M 68 16 L 16 68" fill="none" stroke={color ?? RED} strokeWidth={14} strokeLinecap="round" pathLength={2} strokeDasharray={2} strokeDashoffset={2 - 2 * p} />
    )}
  </svg>
);

/** A rubber stamp that slams in (p = the pop spring, 0→1). */
export const Stamp: React.FC<{ p: number; color?: string; size?: number; rotate?: number; children: React.ReactNode }> = ({ p, color = RED, size = 72, rotate = -12, children }) => (
  <div
    style={{
      display: "inline-block", padding: "12px 32px", border: `8px solid ${color}`, borderRadius: 16, color, fontSize: size, fontWeight: 800,
      letterSpacing: 4, whiteSpace: "nowrap", transform: `rotate(${rotate}deg) scale(${1.6 - 0.6 * Math.min(1, p)})`, opacity: Math.min(1, p),
    }}
  >
    {children}
  </div>
);

/** The exam book: periwinkle cover, strap and yellow padlock; `open` 0→1 pops the lock and swings the cover open. */
export const ExamBook: React.FC<{ s?: number; open?: number }> = ({ s = 1, open = 0 }) => (
  <div style={{ position: "relative", width: 340, height: 420, transform: `rotate(4deg) scale(${s})` }}>
    {/* left page of the spread (appears as the cover swings past) */}
    <div style={{ position: "absolute", top: 0, bottom: 0, left: -330, width: 340, borderRadius: "20px 0 0 20px", backgroundColor: "#E9DFCC", boxShadow: "0 24px 50px rgba(0,0,0,0.35)", opacity: open > 0.55 ? 1 : 0, padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22 }}>
      {[80, 88, 64, 82, 70].map((w, i) => (
        <div key={i} style={{ height: 16, borderRadius: 8, width: `${w}%`, backgroundColor: "rgba(20,22,28,0.2)" }} />
      ))}
    </div>
    {/* pages (seen once the cover swings) */}
    <div style={{ position: "absolute", inset: 0, borderRadius: 20, backgroundColor: PAPER, boxShadow: "0 24px 50px rgba(0,0,0,0.35)", padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22 }}>
      {[90, 70, 84, 60, 78].map((w, i) => (
        <div key={i} style={{ height: 16, borderRadius: 8, width: `${w}%`, backgroundColor: "rgba(20,22,28,0.2)" }} />
      ))}
    </div>
    <div style={{ position: "absolute", inset: 0, transformOrigin: "left center", transform: `perspective(1200px) rotateY(${-150 * open}deg)`, opacity: open > 0.55 ? 0 : 1 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 20, backgroundColor: colors.periwinkle }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 34, borderRadius: "20px 0 0 20px", backgroundColor: "#6F86E0" }} />
      <div style={{ position: "absolute", left: 70, right: 40, top: 70, height: 18, borderRadius: 9, backgroundColor: "rgba(20,22,28,0.25)" }} />
      <div style={{ position: "absolute", left: 70, right: 100, top: 110, height: 18, borderRadius: 9, backgroundColor: "rgba(20,22,28,0.25)" }} />
      <div style={{ position: "absolute", left: -10, right: -10, top: 200, height: 40, backgroundColor: colors.lineStrong, opacity: 1 - Math.min(1, open * 4) }} />
    </div>
    <svg style={{ position: "absolute", left: 120, top: 150, transform: `translate(${open * 160}px, ${-open * 260}px) rotate(${open * 40}deg)`, opacity: 1 - Math.min(1, open * 1.6) }} width={110} height={130} viewBox="0 0 110 130" aria-hidden>
      <path d={open > 0 ? "M 28 62 V 30 a 27 27 0 0 1 54 0 V 40" : "M 28 62 V 40 a 27 27 0 0 1 54 0 V 62"} fill="none" stroke={colors.yellow} strokeWidth={14} />
      <rect x={10} y={58} width={90} height={68} rx={14} fill={colors.yellow} />
      <circle cx={55} cy={88} r={9} fill={colors.ink} />
      <rect x={51} y={92} width={8} height={18} rx={4} fill={colors.ink} />
    </svg>
  </div>
);

/** Dot's pencil, held at Dot's lower left (pass Dot's centre); render it before <Dot> so Dot covers the end. */
export const Pencil: React.FC<{ x: number; y: number; o: number; wiggle?: number }> = ({ x, y, o, wiggle = 0 }) => (
  <svg
    style={{ position: "absolute", left: x - 130 + wiggle, top: y - 50, opacity: o, transform: "rotate(35deg)", transformOrigin: "50% 100%" }}
    width={40} height={170} viewBox="0 0 40 170" aria-hidden
  >
    <rect x={6} y={0} width={28} height={24} rx={6} fill={colors.coral} />
    <rect x={6} y={22} width={28} height={10} fill={colors.lineStrong} />
    <rect x={6} y={32} width={28} height={104} fill={colors.yellow} />
    <path d="M 6 136 L 34 136 L 20 168 Z" fill={PAPER} />
    <path d="M 15 156 L 25 156 L 20 168 Z" fill={colors.ink} />
  </svg>
);

/** Magnifying glass (yellow = the thing being checked). */
export const Magnifier: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
    <circle cx={86} cy={86} r={56} fill="rgba(255,201,60,0.12)" stroke={colors.yellow} strokeWidth={14} />
    <line x1={128} y1={128} x2={180} y2={180} stroke={colors.yellow} strokeWidth={22} strokeLinecap="round" />
  </svg>
);

/** A voice waveform strip: identical shape for every bubble (that's the point in S4/S6). */
export const Wave: React.FC<{ w: number; p: number; color?: string; seed?: number }> = ({ w, p, color = colors.subtext, seed = 0 }) => {
  const bars = 22;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 70, width: w }}>
      {Array.from({ length: bars }, (_, i) => {
        const h = 16 + 44 * Math.abs(Math.sin(i * 0.9 + seed) * Math.cos(i * 0.37));
        return <div key={i} style={{ flex: 1, height: h * Math.min(1, Math.max(0, p * bars - i)), borderRadius: 6, backgroundColor: color }} />;
      })}
    </div>
  );
};
