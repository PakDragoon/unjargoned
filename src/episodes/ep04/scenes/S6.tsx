import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { QuestionStrip } from "../QuestionStrip";
import { Figure2, INK, Stage } from "../Rig";
import { Checkout, Kiosk, ProductView } from "../Screens";
import { scene } from "../timeline";
import {
  BODY_H, BUY_TIP, BeltKit, CHAT, CamKey, FIG, FLOOR, Key, LoopRing, REST_WIDE_L, REST_WIDE_R, SCREEN, ScreenOff, World, along, camAt, forearmPt,
  wristFor,
} from "../World";

const S = scene("S6");

// Times (s) from the S6 word timings in captions.json. Re-voice S6 → re-check these.
const T = {
  agent: 1.2, brain: 2.9, hands: 4.64, eyes: 6.14, notebook: 7.66, round: 9.56, done: 11.32, stop: 12.12, risky: 13.52,
  talks: 14.76, acts: 16.4, actsWord: 17.04, alive: 18.86, guessing: 21.36, tools: 23.38, wrong: 24.64, click: 25.36, buy: 25.6,
};

// Recap on the same agent, one part per beat (the camera visits each): the bare jar-on-a-body → gloves + belt + helper
// → goggles → notebook → the loop rings it → the "Allow?" gate → the headline alone on a dark stage → back at the
// checkout: the jar's guess slot spins and lands on "Buy" (wrong), and the finger presses Buy.

const RING = { cx: 660, cy: 520, rx: 300, ry: 350 };
const LAP = 0.9;
const GUESSES = ["eggs", "milk", "bread", "rice", "jam"];
const CAM: CamKey[] = [
  [-1, 660, 480, 1.2], [2.6, 660, 480, 1.2], [3.1, 660, 330, 1.9], [4.4, 660, 330, 1.9], [4.9, 660, 600, 1.75], [5.9, 660, 600, 1.75],
  [6.35, 660, 320, 1.95], [7.4, 660, 320, 1.95], [7.9, 680, 470, 1.9], [9.2, 680, 470, 1.9], [9.7, 700, 500, 1.05], [11.7, 700, 500, 1.05],
  [12.2, 680, 600, 1.9], [14.4, 680, 600, 1.9], [18.1, 840, 480, 1.4], [20.9, 840, 480, 1.4], [21.4, 660, 300, 2.1], [23.2, 660, 300, 2.1],
  [23.8, 840, 470, 1.4], [99, 840, 470, 1.4],
];
const HOVER = wristFor({ x: BUY_TIP().x - 18, y: BUY_TIP().y - 34 });
const PRESS = wristFor(BUY_TIP());
const RIGHT_KEYS: Key[] = [[-1, REST_WIDE_R], [23.5, REST_WIDE_R], [24.3, HOVER], [25.15, HOVER], [25.36, PRESS], [99, PRESS]];

const TRACK: MoodKey[] = [
  { at: 0, mood: "happy" },
  { at: sec(T.hands), mood: "relieved" },
  { at: sec(T.acts), mood: "aha" },
  { at: sec(T.alive), mood: "neutral" },
  { at: sec(T.wrong), mood: "worried" },
  { at: sec(T.click), mood: "panic" },
];
const ROUTE = hops([
  { at: 0, x: 1650, y: 920 },
  { at: sec(9.8), x: 1720, y: 930 },
  { at: sec(18.3), x: 1790, y: 950 },
  { at: sec(21.5), x: 1320, y: 640 }, // beside the jar, watching the slot spin
  { at: sec(23.9), x: 1790, y: 950 },
]);
const LOOK = glances([
  { at: 0, x: -1, y: -0.4 },
  { at: sec(9.8), x: -1, y: -0.4 },
  { at: sec(18.3), x: -1, y: -0.5 },
  { at: sec(21.5), x: -1, y: -0.2 },
  { at: sec(23.9), x: -0.9, y: -0.6 },
]);

