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
import { ExamBook, ExamSheet, Pencil, Strike } from "../Props";

const S = scene("S2");

// Times (s) from the S2 word timings in captions.json. Re-voice S2 → re-check these.
const T = {
  lying: 0.42, means: 1.66, guessing: 3.76, student: 4.92, bluffing: 5.24, closedBook: 5.98, exam: 6.48,
  makes: 8.44, fact: 10.08, hallucination: 11.48, odd: 12.92, seeing: 14.2, things: 14.4, itsBluffing: 15.62,
  three: 17.0, q1: 18.82, q2: 21.1, q3: 23.06, strip: 24.55,
};

// Phases (one hero each): the chat's "yes" → closed-book exam → the word card → three questions.
const P = { words: [0.0, 4.4], desk: [4.4, 7.55], card: [7.55, 16.75], qs: [16.75, 99] } as const;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.means), mood: "neutral" },
  { at: sec(T.guessing), mood: "aha" },
  { at: sec(T.student), mood: "happy" },
  { at: sec(T.makes), mood: "curious" },
  { at: sec(T.hallucination + 0.2), mood: "surprised" },
  { at: sec(T.odd), mood: "confused" },
  { at: sec(T.itsBluffing), mood: "smug" },
  { at: sec(T.three), mood: "curious" },
];

// Dot's route: beside the words, sits at the exam desk with a pencil, beside the word card, then watches the three questions.
const ROUTE = hops([
  { at: 0, x: 1540, y: 860 },
  { at: sec(T.student), x: 1100, y: 700 }, // at the desk, between paper and book
  { at: sec(7.95), x: 1580, y: 860 },
  { at: sec(T.odd + 0.2), x: 1580, y: 720 }, // hops up to inspect the chips
  { at: sec(T.three + 0.3), x: 1580, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: -0.6, y: -0.3 },
  { at: sec(T.student), x: -0.7, y: 0.4 },
  { at: sec(7.95), x: -0.6, y: -0.5 },
  { at: sec(T.odd + 0.2), x: -0.7, y: 0.1 },
  { at: sec(T.three + 0.3), x: -0.6, y: -0.4 },
  { at: sec(T.q2), x: -0.6, y: -0.1 },
  { at: sec(T.q3), x: -0.6, y: 0.2 },
]);

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

const QUESTIONS = ["Why does AI make things up?", "Why does it sound so sure?", "How do you protect yourself?"];

const S2Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);

  const dotPos = ROUTE.path(frame);
  const pencilO = during(frame, T.student, P.desk[1], 0.25);

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
          <ExamBook s={0.85 + 0.15 * Math.min(1, pop(frame, T.closedBook))} />
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

      {/* 4 · Three questions, then they become the progress strip */}
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

      <Pencil x={dotPos.x} y={dotPos.y} o={pencilO} wiggle={0} />
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
