import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, hops } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { EggCarton } from "../Props";
import { Hand, HandPose, INK, Pt, Stage } from "../Rig";
import { Checkout } from "../Screens";
import { scene } from "../timeline";
import { BODY_H, BUY_TIP, CamKey, FLOOR, QtyView, SCREEN, SLOT, World, camAt, toScreen } from "../World";

const S = scene("S3b");

// The silent gag (~3 s, music muffled in tools/mix.py), hard cut in, SFX only: on the same stage, Dot sprouts its own
// little white arms, pulls on the agent's gloves, hops up and taps "Buy" — the quantity spins 1 → 400 — and egg cartons
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

/**
 * Dot's own arm: a short white rubber-hose arm (Dot's body colour, thin ink line), bowing smoothly from its side to
 * the wrist — clearly not the agent's jointed paper sleeve. The borrowed glove sits on the end, along the arm's tangent.
 */
const HOSE_LEN = 130;
const HoseArm: React.FC<{ shoulder: Pt; wrist: Pt; grow: number; glove: number; pose: HandPose; thumb: "up" | "down"; bow: 1 | -1; press?: number }> = ({ shoulder, wrist, grow, glove, pose, thumb, bow, press = 0 }) => {
  if (grow <= 0) return null;
  const w = { x: shoulder.x + (wrist.x - shoulder.x) * grow, y: shoulder.y + (wrist.y - shoulder.y) * grow };
  const dx = w.x - shoulder.x;
  const dy = w.y - shoulder.y;
  const d = Math.hypot(dx, dy) || 1;
  const sag = Math.sqrt(Math.max(0, HOSE_LEN * grow * HOSE_LEN * grow - d * d)) * 0.45;
  const ctl = { x: (shoulder.x + w.x) / 2 + (-dy / d) * sag * bow, y: (shoulder.y + w.y) / 2 + (dx / d) * sag * bow };
  const ang = (Math.atan2(w.y - ctl.y, w.x - ctl.x) * 180) / Math.PI;
  const path = `M ${shoulder.x} ${shoulder.y} Q ${ctl.x} ${ctl.y} ${w.x} ${w.y}`;
  return (
    <g>
      <path d={path} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d={path} fill="none" stroke={colors.white} strokeWidth={12} strokeLinecap="round" />
      {glove > 0 ? (
        <g transform={`translate(${w.x} ${w.y}) rotate(${ang}) scale(${glove})`}>
          <Hand pose={pose} thumb={thumb} size={0.8} press={press} />
        </g>
      ) : null}
    </g>
  );
};

const S3bContent: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = camAt(CAM, t);
  const qty = Math.round(interpolate(t, [TAP + 0.15, 1.95], [1, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x }));
  const press = during(frame, TAP - 0.04, TAP + 0.3, 0.05);

  // Dot's OWN arms: short white rubber-hose arms that match its body (not the agent's paper sleeves); they sprout from
  // its sides, then the borrowed blue gloves pop on. Dot hops up to the screen to tap, then hops back.
  const grow = ramp(frame, 0.1, 0.35);
  const gloves = t < 0.53 ? 0 : Math.min(1.08, pop(frame, 0.55));
  const buyAt = toScreen(BUY_TIP(), camAt(CAM, TAP));
  const NEAR = { x: buyAt.x - 275, y: buyAt.y + 55 };
  const route = hops([{ at: 0, x: DOT.x, y: DOT.y }, { at: sec(0.82), x: NEAR.x, y: NEAR.y }, { at: sec(1.68), x: DOT.x, y: DOT.y }], 10, 50);
  const bob = Math.sin(t * 7) * 4 * (1 - ramp(frame, 1.9, 0.2)) * (t > 0.6 && t < 1.7 ? 0 : 1);
  const p0 = route.path(frame);
  const dot = { x: p0.x, y: p0.y + bob };
  const shR = { x: dot.x + 70, y: dot.y + 30 };
  const shL = { x: dot.x - 70, y: dot.y + 30 };
  const buy = toScreen(BUY_TIP(), c);
  const HAND = 80; // wrist → pointing fingertip at handSize 0.8
  const reach = interpolate(t, [0.82, TAP - 0.02], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) - interpolate(t, [1.38, 1.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d = Math.hypot(buy.x - shR.x, buy.y - shR.y);
  const wristBuy = { x: buy.x - ((buy.x - shR.x) / d) * HAND, y: buy.y - ((buy.y - shR.y) / d) * HAND };
  const restR = { x: shR.x + 30, y: shR.y + 78 };
  const wristR = { x: restR.x + (wristBuy.x - restR.x) * reach, y: restR.y + (wristBuy.y - restR.y) * reach };
  const panicK = ramp(frame, 1.95, 0.15);
  const wave = panicK * Math.sin(t * 22) * 14;
  const wristL = { x: shL.x - 30 - 20 * panicK + wave, y: shL.y + 78 - 190 * panicK };

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
            <HoseArm shoulder={shL} wrist={wristL} grow={grow} glove={gloves} pose={t > 1.95 ? "open" : "relaxed"} thumb="down" bow={-1} />
            <HoseArm shoulder={shR} wrist={wristR} grow={grow} glove={gloves} pose={t > 0.7 && t < 1.6 ? "point" : "relaxed"} thumb="up" bow={1} press={press} />
          </>
        ) : null}
      </svg>
      <Dot x={dot.x} y={dot.y} size={100} squash={(fr) => Math.max(route.squash(fr), 0.12 * press)} tailAngle={180} track={TRACK} blinks={false} seed="gag4" look={{ x: t < 1.6 ? 1 : 0.8, y: t < 1.6 ? 0 : 0.6 }} />
    </AbsoluteFill>
  );
};

// Scene S3b — the silent gag. Edit only this file for S3b changes.
export const S3b: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title}>
    <S3bContent />
  </SceneShell>
);
