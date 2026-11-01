import React from "react";
import { interpolate } from "remotion";
import { colors } from "../../shared/brand";
import { pop, ramp, sec } from "../../shared/motion";

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

/** The exam paper: small at the S2 desk; big in the S3 viewer test (blank = 0, a confident guess = maybe 1). */
export type SheetTimes = { write: number; sounds: number; zero: number; maybe: number; correct: number };
export const ExamSheet: React.FC<{ frame: number; big: boolean; t?: SheetTimes }> = ({ frame, big, t = { write: 99, sounds: 99, zero: 99, maybe: 99, correct: 99 } }) => {
  const scribble = "Around 1350";
  const shown = Math.floor(interpolate(frame, [sec(t.write + 0.15), sec(t.sounds + 0.5)], [0, scribble.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const zero = pop(frame, t.zero);
  const maybe = pop(frame, t.maybe);
  const tick = ramp(frame, t.correct, 0.35);
  const rowB = ramp(frame, t.write - 0.3, 0.3);
  return (
    <div
      style={{
        width: big ? 1060 : 620, height: big ? 700 : 420, borderRadius: 24, backgroundColor: PAPER, color: colors.ink,
        padding: big ? "52px 64px" : "36px 44px", boxSizing: "border-box", transform: `rotate(${big ? -1.2 : -4}deg)`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", gap: big ? 40 : 26,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: big ? 56 : 48, fontWeight: 800, letterSpacing: 2 }}>EXAM</div>
        <div style={{ fontSize: big ? 44 : 0, fontWeight: 600, opacity: 0.55 }}>Name: Dot</div>
      </div>
      {big ? (
        <>
          <div style={{ fontSize: 60, fontWeight: 700 }}>Q7. When was the castle built?</div>
          {[0, 1].map((row) => (
            <div key={row} style={{ display: "flex", alignItems: "center", gap: 32, opacity: row === 0 ? 1 : rowB }}>
              <div style={{ fontSize: 56, fontWeight: 800, width: 60, opacity: 0.6 }}>{row === 0 ? "A" : "B"}</div>
              <div
                style={{
                  width: 520, height: 110, borderRadius: 16, border: `5px solid ${colors.ink}`, boxSizing: "border-box",
                  display: "flex", alignItems: "center", paddingLeft: 26, fontSize: 60, fontWeight: 700, color: PEN,
                  fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden",
                }}
              >
                {row === 1 ? scribble.slice(0, shown) : ""}
              </div>
              {row === 0 ? (
                <div style={{ fontSize: 96, fontWeight: 800, color: RED, transform: `rotate(-10deg) scale(${Math.min(1.15, zero * 1.0)})`, opacity: Math.min(1, zero) }}>0</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, maybe), transform: `scale(${Math.min(1.1, maybe)})` }}>
                  <div style={{ fontSize: 96, fontWeight: 800, color: tick > 0.5 ? "#1F9D74" : "#C98A00" }}>{tick > 0.5 ? "1" : "1?"}</div>
                  <svg width={84} height={84} viewBox="0 0 84 84" aria-hidden style={{ opacity: tick }}>
                    <path d="M 12 44 L 34 66 L 74 18" fill="none" stroke="#1F9D74" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        [0, 1, 2, 3].map((i) => <div key={i} style={{ height: 22, borderRadius: 11, width: `${[92, 70, 84, 55][i]}%`, backgroundColor: "rgba(20,22,28,0.18)" }} />)
      )}
    </div>
  );
};

