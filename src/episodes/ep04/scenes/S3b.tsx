import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { EggCarton } from "../Props";
import { Arm, Pt, Stage } from "../Rig";
import { Checkout } from "../Screens";
import { scene } from "../timeline";
import { BODY_H, BUY_TIP, CamKey, FLOOR, QtyView, SCREEN, SLOT, World, camAt, toScreen } from "../World";

const S = scene("S3b");

// The silent gag (~3 s, music muffled in tools/mix.py), hard cut in, SFX only: on the same stage, Dot has grown two
// paper arms with the gloves on them, taps "Buy" on the checkout — the quantity spins 1 → 400 — and egg cartons
// shoot out of the checkout's slot onto a growing pile (one thud each).
const CAM: CamKey[] = [[-1, 1040, 540, 1.55], [0.6, 1050, 530, 1.5], [1.9, 1060, 560, 1.4], [99, 1070, 575, 1.32]];
const DOT: Pt = { x: 470, y: 600 }; // Dot (screen)
const TAP = 1.0;
const N = 6;
const pileAt = (i: number): Pt => ({ x: 1120 + [0, 170, -150, 90, -60, 40][i], y: FLOOR - 45 - [0, 0, 0, 80, 80, 155][i] });

const TRACK: MoodKey[] = [
  { at: 0, mood: "smug" },
  { at: sec(1.55), mood: "surprised" },
  { at: sec(1.95), mood: "panic" },
];

const S3bContent: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = camAt(CAM, t);
  const qty = Math.round(interpolate(t, [TAP + 0.15, 1.95], [1, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x }));
  const press = during(frame, TAP - 0.04, TAP + 0.3, 0.05);

  // Dot's arms: paper sleeves grow out of its sides, then the gloves pop on
  const grow = ramp(frame, 0.1, 0.4);
  const gloves = t < 0.53 ? 0 : Math.min(1.08, pop(frame, 0.55));
  const bob = Math.sin(t * 7) * 4 * (1 - ramp(frame, 1.9, 0.2));
  const dot = { x: DOT.x, y: DOT.y + bob };
  const shR = { x: dot.x + 62, y: dot.y + 28 };
  const shL = { x: dot.x - 62, y: dot.y + 28 };
  const buy = toScreen(BUY_TIP(), c);
  // wrist so that the pointing fingertip lands on Buy (hand ≈ 100 px wrist → tip at handSize 1.0 × screen)
  const HAND = 96;
  const reach = interpolate(t, [0.75, TAP], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) - interpolate(t, [1.45, 1.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d = Math.hypot(buy.x - shR.x, buy.y - shR.y);
  const wristBuy = { x: buy.x - ((buy.x - shR.x) / d) * HAND, y: buy.y - ((buy.y - shR.y) / d) * HAND };
  const restR = { x: shR.x + 90 * grow, y: shR.y + 262 * grow };
  const wristR = { x: restR.x + (wristBuy.x - restR.x) * reach, y: restR.y + (wristBuy.y - restR.y) * reach };
  const panicK = ramp(frame, 1.95, 0.15);
  const wristL = { x: shL.x - (90 - 20 * panicK) * grow, y: shL.y + (262 - 520 * panicK) * grow };

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
      <World cam={c}>
        <Stage spotX={1200} floorY={FLOOR} />
        {/* cartons that already landed sit on the floor behind the machine's front edge */}
        <div style={{ position: "absolute", left: SCREEN.left, top: SCREEN.top }}>
          <Checkout w={SCREEN.w} bodyH={BODY_H} feed={0} receipt={null}>
            <QtyView w={SCREEN.w} qty={qty} press={press} />
          </Checkout>
        </div>
        {/* cartons shoot out of the slot and pile up */}
        {Array.from({ length: N }, (_, i) => {
          const at = 1.95 + i * 0.2 - 0.18;
          const k = Math.max(0, Math.min(1, (t - at) / 0.18));
          if (t < at) return null;
          const end = pileAt(i);
          const x = SLOT.x + (end.x - SLOT.x) * k;
          const y = SLOT.y + 10 + (end.y - SLOT.y - 10) * k * k - Math.sin(k * Math.PI) * 40;
          const rot = (random(`r${i}`) - 0.5) * 30 * k;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", rotate: `${rot}deg`, scale: `${0.4 + 0.6 * k}` }}>
              <EggCarton w={150} />
            </div>
          );
        })}
      </World>

      {/* Dot with its borrowed gloves (arms attached at its sides) */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {grow > 0 ? (
          <>
            <Arm shoulder={shL} target={wristL} upper={150 * grow + 1} lower={145 * grow + 1} width={30} handSize={0.95} hand={gloves} pose={t > 1.95 ? "open" : "relaxed"} thumb="down" bend={1} />
            <Arm shoulder={shR} target={wristR} upper={150 * grow + 1} lower={145 * grow + 1} width={30} handSize={0.95} hand={gloves} pose={t > 0.7 && t < 1.8 ? "point" : "relaxed"} thumb="up" bend={-1} press={press} />
          </>
        ) : null}
      </svg>
      <Dot x={dot.x} y={dot.y} size={100} tailAngle={180} track={TRACK} blinks={false} seed="gag4" look={{ x: t < 1.6 ? 1 : 0.8, y: t < 1.6 ? 0 : 0.6 }} squash={() => 0.12 * press} />
    </AbsoluteFill>
  );
};

// Scene S3b — the silent gag. Edit only this file for S3b changes.
export const S3b: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title}>
    <S3bContent />
  </SceneShell>
);
