import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow, StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S2");

// Times (s) from the S2 word timings in captions.json. Re-voice S2 → re-check these.
const T = {
  lying: 0.42, means: 1.7, guessing: 3.8, student: 4.98, bluffing: 5.28, closedBook: 6.06, exam: 6.52,
  makes: 8.68, fact: 10.34, hallucination: 11.78, odd: 13.26, seeing: 14.56, things: 14.76, itsBluffing: 15.98,
  picture: 17.62, blank: 20.72, zero: 21.64, write: 22.92, sounds: 23.76, maybe: 24.92, correct: 25.88,
  three: 27.32, q1: 28.9, q2: 31.58, q3: 33.52, strip: 34.9,
};

// Phases (one hero each): words → closed-book exam → the word card → blank vs bluff → three questions.
const P = { words: [0, 4.5], desk: [4.5, 7.9], card: [7.9, 17.35], score: [17.35, 27.1], qs: [27.1, 99] } as const;

const PAPER = "#F3EBDD";
const PEN = "#3B5BDB";
const RED = "#E0533B";

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.means), mood: "neutral" },
  { at: sec(T.guessing), mood: "aha" },
  { at: sec(T.student), mood: "happy" },
  { at: sec(T.makes), mood: "curious" },
  { at: sec(T.hallucination + 0.2), mood: "surprised" },
  { at: sec(T.odd), mood: "confused" },
  { at: sec(T.itsBluffing), mood: "smug" },
  { at: sec(T.picture), mood: "neutral" },
  { at: sec(T.blank), mood: "worried" },
  { at: sec(T.zero + 0.2), mood: "sad" },
  { at: sec(T.write), mood: "intrigued" },
  { at: sec(T.maybe), mood: "smug" },
  { at: sec(T.correct), mood: "happy" },
  { at: sec(T.three), mood: "curious" },
];

// Dot's route: beside the words, sits at the exam desk, beside the word card, at the answer sheet with a pencil,
// then watches the three questions.
const ROUTE = hops([
  { at: 0, x: 1540, y: 860 },
  { at: sec(T.student), x: 1100, y: 700 }, // at the desk, between paper and book
  { at: sec(8.2), x: 1580, y: 860 },
  { at: sec(T.odd + 0.2), x: 1580, y: 720 }, // hops up to inspect the chips
  { at: sec(T.picture + 0.3), x: 1500, y: 470 }, // by the exam sheet, row A
  { at: sec(T.write - 0.1), x: 1150, y: 690 }, // onto the sheet beside answer B, writes it
  { at: sec(T.maybe - 0.15), x: 1420, y: 690 }, // hops clear before the score lands
  { at: sec(T.three + 0.3), x: 1580, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: -0.6, y: -0.3 },
  { at: sec(T.student), x: -0.7, y: 0.4 },
  { at: sec(8.2), x: -0.6, y: -0.5 },
  { at: sec(T.odd + 0.2), x: -0.7, y: 0.1 },
  { at: sec(T.picture + 0.3), x: -0.7, y: 0.2 },
  { at: sec(T.write - 0.1), x: -0.8, y: 0.3 },
  { at: sec(T.three + 0.3), x: -0.6, y: -0.4 },
  { at: sec(T.q2), x: -0.6, y: -0.1 },
  { at: sec(T.q3), x: -0.6, y: 0.2 },
]);

/** A hand-drawn strike-through that grows left→right. */
const Strike: React.FC<{ p: number; color?: string; width?: number }> = ({ p, color = colors.coral, width = 12 }) => (
  <span
    style={{
      position: "absolute", left: -10, top: "52%", height: width, borderRadius: width / 2, backgroundColor: color,
      width: `calc(${p * 100}% + ${p * 20}px)`, transform: "rotate(-3deg)",
    }}
  />
);

/** A loose yellow marker ring drawn around a word. */
const Ring: React.FC<{ p: number }> = ({ p }) => (
  <svg style={{ position: "absolute", left: -40, top: -26, width: "calc(100% + 80px)", height: "calc(100% + 52px)", overflow: "visible" }} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
    <path
      d="M 52 3 C 85 2, 99 10, 98 20 C 97 32, 75 38, 48 38 C 20 38, 2 31, 3 19 C 4 8, 24 2, 58 5"
      fill="none" stroke={colors.yellow} strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke"
      style={{ strokeWidth: 9 }} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p}
    />
  </svg>
);

