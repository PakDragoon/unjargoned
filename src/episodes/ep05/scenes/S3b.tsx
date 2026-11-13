import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { MoodKey } from "../../../shared/Dot";
import { pop, ramp, sec } from "../../../shared/motion";
import { Arm, INK, OUT, SHADOW, Stage } from "../../../shared/Rig";
import { DotActor, Scene5, kk, lerp } from "../Common";
import { HOSE_LEN, dotShoulders, wristForTip } from "../DotArm";
import { Brush, Highlighter, SHEET } from "../Props";

// The silent gag (~3.5 s, music muffled in tools/mix.py), hard cut in, SFX only: Dot paints on a white sheet with a
// white brush — nothing shows. Dot turns to the viewer, smug. A highlighter (in the recruiter's sleeve from S3, in from
// the right edge) swipes across: "Subscribe to Unjargoned." A tiny drawn Subscribe pill pops under it. Dot is caught
// (surprised), then a sheepish thumbs-up.
const SHEET_BOX = { x: 560, y: 220, w: 860, h: 440 };
const LINE = { x0: SHEET_BOX.x + 80, x1: SHEET_BOX.x + 780, y: SHEET_BOX.y + 230 };
const DOT = { x: 360, y: 720 };
const R = 90;
const TEXT = "Subscribe to Unjargoned.";
const SWIPE = [1.75, 2.45] as const;
const TRACK: MoodKey[] = [
  { at: 0, mood: "smug" }, { at: sec(1.35), mood: "smug" }, { at: sec(1.95), mood: "surprised" }, { at: sec(2.75), mood: "happy" },
];

const S3bContent: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const k = R / 100;
  const sh = dotShoulders(DOT, R);
  // brush: three quick strokes across the sheet's left half (0.15–1.3 s), then down
  const strokeT = kk(t, 0.15, 1.3);
  const paintOn = t < 1.35;
  const sx = lerp(SHEET_BOX.x + 70, SHEET_BOX.x + 300, (Math.sin(strokeT * Math.PI * 3 - Math.PI / 2) + 1) / 2);
  const sy = lerp(SHEET_BOX.y + 170, SHEET_BOX.y + 300, strokeT);
  const brushLen = 170 * k;
  const wristR = paintOn ? wristForTip(sh.R, DOT.x, { x: sx, y: sy }, 30 * k, { x: 0, y: brushLen * 0.5 }, HOSE_LEN * k) : { x: sh.R.x + 40, y: sh.R.y + 80 };
  const sw = kk(t, SWIPE[0], SWIPE[1]);
  const front = lerp(LINE.x0 - 20, LINE.x1, sw);
  const handIn = ramp(frame, 1.45, 0.3) * (1 - ramp(frame, 2.75, 0.3));
  const turned = t > 1.35;
  const thumb = t > 2.75;
  const subPop = pop(frame, 2.5);

  return (
    <AbsoluteFill>
      <Stage spotX={900} floorY={880} />
      {/* the white sheet: white paint on it shows nothing */}
      <div style={{ position: "absolute", left: SHEET_BOX.x, top: SHEET_BOX.y, width: SHEET_BOX.w, height: SHEET_BOX.h, backgroundColor: SHEET, border: `${OUT}px solid ${INK}`, borderRadius: 12, boxShadow: `10px 12px 0 ${SHADOW}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: LINE.x0 - SHEET_BOX.x - 10, top: LINE.y - SHEET_BOX.y - 38, width: Math.max(0, front - LINE.x0 + 10), height: 76, backgroundColor: colors.yellow, borderRadius: 8, transform: "skewX(-8deg)" }} />
        {[0, 1].map((layer) => (
          <div key={layer} style={{ position: "absolute", left: LINE.x0 - SHEET_BOX.x, top: LINE.y - SHEET_BOX.y - 32, fontSize: 56, fontWeight: 800, whiteSpace: "nowrap", color: layer ? INK : SHEET, clipPath: layer ? `inset(0 ${Math.max(0, LINE.x1 + 40 - front)}px 0 0)` : undefined }}>{TEXT}</div>
        ))}
      </div>
      {/* the drawn Subscribe pill (our style) */}
      <div style={{ position: "absolute", left: 960 - 170, top: SHEET_BOX.y + SHEET_BOX.h + 40, width: 340, height: 96, borderRadius: 48, backgroundColor: colors.yellow, border: `6px solid ${INK}`, boxShadow: `6px 8px 0 ${SHADOW}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 800, color: INK, scale: `${Math.max(0, subPop)}` }}>Subscribe</div>
      {/* the recruiter's sleeve from the right edge, holding the highlighter (tip on the swipe front) */}
      {handIn > 0 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
          <Arm shoulder={{ x: front + 330 + 400 * (1 - handIn), y: 1250 }} target={{ x: front + 70 + 400 * (1 - handIn), y: LINE.y - 20 }} pose="grip" thumb="up" upper={450} lower={440} width={52} color="#5B6378" bend={-1} />
          <g transform={`translate(${front + 37 + 400 * (1 - handIn)} ${LINE.y - 53}) rotate(35)`}><Highlighter len={130} /></g>
        </svg>
      ) : null}
      <DotActor x={DOT.x} y={DOT.y} r={R} track={TRACK} seed="e5s3b" arms={1} tailAngle={200}
        look={turned ? { x: 0, y: 0.1 } : { x: 1, y: -0.4 }}
        R={thumb ? { pose: "thumbsup", wrist: { x: sh.R.x + 60, y: sh.R.y - 40 } } : { wrist: wristR, pose: "grip", tool: paintOn || t < 2.75 ? <Brush len={brushLen} /> : undefined }} />
    </AbsoluteFill>
  );
};

// Scene S3b — silent gag: Dot's hidden Subscribe note. Hard cut. Edit only this file.
export const S3b: React.FC = () => (
  <Scene5 id="S3b" enter="cut">
    <S3bContent />
  </Scene5>
);
