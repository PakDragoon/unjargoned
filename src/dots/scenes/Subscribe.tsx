// Subscribe sting: the red agent Dot meets the channel's original white Dot mascot, they shake hands,
// and the red Dot says "Subscribe!". Standalone (Dots-Subscribe) for review before it goes into the episode.
import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame, Easing } from "remotion";
import { Dot, hops } from "../../shared/Dot";
import { C, F, STROKE, SHADOW, Paper, TheDot, useCues, ramp, lerp } from "../kit";

export const SUB_FRAMES = 300;
const FLOOR = 760;            // floor line
const R = 115;                // both dots the same size
const RED = { x: 720 };       // red Dot stands here
const WHITE = { x: 1200 };    // white Dot lands here
const VOICE_AT = 176;         // "Subscribe!" starts (audio sequence start)

const T = {
  hop: [0, 30, 60],           // white Dot hop landings
  reach: 74, clasp: 92,       // arms out -> hands meet
  shakeEnd: 156,              // 3 shakes
  release: 164,
};

/** Thumb capsule from base (inside the palm) to tip; drawn before its palm so the base tucks under it. */
const Thumb: React.FC<{ x1: number; y1: number; x2: number; y2: number; fill: string }> = ({ x1, y1, x2, y2, fill }) => (
  <g strokeLinecap="round">
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={23} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill} strokeWidth={16.6} />
  </g>
);

/** Noodle arm (soft curve, no elbow); its mitten hand is drawn on top later. dir: +1 reaching right, -1 reaching left. */
const NoodleArm: React.FC<{ sx: number; sy: number; hx: number; hy: number; dir: 1 | -1 }> = ({ sx, sy, hx, hy, dir }) => {
  const mx = (sx + hx) / 2, my = Math.max(sy, hy) + 14; // sags a little below the line
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={`M ${sx} ${sy} Q ${mx} ${my} ${hx - dir * 34} ${hy}`} fill="none" stroke={C.ink} strokeWidth={17} strokeLinecap="round" />
    </svg>
  );
};

