import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { AllowCard, Figure, HandShape, Jar, Receipt } from "../Props";
import { NotebookIcon, QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S2");

// Times (s) from the S2 word timings in captions.json. Re-voice S2 → re-check these.
const T = {
  hands: 0.28, chatbot: 2.06, brain: 4.44, jar: 5.0, talk: 6.58, touch: 7.74, agent: 9.52, given: 11.74, body: 12.12, with: 13.0,
  build: 14.5, part: 15.02, canDo: 17.96, remembers: 19.14, step: 21.02, cost: 22.22, d31: 22.7,
};

// Phases: "It got hands" → the hero jar (a chatbot: thinks and talks, nothing moves) → the body draws on around it →
// three promises stack, the third is the open loop, then they shrink into the progress strip.
const P = { hands: [0, 1.5], jar: [1.5, 9.0], body: [9.0, 99], cards: [17.7, 23.6] } as const;

// The figure, centred while it's built, then slides left to make room for the cards.
const FIG = { size: 640, left: 747, top: 230 };
const FK = FIG.size / 900;
const HEAD = { left: FIG.left + 170 * FK, top: FIG.top + 30 * FK, w: 260 * FK }; // the jar inside the figure
const HERO = { left: 770, top: 270, w: 380 };

const TRACK: MoodKey[] = [
  { at: 0, mood: "aha" },
  { at: sec(1.6), mood: "curious" },
  { at: sec(T.touch - 0.1), mood: "neutral" },
  { at: sec(T.agent), mood: "happy" },
  { at: sec(T.canDo - 0.3), mood: "curious" },
  { at: sec(23.4), mood: "happy" },
];

const ROUTE = hops([
  { at: 0, x: 1500, y: 840 },
  { at: sec(2.2), x: 1420, y: 820 },
  { at: sec(7.3), x: 1250, y: 560 }, // beside the jar: knocks on it
  { at: sec(T.agent + 0.3), x: 1420, y: 860 },
  { at: sec(T.canDo - 0.4), x: 1720, y: 900 }, // beside the cards
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.4 },
  { at: sec(7.3), x: -1, y: 0 },
  { at: sec(T.agent + 0.3), x: -0.9, y: -0.4 },
  { at: sec(T.canDo - 0.4), x: -0.8, y: -0.5 },
  { at: sec(21.3), x: -0.8, y: 0.3 }, // the flickering receipt behind the third card
  { at: sec(23.4), x: -0.4, y: -0.9 },
]);

const Card: React.FC<{ p: number; on?: number; children: React.ReactNode }> = ({ p, on = 0, children }) => (
  <div
    style={{
      width: 300, height: 190, borderRadius: 36, backgroundColor: colors.panel, border: `6px solid ${on > 0.5 ? colors.yellow : colors.line}`,
      display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
      transform: `scale(${Math.min(1, Math.max(0, p))})`, opacity: Math.min(1, p * 3),
    }}
  >
    {children}
  </div>
);

