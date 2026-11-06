import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, hops } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { EggCarton } from "../Props";
import { Hand, HandPose, INK, Pt, Stage, ThumbsUpHand } from "../Rig";
import { Checkout } from "../Screens";
import { scene } from "../timeline";
import { BODY_H, BUY_TIP, CamKey, FLOOR, QtyView, SCREEN, SLOT, World, camAt, toScreen } from "../World";

const S = scene("S3b");

// The silent gag (~3 s, music muffled in tools/mix.py), hard cut in, SFX only: on the same stage, Dot sprouts its own
// little white arms, pulls on the agent's gloves, hops up and taps "Buy" — the quantity spins 1 → 400 — and egg cartons
// shoot out of the checkout's slot onto a growing pile (one thud each). Tag (3.2–5.0 s): Dot freezes, turns to the
// viewer, happy, points down at a drawn Subscribe pill with one hand (tap, tap) and gives a thumbs-up with the other.
const CAM: CamKey[] = [[-1, 1040, 540, 1.55], [0.6, 1050, 530, 1.5], [1.9, 1060, 560, 1.4], [99, 1070, 575, 1.32]];
const DOT: Pt = { x: 470, y: 600 }; // Dot (screen)
const TAP = 1.0;
const N = 6;
const pileAt = (i: number): Pt => ({ x: 1120 + [0, 170, -150, 90, -60, 40][i], y: FLOOR - 45 - [0, 0, 0, 80, 80, 155][i] });

const TURN = 3.35; // Dot turns to the viewer
const SUB = { x: 235, y: 805, w: 330, h: 100 }; // the drawn Subscribe pill (screen), below Dot, toward the real button
const SUB_TIP: Pt = { x: SUB.x + 70, y: SUB.y - SUB.h / 2 + 8 }; // fingertip lands on the pill's top edge, right of centre
const TRACK: MoodKey[] = [
  { at: 0, mood: "smug" },
  { at: sec(1.55), mood: "surprised" },
  { at: sec(1.95), mood: "panic" },
  { at: sec(3.15), mood: "neutral" },
  { at: sec(TURN + 0.3), mood: "happy" },
];