/** The closed book: periwinkle cover, a strap and a yellow padlock. */
const ClosedBook: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ position: "relative", width: 340, height: 420, transform: `rotate(4deg) scale(${s})` }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 20, backgroundColor: colors.periwinkle, boxShadow: "0 24px 50px rgba(0,0,0,0.35)" }} />
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 34, borderRadius: "20px 0 0 20px", backgroundColor: "#6F86E0" }} />
    <div style={{ position: "absolute", left: 70, right: 40, top: 70, height: 18, borderRadius: 9, backgroundColor: "rgba(20,22,28,0.25)" }} />
    <div style={{ position: "absolute", left: 70, right: 100, top: 110, height: 18, borderRadius: 9, backgroundColor: "rgba(20,22,28,0.25)" }} />
    <div style={{ position: "absolute", left: -10, right: -10, top: 200, height: 40, backgroundColor: colors.lineStrong }} />
    <svg style={{ position: "absolute", left: 120, top: 150 }} width={110} height={130} viewBox="0 0 110 130" aria-hidden>
      <path d="M 28 62 V 40 a 27 27 0 0 1 54 0 V 62" fill="none" stroke={colors.yellow} strokeWidth={14} />
      <rect x={10} y={58} width={90} height={68} rx={14} fill={colors.yellow} />
      <circle cx={55} cy={88} r={9} fill={colors.ink} />
      <rect x={51} y={92} width={8} height={18} rx={4} fill={colors.ink} />
    </svg>
  </div>
);

