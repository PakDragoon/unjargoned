import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FPS, lerp, easeInOut } from "./theme";
import type { Rect } from "./kit";
import durations from "./durations.json";

/** Seconds since the scene started. */
export const useT = () => useCurrentFrame() / FPS;

export type SceneId = "scene1" | "scene2" | "scene3" | "scene4" | "scene5";
export const frames = (id: SceneId) => durations.scenes[id].durationInFrames;
export const seconds = (id: SceneId) => durations.scenes[id].seconds;

export const Voice: React.FC<{ id: SceneId }> = ({ id }) => <Audio src={staticFile(durations.scenes[id].file)} />;

export type SfxName = "slam" | "thud" | "chime" | "stamp" | "click" | "tick" | "snap" | "paper" | "slap" | "roll" | "vault" | "ding" | "whoosh" | "pop" | "hop";
export const Sfx: React.FC<{ at: number; name: SfxName; vol?: number }> = ({ at, name, vol = 0.5 }) => (
  <Sequence from={Math.max(0, Math.round(at * FPS))} layout="none">
    <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={vol} />
  </Sequence>
);

/* Shared "world" composition of Scene 1 / Scene 5 (the loop frame). */
export const LAPTOP = { x: 540, y: 1062, s: 1.25 }; // hinge centre; body spans ~y 1057–1190 (centred ≈ 1120)
export const SEAM: [number, number] = [540, 1058];
export const MOON: [number, number] = [220, 420];
export const MOON_S = 0.8;
export const WIN0: Rect = { cx: 540, cy: 680, w: 620, h: 400 };
export const WIN1: Rect = { cx: 540, cy: 900, w: 860, h: 1050 }; // zoomed: 80% of frame
export const TETHER_FROM: [number, number] = [540, 1052];
export const TETHER_TO: [number, number] = [540, WIN0.cy + WIN0.h / 2 + 4];
export const DOT_REST = { u: 0.5, v: 0.72 }; // where TheDot sits inside the window

export const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({
  cx: lerp(a.cx, b.cx, p),
  cy: lerp(a.cy, b.cy, p),
  w: lerp(a.w, b.w, p),
  h: lerp(a.h, b.h, p),
});
export const zoomP = (p: number) => easeInOut(Math.min(1, Math.max(0, p)));
