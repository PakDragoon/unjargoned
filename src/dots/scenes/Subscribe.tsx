// Subscribe sting: the red agent Dot meets the channel's original white Dot mascot, they high-five,
// and the red Dot says "Subscribe!". Standalone (Dots-Subscribe) for review before it goes into the episode.
import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame, Easing, interpolate } from "remotion";
import { Dot, hops } from "../../shared/Dot";
import { C, F, STROKE, SHADOW, Paper, TheDot, useCues, ramp, lerp } from "../kit";

export const SUB_FRAMES = 300;
const FLOOR = 780;            // floor line
const R = 115;                // both dots the same size
const RED = { x: 720 };       // red Dot stands here
const WHITE = { x: 1200 };    // white Dot lands here
const VOICE_AT = 176;         // "Subscribe!" starts (audio sequence start)
const CY = FLOOR - R;         // body centre height
const SLAP = 112;             // palms meet
const M = { x: (RED.x + WHITE.x) / 2, y: CY - 175 }; // high-five point, above their heads

/**
 * Cartoon glove (white, 4 fingers, thumb, rolled cuff), drawn with fingers pointing up from the wrist at (0,0).
 * Placed by wrist position + rotation; `flip` mirrors it so the thumb is on the correct side for a left hand.
 */
const Glove: React.FC<{ x: number; y: number; rot: number; flip: boolean; s?: number }> = ({ x, y, rot, flip, s = 1 }) => {
  const cap = (x1: number, y1: number, x2: number, y2: number, w: number, k: string) => (
    <g key={k} strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={w + 7} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.white} strokeWidth={w} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s} ${s})`} strokeLinejoin="round">
      {/* fingers (bases tuck under the palm) */}
      {cap(-17, -46, -21, -80, 15, "f1")}
      {cap(-5, -50, -6, -92, 15, "f2")}
      {cap(7, -50, 8, -90, 15, "f3")}
      {cap(18, -46, 22, -76, 14, "f4")}
      {/* thumb on the inner side, angled out */}
      {cap(-20, -26, -44, -50, 16, "th")}
      {/* palm */}
      <path d="M -28 -14 Q -30 -58 0 -60 Q 30 -58 28 -14 Q 26 0 0 2 Q -26 0 -28 -14 Z" fill={C.white} stroke={C.ink} strokeWidth={3.5} />
      {/* finger creases on the palm */}
      <path d="M -11 -50 L -11 -40 M 1 -52 L 1 -42 M 13 -50 L 13 -41" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
      {/* rolled cuff */}
      <rect x={-25} y={-6} width={50} height={20} rx={9} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
      <path d="M -20 4 L 20 4" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
};

type Key = { f: number; x: number; y: number; rot: number; s: number };
/** Keyframed hand path for the red Dot (right hand); the white Dot mirrors it around the centre line. */
const KEYS = (sh: { x: number; y: number }): Key[] => [
  { f: 78, x: sh.x + 10, y: sh.y + 20, rot: 130, s: 0 },          // tucked at the side
  { f: 88, x: sh.x + 34, y: sh.y - 20, rot: 50, s: 1 },           // arm pops out, raising
  { f: 100, x: sh.x + 6, y: sh.y - 150, rot: -18, s: 1 },         // wind-up: pulled back high
  { f: SLAP, x: M.x - 60, y: M.y + 46, rot: 20, s: 1 },           // swing in -> palms meet
  { f: SLAP + 10, x: M.x - 74, y: M.y + 40, rot: 10, s: 1 },      // recoil
  { f: 140, x: sh.x + 34, y: sh.y - 20, rot: 50, s: 1 },          // lowering
  { f: 152, x: sh.x + 10, y: sh.y + 20, rot: 130, s: 0 },         // tucked away again
];
const EASES = [Easing.out(Easing.back(1.6)), Easing.inOut(Easing.cubic), Easing.in(Easing.quad), Easing.out(Easing.quad), Easing.inOut(Easing.cubic), Easing.in(Easing.cubic)];
const handAt = (keys: Key[], f: number): Key => {
  if (f <= keys[0].f) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i].f) {
      const a = keys[i - 1], b = keys[i];
      const t = interpolate(f, [a.f, b.f], [0, 1], { easing: EASES[i - 1] });
      return { f, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rot: lerp(a.rot, b.rot, t), s: lerp(a.s, b.s, t) };
    }
  }
  return keys[keys.length - 1];
};

export const Subscribe: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues("long_subscribe");
  const speakFrom = VOICE_AT + cue("Subscribe!");
  const speakTo = VOICE_AT + cue("Subscribe!", 1, true);

  // white Dot hops in from the right
  const wh = hops([{ at: 0, x: 2160, y: CY }, { at: 30, x: 1580, y: CY }, { at: 60, x: WHITE.x, y: CY }], 28, 85);

  // body reactions: crouch before the swing, little joy-hop on impact
  const crouch = ramp(f, 90, 100) * (1 - ramp(f, 102, 110));
  const joy = ramp(f, SLAP, SLAP + 22);
  const hopUp = Math.sin(Math.PI * joy) * 34;
  const landSq = f > SLAP + 22 && f < SLAP + 32 ? 0.22 * Math.sin(((f - SLAP - 22) / 10) * Math.PI) : 0;
  const bodySquash = crouch * 0.18 + landSq;
  const shakeCam = f >= SLAP && f < SLAP + 8 ? Math.sin(f * 2.3) * 5 * (1 - (f - SLAP) / 8) : 0;

  // red Dot: looks toward the newcomer, up at the hands, then to camera to speak
  const redLook = f < 20 ? 0 : f < 150 ? 1 : lerp(1, 0, ramp(f, 150, 162));
  const talk = f >= speakFrom && f <= speakTo ? 0.45 + 0.55 * Math.abs(Math.sin((f - speakFrom) / 3.2)) : 0;
  const redHop = ramp(f, speakFrom - 10, speakFrom + 8, 0, 1);
  const redSpeakSq = f > speakFrom + 8 && f < speakFrom + 16 ? 0.25 * Math.sin(((f - speakFrom - 8) / 8) * Math.PI) : 0;
  const idle = Math.sin(f / 18) * 2;
  const redY = CY - hopUp - Math.sin(Math.PI * redHop) * 26 + idle;

  // subscribe button
  const btn = ramp(f, speakFrom - 4, speakFrom + 14, 0, 1, Easing.out(Easing.back(2.2)));
  const bellRing = f > speakFrom + 10 ? Math.sin((f - speakFrom) / 2.2) * 16 * Math.exp(-(f - speakFrom - 10) / 40) : 0;
  const pulse = f > speakFrom + 30 ? 1 + 0.03 * Math.sin((f - speakFrom) / 8) : 1;

  // arms: shoulders on the upper inner side of each body; white mirrors red around the centre line
  const redSh = { x: RED.x + R * 0.72, y: CY - R * 0.42 - hopUp };
  const whiteSh = { x: WHITE.x - R * 0.72, y: CY - R * 0.42 - hopUp };
  const rH = handAt(KEYS(redSh), f);
  const wK = KEYS({ x: 2 * M.x - whiteSh.x, y: whiteSh.y }).map((k) => ({ ...k, x: 2 * M.x - k.x, rot: -k.rot }));
  const wH = handAt(wK, f);
  const armsOn = f > 78 && f < 152;
  const burst = ramp(f, SLAP - 1, SLAP + 16, 0, 1, Easing.out(Easing.cubic));

  const arm = (sh: { x: number; y: number }, h: Key, side: 1 | -1, k: string) => {
    // soft noodle from shoulder to wrist, bowing outward (away from the other Dot)
    const mx = (sh.x + h.x) / 2 - side * 28, my = (sh.y + h.y) / 2 + 10;
    return <path key={k} d={`M ${sh.x} ${sh.y} Q ${mx} ${my} ${h.x} ${h.y}`} fill="none" stroke={C.ink} strokeWidth={17 * Math.min(1, h.s * 1.5)} strokeLinecap="round" />;
  };

  return (
    <Paper>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shakeCam}px, ${shakeCam * 0.4}px)` }}>
        {/* stage floor + contact shadows */}
        <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR, bottom: 0, background: C.sand, borderTop: STROKE }} />
        {[{ x: RED.x, lift: CY - redY }, { x: wh.path(f).x, lift: CY - wh.path(f).y + hopUp }].map((d, i) => {
          const sc = Math.max(0.5, 1 - Math.max(0, d.lift) / 300);
          return <div key={i} style={{ position: "absolute", left: d.x - 70 * sc, top: FLOOR - 4, width: 140 * sc, height: 16, borderRadius: "50%", background: "rgba(20,20,20,0.18)" }} />;
        })}

        {/* subscribe button */}
        {btn > 0 && (
          <div style={{ position: "absolute", left: 960, top: 250, transform: `translate(-50%,-50%) scale(${btn * pulse})` }}>
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

        {/* arms go behind the bodies so the shoulders tuck in */}
        {armsOn && (
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {arm(redSh, rH, 1, "ra")}
            {arm(whiteSh, wH, -1, "wa")}
          </svg>
        )}

        {/* red agent Dot */}
        <TheDot x={RED.x} y={redY} r={R} look={redLook} squash={bodySquash + redSpeakSq} mood="happy" mouthOpen={talk} />

        {/* the original white mascot, outlined for the cream stage; clipped at the floor so the tail never dips under it */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, clipPath: `inset(0 0 ${1080 - FLOOR - 2}px 0)`,
          filter: `drop-shadow(3px 0 0 ${C.ink}) drop-shadow(-3px 0 0 ${C.ink}) drop-shadow(0 3px 0 ${C.ink}) drop-shadow(0 -3px 0 ${C.ink}) drop-shadow(8px 8px 0 ${C.ink})` }}>
          <Dot path={(fr) => { const p = wh.path(fr); const j = Math.sin(Math.PI * ramp(fr, SLAP, SLAP + 22)) * 34; return { x: p.x, y: p.y - j }; }}
            squash={(fr) => wh.squash(fr) + (ramp(fr, 90, 100) * (1 - ramp(fr, 102, 110))) * 0.07 + (fr > SLAP + 22 && fr < SLAP + 32 ? 0.1 * Math.sin(((fr - SLAP - 22) / 10) * Math.PI) : 0)}
            size={R} track={[{ at: 0, mood: "curious" }, { at: 64, mood: "happy" }, { at: speakFrom + 6, mood: "aha" }]}
            look={{ x: f < 150 ? -0.6 : -0.2, y: f > 92 && f < 140 ? -0.6 : 0 }} tailAngle={0} seed="sub-white" />
        </div>

        {/* gloves on top */}
        {armsOn && (
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {rH.s > 0.02 && <Glove x={rH.x} y={rH.y} rot={rH.rot} flip={false} s={rH.s * 1.1} />}
            {wH.s > 0.02 && <Glove x={wH.x} y={wH.y} rot={wH.rot} flip={true} s={wH.s * 1.1} />}
          </svg>
        )}

        {/* impact burst */}
        {burst > 0 && burst < 1 && (
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
              if (Math.sin(a) > 0.1) return null; // only rays above the hands
              const r0 = 105 + burst * 40, r1 = r0 + 40 * (1 - burst) + 12;
              return <line key={i} x1={M.x + Math.cos(a) * r0} y1={M.y - 50 + Math.sin(a) * r0} x2={M.x + Math.cos(a) * r1} y2={M.y - 50 + Math.sin(a) * r1}
                stroke={C.ochre} strokeWidth={12} strokeLinecap="round" opacity={1 - burst * 0.6} />;
            })}
          </svg>
        )}
      </div>

      <Sequence from={VOICE_AT} layout="none"><Audio src={staticFile("audio/long_subscribe.mp3")} /></Sequence>
      <Sequence from={28} layout="none"><Audio src={staticFile("sfx-dots/bounce.mp3")} volume={0.35} /></Sequence>
      <Sequence from={58} layout="none"><Audio src={staticFile("sfx-dots/bounce.mp3")} volume={0.35} /></Sequence>
      <Sequence from={102} layout="none"><Audio src={staticFile("sfx-dots/whoosh.mp3")} volume={0.35} /></Sequence>
      <Sequence from={SLAP - 1} layout="none"><Audio src={staticFile("sfx-dots/slap.mp3")} volume={0.7} /></Sequence>
      <Sequence from={speakFrom - 4} layout="none"><Audio src={staticFile("sfx-dots/pop.mp3")} volume={0.45} /></Sequence>
      <Sequence from={speakFrom + 10} layout="none"><Audio src={staticFile("sfx-dots/bell.mp3")} volume={0.35} /></Sequence>
    </Paper>
  );
};