/** A drawn Subscribe pill (our style, not YouTube's): yellow paper with an ink outline and a little bell. */
const SubscribePill: React.FC<{ p: number; jab: number }> = ({ p, jab }) => (
  <div style={{ position: "absolute", left: SUB.x - SUB.w / 2, top: SUB.y - SUB.h / 2, width: SUB.w, height: SUB.h, scale: `${Math.max(0, p) * (1 - 0.06 * jab)}`, translate: `0 ${5 * jab}px`, opacity: Math.min(1, Math.max(0, p) * 3) }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: SUB.h / 2, backgroundColor: colors.yellow, border: `6px solid ${INK}`, boxSizing: "border-box", boxShadow: `6px 8px 0 rgba(0,0,0,0.38)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily, fontSize: 50, fontWeight: 800, color: INK }}>
      <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden>
        <path d="M 20 5 C 12 5 9 12 9 18 L 9 26 L 5 31 L 35 31 L 31 26 L 31 18 C 31 12 28 5 20 5 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 16 34 Q 20 39 24 34" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </svg>
      Subscribe
    </div>
  </div>
);

/**
 * Dot's own arm: a short white rubber-hose arm (Dot's body colour, thin ink line), bowing smoothly from its side to
 * the wrist — clearly not the agent's jointed paper sleeve. The borrowed glove sits on the end, along the arm's tangent.
 */
const HOSE_LEN = 130;
const HoseArm: React.FC<{ shoulder: Pt; wrist: Pt; bodyX: number; grow: number; glove: number; pose: HandPose; thumb: "up" | "down"; press?: number; thumbPop?: number }> = ({ shoulder, wrist, bodyX, grow, glove, pose, thumb, press = 0, thumbPop = 1 }) => {
  if (grow <= 0) return null;
  const w = { x: shoulder.x + (wrist.x - shoulder.x) * grow, y: shoulder.y + (wrist.y - shoulder.y) * grow };
  const dx = w.x - shoulder.x;
  const dy = w.y - shoulder.y;
  const d = Math.hypot(dx, dy) || 1;
  const sag = Math.sqrt(Math.max(0, HOSE_LEN * grow * HOSE_LEN * grow - d * d)) * 0.45;
  const mid = { x: (shoulder.x + w.x) / 2, y: (shoulder.y + w.y) / 2 };
  const a = { x: mid.x - (dy / d) * sag, y: mid.y + (dx / d) * sag };
  const b = { x: mid.x + (dy / d) * sag, y: mid.y - (dx / d) * sag };
  // natural bend: reaching out sideways → the arm sags (bulge down); hanging or raised → it bows out, away from the body
  const side = Math.sign(shoulder.x - bodyX) || 1;
  const ctl = Math.abs(dx) > Math.abs(dy) ? (a.y >= b.y ? a : b) : ((a.x - bodyX) * side >= (b.x - bodyX) * side ? a : b);
  const ang = (Math.atan2(w.y - ctl.y, w.x - ctl.x) * 180) / Math.PI;
  const path = `M ${shoulder.x} ${shoulder.y} Q ${ctl.x} ${ctl.y} ${w.x} ${w.y}`;
  return (
    <g>
      <path d={path} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d={path} fill="none" stroke={colors.white} strokeWidth={12} strokeLinecap="round" />
      {glove > 0 && pose === "thumbsup" ? (
        // upright thumbs-up on the wrist, leaning a little with the arm
        <g transform={`translate(${w.x} ${w.y}) rotate(${(ang + 90) * 0.35}) scale(${glove * thumbPop})`}>
          <ThumbsUpHand size={0.88} side={-1} />
        </g>
      ) : glove > 0 ? (
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
  const restR0 = { x: shR.x + 16, y: shR.y + 100 };
  const panicK = ramp(frame, 1.95, 0.15) - ramp(frame, 3.15, 0.2); // arm shoots up, then drops as Dot freezes
  const wave = panicK * Math.sin(t * 22) * 14;
  // tag: the right arm comes up beside Dot with a thumbs-up
  const thumbK = ramp(frame, 3.95, 0.25);
  const THUMB_AT = { x: shR.x + 80, y: shR.y - 70 };
  const thumbPop = t < 4.05 ? 1 : 1 + 0.25 * Math.max(0, Math.sin(Math.min(1, (t - 4.05) / 0.3) * Math.PI));
  const restR = { x: restR0.x + (34 * panicK) + wave + (THUMB_AT.x - restR0.x) * thumbK, y: restR0.y - 225 * panicK + (THUMB_AT.y - restR0.y) * thumbK }; // panic: the right arm shoots up and waves
  const wristR = { x: restR.x + (wristBuy.x - restR.x) * reach, y: restR.y + (wristBuy.y - restR.y) * reach };
  // tag: the left arm points down at the Subscribe pill, with two little jabs (fingertip computed from the pill)
  const jab = during(frame, 4.1, 4.22, 0.05) + during(frame, 4.4, 4.52, 0.05);
  const tipNow = { x: SUB_TIP.x, y: SUB_TIP.y - 14 + 14 * jab };
  const dl = Math.hypot(tipNow.x - shL.x, tipNow.y - shL.y) || 1;
  const wristSub = { x: tipNow.x - ((tipNow.x - shL.x) / dl) * HAND, y: tipNow.y - ((tipNow.y - shL.y) / dl) * HAND };
  const pointK = ramp(frame, 3.7, 0.3);
  const restL = { x: shL.x - 16, y: shL.y + 100 };
  const wristL = { x: restL.x + (wristSub.x - restL.x) * pointK, y: restL.y + (wristSub.y - restL.y) * pointK };
  const subP = t < 3.78 ? 0 : pop(frame, 3.8);
  const focus = ramp(frame, TURN, 0.4); // the stage dims behind Dot
  const push = ramp(frame, TURN - 0.05, 0.55); // screen-space push-in on Dot (and everything behind it)
  const turnLook = ramp(frame, TURN, 0.25);
  const lookNow = t < 1.6 ? { x: 1, y: 0 } : { x: 0.8 * (1 - turnLook), y: 0.6 * (1 - turnLook) };

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink, overflow: "hidden" }}>
     <AbsoluteFill style={{ transformOrigin: "470px 640px", transform: `translate(${260 * push}px, ${-40 * push}px) scale(${1 + 0.5 * push})` }}>
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

      {/* tag: the stage dims, the Subscribe pill pops up below Dot */}
      <AbsoluteFill style={{ backgroundColor: colors.ink, opacity: 0.55 * focus }} />
      <SubscribePill p={subP} jab={jab} />

      {/* Dot with its borrowed gloves (arms attached at its sides) */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {grow > 0 ? (
          <>
            <HoseArm shoulder={shL} wrist={wristL} bodyX={dot.x} grow={grow} glove={gloves} pose={pointK > 0.3 ? "point" : "relaxed"} thumb={pointK > 0.3 ? "down" : "up"} press={jab} />
            <HoseArm shoulder={shR} wrist={wristR} bodyX={dot.x} grow={grow} glove={gloves} pose={t > 0.84 && t < 1.6 ? "point" : thumbK > 0.4 ? "thumbsup" : t > 1.95 && t < 3.25 ? "open" : "relaxed"} thumb={(t > 0.84 && t < 1.6) || thumbK > 0.4 ? "up" : "down"} press={press} thumbPop={thumbPop} />
          </>
        ) : null}
      </svg>
      <Dot x={dot.x} y={dot.y} size={100} squash={(fr) => Math.max(route.squash(fr), 0.12 * press)} tailAngle={198} tailStart={1.08} tailLength={1.2} tailWidth={0.24} track={TRACK} blinks={false} seed="gag4" look={lookNow} />
     </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene S3b — the silent gag. Edit only this file for S3b changes.
export const S3b: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title}>
    <S3bContent />
  </SceneShell>
);