const S6Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = camAt(CAM, t);
  const part = (at: number) => (t < at - 0.02 ? 0 : Math.min(1.08, pop(frame, at)));

  const hands = part(T.hands);
  const eyes = part(T.eyes);
  const notebook = part(T.notebook);
  const gate = part(12.02);
  const right = along(RIGHT_KEYS, t);
  const press = during(frame, T.click - 0.02, 26.4, 0.05);

  // the loop
  const ringO = during(frame, 9.36, 11.9, 0.3);
  const runner = -90 + (360 * Math.max(0, Math.min(t, T.done) - 9.6)) / LAP;

  // the guess slot
  const spinning = t > 21.16 && t < T.wrong;
  const guess = t < 21.16 ? "" : spinning ? GUESSES[Math.floor(frame / 2.5) % GUESSES.length] : "Buy";
  const wrong = t >= T.wrong ? 1 : 0;

  // headline
  const head = during(frame, 14.6, 18.1, 0.25);

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
      <World cam={c}>
        <Stage spotX={720} floorY={FLOOR} />
        <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
          <Kiosk w={CHAT.w}><ScreenOff /></Kiosk>
        </div>
        <div style={{ position: "absolute", left: SCREEN.left, top: SCREEN.top }}>
          <Checkout w={SCREEN.w} bodyH={BODY_H} feed={0} receipt={null}>
            {t < 18.1 ? <ScreenOff /> : <ProductView w={SCREEN.w} press={press} ripple={ramp(frame, T.click, 0.5)} />}
          </Checkout>
        </div>
        {ringO > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: ringO }}>
            <LoopRing cx={RING.cx} cy={RING.cy} rx={RING.rx} ry={RING.ry} draw={ramp(frame, 9.36, 0.35)} runner={runner} runnerO={t > 9.55 && t < T.done + 0.1 ? 1 : 0} color={t >= T.done ? colors.mint : colors.yellow} />
          </div>
        ) : null}

        <div style={{ position: "absolute", left: FIG.left, top: FIG.top }}>
          <Figure2
            size={FIG.size}
            eyes={eyes}
            notebook={notebook}
            glow={Math.max(during(frame, T.brain - 0.1, T.brain + 1.0, 0.2), spinning ? 0.6 : 0)}
            guess={guess}
            wrong={wrong}
            look={t >= 18.1 ? { x: 1, y: 0.3 } : { x: 0.3, y: 0.3 }}
            left={{ target: REST_WIDE_L, pose: "relaxed", thumb: "up", hand: hands }}
            right={{ target: right, pose: t > 23.4 ? "point" : "relaxed", thumb: t > 23.4 ? "up" : "down", hand: hands, press }}
          >
            <BeltKit strap={ramp(frame, T.hands, 0.3)} tools={[0, 1, 2, 3].map((i) => part(T.hands + 0.1 + i * 0.07))} helper={hands} light={1} gate={gate}
              cables={{ l: forearmPt("L", REST_WIDE_L), r: forearmPt("R", right), o: hands >= 1 ? 1 : 0 }} />
          </Figure2>
        </div>
        {t >= T.done && t < 11.95 ? (
          <div style={{ position: "absolute", left: RING.cx + RING.rx - 40, top: RING.cy - 40, width: 80, height: 80, borderRadius: 40, backgroundColor: colors.mint, border: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", scale: `${Math.min(1.1, pop(frame, T.done))}` }}>
            <svg width={44} height={44} viewBox="0 0 84 84" aria-hidden><path d="M 12 44 L 34 66 L 74 18" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        ) : null}
      </World>

      {/* the headline, alone on a dark stage */}
      <AbsoluteFill style={{ backgroundColor: colors.ink, opacity: head }} />
      <AbsoluteFill style={{ opacity: head, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1.05, opacity: ramp(frame, T.talks - 0.15, 0.25), color: colors.subtext }}>A chatbot talks.</div>
        <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1.05, opacity: ramp(frame, T.acts - 0.15, 0.25), color: colors.white }}>
          An agent <span style={{ display: "inline-block", color: colors.yellow, scale: `${t < T.actsWord ? 1 : Math.min(1.18, pop(frame, T.actsWord) * 1.1)}` }}>acts.</span>
        </div>
      </AbsoluteFill>

      <QuestionStrip active={-1} answered={3} allowFill={1} o={1 - ramp(frame, 2.6, 0.4)} />
      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s6" look={LOOK} opacity={1 - head} />
    </AbsoluteFill>
  );
};

// Scene S6 — big payoff: what is an AI agent? Edit only this file for S6 changes.
export const S6: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S6Content />
    </FadeIn>
  </SceneShell>
);