/** The exam paper (used small at the desk and big in the scoring shot). */
const ExamSheet: React.FC<{ frame: number; big: boolean }> = ({ frame, big }) => {
  const scribble = "Around 1350";
  const shown = Math.floor(interpolate(frame, [sec(T.write + 0.15), sec(T.sounds + 0.5)], [0, scribble.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const zero = pop(frame, T.zero);
  const maybe = pop(frame, T.maybe);
  const tick = ramp(frame, T.correct, 0.35);
  const rowB = ramp(frame, T.write - 0.3, 0.3);
  return (
    <div
      style={{
        width: big ? 1060 : 620, height: big ? 700 : 420, borderRadius: 24, backgroundColor: PAPER, color: colors.ink,
        padding: big ? "52px 64px" : "36px 44px", boxSizing: "border-box", transform: `rotate(${big ? -1.2 : -4}deg)`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", gap: big ? 40 : 26,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: big ? 56 : 48, fontWeight: 800, letterSpacing: 2 }}>EXAM</div>
        <div style={{ fontSize: big ? 44 : 0, fontWeight: 600, opacity: 0.55 }}>Name: Dot</div>
      </div>
      {big ? (
        <>
          <div style={{ fontSize: 60, fontWeight: 700 }}>Q7. When was the castle built?</div>
          {[0, 1].map((row) => (
            <div key={row} style={{ display: "flex", alignItems: "center", gap: 32, opacity: row === 0 ? 1 : rowB }}>
              <div style={{ fontSize: 56, fontWeight: 800, width: 60, opacity: 0.6 }}>{row === 0 ? "A" : "B"}</div>
              <div
                style={{
                  width: 520, height: 110, borderRadius: 16, border: `5px solid ${colors.ink}`, boxSizing: "border-box",
                  display: "flex", alignItems: "center", paddingLeft: 26, fontSize: 60, fontWeight: 700, color: PEN,
                  fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden",
                }}
              >
                {row === 1 ? scribble.slice(0, shown) : ""}
              </div>
              {row === 0 ? (
                <div style={{ fontSize: 96, fontWeight: 800, color: RED, transform: `rotate(-10deg) scale(${Math.min(1.15, zero * 1.0)})`, opacity: Math.min(1, zero) }}>0</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, maybe), transform: `scale(${Math.min(1.1, maybe)})` }}>
                  <div style={{ fontSize: 96, fontWeight: 800, color: tick > 0.5 ? "#1F9D74" : "#C98A00" }}>{tick > 0.5 ? "1" : "1?"}</div>
                  <svg width={84} height={84} viewBox="0 0 84 84" aria-hidden style={{ opacity: tick }}>
                    <path d="M 12 44 L 34 66 L 74 18" fill="none" stroke="#1F9D74" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        [0, 1, 2, 3].map((i) => <div key={i} style={{ height: 22, borderRadius: 11, width: `${[92, 70, 84, 55][i]}%`, backgroundColor: "rgba(20,22,28,0.18)" }} />)
      )}
    </div>
  );
};

/** Dot's pencil: held beside Dot, wiggling while it writes. */
const Pencil: React.FC<{ x: number; y: number; o: number; wiggle: number }> = ({ x, y, o, wiggle }) => (
  <svg
    style={{ position: "absolute", left: x - 130 + wiggle, top: y - 50, opacity: o, transform: "rotate(35deg)", transformOrigin: "50% 100%" }}
    width={40} height={170} viewBox="0 0 40 170" aria-hidden
  >
    <rect x={6} y={0} width={28} height={24} rx={6} fill={colors.coral} />
    <rect x={6} y={22} width={28} height={10} fill={colors.lineStrong} />
    <rect x={6} y={32} width={28} height={104} fill={colors.yellow} />
    <path d="M 6 136 L 34 136 L 20 168 Z" fill={PAPER} />
    <path d="M 15 156 L 25 156 L 20 168 Z" fill={colors.ink} />
  </svg>
);

const QUESTIONS = ["Why does AI make things up?", "Why does it sound so sure?", "How do you protect yourself?"];

const S2Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);

  const dotPos = ROUTE.path(frame);
  const writing = frame >= sec(T.write + 0.15) && frame < sec(T.sounds + 0.5);
  const pencilO = Math.max(during(frame, T.student, P.desk[1], 0.25), during(frame, T.write - 0.4, P.score[1], 0.25));

  // Card chips: lying (already struck), seeing things (struck on "things"), bluffing (ringed in yellow).
  const chips = [
    { label: "lying", at: T.odd, strike: T.odd, yellow: false },
    { label: "seeing things", at: T.seeing - 0.4, strike: T.things, yellow: false },
    { label: "bluffing", at: T.itsBluffing - 0.1, strike: -1, yellow: true },
  ];
  const typed = "HALLUCINATION".slice(0, Math.floor(interpolate(frame, [sec(T.hallucination), sec(T.hallucination + 0.7)], [0, 13], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      {/* 1 · The chat's "yes" from S1: not a lie (stamp struck), a guess (Ep 2's guess slot on "real") */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: f(P.words) }}>
        <div style={{ position: "relative", marginRight: 300, marginTop: 120 }}>
          <ChatWindow width={980} height={420}>
            <ChatBubble from="me">Is this case real?</ChatBubble>
            <ChatBubble from="ai" fontSize={60}>
              Yes, it's a{" "}
              <span style={{ position: "relative", display: "inline-block", padding: "0 14px", borderRadius: 16, border: `5px dashed ${frame >= sec(T.guessing) ? colors.yellow : "transparent"}`, color: frame >= sec(T.guessing) ? colors.yellow : colors.white }}>
                real
              </span>{" "}
              case.
            </ChatBubble>
          </ChatWindow>
          {/* the options it picked from */}
                <div style={{ position: "absolute", left: 300, bottom: "100%", marginBottom: 24, display: "flex", flexDirection: "column", gap: 10, padding: "16px 24px", borderRadius: 24, backgroundColor: colors.panel, border: `4px solid ${colors.line}`, opacity: during(frame, T.guessing, P.words[1], 0.25), transform: `scale(${0.85 + 0.15 * ramp(frame, T.guessing, 0.25)})`, transformOrigin: "bottom center" }}>
                  {([["real", 0.58], ["fake", 0.22], ["unsure", 0.09]] as const).map(([w, pr], i) => (
                    <div key={w} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                      <div style={{ width: 150, fontSize: 46, fontWeight: 700, color: i === 0 ? colors.yellow : colors.subtext }}>{w}</div>
                      <div style={{ width: 240 * pr * ramp(frame, T.guessing + 0.1 + i * 0.08, 0.3), height: 24, borderRadius: 12, backgroundColor: i === 0 ? colors.yellow : colors.lineStrong }} />
                    </div>
                  ))}
                </div>
          {/* "LYING?" stamp, struck through on "Lying means you know the truth" */}
          <div
            style={{
              position: "absolute", right: -60, top: -70, padding: "10px 30px", border: `8px solid ${colors.coral}`, borderRadius: 16, color: colors.coral,
              fontSize: 80, fontWeight: 800, letterSpacing: 3, transform: `rotate(10deg) scale(${1.5 - 0.5 * Math.min(1, pop(frame, T.lying - 0.2))})`,
              opacity: Math.min(1, pop(frame, T.lying - 0.2)) * (1 - ramp(frame, T.guessing - 0.3, 0.3)),
            }}
          >
            <span style={{ position: "relative" }}>
              LYING?
              <Strike p={ramp(frame, T.means + 0.6, 0.35)} width={14} color={colors.white} />
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* 2 · The closed-book exam */}
      <AbsoluteFill style={{ opacity: f(P.desk) }}>
        <div style={{ position: "absolute", top: 120, left: 0, right: 120, textAlign: "center", fontSize: 76, fontWeight: 800 }}>
          a <span style={{ color: colors.yellow }}>closed-book</span> exam
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 780, height: 300, backgroundColor: colors.panel, borderTop: `6px solid ${colors.lineStrong}` }} />
        <div style={{ position: "absolute", left: 360, top: 470, transform: `translateY(${(1 - ramp(frame, P.desk[0], 0.4)) * 60}px)` }}>
          <ExamSheet frame={frame} big={false} />
        </div>
        <div style={{ position: "absolute", left: 1340, top: 380 }}>
          <ClosedBook s={0.85 + 0.15 * Math.min(1, pop(frame, T.closedBook))} />
        </div>
      </AbsoluteFill>

      {/* 3 · The word card: HALLUCINATION, and what it isn't */}
      <AbsoluteFill style={{ opacity: f(P.card) }}>
        {/* made up + said like a fact: a confident answer with a fake "FACT" seal */}
        <div style={{ position: "absolute", top: 120, left: 0, right: 240, display: "flex", justifyContent: "center", alignItems: "center", gap: 36, opacity: ramp(frame, T.makes - 0.3, 0.3) }}>
          <ChatBubble from="ai" fontSize={56}>
            <StreamText text="The castle was built in 1350." frame={frame} from={sec(T.makes - 0.2)} to={sec(T.fact - 0.6)} />
          </ChatBubble>
          <div style={{ padding: "10px 26px", borderRadius: 999, backgroundColor: colors.mint, color: colors.ink, fontSize: 48, fontWeight: 800, transform: `rotate(-8deg) scale(${Math.min(1.1, pop(frame, T.fact))})`, opacity: Math.min(1, pop(frame, T.fact)) }}>
            ✔ FACT
          </div>
        </div>
        <div style={{ position: "absolute", top: 330, left: 0, right: 240, textAlign: "center", fontSize: 150, fontWeight: 800, letterSpacing: 4, color: colors.yellow, minHeight: 180 }}>
          {typed}
          <span style={{ opacity: frame < sec(T.hallucination + 0.7) && Math.floor(frame / 8) % 2 === 0 ? 1 : 0, color: colors.white }}>|</span>
        </div>
        <div style={{ position: "absolute", top: 640, left: 0, right: 240, display: "flex", justifyContent: "center", gap: 56 }}>
          {chips.map((c) => {
            const p = pop(frame, c.at);
            return (
              <div
                key={c.label}
                style={{
                  position: "relative", padding: "20px 40px", borderRadius: 999, fontSize: 60, fontWeight: 700,
                  backgroundColor: colors.panel, border: `4px solid ${c.yellow ? colors.yellow : colors.line}`,
                  color: c.yellow ? colors.yellow : colors.subtext, opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * 40}px)`,
                }}
              >
                <span style={{ position: "relative" }}>
                  {c.label}
                  {c.strike >= 0 ? <Strike p={ramp(frame, c.strike, 0.3)} /> : null}
                </span>
                {c.yellow ? <Ring p={ramp(frame, c.at + 0.25, 0.5)} /> : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* 4 · Blank = 0, a confident bluff = maybe 1 */}
      <AbsoluteFill style={{ opacity: f(P.score) }}>
        <div style={{ position: "absolute", left: 170, top: 190, transform: `translateY(${(1 - ramp(frame, P.score[0], 0.4)) * 60}px)` }}>
          <ExamSheet frame={frame} big />
        </div>
      </AbsoluteFill>

      {/* 5 · Three questions, then they become the progress strip */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: during(frame, P.qs[0], T.strip, 0.4) }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 60, marginRight: 200 }}>
          {QUESTIONS.map((q, i) => {
            const p = pop(frame, [T.q1, T.q2, T.q3][i]);
            return (
              <div
                key={q}
                style={{
                  display: "flex", alignItems: "center", gap: 32, padding: "24px 44px", borderRadius: 32,
                  backgroundColor: colors.panel, border: `4px solid ${colors.line}`, fontSize: 64, fontWeight: 700,
                  opacity: Math.min(1, p), transform: `translateX(${(1 - Math.min(1, p)) * 80}px)`,
                }}
              >
                <span style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.yellow, color: colors.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                  {i + 1}
                </span>
                {q}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ opacity: ramp(frame, T.strip, 0.4) }}>
        <QuestionStrip active={-1} />
      </div>

      <Pencil x={dotPos.x} y={dotPos.y} o={pencilO} wiggle={writing ? Math.sin(frame * 1.7) * 14 : 0} />
      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e3s2" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S2 — it's guessing (first payoff). Edit only this file for S2 changes.
export const S2: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S2Content />
    </FadeIn>
  </SceneShell>
);
