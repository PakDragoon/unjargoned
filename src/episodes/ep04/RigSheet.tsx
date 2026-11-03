import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fontFamily } from "../../shared/brand";
import { Arm, HandPose, Pt } from "./Rig";

// Anatomy check sheet for the arm + hand rig: every hand must sit on its wrist with the fingers pointing away from it.
const CASES: { label: string; s: Pt; t: Pt; bend: 1 | -1; pose: HandPose; thumb: "up" | "down" }[] = [
  { label: "hanging (left of body)", s: { x: 160, y: 120 }, t: { x: 140, y: 380 }, bend: 1, pose: "relaxed", thumb: "down" },
  { label: "hanging (right of body)", s: { x: 160, y: 120 }, t: { x: 180, y: 380 }, bend: -1, pose: "relaxed", thumb: "up" },
  { label: "reach right, point", s: { x: 60, y: 200 }, t: { x: 300, y: 170 }, bend: 1, pose: "point", thumb: "up" },
  { label: "reach right, press", s: { x: 60, y: 160 }, t: { x: 290, y: 260 }, bend: -1, pose: "point", thumb: "up" },
  { label: "hold up, grip", s: { x: 120, y: 330 }, t: { x: 190, y: 120 }, bend: 1, pose: "grip", thumb: "up" },
  { label: "wave, open", s: { x: 120, y: 330 }, t: { x: 230, y: 110 }, bend: -1, pose: "open", thumb: "down" },
  { label: "reach left, point", s: { x: 300, y: 200 }, t: { x: 60, y: 170 }, bend: -1, pose: "point", thumb: "up" },
  { label: "fist", s: { x: 80, y: 120 }, t: { x: 230, y: 330 }, bend: 1, pose: "fist", thumb: "up" },
];

export const RigSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
    <div style={{ position: "absolute", left: 60, top: 30, fontSize: 44, fontWeight: 800 }}>Arm + hand rig: anatomy check</div>
    {CASES.map((c, i) => (
      <div key={c.label} style={{ position: "absolute", left: 40 + (i % 4) * 470, top: 110 + Math.floor(i / 4) * 480, width: 440, height: 460, borderRadius: 24, backgroundColor: "#232838" }}>
        <svg width={440} height={420} viewBox="0 0 360 440" aria-hidden>
          <circle cx={c.s.x} cy={c.s.y} r={10} fill={colors.yellow} />
          <Arm shoulder={c.s} target={c.t} bend={c.bend} pose={c.pose} thumb={c.thumb} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontSize: 26, color: colors.subtext }}>{c.label}</div>
      </div>
    ))}
  </AbsoluteFill>
);
