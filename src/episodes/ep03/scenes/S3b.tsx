import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { PAPER, PEN, Pencil, RED } from "../Props";
import { scene } from "../timeline";

const S = scene("S3b");

// The silent gag (~3 s, music muffled in tools/mix.py): Dot takes its own exam. "Dot's birthday?" → scribbles
// "Every day!" with total confidence, holds it up… a tiny red 0 lands. Hard cut in, no voice.
const TRACK: MoodKey[] = [
  { at: 0, mood: "intrigued" },
  { at: sec(0.5), mood: "smug" },
  { at: sec(2.15), mood: "sad" },
];

const S3bContent: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 3, 100], [1.3, 1.08, 1.2], { extrapolateRight: "clamp" });
  const answer = "Every day!";
  const shown = Math.floor(interpolate(frame, [sec(0.45), sec(1.3)], [0, answer.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const holdUp = ramp(frame, 1.35, 0.2); // sheet lifted toward camera
  const zero = pop(frame, 2.05);
  const writing = frame >= sec(0.45) && frame < sec(1.3);
  const dot = { x: 1330, y: 640 };
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <div
        style={{
          position: "absolute", left: 300, top: 250, width: 900, height: 560, borderRadius: 24, backgroundColor: PAPER, color: colors.ink,
          padding: "50px 64px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          transform: `rotate(${-3 + 4 * holdUp}deg) translateY(${-40 * holdUp}px) scale(${1 + 0.06 * holdUp})`,
        }}
      >
        <div style={{ fontSize: 50, fontWeight: 800, letterSpacing: 2, opacity: 0.6 }}>EXAM · Name: Dot</div>
        <div style={{ fontSize: 76, fontWeight: 800, margin: "40px 0 50px" }}>Q1. Dot's birthday?</div>
        <div style={{ fontSize: 110, fontWeight: 800, color: PEN, fontStyle: "italic", height: 130 }}>{answer.slice(0, shown)}</div>
        <div style={{ position: "absolute", right: 60, bottom: 30, fontSize: 130, fontWeight: 800, color: RED, transform: `rotate(-12deg) scale(${Math.min(1.2, zero)})`, opacity: Math.min(1, zero) }}>0</div>
      </div>
      <Pencil x={dot.x} y={dot.y} o={1 - ramp(frame, 1.35, 0.15)} wiggle={writing ? Math.sin(frame * 1.9) * 16 : 0} />
      <Dot x={dot.x} y={dot.y} size={110} track={TRACK} blinks={false} seed="gag3" look={{ x: frame < sec(2.1) ? -0.8 : -0.5, y: frame < sec(2.1) ? 0.3 : 0.6 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(20,22,28,0) 50%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

// Scene S3b — the silent gag. Edit only this file for S3b changes.
export const S3b: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title}>
    <S3bContent />
  </SceneShell>
);
