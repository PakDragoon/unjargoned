import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../../shared/brand";

// Ep 1 thumbnail style: warm blurred yellow background with bokeh, a shaded "3D" Dot with brow,
// mouth and an arm holding the hero, a glowing hero object, and big white outlined words top-right.
const { fontFamily: inter } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });

/** Warm, out-of-focus backdrop (drawn shapes, blurred), darker at the edges. */
export const WarmBackdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 55% 45%, #FFD45C 0%, #E9A920 55%, #9A6410 100%)", overflow: "hidden" }}>
    <AbsoluteFill style={{ filter: "blur(18px)", opacity: 0.55 }}>
      {[[180, 120, 140], [420, 520, 110], [980, 140, 90], [1120, 560, 160], [700, 330, 70], [300, 640, 90], [880, 650, 60]].map(([x, y, r], i) => (
        <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: "#FFF1B8" }} />
      ))}
      {/* a blurred chat window shape */}
      <div style={{ position: "absolute", left: 560, top: 250, width: 420, height: 300, borderRadius: 40, background: "#7A4B05", opacity: 0.6 }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,30,0,0.45) 100%)" }} />
    {children}
  </AbsoluteFill>
);

/** Big white words with a thick dark outline and a drop shadow. */
export const Shout: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({ children, size, style }) => (
  <div
    style={{
      position: "absolute", fontFamily: inter, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.02,
      color: colors.white, WebkitTextStroke: `${size * 0.09}px ${colors.ink}`, paintOrder: "stroke fill",
      filter: "drop-shadow(0 8px 0 rgba(20,22,28,0.9))", textAlign: "right", ...style,
    }}
  >
    {children}
  </div>
);

type Face = "skeptical" | "shocked" | "smug";

/**
 * Dot, thumbnail edition: a shaded sphere with an ink outline, pill eyes, a brow and a mouth,
 * plus an arm reaching right (hand at the end) to hold the hero object.
 */
export const ThumbDot: React.FC<{ x: number; y: number; r: number; face: Face; arm?: { x: number; y: number } }> = ({ x, y, r, face, arm }) => {
  const s = r / 100;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1} aria-hidden>
      <defs>
        <radialGradient id="tdShade" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F3EEE4" />
          <stop offset="100%" stopColor="#C9C1B2" />
        </radialGradient>
      </defs>
      {arm ? (
        <g>
          <path
            d={`M ${x + r * 0.7} ${y + r * 0.45} Q ${(x + arm.x) / 2} ${Math.max(y + r * 0.6, arm.y + 40)} ${arm.x} ${arm.y}`}
            fill="none" stroke={colors.ink} strokeWidth={r * 0.2} strokeLinecap="round"
          />
          <path
            d={`M ${x + r * 0.7} ${y + r * 0.45} Q ${(x + arm.x) / 2} ${Math.max(y + r * 0.6, arm.y + 40)} ${arm.x} ${arm.y}`}
            fill="none" stroke="#EDE7DB" strokeWidth={r * 0.12} strokeLinecap="round"
          />
          <circle cx={arm.x} cy={arm.y} r={r * 0.2} fill="#F3EEE4" stroke={colors.ink} strokeWidth={r * 0.045} />
        </g>
      ) : null}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={100} fill="url(#tdShade)" stroke={colors.ink} strokeWidth={6} />
        {/* eyes */}
        {face === "shocked" ? (
          <>
            <ellipse cx={-30} cy={-6} rx={17} ry={22} fill={colors.ink} />
            <ellipse cx={30} cy={-6} rx={17} ry={22} fill={colors.ink} />
          </>
        ) : (
          <>
            <clipPath id="tdLidL">
              {face === "smug" ? <rect x={-80} y={-14} width={100} height={80} transform="rotate(-8 -32 -14)" /> : <rect x={-80} y={-80} width={100} height={160} />}
            </clipPath>
            <clipPath id="tdLidR">
              {face === "smug" ? <rect x={-20} y={-14} width={100} height={80} transform="rotate(8 32 -14)" /> : <rect x={-20} y={-80} width={100} height={160} />}
            </clipPath>
            <rect x={-46} y={-30} width={28} height={46} rx={13} fill={colors.ink} clipPath="url(#tdLidL)" />
            <rect x={18} y={-30} width={28} height={46} rx={13} fill={colors.ink} clipPath="url(#tdLidR)" />
            {face === "smug" ? (
              <>
                <path d="M -50 -14 L -14 -19" stroke={colors.ink} strokeWidth={6} strokeLinecap="round" />
                <path d="M 14 -19 L 50 -14" stroke={colors.ink} strokeWidth={6} strokeLinecap="round" />
              </>
            ) : null}
          </>
        )}
        {/* brows */}
        {face === "skeptical" ? (
          <>
            <path d="M -52 -46 L -18 -44" stroke={colors.ink} strokeWidth={8} strokeLinecap="round" />
            <path d="M 14 -54 Q 34 -70 52 -50" fill="none" stroke={colors.ink} strokeWidth={8} strokeLinecap="round" />
          </>
        ) : face === "shocked" ? (
          <>
            <path d="M -50 -48 Q -30 -62 -12 -50" fill="none" stroke={colors.ink} strokeWidth={8} strokeLinecap="round" />
            <path d="M 12 -50 Q 30 -62 50 -48" fill="none" stroke={colors.ink} strokeWidth={8} strokeLinecap="round" />
          </>
        ) : null}
        {/* mouth */}
        {face === "smug" ? (
          <path d="M -12 44 Q 6 54 24 40" fill="none" stroke={colors.ink} strokeWidth={7} strokeLinecap="round" />
        ) : (
          <ellipse cx={-4} cy={46} rx={face === "shocked" ? 13 : 9} ry={face === "shocked" ? 18 : 12} fill={colors.ink} />
        )}
      </g>
    </svg>
  );
};

/** Soft glow behind a hero object. */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string }> = ({ x, y, r, color }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: color, filter: `blur(${r * 0.35}px)`, opacity: 0.7 }} />
);