const S2Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const f = (r: readonly [number, number], d = 0.3) => during(frame, r[0], r[1], d);

  // Hero jar shrinks into the figure's head on "An AI agent".
  const toHead = ramp(frame, T.agent - 0.4, 0.6);
  const jar = {
    left: interpolate(toHead, [0, 1], [HERO.left, HEAD.left]),
    top: interpolate(toHead, [0, 1], [HERO.top, HEAD.top]),
    w: interpolate(toHead, [0, 1], [HERO.w, HEAD.w]),
  };
  const draw = ramp(frame, T.agent + 0.3, 2.6);
  const slide = ramp(frame, T.build - 0.3, 0.6); // figure slides left for the cards
  const knock = during(frame, T.touch - 0.05, T.touch + 0.1, 0.05) + during(frame, T.touch + 0.25, T.touch + 0.4, 0.05);
  const slotPulse = during(frame, T.part, T.part + 0.8, 0.2);

  // Cards → strip
  const c = [pop(frame, T.canDo), pop(frame, T.remembers), pop(frame, T.step - 0.25)];
  const push3 = ramp(frame, T.step, 2.0);
  const flicker = t > T.step + 0.3 && t < 23.2 ? (Math.floor(frame / 3) % 3 === 0 ? 0.2 : 0.75) : 0;
  const shrink = ramp(frame, 23.3, 0.45);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* 1 · It got hands */}
      <AbsoluteFill style={{ opacity: f(P.hands, 0.2) }}>
        <svg width={1920} height={1080} aria-hidden>
          <g style={{ transform: `scale(${Math.max(0, pop(frame, 0.05))})`, transformOrigin: "760px 540px" }}><HandShape cx={760} cy={540} r={150} /></g>
          <g style={{ transform: `scale(${Math.max(0, pop(frame, 0.18))})`, transformOrigin: "1160px 540px" }}><HandShape cx={1160} cy={540} r={150} flip /></g>
        </svg>
      </AbsoluteFill>

      {/* 2 · The hero jar: a chatbot thinks and talks, nothing else moves */}
      <div style={{ position: "absolute", left: jar.left, top: jar.top, opacity: f([P.jar[0], T.agent + 0.25], 0.25), transform: `translateX(${-6 * knock}px)` }}>
        <Jar size={jar.w} />
      </div>
      <AbsoluteFill style={{ opacity: f([P.jar[0], T.agent - 0.3], 0.25) }}>
        <div style={{ position: "absolute", left: 960, top: 740, transform: "translateX(-50%)", padding: "12px 30px", borderRadius: 999, backgroundColor: colors.panel, border: `4px solid ${colors.yellow}`, fontSize: 42, fontWeight: 700, opacity: ramp(frame, T.brain, 0.3), whiteSpace: "nowrap" }}>
          brain = <span style={{ color: colors.yellow }}>the AI model</span>
        </div>
        <div style={{ position: "absolute", left: 1110, top: 170, opacity: ramp(frame, T.talk - 0.6, 0.25), transform: `scale(${Math.min(1, pop(frame, T.talk - 0.6))})`, transformOrigin: "0 100%" }}>
          <div style={{ position: "relative", padding: "20px 34px", borderRadius: 34, backgroundColor: colors.white, color: colors.ink, fontSize: 48, fontWeight: 700, whiteSpace: "nowrap" }}>
            <StreamText text="Hi! I can think and talk." frame={frame} from={sec(T.talk - 0.5)} to={sec(T.talk + 0.6)} />
            <div style={{ position: "absolute", left: 28, bottom: -22, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `26px solid ${colors.white}` }} />
          </div>
        </div>
        {/* knock rings */}
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: 1150 - 30 * i, top: 470 - 30 * i, width: 60 + 60 * i, height: 60 + 60 * i, borderRadius: "50%", border: `5px solid ${colors.subtext}`, opacity: during(frame, T.touch + i * 0.3, T.touch + i * 0.3 + 0.3, 0.08) }} />
        ))}
      </AbsoluteFill>

      {/* 3 · The body draws on around the same jar (dashed slots: hands, eyes, pocket) */}
      <div style={{ position: "absolute", left: FIG.left - 400 * slide, top: FIG.top, opacity: f(P.body, 0.01) * ramp(frame, T.agent + 0.2, 0.05) * (1 - 0.0 * shrink) }}>
        <Figure size={FIG.size} draw={draw} slots={ramp(frame, T.body, 0.5)} />
        <div style={{ position: "absolute", inset: 0, opacity: slotPulse }}>
          <Figure size={FIG.size} draw={0} brain={0} slots={1} />
        </div>
      </div>

      {/* 4 · Three promises stack; the third is the open loop ($31 flickers behind it) */}
      <div style={{ position: "absolute", left: 1150, top: 170, display: "flex", flexDirection: "column", gap: 34, opacity: 1 - shrink, transform: `translate(${-200 * shrink}px, ${-200 * shrink}px) scale(${1 - 0.6 * shrink})`, transformOrigin: "50% 0" }}>
        <Card p={c[0]}>
          <svg width={130} height={130} viewBox="-60 -60 120 120" aria-hidden><HandShape cx={0} cy={0} r={46} /></svg>
        </Card>
        <Card p={c[1]}>
          <NotebookIcon size={110} />
        </Card>
        <div style={{ position: "relative", transform: `scale(${1 + 0.18 * push3})`, transformOrigin: "30% 50%" }}>
          <div style={{ position: "absolute", left: 60, top: 18, transform: "rotate(-6deg)", opacity: flicker }}>
            <Receipt w={150} rows={2} />
          </div>
          <Card p={c[2]} on={t > T.step ? 1 : 0}>
            <AllowCard w={220} empty={1} showButtons={false} />
          </Card>
        </div>
      </div>
      <QuestionStrip active={-1} o={ramp(frame, 23.45, 0.35)} />

      <Dot path={(fr) => { const p = ROUTE.path(fr); return { x: p.x - 18 * knock, y: p.y }; }} squash={ROUTE.squash} track={TRACK} seed="e4s2" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S2 — first payoff: it got hands; chatbot = brain in a jar; the body; the open loop. Edit only this file for S2 changes.
export const S2: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S2Content />
    </FadeIn>
  </SceneShell>
);
