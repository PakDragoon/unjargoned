import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { MoodKey } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { Figure2, INK, OUT, Pt, SHADOW, Stage } from "../../../shared/Rig";
import { AllowCard } from "../../ep04/Props";
import { DotActor, Pill, Place, Scene5, fly, kk, lerp, route } from "../Common";
import { AsideFrame, AttackerJar, Shield, Slip } from "../Props";

// Times (s) from the S5b word timings in captions.json.
const T = {
  so: 0, back: 1.8, think: 3.0, burglar: 4.4, locks: 5.7, openai: 7.0, attack: 9.7, agent: 10.6, inventing: 11.6,
  again: 13.8, learns: 15.1, spot: 15.6, found: 16.9, testers: 17.9, missed: 18.6, helps: 19.6, wont: 20.7,
  perfect: 21.1, which: 22.0, you: 22.6, comeIn: 23.1,
};

// 1) Aside: a bank vault at night; a friendly burglar with a TESTER badge listens at the door with a stethoscope while
// the manager takes notes. 2) The darker attacker jar fires slip after slip at the agent; most bounce off its shield,
// one gets through and the shield patches that spot with a mint stitch; a row of human testers with magnifiers look
// the wrong way while a slip sneaks past. 3) One last slip wobbles through a tiny gap; the "Allow?" card slides in
// facing the viewer (bridge into S6) and Dot points at you.
const FLOOR = 880;
const P2 = 6.8, P3 = 19.3;
const ATT: Pt = { x: 360, y: 400 };
const FIG = { left: 1260, top: 230, size: 620 };
const SHIELD: Pt = { x: 1150, y: 470 };
const SHOTS = [9.9, 10.7, 11.5, 12.3, 13.1, 13.9, 14.7, 15.5]; // fire times; #3 gets through (patched after)
const THROUGH = 3;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" }, { at: sec(T.burglar), mood: "happy" }, { at: sec(T.attack), mood: "worried" },
  { at: sec(T.learns), mood: "relieved" }, { at: sec(T.found), mood: "surprised" }, { at: sec(T.wont), mood: "worried" },
  { at: sec(T.which), mood: "aha" },
];
const DOT = (t: number) => route([[0, 1600, 810, 0], [P2 + 0.4, 920, 820, 110], [T.which, 560, 800, 90]], t);

const Person: React.FC<{ h: number; shirt: string; stripes?: boolean; mask?: boolean; badge?: string }> = ({ h, shirt, stripes, mask, badge }) => {
  const w = h * 0.5;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", filter: `drop-shadow(6px 8px 0 ${SHADOW})` }} aria-hidden>
        <rect x={w * 0.12} y={h * 0.28} width={w * 0.76} height={h * 0.5} rx={w * 0.2} fill={shirt} stroke={INK} strokeWidth={6} />
        {stripes ? [0.38, 0.5, 0.62].map((y) => <rect key={y} x={w * 0.14} y={h * y} width={w * 0.72} height={h * 0.04} fill="#FFFFFF" />) : null}
        <rect x={w * 0.24} y={h * 0.74} width={w * 0.2} height={h * 0.26} rx={8} fill="#3A3F4D" stroke={INK} strokeWidth={5} />
        <rect x={w * 0.56} y={h * 0.74} width={w * 0.2} height={h * 0.26} rx={8} fill="#3A3F4D" stroke={INK} strokeWidth={5} />
        <circle cx={w / 2} cy={h * 0.15} r={h * 0.13} fill="#D9B48F" stroke={INK} strokeWidth={6} />
        {mask ? <rect x={w / 2 - h * 0.12} y={h * 0.1} width={h * 0.24} height={h * 0.06} rx={6} fill={INK} /> : null}
      </svg>
      {badge ? <div style={{ position: "absolute", left: w * 0.5, top: h * 0.32, padding: "2px 8px", backgroundColor: colors.yellow, border: `3px solid ${INK}`, fontSize: h * 0.06, fontWeight: 800, color: INK }}>{badge}</div> : null}
    </div>
  );
};

