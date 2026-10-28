import React from "react";
import { colors } from "./brand";

/** The "Untangle" mark: speech bubble, tangled scribble straightening into a line, white dot. */
export const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="150 150 500 500" aria-hidden>
    <rect x="170" y="210" width="460" height="300" rx="150" fill={colors.yellow} />
    <path d="M 262 480 L 222 612 L 356 500 Z" fill={colors.yellow} />
    <path
      d="M 250 380 C 262 312, 328 312, 316 362 C 306 402, 262 398, 280 352 C 296 314, 352 330, 360 360 L 548 360"
      fill="none" stroke={colors.ink} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="548" cy="360" r="22" fill={colors.white} stroke={colors.ink} strokeWidth="8" />
  </svg>
);

export const Wordmark: React.FC<{ fontSize: number }> = ({ fontSize }) => (
  <span style={{ fontSize, fontWeight: 800, letterSpacing: -fontSize * 0.03, color: colors.white }}>
    <span style={{ color: colors.yellow }}>un</span>jargoned
  </span>
);