export const Subscribe: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues("long_subscribe");
  const speakFrom = VOICE_AT + cue("Subscribe!");
  const speakTo = VOICE_AT + cue("Subscribe!", 1, true);

  // white Dot route (hops in from the right)
  const wh = hops([{ at: T.hop[0], x: 2160, y: FLOOR - R }, { at: T.hop[1], x: 1580, y: FLOOR - R }, { at: T.hop[2], x: WHITE.x, y: FLOOR - R }], 28, 85);

  // handshake
  const reach = ramp(f, T.reach, T.clasp, 0, 1, Easing.out(Easing.back(1.3)));
  const retract = ramp(f, T.release, T.release + 18, 0, 1, Easing.in(Easing.cubic));
  const ext = reach * (1 - retract);
  const shakeEnv = ramp(f, T.clasp, T.clasp + 8) * (1 - ramp(f, T.shakeEnd - 10, T.shakeEnd));
  const shake = Math.sin(((f - T.clasp) / 22) * Math.PI * 2) * 22 * shakeEnv;
  const M = { x: (RED.x + WHITE.x) / 2, y: FLOOR - R + 22 + shake };
  const bob = shake * 0.22;
  const clasped = f >= T.clasp - 2 && f < T.release + 2;

  // red Dot: looks toward the newcomer, then to camera to speak
  const redLook = f < 20 ? 0 : f < T.release ? 1 : lerp(1, 0, ramp(f, T.release, T.release + 10));
  const talk = f >= speakFrom && f <= speakTo ? 0.45 + 0.55 * Math.abs(Math.sin((f - speakFrom) / 3.2)) : 0;
  const redHop = ramp(f, speakFrom - 10, speakFrom + 8, 0, 1);
  const redY = FLOOR - R + bob - Math.sin(Math.PI * redHop) * 26;
  const redSquash = f > speakFrom + 8 && f < speakFrom + 16 ? 0.25 * Math.sin(((f - speakFrom - 8) / 8) * Math.PI) : 0;
  const idle = Math.sin(f / 18) * 2;

  // subscribe button
  const btn = ramp(f, speakFrom - 4, speakFrom + 14, 0, 1, Easing.out(Easing.back(2.2)));
  const bellRing = f > speakFrom + 10 ? Math.sin((f - speakFrom) / 2.2) * 16 * Math.exp(-(f - speakFrom - 10) / 40) : 0;
  const pulse = f > speakFrom + 30 ? 1 + 0.03 * Math.sin((f - speakFrom) / 8) : 1;

  const shoulderY = FLOOR - R + 34;
  const redShoulder = { x: RED.x + R * 0.86, y: shoulderY + bob };
  const whiteShoulder = { x: WHITE.x - R * 0.86, y: shoulderY + bob };
  const hand = (s: { x: number; y: number }, side: 1 | -1) => ({ // tucked at the body side when ext = 0
    x: lerp(s.x + side * 6, M.x - side * 34, ext),
    y: lerp(s.y + 10, M.y, ext),
  });
  const rh = hand(redShoulder, 1), wh2 = hand(whiteShoulder, -1);

  return (
    <Paper>
      {/* stage floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR, bottom: 0, background: C.sand, borderTop: STROKE }} />
      {/* floor shadows */}
      {[{ x: RED.x, s: 1 - Math.sin(Math.PI * redHop) * 0.2 }, { x: wh.path(f).x, s: 1 - (FLOOR - R - wh.path(f).y) / 300 }].map((d, i) => (
        <div key={i} style={{ position: "absolute", left: d.x - 70 * d.s, top: FLOOR - 4, width: 140 * d.s, height: 16, borderRadius: "50%", background: "rgba(20,20,20,0.18)" }} />
      ))}

      {/* subscribe button between them */}
      {btn > 0 && (
        <div style={{ position: "absolute", left: 960, top: 290, transform: `translate(-50%,-50%) scale(${btn * pulse})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, background: C.red, color: C.white, border: STROKE, borderRadius: 60, padding: "22px 46px 22px 30px", boxShadow: SHADOW, fontFamily: F.head, fontWeight: 700, fontSize: 64, letterSpacing: 1 }}>
            <svg width={60} height={60} viewBox="0 0 100 100" style={{ transform: `rotate(${bellRing}deg)`, transformOrigin: "50% 15%" }}>
              <path d="M 20 72 Q 20 34 50 28 Q 80 34 80 72 Z" fill={C.ochre} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
              <rect x={12} y={70} width={76} height={12} rx={5} fill={C.ochre} stroke={C.ink} strokeWidth={6} />
              <circle cx={50} cy={88} r={8} fill={C.ink} />
              <circle cx={50} cy={22} r={6} fill={C.ink} />
            </svg>
            SUBSCRIBE
          </div>
        </div>
      )}

      {/* arms drawn before the bodies so the shoulders tuck under them */}
      {ext > 0.02 && (
        <>
          <NoodleArm sx={redShoulder.x - 14} sy={redShoulder.y} hx={clasped ? M.x - 30 : rh.x} hy={clasped ? M.y + 4 : rh.y} dir={1} />
          <NoodleArm sx={whiteShoulder.x + 14} sy={whiteShoulder.y} hx={clasped ? M.x + 30 : wh2.x} hy={clasped ? M.y : wh2.y} dir={-1} />
        </>
      )}

      {/* red agent Dot */}
      <TheDot x={RED.x} y={redY + idle} r={R} look={redLook} squash={redSquash} mood="happy" mouthOpen={talk} />

      {/* the original white mascot, outlined for the cream stage (outline + hard shadow follow its shape) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, clipPath: `inset(0 0 ${1080 - FLOOR - 2}px 0)`,
        filter: `drop-shadow(3px 0 0 ${C.ink}) drop-shadow(-3px 0 0 ${C.ink}) drop-shadow(0 3px 0 ${C.ink}) drop-shadow(0 -3px 0 ${C.ink}) drop-shadow(8px 8px 0 ${C.ink})` }}>
        <Dot path={(fr) => { const p = wh.path(fr); return { x: p.x, y: p.y + (fr >= T.clasp ? bob : 0) }; }} squash={wh.squash} size={R}
          track={[{ at: 0, mood: "curious" }, { at: T.hop[2] + 4, mood: "happy" }, { at: speakFrom + 6, mood: "aha" }]}
          look={{ x: f < T.release ? -0.6 : -0.2, y: 0 }} tailAngle={0} seed="sub-white" />
      </div>

      {/* hands drawn on top. Red Dot wears ochre mittens, white Dot white ones, so the two hands read apart. */}
      {ext > 0.02 && (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
          {clasped ? (
            // one clasp unit, side view: white hand behind (thumb up-left), red hand in front wrapping it (thumb on top)
            <g transform={`translate(${M.x} ${M.y}) scale(1.35)`} strokeLinejoin="round" strokeLinecap="round">
              {/* white hand (from the right) behind; its thumb crosses up-left over the top */}
              <Thumb x1={30} y1={-8} x2={8} y2={-36} fill={C.white} />
              <rect x={-20} y={-23} width={72} height={46} rx={23} fill={C.white} stroke={C.ink} strokeWidth={3.2} />
              {/* red hand (from the left) in front, fingers wrapping; its thumb crosses up-right */}
              <Thumb x1={-14} y1={-6} x2={10} y2={-34} fill={C.ochre} />
              <rect x={-52} y={-20} width={74} height={46} rx={23} fill={C.ochre} stroke={C.ink} strokeWidth={3.2} />
              <path d="M 4 -14 Q 12 3 4 20" fill="none" stroke={C.ink} strokeWidth={2.8} />
              <path d="M 13 -12 Q 20 3 13 17" fill="none" stroke={C.ink} strokeWidth={2.8} />
            </g>
          ) : (
            [{ h: rh, dir: 1, fill: C.ochre }, { h: wh2, dir: -1, fill: C.white }].map(({ h, dir, fill }, i) => (
              // open mitten reaching sideways, thumb up
              <g key={i} transform={`translate(${h.x} ${h.y}) scale(${dir * 1.35} 1.35)`} strokeLinejoin="round">
                <Thumb x1={-2} y1={-8} x2={14} y2={-34} fill={fill} />
                <rect x={-30} y={-22} width={70} height={44} rx={22} fill={fill} stroke={C.ink} strokeWidth={3.2} />
              </g>
            ))
          )}
        </svg>
      )}

      <Sequence from={VOICE_AT} layout="none"><Audio src={staticFile("audio/long_subscribe.mp3")} /></Sequence>
      <Sequence from={T.hop[1] - 2} layout="none"><Audio src={staticFile("sfx-dots/bounce.mp3")} volume={0.35} /></Sequence>
      <Sequence from={T.hop[2] - 2} layout="none"><Audio src={staticFile("sfx-dots/bounce.mp3")} volume={0.35} /></Sequence>
      <Sequence from={T.clasp} layout="none"><Audio src={staticFile("sfx-dots/slap.mp3")} volume={0.5} /></Sequence>
      <Sequence from={speakFrom - 4} layout="none"><Audio src={staticFile("sfx-dots/pop.mp3")} volume={0.45} /></Sequence>
      <Sequence from={speakFrom + 10} layout="none"><Audio src={staticFile("sfx-dots/bell.mp3")} volume={0.35} /></Sequence>
    </Paper>
  );
};
