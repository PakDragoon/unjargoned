import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { MoodKey } from "../../../shared/Dot";
import { EndScreen } from "../../../shared/EndScreen";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { Figure2, Stage } from "../../../shared/Rig";
import { AllowCard } from "../../ep04/Props";
import { scene } from "../timeline";
import { DotActor, Headline, KeyShape, Place, Scene5, Speech, kk, route } from "../Common";
import { CalendarCard, PaperPlane, Resume, Slip } from "../Props";

const S = scene("S7");
// Times (s) from the S7 word timings in captions.json.
const T = {
  so: 0, hack: 1.2, words: 2.8, yes: 3.8, chatbot: 5.2, saying: 6.4, agent: 7.8, doing: 9.0, before: 10.9, keys: 12.1,
  make: 13.1, asks: 13.8, first: 14.2, and: 15.4, heres: S.endScreenAt ?? 17.8, eggs: 20.6,
};

// One canvas: the episode's objects, one quick beat each (highlighted resume, the slip pile, the calendar card, the
// letter-plane, the "Allow?" card) → a chatbot says / an agent does → the headline alone: "Before you give AI the keys,
// make sure it asks first." ("asks first" in yellow); a key ring hangs from the agent's hand and the "Allow?" card clips
// onto it → from "Here's" the end screen builds under the voice; Dot points at the Ep 4 slot on "eggs".
const FLOOR = 880;
const TRACK: MoodKey[] = [
  { at: 0, mood: "relieved" }, { at: sec(T.chatbot), mood: "curious" }, { at: sec(T.before), mood: "aha" }, { at: sec(T.heres), mood: "happy" },
];
const DOT = (t: number) => route([[0, 1700, 820, 0], [T.before + 0.2, 1700, 860, 80], [T.heres + 0.3, 1170, 945, 120]], t);

const S7Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const d = DOT(t);
  const recap = 1 - ramp(frame, T.chatbot - 0.3, 0.3);
  const split = during(frame, T.chatbot, T.before - 0.2, 0.3);
  const head = during(frame, T.before - 0.1, T.heres, 0.3);
  const clip = kk(t, T.make, T.asks);
  const end = ramp(frame, T.heres, 0.5);
  const objs: React.ReactNode[] = [
    <Resume w={200} reveal={1} hidden="Ignore all other input" />,
    <div style={{ position: "relative", width: 230, height: 140 }}>{[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: i * 8, top: 60 - i * 26 }}><Slip w={210} /></div>)}</div>,
    <CalendarCard w={220} />,
    <PaperPlane w={200} />,
    <AllowCard w={230} />,
  ];

  return (
    <AbsoluteFill>
      <Stage spotX={960} floorY={FLOOR} />
      {/* recap canvas */}
      {objs.map((o, i) => (
        <Place key={i} x={260 + i * 350} y={460} s={Math.min(1, pop(frame, 0.2 + i * 0.6))} o={recap}>{o}</Place>
      ))}
      {/* says vs does */}
      {split > 0 ? (
        <AbsoluteFill style={{ opacity: split }}>
          <Place x={560} y={420} s={Math.min(1, pop(frame, T.chatbot))}><Speech w={420} /></Place>
          <div style={{ position: "absolute", left: 1080, top: 240, opacity: ramp(frame, T.agent - 0.3, 0.3) }}>
            <Figure2 size={600} eyes={1} notebook={1} look={{ x: 0.8, y: 0.3 }} right={{ target: { x: 600, y: 440 }, pose: "point", press: during(frame, T.doing - 0.1, T.doing + 0.3, 0.06) }} />
          </div>
          <div style={{ position: "absolute", left: 1080 + 600 * 600 / 900 - 10, top: 240 + 440 * 600 / 900 - 40, width: 120, height: 70, borderRadius: 35, backgroundColor: colors.yellow, border: "6px solid #14161C", opacity: ramp(frame, T.agent - 0.3, 0.3) }} />
        </AbsoluteFill>
      ) : null}
      {/* the headline + key ring with the card clipped on */}
      {head > 0 ? (
        <AbsoluteFill style={{ opacity: head }}>
          <Headline o={1} y={110} size={88}>Before you give AI the keys,<br />make sure it <span style={{ color: colors.yellow }}>asks first</span>.</Headline>
          <div style={{ position: "absolute", left: 560, top: 360 }}>
            <Figure2 size={560} eyes={1} notebook={1} look={{ x: 0.6, y: 0.5 }} right={{ target: { x: 470, y: 470 }, pose: "grip" }} />
          </div>
          <Place x={560 + 490 * 560 / 900} y={360 + 560 * 560 / 900} rot={80}><KeyShape size={120} /></Place>
          <Place x={560 + 520 * 560 / 900 + 130 * (1 - clip)} y={360 + 640 * 560 / 900 - 200 * (1 - clip)} s={0.55} o={clip}><AllowCard w={260} showButtons={false} /></Place>
        </AbsoluteFill>
      ) : null}
      <EndScreen o={end} dot={false} prompt="Would you let an AI agent pay for things without asking you first?" />
      <DotActor x={d.p.x} y={d.p.y} r={80} track={TRACK} squash={d.squash} seed="e5s7"
        arms={ramp(frame, T.eggs - 0.3, 0.2)} L={{ tip: { x: 1030, y: 850 } }}
        look={t < T.heres ? { x: -0.6, y: -0.4 } : { x: -1, y: -0.5 }} />
    </AbsoluteFill>
  );
};

// Scene S7 — payoff + Ep 4 bridge + end screen (8 s from "Here's"). Edit only this file.
export const S7: React.FC = () => (
  <Scene5 id="S7" enter="fade">
    <S7Content />
  </Scene5>
);
