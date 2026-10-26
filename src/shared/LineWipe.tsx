import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "./brand";

const FRAMES = 18;

/**
 * Line wipe into a new "stop": a yellow bar with the logo dot at its head sweeps
 * left→right and reveals the scene behind it (18 frames, as in Ep 1).
 */
export const LineWipeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  if (frame >= FRAMES) return <>{children}</>;
  const t = interpolate(frame, [0, FRAMES], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const x = -60 + t * 2040;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      <AbsoluteFill style={{ clipPath: `inset(0 ${Math.max(0, 1920 - x)}px 0 0)` }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", left: x - 1920, top: 532, width: 1920, height: 16, borderRadius: 8, backgroundColor: colors.yellow }} />
      <div style={{ position: "absolute", left: x - 22, top: 518, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white }} />
    </AbsoluteFill>
  );
};
