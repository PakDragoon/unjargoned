import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/** Soft cut used between scenes that aren't a new "stop": 10-frame fade up from the background. */
export const FadeIn: React.FC<{ children: React.ReactNode; frames?: number }> = ({ children, frames = 10 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, frames], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
