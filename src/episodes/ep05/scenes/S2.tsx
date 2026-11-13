import React from "react";
import { useCurrentFrame } from "remotion";
import { MoodKey } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { Figure2, Pt, Stage } from "../../../shared/Rig";
import { CamKey, World, camAt } from "../../ep04/World";
import { CodeWindow, Cross, DotActor, KeyShape, Padlock, Place, Scene5, Speech, fly, kk, lerpPt, route } from "../Common";
import { Boiler, HandNote, Slip, SlipIcon, TermCard } from "../Props";

// Times (s) from the S2 word timings in captions.json. Re-voice S2 → re-check these.
const T = {
  yes: 0, called: 1.7, prompt: 2.0, hiding: 4.0, read: 6.4, noCode: 7.4, noPw: 8.3, just: 9.9, words: 10.2,
  and: 11.3, switched: 12.9, boiler: 13.6, wellGet: 15.7, heres: 16.8, boss: 19.0, stranger: 21.0, toAn: 22.1,
  pile: 25.0, question: 26.1, resume: 27.0, web: 27.9, same: 29.0, handwriting: 30.3, so: 31.6, sound: 33.4, you: 34.9,
};

// Stage: Dot on the floor; the term card drops in; code / padlock+key get crossed out, a speech bubble stays.
// Open loop: the small boiler at the back flickers on for half a second (camera pushes in, then away).
// The analogy: two handwritten notes (boss, stranger) drop into the agent's jar and come out as identical typed slips
// on one pile; question / resume / web page slips join it; Dot tries to sort them and gives up; one slip floats up and
// becomes a chat bubble tagged "you".
const FLOOR = 830;
const BOILER = { x: 1720, y: FLOOR - 116 }; // centre (w 150)
const FIG = { left: 1170, top: 190, size: 640 };
const FK = FIG.size / 900;
const LID: Pt = { x: FIG.left + 300 * FK, y: FIG.top - 10 }; // the jar's lid (notes go in here)
const JAR: Pt = { x: FIG.left + 300 * FK, y: FIG.top + 200 * FK };
const PILE: Pt = { x: 960, y: 760 };
const pileAt = (i: number): Pt => ({ x: PILE.x + [0, 30, -24, 18, -10][i], y: PILE.y - i * 26 });

const CAM: CamKey[] = [
  [-1, 960, 540, 1.0], [11.2, 960, 540, 1.0], [12.4, 1320, 640, 1.6], [15.6, 1330, 640, 1.65], [16.5, 960, 540, 1.0], [99, 960, 540, 1.0],
];
const TRACK: MoodKey[] = [
  { at: 0, mood: "happy" }, { at: sec(T.called), mood: "curious" }, { at: sec(T.noCode), mood: "smug" },
  { at: sec(T.and + 0.3), mood: "worried" }, { at: sec(T.heres), mood: "curious" }, { at: sec(T.toAn + 0.9), mood: "confused" },
  { at: sec(T.question), mood: "curious" }, { at: sec(T.same), mood: "confused" }, { at: sec(T.so), mood: "sad" }, { at: sec(T.sound), mood: "surprised" },
];
const DOT = (t: number) => route([
  [0, 470, 750, 0], [T.and + 0.4, 1060, 750, 120], [T.heres + 0.2, 420, 750, 130], [T.same, 690, 750, 90],
], t);

// slips: [enter time, icon] → each goes into the lid and out to the pile
const SLIPS: [number, SlipIcon][] = [[T.toAn + 0.2, "none"], [T.toAn + 0.5, "none"], [T.question, "question"], [T.resume, "resume"], [T.web, "web"]];

