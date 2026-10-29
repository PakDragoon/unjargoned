import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S4b");

// The meme beat: hard cut to Dot staring down the camera, music muffled (tools/mix.py), no voice.
const TRACK: MoodKey[] = [
  { at: 0, mood: "neutral" },
  { at: sec(1.6), mood: "smug" },
];

const S4bContent: React.FC = () => {
  const frame = useCurrentFrame();
  // Smash zoom on the cut, then a slow creep in.
  const zoom = interpolate(frame, [0, 3, 96], [1.35, 1.12, 1.34], { extrapolateRight: "clamp" });
  const shake = frame < 8 ? Math.sin(frame * 3.3) * (8 - frame) * 1.5 : 0;
  const textO = ramp(frame, 0.3, 0.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px) scale(${zoom})` }}>
        <Dot x={960} y={470} size={260} track={TRACK} blinks={false} seed="gag" tailLength={1.4} />
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(20,22,28,0) 45%, rgba(0,0,0,0.75) 100%)" }} />
      <div
        style={{
          position: "absolute", left: 120, right: 120, bottom: 110, textAlign: "center", fontSize: 72, fontWeight: 800,
          color: colors.white, opacity: textO, textShadow: "0 4px 24px rgba(0,0,0,0.8)",
        }}
      >
        …you haven't <span style={{ color: colors.yellow }}>subscribed</span> yet, huh?
      </div>
    </AbsoluteFill>
  );
};

// Scene S4b — the stare gag (silent). Edit only this file for S4b changes.
export const S4b: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title}>
    <S4bContent />
  </SceneShell>
);
