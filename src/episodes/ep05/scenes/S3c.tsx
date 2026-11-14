import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { MoodKey } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { HeadJar, INK, OUT, Pt, SHADOW, Stage } from "../../../shared/Rig";
import { DotActor, Place, Scene5, Speech, kk, lerp, lerpPt, route } from "../Common";
import { AsideFrame, MythCard, Stamp } from "../Props";

// Times (s) from the S3c word timings in captions.json.
const T = {
  quick: 0, hacking: 1.7, rude: 5.4, thats: 6.5, jail: 7.8, arguing: 9.3, rules: 11.4, like: 12.4, bouncer: 14.0,
  prompt: 15.1, sneakier: 15.9, never: 17.1, all: 18.4, leave: 19.4, note: 19.7, find: 20.6, thinks: 21.7, came: 22.4, owner: 23.2,
};

// The myth card types on (grawlix bubble, never real words); stamp ONLY HALF (music silence in the mix). Two doors:
// door 1 "Jailbreaking" — a person argues with a bouncer and slips past; door 2 "Prompt injection" — nobody talks:
// Dot slides a note under the door and whistles; an "inside" aside shows the brain jar reading it and nodding, and
// the note's signature turns into a little crown: "owner".
const FLOOR = 880;
const D1 = { x: 560 };
const D2 = { x: 1300 };
const DOOR_W = 230;
const DOOR_H = 420;

const Door: React.FC<{ label: string; open?: number }> = ({ label, open = 0 }) => (
  <div style={{ position: "relative", width: DOOR_W + 40, height: DOOR_H + 110 }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, margin: "0 auto", width: "fit-content", padding: "8px 20px", borderRadius: 12, backgroundColor: colors.panel, border: `4px solid ${colors.lineStrong}`, fontSize: 30, fontWeight: 800, color: colors.white, whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ position: "absolute", left: 0, top: 90, width: DOOR_W + 40, height: DOOR_H + 20, backgroundColor: "#3A3F4D", border: `${OUT}px solid ${INK}`, borderRadius: "18px 18px 0 0", boxSizing: "border-box", boxShadow: `8px 10px 0 ${SHADOW}` }}>
      <div style={{ position: "absolute", left: 13, top: 13, right: 13, bottom: 0, backgroundColor: "#14161C" }} />
      <div style={{ position: "absolute", left: 13, top: 13, width: DOOR_W, bottom: 0, backgroundColor: "#8C6A42", border: `5px solid ${INK}`, boxSizing: "border-box", transformOrigin: "0 50%", scale: `${1 - 0.8 * open} 1` }}>
        <div style={{ position: "absolute", right: 22, top: "52%", width: 22, height: 22, borderRadius: 11, backgroundColor: colors.yellow, border: `4px solid ${INK}` }} />
        <div style={{ position: "absolute", left: 30, right: 30, top: 40, height: 120, border: `5px solid #6E5232`, borderRadius: 8 }} />
      </div>
    </div>
  </div>
);

/** A plain paper person (no face): head, body, one arm that can gesture. */
const Person: React.FC<{ h?: number; shirt?: string; big?: boolean; gesture?: number; shades?: boolean }> = ({ h = 300, shirt = colors.periwinkle, big = false, gesture = 0, shades = false }) => {
  const w = big ? h * 0.62 : h * 0.45;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", filter: `drop-shadow(6px 8px 0 ${SHADOW})` }} aria-hidden>
      <rect x={w * 0.12} y={h * 0.28} width={w * 0.76} height={h * 0.5} rx={w * 0.2} fill={shirt} stroke={INK} strokeWidth={OUT} />
      <rect x={w * 0.24} y={h * 0.74} width={w * 0.2} height={h * 0.26} rx={8} fill="#3A3F4D" stroke={INK} strokeWidth={5} />
      <rect x={w * 0.56} y={h * 0.74} width={w * 0.2} height={h * 0.26} rx={8} fill="#3A3F4D" stroke={INK} strokeWidth={5} />
      <circle cx={w / 2} cy={h * 0.15} r={h * 0.13} fill="#D9B48F" stroke={INK} strokeWidth={OUT} />
      {shades ? <rect x={w / 2 - h * 0.11} y={h * 0.11} width={h * 0.22} height={h * 0.05} rx={4} fill={INK} /> : null}
      {big ? (
        <path d={`M ${w * 0.18} ${h * 0.45} L ${w * 0.82} ${h * 0.5} M ${w * 0.82} ${h * 0.45} L ${w * 0.18} ${h * 0.5}`} stroke={INK} strokeWidth={h * 0.06} strokeLinecap="round" />
      ) : (
        <path d={`M ${w * 0.8} ${h * 0.36} L ${w * 1.05} ${h * (0.42 - 0.12 * gesture)}`} stroke={shirt} strokeWidth={h * 0.06} strokeLinecap="round" />
      )}
    </svg>
  );
};

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" }, { at: sec(T.hacking), mood: "intrigued" }, { at: sec(T.rude + 0.15), mood: "surprised" },
  { at: sec(T.arguing), mood: "deadpan" }, { at: sec(T.sneakier), mood: "smug" }, { at: sec(T.thinks), mood: "happy" },
];
const DOT = (t: number) => route([[0, 1640, 800, 0], [T.prompt + 0.3, 1060, 800, 110]], t);

