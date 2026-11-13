import React from "react";
import { colors } from "../../shared/brand";
import { DOT_GLOVE, Hand, HandPose, INK, Pt, ThumbsUpHand } from "../../shared/Rig";

// Dot's own arms for Ep 5 (Dot uses props in almost every scene): short white rubber-hose arms (Dot's body colour,
// thin ink line) with Dot's own WHITE gloves — not the agent's jointed paper sleeves and periwinkle gloves.
// Same bend rule as the rig: reaching out sideways → the hose sags; hanging or raised → it bows out, away from the body.
// Held props are placed from `hoseFrame` (wrist + forearm-tangent angle), never by eye.

export const HOSE_LEN = 130;
/** A held tool's rotation relative to the forearm (pen grip). Draw tools with rotate(angle + TOOL_ROT). */
export const TOOL_ROT = -60;

/** Shoulders sit on Dot's sides, a little below the centre. r = Dot's radius (the Dot `size` prop). */
export const dotShoulders = (dot: Pt, r: number) => ({
  L: { x: dot.x - r * 0.9, y: dot.y + r * 0.28 },
  R: { x: dot.x + r * 0.9, y: dot.y + r * 0.28 },
});

/** The hose curve from shoulder to wrist and the hand's angle (degrees) at the wrist. `len` scales with Dot's size. */
export const hoseFrame = (shoulder: Pt, wrist: Pt, bodyX: number, len = HOSE_LEN, grow = 1) => {
  const w = { x: shoulder.x + (wrist.x - shoulder.x) * grow, y: shoulder.y + (wrist.y - shoulder.y) * grow };
  const dx = w.x - shoulder.x;
  const dy = w.y - shoulder.y;
  const d = Math.hypot(dx, dy) || 1;
  const sag = Math.sqrt(Math.max(0, len * grow * len * grow - d * d)) * 0.45;
  const mid = { x: (shoulder.x + w.x) / 2, y: (shoulder.y + w.y) / 2 };
  const a = { x: mid.x - (dy / d) * sag, y: mid.y + (dx / d) * sag };
  const b = { x: mid.x + (dy / d) * sag, y: mid.y - (dx / d) * sag };
  const side = Math.sign(shoulder.x - bodyX) || 1;
  const ctl = Math.abs(dx) > Math.abs(dy) ? (a.y >= b.y ? a : b) : (a.x - bodyX) * side >= (b.x - bodyX) * side ? a : b;
  const angle = (Math.atan2(w.y - ctl.y, w.x - ctl.x) * 180) / Math.PI;
  return { wrist: w, ctl, angle };
};

/** A point `dist` px along the hand from the wrist (e.g. the middle of a fist, where a held prop goes). */
export const inHand = (f: { wrist: Pt; angle: number }, dist: number): Pt => ({
  x: f.wrist.x + Math.cos((f.angle * Math.PI) / 180) * dist,
  y: f.wrist.y + Math.sin((f.angle * Math.PI) / 180) * dist,
});

/** Draws one arm. Put it in an <svg> in the same coordinates as Dot. `held` is drawn under the glove (in the fist). */
export const DotArm: React.FC<{
  shoulder: Pt; wrist: Pt; bodyX: number; r?: number; grow?: number; pose?: HandPose; thumb?: "up" | "down"; press?: number;
  held?: (frame: { wrist: Pt; angle: number }) => React.ReactNode;
}> = ({ shoulder, wrist, bodyX, r = 80, grow = 1, pose = "relaxed", thumb = "up", press = 0, held }) => {
  if (grow <= 0) return null;
  const k = r / 100; // Ep 4's hose was drawn for a 100 px Dot
  const f = hoseFrame(shoulder, wrist, bodyX, HOSE_LEN * k, grow);
  const path = `M ${shoulder.x} ${shoulder.y} Q ${f.ctl.x} ${f.ctl.y} ${f.wrist.x} ${f.wrist.y}`;
  return (
    <g>
      <path d={path} fill="none" stroke={INK} strokeWidth={22 * k} strokeLinecap="round" />
      <path d={path} fill="none" stroke={colors.white} strokeWidth={12 * k} strokeLinecap="round" />
      {held ? held(f) : null}
      {pose === "thumbsup" ? (
        <g transform={`translate(${f.wrist.x} ${f.wrist.y}) rotate(${(f.angle + 90) * 0.35}) scale(${grow})`}>
          <ThumbsUpHand size={0.95 * k} side={1} tone={DOT_GLOVE} />
        </g>
      ) : (
        <g transform={`translate(${f.wrist.x} ${f.wrist.y}) rotate(${f.angle}) scale(${grow})`}>
          <Hand pose={pose} thumb={thumb} size={0.8 * k} press={press} tone={DOT_GLOVE} />
        </g>
      )}
    </g>
  );
};

/**
 * Where to put the wrist so a held tool's tip lands exactly on `target` (fingertips/tips on targets, computed).
 * `grip` = how far into the hand the tool sits; `tip` = the tip in the tool's local frame (tip toward local +y), which
 * is rotated by forearm angle + TOOL_ROT (a pen grip: the tool leaves the fist angled down along the reach).
 */
export const wristForTip = (shoulder: Pt, bodyX: number, target: Pt, grip: number, tip: Pt, len = HOSE_LEN): Pt => {
  let wrist = { x: target.x, y: target.y };
  for (let i = 0; i < 30; i++) {
    const f = hoseFrame(shoulder, wrist, bodyX, len);
    const a = (f.angle * Math.PI) / 180;
    const r = ((f.angle + TOOL_ROT) * Math.PI) / 180;
    const g = { x: Math.cos(a) * grip, y: Math.sin(a) * grip };
    const t = { x: tip.x * Math.cos(r) - tip.y * Math.sin(r), y: tip.x * Math.sin(r) + tip.y * Math.cos(r) };
    wrist = { x: target.x - g.x - t.x, y: target.y - g.y - t.y };
  }
  return wrist;
};
