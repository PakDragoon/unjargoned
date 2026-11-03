import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { AllowCard, BuyButton, Cursor, Figure, Jar, ToolBelt } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S6");

// Times (s) from the S6 word timings in captions.json. Re-voice S6 → re-check these.
const T = {
  agent: 1.2, brain: 2.9, hands: 4.64, eyes: 6.14, notebook: 7.66, round: 9.56, done: 11.32, stop: 12.12, risky: 13.52,
  talks: 14.76, acts: 16.4, actsWord: 17.04, alive: 18.86, guessing: 21.36, tools: 23.38, wrong: 24.64, click: 25.36, buy: 25.6,
};

// Phases: recap on one canvas, one beat per part, pull out as the loop circles the figure → the one headline →
// still a guesser: the guess slot spins, lands wrong (coral), a cursor clicks "Buy".
const P = { recap: [0, 14.4], head: [14.4, 18.1], guess: [18.1, 99] } as const;

const FIG = { left: 750, top: 230, size: 640 };
const RING = { x: 750 + 213, y: 230 + 330, rx: 330, ry: 400 };
const GUESSES = ["eggs", "milk", "bread", "rice", "Buy"];

const TRACK: MoodKey[] = [
  { at: 0, mood: "happy" },
  { at: sec(T.hands), mood: "relieved" },
  { at: sec(T.acts), mood: "aha" },
  { at: sec(T.alive), mood: "neutral" },
  { at: sec(T.wrong), mood: "worried" },
];
const ROUTE = hops([
  { at: 0, x: 1600, y: 900 },
  { at: sec(T.talks - 0.3), x: 1640, y: 900 },
  { at: sec(T.alive - 0.2), x: 440, y: 880 },
  { at: sec(T.wrong - 0.3), x: 430, y: 690 },
]);
const LOOK = glances([
  { at: 0, x: -0.9, y: -0.5 },
  { at: sec(T.talks - 0.3), x: -0.9, y: -0.6 },
  { at: sec(T.alive - 0.2), x: 0.8, y: -0.6 },
  { at: sec(T.wrong + 0.3), x: 1, y: -0.3 }, // the cursor
]);

const S6Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const f = (r: readonly [number, number], d = 0.3) => during(frame, r[0], r[1], d);

  // recap
  const part = (at: number) => (t < at - 0.05 ? 0 : pop(frame, at));
  const pullOut = interpolate(t, [0, T.round - 0.3, T.done], [1.08, 1.08, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = ramp(frame, T.round - 0.2, 0.6);
  const ringAng = (t - T.round) * 4;
  const allow = pop(frame, T.stop - 0.1);

  // guess slot: spins, lands on a wrong guess
  const spinning = t > T.guessing - 0.2 && t < T.wrong;
  const guess = t < T.guessing - 0.2 ? "" : spinning ? GUESSES[Math.floor(frame / 3) % (GUESSES.length - 1)] : GUESSES[GUESSES.length - 1];
  const wrong = t >= T.wrong ? 1 : 0;
  const cursorK = ramp(frame, T.wrong + 0.1, 0.55);
  const press = during(frame, T.click - 0.05, T.click + 0.3, 0.06);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <QuestionStrip active={-1} answered={3} allowFill={1} o={1 - f(P.head, 0.25)} />

      {/* 1 · Recap: brain, hands, eyes, notebook, the loop, the "Allow?" card */}
      <AbsoluteFill style={{ opacity: f([-1, P.recap[1]], 0.3), transform: `scale(${pullOut})`, transformOrigin: "50% 55%" }}>
        <div style={{ position: "absolute", left: FIG.left, top: FIG.top }}>
          <Figure size={FIG.size} hands={part(T.hands)} eyes={part(T.eyes)} notebook={part(T.notebook)} glow={during(frame, T.brain - 0.1, T.brain + 0.9, 0.2)} look={{ x: 0.6, y: 0.1 }} />
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <ellipse cx={RING.x} cy={RING.y} rx={RING.rx} ry={RING.ry} fill="none" stroke={colors.yellow} strokeWidth={12} strokeDasharray={`${2600 * ring} 9999`} transform={`rotate(-90 ${RING.x} ${RING.y})`} strokeLinecap="round" />
          <circle cx={RING.x + RING.rx * Math.cos(ringAng - Math.PI / 2)} cy={RING.y + RING.ry * Math.sin(ringAng - Math.PI / 2)} r={22} fill={colors.yellow} opacity={t > T.round + 0.4 ? 1 : 0} />
        </svg>
        <div style={{ position: "absolute", left: 1340, top: 420, transform: `scale(${Math.min(1, allow)})`, opacity: Math.min(1, allow) }}>
          <AllowCard w={260} />
        </div>
      </AbsoluteFill>

      {/* 2 · The headline */}
      <AbsoluteFill style={{ opacity: f(P.head, 0.25), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1.05, opacity: ramp(frame, T.talks - 0.15, 0.25), color: colors.subtext }}>A chatbot talks.</div>
        <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1.05, opacity: ramp(frame, T.acts - 0.15, 0.25) }}>
          An agent <span style={{ display: "inline-block", color: colors.yellow, transform: `scale(${t < T.actsWord ? 1 : Math.min(1.18, pop(frame, T.actsWord) * 1.1)})` }}>acts.</span>
        </div>
      </AbsoluteFill>

      {/* 3 · Still a guesser, now with tools: a wrong guess clicks "Buy" */}
      <AbsoluteFill style={{ opacity: f(P.guess, 0.3) }}>
        <div style={{ position: "absolute", left: 760, top: 250, transform: `scale(${Math.min(1, pop(frame, P.guess[0]))})` }}>
          <Jar size={360} guess={guess} wrong={wrong} />
        </div>
        <div style={{ position: "absolute", left: 640, top: 760, opacity: ramp(frame, T.tools - 0.2, 0.3) }}>
          <ToolBelt w={600} shown={[0, 1, 2, 3].map((i) => (t < T.tools - 0.2 + i * 0.08 ? 0 : pop(frame, T.tools - 0.2 + i * 0.08)))} />
        </div>
        <div style={{ position: "absolute", left: 1290, top: 470, opacity: ramp(frame, T.wrong - 0.2, 0.25) }}>
          <BuyButton w={320} press={press} />
        </div>
        <div style={{ position: "absolute", left: interpolate(cursorK, [0, 1], [1780, 1450]), top: interpolate(cursorK, [0, 1], [960, 520]), opacity: ramp(frame, T.wrong, 0.2) }}>
          <Cursor size={78} press={press} />
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s6" look={LOOK} />
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