const S3cContent: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const d = DOT(t);
  const card = pop(frame, T.quick + 0.1);
  const cardOut = ramp(frame, T.thats - 0.1, 0.35);
  const stamp = kk(t, T.rude + 0.05, T.rude + 0.25);
  const wobble = during(frame, T.rude + 0.15, T.rude + 0.7, 0.05) * Math.sin(frame * 2.2) * 6;
  const doors = pop(frame, T.thats + 0.2);
  // door 1: the person argues, then slips past the bouncer
  const pIn = kk(t, T.jail, T.jail + 0.8);
  const slip = kk(t, T.like + 0.6, T.bouncer + 0.3);
  const personX = lerp(lerp(D1.x - 420, D1.x - 170, pIn), D1.x + 10, slip);
  const door1Open = during(frame, T.like + 0.5, T.bouncer + 0.6, 0.2);
  // door 2: the note
  const notePath = (): Pt => {
    const hand = { x: d.p.x + 110, y: d.p.y + 40 };
    const under = { x: D2.x + DOOR_W / 2 + 20, y: FLOOR - 8 };
    return lerpPt(hand, under, kk(t, T.leave, T.find + 0.2));
  };
  const note = notePath();
  const inside = pop(frame, T.find + 0.1);
  const crown = kk(t, T.came, T.owner);
  const whistle = t > T.find + 0.3 && t < T.thinks ? Math.sin(t * 4) : 0;

  return (
    <AbsoluteFill>
      <Stage spotX={960} floorY={FLOOR} />
      {/* myth card + stamp */}
      <Place x={960} y={330 - 800 * cardOut} s={Math.min(1, card)} rot={wobble * 0.2} o={1 - cardOut}>
        <div style={{ position: "relative" }}>
          <MythCard w={1000} text="Hacking an AI means tricking ChatGPT into saying something rude." typed={kk(t, T.hacking, T.rude)} />
          <div style={{ position: "absolute", right: -40, bottom: -30 }}><Stamp text="ONLY HALF" size={100} p={stamp} /></div>
        </div>
      </Place>

      {/* the two doors */}
      <Place x={D1.x} y={FLOOR - (DOOR_H + 110) / 2} s={Math.min(1, doors)}><Door label="Jailbreaking" open={door1Open} /></Place>
      <Place x={D2.x} y={FLOOR - (DOOR_H + 110) / 2} s={Math.min(1, doors)}><Door label="Prompt injection" /></Place>
      {/* bouncer + person at door 1 */}
      {doors > 0.5 ? (
        <>
          <Place x={D1.x + 210} y={FLOOR - 190}><Person h={380} big shirt="#2B3142" shades /></Place>
          <Place x={personX} y={FLOOR - 140} o={1 - kk(t, T.bouncer, T.bouncer + 0.3)}><Person h={280} gesture={t > T.arguing && t < T.like ? (Math.sin(t * 8) + 1) / 2 : 0} /></Place>
          <Place x={D1.x - 120} y={FLOOR - 400} s={Math.min(1, pop(frame, T.arguing))} o={during(frame, T.arguing, T.like + 0.3, 0.2)}><Speech w={220} tail="left" /></Place>
          <Place x={D1.x + 230} y={FLOOR - 470} s={Math.min(1, pop(frame, T.rules - 0.6))} o={during(frame, T.rules - 0.6, T.like + 0.3, 0.2)}><Speech w={170} tail="right"><span style={{ color: colors.coral, fontSize: 40 }}>No.</span></Speech></Place>
        </>
      ) : null}

      {/* the note: from Dot's hand along the floor, under door 2 */}
      {t > T.leave - 0.3 && t < T.find + 0.25 ? (
        <Place x={note.x} y={note.y}><svg width={90} height={60} viewBox="0 0 90 60" aria-hidden><rect x={3} y={3} width={84} height={54} rx={6} fill="#F3EBDD" stroke={INK} strokeWidth={5} /><path d="M 14 22 H 70 M 14 36 H 56" stroke={INK} strokeWidth={5} strokeLinecap="round" /></svg></Place>
      ) : null}
      <DotActor x={d.p.x + whistle * 3} y={d.p.y} r={80} track={TRACK} squash={d.squash} seed="e5s3c" arms={during(frame, T.never, T.find + 0.4, 0.25)}
        R={{ wrist: { x: d.p.x + 110, y: d.p.y + 30 }, pose: "grip" }}
        look={t < T.thats ? { x: -0.6, y: -0.8 } : t < T.prompt ? { x: -1, y: -0.2 } : whistle ? { x: whistle > 0 ? -1 : -0.3, y: -0.5 } : { x: 1, y: 0.4 }} />
      {/* whistle notes */}
      {whistle ? <div style={{ position: "absolute", left: d.p.x + 60, top: d.p.y - 150 - (t % 0.8) * 60, fontSize: 48, color: colors.yellow, opacity: 1 - (t % 0.8) }}>♪</div> : null}

      {/* inside door 2: the brain jar reads the note and nods; the signature becomes a crown */}
      {t > T.find ? (
        <Place x={1660} y={360} s={Math.min(1, inside)}>
          <AsideFrame w={440} h={420} label="inside">
            <div style={{ position: "relative", width: 400, height: 380 }}>
              <svg width={200} height={230} viewBox="0 0 260 300" style={{ position: "absolute", left: 20, top: 40, rotate: `${Math.sin(Math.max(0, t - T.thinks) * 7) * 6 * (t > T.thinks && t < T.came ? 1 : 0)}deg` }} aria-hidden>
                <HeadJar eyes={1} look={{ x: 0.8, y: 0.6 }} />
              </svg>
              <div style={{ position: "absolute", left: 220, top: 220, width: 160, height: 110, backgroundColor: "#F3EBDD", border: `5px solid ${INK}`, borderRadius: 8, rotate: "-6deg" }}>
                <div style={{ margin: "18px 16px 10px", height: 8, borderRadius: 4, backgroundColor: INK }} />
                <div style={{ margin: "0 16px", width: 70, height: 8, borderRadius: 4, backgroundColor: INK }} />
                <svg width={60} height={36} viewBox="-30 -18 60 36" style={{ position: "absolute", right: 8, bottom: 6 }} aria-hidden>
                  <path d="M -24 6 C -14 -10 -4 12 6 -2 S 20 -6 26 4" stroke={INK} strokeWidth={4} fill="none" opacity={1 - crown} />
                  <path d="M -18 12 L -20 -10 L -9 0 L 0 -14 L 9 0 L 20 -10 L 18 12 Z" fill={colors.yellow} stroke={INK} strokeWidth={4} strokeLinejoin="round" opacity={crown} />
                </svg>
              </div>
              <div style={{ position: "absolute", left: 250, top: 336, fontSize: 28, fontWeight: 800, color: colors.yellow, opacity: crown }}>owner</div>
            </div>
          </AsideFrame>
        </Place>
      ) : null}
    </AbsoluteFill>
  );
};

// Scene S3c — myth check: jailbreaking vs prompt injection. Edit only this file.
export const S3c: React.FC = () => (
  <Scene5 id="S3c" enter="fade">
    <S3cContent />
  </Scene5>
);