const S2Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camAt(CAM, t);
  const d = DOT(t);
  // nod on "Yes, you can"
  const nod = t < 1.3 ? 0.12 * Math.max(0, Math.sin(t * 9)) : 0;

  const term = pop(frame, T.called - 0.15);
  const termOut = ramp(frame, T.noCode - 0.4, 0.3);
  const typed = kk(t, T.prompt, T.prompt + 0.9);
  const noObjs = 1 - ramp(frame, T.just - 0.2, 0.3);
  const flame = during(frame, T.switched + 0.25, T.switched + 0.9, 0.08);
  const notesIn = ramp(frame, T.boss - 0.6, 0.4);
  const agentIn = kk(t, T.toAn - 1.2, T.toAn - 0.3);
  const swap = kk(t, T.same + 0.4, T.same + 1.1) - kk(t, T.handwriting + 0.2, T.handwriting + 0.9); // Dot shuffles two slips and puts them back
  const youUp = kk(t, T.so + 0.6, T.sound);

  return (
    <World cam={cam}>
      <Stage spotX={960} floorY={FLOOR} />
      {/* the boiler at the back of the stage: cold, then a half-second flame */}
      <Place x={BOILER.x} y={BOILER.y} o={0.95}><Boiler w={150} flame={flame} t={frame} /></Place>

      {/* term card */}
      <Place x={960} y={400 - 300 * (1 - Math.min(1, term)) - 260 * termOut} o={Math.min(1, term * 2) * (1 - termOut)}>
        <TermCard typed={typed} w={760} />
      </Place>

      {/* No code / no passwords → crossed out; a speech bubble stays */}
      <Place x={620} y={540} s={pop(frame, T.noCode - 0.1) * (0.3 + 0.7 * noObjs)} o={noObjs}>
        <div style={{ position: "relative" }}><CodeWindow w={300} /><Cross size={260} p={kk(t, T.noCode + 0.25, T.noCode + 0.6)} /></div>
      </Place>
      <Place x={980} y={530} s={pop(frame, T.noPw - 0.1) * (0.3 + 0.7 * noObjs)} o={noObjs}>
        <div style={{ position: "relative" }}><Padlock size={190} /><Cross size={240} p={kk(t, T.noPw + 0.35, T.noPw + 0.7)} /></div>
      </Place>
      <Place x={1330} y={560} s={pop(frame, T.noPw + 0.05) * (0.3 + 0.7 * noObjs)} o={noObjs} rot={-20}>
        <div style={{ position: "relative" }}><KeyShape size={230} /><Cross size={220} p={kk(t, T.noPw + 0.5, T.noPw + 0.85)} /></div>
      </Place>
      <Place x={960} y={500} s={Math.min(1, pop(frame, T.just - 0.05))} o={during(frame, T.just - 0.05, T.and - 0.1, 0.25)}>
        <Speech w={360} />
      </Place>

      {/* the agent (the same AI as in S1) walks in */}
      {agentIn > 0 ? (
        <div style={{ position: "absolute", left: FIG.left + 700 * (1 - agentIn), top: FIG.top - (agentIn < 1 ? Math.abs(Math.sin(agentIn * 12)) * 10 : 0) }}>
          <Figure2 size={FIG.size} eyes={1} notebook={1} look={t < T.so ? { x: -0.8, y: 0.2 } : { x: -0.8, y: -0.3 }} />
        </div>
      ) : null}

      {/* the two handwritten notes, then into the jar */}
      {[0, 1].map((i) => {
        const at = i === 0 ? T.boss - 0.6 : T.stranger - 0.5;
        const home = { x: 560, y: i === 0 ? 330 : 590 };
        const into = SLIPS[i][0];
        const p = t < into ? fly({ x: -300, y: home.y }, home, t, at, at + 0.5, 40) : fly(home, LID, t, into, into + 0.6, 160);
        const s = t < into ? 1 : 1 - 0.85 * kk(t, into, into + 0.6);
        if (t < at || t > into + 0.6) return null;
        return <Place key={i} x={p.x} y={p.y} s={s * notesIn} rot={i ? 3 : -4}><HandNote w={300} kind={i === 0 ? "boss" : "stranger"} /></Place>;
      })}
      {/* question / resume / web page: arrive as their own things, go into the jar */}
      {SLIPS.slice(2).map(([at, icon], i) => {
        const p = fly({ x: 300, y: 300 + i * 30 }, LID, t, at - 0.5, at, 160);
        if (t < at - 0.5 || t > at) return null;
        return <Place key={icon} x={p.x} y={p.y} s={1 - 0.85 * kk(t, at - 0.5, at)}><Slip w={220} icon={icon} /></Place>;
      })}
      {/* everything comes out as the same typed slip, onto one pile */}
      {SLIPS.map(([at, icon], i) => {
        const out = at + (i < 2 ? 0.7 : 0.15);
        if (t < out) return null;
        const home = pileAt(i);
        const sw = i === 0 ? swap : i === 1 ? -swap : 0;
        let p = lerpPt(fly(JAR, home, t, out, out + 0.6, 140), { x: home.x + sw * 260, y: home.y }, Math.abs(sw));
        const isYou = i === 4;
        if (isYou && youUp > 0) p = lerpPt(home, { x: 960, y: 420 }, youUp);
        const s = Math.min(1, 0.3 + kk(t, out, out + 0.4));
        return (
          <Place key={i} x={p.x} y={p.y} s={s} rot={[-3, 4, -2, 3, -1][i] * (1 - youUp * (isYou ? 1 : 0))} o={isYou ? 1 - kk(t, T.sound - 0.2, T.sound) : 1}>
            <Slip w={260} icon={icon} />
          </Place>
        );
      })}
      <Place x={960} y={400} s={Math.min(1, pop(frame, T.sound - 0.15))} o={t > T.sound - 0.2 ? 1 : 0}>
        <Speech w={360} tag="you" />
      </Place>

      <DotActor x={d.p.x} y={d.p.y} r={80} track={TRACK} squash={Math.max(d.squash, nod)} seed="e5s2"
        look={t > T.and && t < T.heres ? { x: 1, y: -0.3 } : t > T.toAn ? { x: 1, y: -0.2 } : { x: 0.6, y: -0.3 }}
        arms={ramp(frame, T.same - 0.2, 0.25) * (1 - ramp(frame, T.so + 0.2, 0.3))}
        R={{ tip: { x: pileAt(0).x - 110 + swap * 240, y: pileAt(0).y - 30 } }}
      />
    </World>
  );
};

// Scene S2 — first payoff: prompt injection; the boiler open loop; same paper, same handwriting. Edit only this file.
export const S2: React.FC = () => (
  <Scene5 id="S2" enter="fade">
    <S2Content />
  </Scene5>
);