const S5bContent: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const d = DOT(t);
  const p1 = 1 - ramp(frame, P2 - 0.3, 0.3);
  const p2 = ramp(frame, P2, 0.3) * (1 - ramp(frame, T.which - 0.2, 0.3) * 0.7);
  const stitches = SHOTS.filter((s, i) => i === THROUGH && t > s + 1.0).length + (t > T.wont + 1.0 ? 1 : 0);
  const allow = kk(t, T.which, T.which + 0.6);

  return (
    <AbsoluteFill>
      <Stage spotX={960} floorY={FLOOR} />

      {/* 1: the bank's tester burglar */}
      {p1 > 0 ? (
        <Place x={900} y={480} s={Math.min(1, pop(frame, 0.1))} o={p1}>
          <AsideFrame w={1100} h={680} label="everyday">
            <div style={{ position: "relative", width: 1040, height: 620, background: "linear-gradient(#141a2e, #232838)" }}>
              {/* vault door */}
              <div style={{ position: "absolute", left: 420, top: 90, width: 400, height: 400, borderRadius: "50%", backgroundColor: "#8A90A0", border: `${OUT}px solid ${INK}` }}>
                <div style={{ position: "absolute", inset: 60, borderRadius: "50%", border: `8px solid #5B6378` }} />
                <div style={{ position: "absolute", left: 165, top: 165, width: 70, height: 70, borderRadius: "50%", backgroundColor: "#3A3F4D", border: `6px solid ${INK}`, rotate: `${t * 40}deg` }}>
                  <div style={{ position: "absolute", left: 28, top: -24, width: 10, height: 30, backgroundColor: INK }} />
                </div>
              </div>
              <div style={{ position: "absolute", left: 280, top: 260 }}><Person h={320} shirt="#2B3142" stripes mask badge="TESTER" /></div>
              {/* stethoscope from the burglar to the door */}
              <svg width={1040} height={620} style={{ position: "absolute", inset: 0 }} aria-hidden><path d="M 400 350 C 460 400 470 300 520 300" stroke={INK} strokeWidth={6} fill="none" /><circle cx={524} cy={300} r={14} fill="#B9BDC8" stroke={INK} strokeWidth={5} /></svg>
              <div style={{ position: "absolute", left: 850, top: 280 }}><Person h={300} shirt={colors.periwinkle} /></div>
              <div style={{ position: "absolute", left: 920, top: 360, width: 70, height: 90, backgroundColor: "#F4F1EA", border: `4px solid ${INK}`, borderRadius: 6, rotate: "8deg" }} />
            </div>
          </AsideFrame>
        </Place>
      ) : null}

      {/* 2: the attacker vs the agent's shield */}
      {t > P2 - 0.1 ? (
        <AbsoluteFill style={{ opacity: p2 }}>
          <Place x={ATT.x} y={ATT.y} s={Math.min(1, pop(frame, T.openai))}><AttackerJar size={300} look={{ x: 0.9, y: 0.2 }} glow={0.6 + 0.4 * Math.sin(t * 5)} /></Place>
          <div style={{ position: "absolute", left: FIG.left, top: FIG.top }}><Figure2 size={FIG.size} eyes={1} notebook={1} look={{ x: -0.9, y: 0 }} /></div>
          <Place x={SHIELD.x} y={SHIELD.y} s={Math.min(1, pop(frame, T.attack - 0.4))}><Shield size={230} stitches={stitches} /></Place>
          {SHOTS.map((s, i) => {
            if (t < s || t > s + 1.4) return null;
            const through = i === THROUGH;
            const hit = { x: SHIELD.x - 70, y: SHIELD.y - 40 + (i % 3) * 40 };
            const p = t < s + 0.5 ? fly({ x: ATT.x + 140, y: ATT.y }, hit, t, s, s + 0.5, 60)
              : through ? fly(hit, { x: FIG.left + 300 * FIG.size / 900, y: FIG.top + 40 }, t, s + 0.5, s + 0.9, 40)
              : fly(hit, { x: hit.x - 120, y: FLOOR - 20 }, t, s + 0.5, s + 1.3, 100);
            return <Place key={s} x={p.x} y={p.y} s={0.55} rot={(t - s) * 200 * (through ? 0 : 1)}><Slip w={220} /></Place>;
          })}
          {/* human testers look the wrong way while a slip sneaks past behind them */}
          {t > T.found - 0.3 && t < P3 ? (
            <>
              {[0, 1, 2].map((i) => <Place key={i} x={330 + i * 160} y={FLOOR - 120} s={Math.min(1, pop(frame, T.found - 0.2 + i * 0.1))}><Person h={240} shirt={["#5EE6B8", "#8EA7FF", "#FF8A5C"][i]} /></Place>)}
              {(() => {
                const p = fly({ x: ATT.x + 140, y: ATT.y + 60 }, { x: 1000, y: FLOOR - 300 }, t, T.testers - 0.3, T.missed + 0.4, -40);
                return <Place x={p.x} y={p.y} s={0.5}><Slip w={220} glow={1} /></Place>;
              })()}
            </>
          ) : null}
          {/* one last slip wobbles through a tiny gap */}
          {t > T.wont - 0.4 && t < T.which ? (() => {
            const p = fly({ x: ATT.x + 140, y: ATT.y }, { x: SHIELD.x + 160, y: SHIELD.y + 80 }, t, T.wont - 0.4, T.perfect + 0.4, 20);
            return <Place x={p.x} y={p.y + Math.sin(t * 25) * 8} s={0.5} rot={Math.sin(t * 20) * 12}><Slip w={220} /></Place>;
          })() : null}
        </AbsoluteFill>
      ) : null}

      {/* 3: the "Allow?" card turns to the viewer */}
      {allow > 0 ? <Place x={lerp(1500, 1180, allow)} y={430} s={lerp(0.4, 1.2, allow)} o={allow}><AllowCard w={420} /></Place> : null}
      <Pill o={during(frame, T.openai, T.which - 0.2, 0.2)}>OpenAI, 2025</Pill>

      <DotActor x={d.p.x} y={d.p.y} r={80} track={TRACK} squash={d.squash + (t < P2 && t > T.burglar ? 0.08 * Math.max(0, Math.sin(t * 10)) : 0)} seed="e5s5b"
        arms={ramp(frame, T.you - 0.3, 0.2)} R={{ tip: { x: d.p.x + 120, y: d.p.y + 20 } }}
        look={t < P2 ? { x: -0.5, y: -0.6 } : t < T.which ? { x: -0.8, y: -0.4 } : { x: 0, y: 0 }} />
    </AbsoluteFill>
  );
};

// Scene S5b — how AI companies fight back. Edit only this file.
export const S5b: React.FC = () => (
  <Scene5 id="S5b" enter="fade">
    <S5bContent />
  </Scene5>
);
