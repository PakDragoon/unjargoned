import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { BuyButton, EggCarton, HandShape } from "../Props";
import { scene } from "../timeline";

const S = scene("S3b");

// The silent gag (~3 s, music muffled in tools/mix.py): Dot pulls on the agent's tiny hands like gloves, taps "Buy"
// once, the quantity spins 1 → 400 and egg cartons rain in. Hard cut in, no voice; SFX only (tap, whirr, thuds).
const TRACK: MoodKey[] = [
  { at: 0, mood: "smug" },
  { at: sec(1.55), mood: "surprised" },
  { at: sec(1.95), mood: "panic" },
];
const TAP = 1.0;

const S3bContent: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const zoom = interpolate(frame, [0, 3, 100], [1.25, 1.06, 1.15], { extrapolateRight: "clamp" });
  const gloves = ramp(frame, 0.1, 0.45); // hands slide onto Dot's sides
  const tap = Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - TAP + 0.15) / 0.3)) * Math.PI));
  const qty = Math.round(interpolate(t, [TAP + 0.15, 2.0], [1, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x }));
  const dot = { x: 1180, y: 620 - 40 * tap };
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, fontFamily }}>
      {/* Buy button + quantity counter */}
      <div style={{ position: "absolute", left: 560, top: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 40px", borderRadius: 28, backgroundColor: colors.panel, border: `5px solid ${qty > 1 ? colors.coral : colors.line}` }}>
          <div style={{ fontSize: 54, fontWeight: 700, color: colors.subtext }}>Qty</div>
          <div style={{ fontSize: 96, fontWeight: 800, minWidth: 210, textAlign: "right", color: qty > 1 ? colors.coral : colors.white, fontVariantNumeric: "tabular-nums" }}>{qty}</div>
        </div>
        <BuyButton w={420} press={tap} />
      </div>
      {/* raining cartons */}
      {Array.from({ length: 16 }, (_, i) => {
        const start = 1.55 + random(`c${i}`) * 1.1;
        const y = interpolate(t, [start, start + 0.55], [-300, 760 - (i % 4) * 90], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x });
        if (t < start) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 120 + random(`x${i}`) * 1600, top: y, transform: `rotate(${(random(`r${i}`) - 0.5) * 50}deg)` }}>
            <EggCarton w={200} />
          </div>
        );
      })}
      {/* the gloves (the agent's hands) on Dot */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <HandShape cx={dot.x - 95 - 220 * (1 - gloves) - 130 * tap} cy={dot.y + 40 + 70 * tap} r={34} press={tap} />
        <HandShape cx={dot.x + 95 + 220 * (1 - gloves)} cy={dot.y + 40} r={34} flip />
      </svg>
      <Dot x={dot.x} y={dot.y} size={100} track={TRACK} blinks={false} seed="gag4" look={{ x: -0.7, y: t < 1.6 ? 0.4 : -0.6 }} squash={() => 0.15 * tap} />
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
