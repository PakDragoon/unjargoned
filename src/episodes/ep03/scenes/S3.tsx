import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { Mark, PAPER, PEN, RED, Stamp } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S3");

// Times (s) from the S3 word timings in captions.json. Re-voice S3 → re-check these.
const T = {
  why: 1.42, because: 3.36, marked: 4.38, y2025: 5.54, researchers: 6.98, openai: 7.8, company: 9.14, published: 11.48,
  title: 12.8, titleEnd: 14.02, answer: 15.22, exam: 16.2, when: 17.34, tested: 18.76, scoring: 20.1,
  right: 22.12, point: 23.2, wrong: 24.2, zero: 25.04, idk: 26.22, zero2: 27.38, bluffing: 28.6, wins: 29.1,
  facts: 30.96, barely: 31.54, asked: 33.26, birthdays: 35.26, told: 36.38, knew: 37.92,
  three: 38.72, tries: 38.92, three2: 40.14, dates: 40.72, allWrong: 41.62,
};

// Shots: the marker's red pen → the paper → the scoreboard (honest vs bluffer) → the birthday test.
const P = { pen: [0.0, 5.26], paper: [5.26, 16.77], board: [16.77, 30.54], bday: [30.54, 99] } as const;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.marked), mood: "surprised" },
  { at: sec(T.researchers), mood: "intrigued" },
  { at: sec(T.exam), mood: "aha" },
  { at: sec(T.scoring), mood: "neutral" },
  { at: sec(T.idk + 0.3), mood: "confused" },
  { at: sec(T.bluffing), mood: "smug" },
  { at: sec(T.facts), mood: "curious" },
  { at: sec(T.three), mood: "worried" },
  { at: sec(T.allWrong), mood: "panic" },
];

// Dot: beside the sheet, up by the paper's title, between the two score columns, by the chat.
const ROUTE = hops([
  { at: 0, x: 1560, y: 860 },
  { at: sec(T.researchers + 0.2), x: 1500, y: 420 },
  { at: sec(T.when + 0.2), x: 960, y: 900 }, // between honest and bluffer
  { at: sec(T.bluffing + 0.3), x: 1250, y: 880 }, // hops toward the bluffer's trophy
  { at: sec(T.facts + 0.3), x: 1600, y: 860 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: 0 },
  { at: sec(T.researchers + 0.2), x: -0.8, y: 0.2 },
  { at: sec(T.when + 0.2), x: -0.9, y: -0.6 },
  { at: sec(T.wrong), x: 0, y: -0.9 },
  { at: sec(T.idk), x: -0.9, y: -0.6 },
  { at: sec(T.bluffing + 0.3), x: 0.7, y: -0.6 },
  { at: sec(T.facts + 0.3), x: -0.8, y: -0.3 },
  { at: sec(T.three), x: -0.8, y: 0.3 },
]);

/** The marker's red pen. */
const RedPen: React.FC = () => (
  <svg width={60} height={260} viewBox="0 0 60 260" aria-hidden>
    <rect x={10} y={0} width={40} height={40} rx={10} fill={colors.lineStrong} />
    <rect x={10} y={36} width={40} height={170} rx={8} fill={RED} />
    <path d="M 10 206 L 50 206 L 30 256 Z" fill={PAPER} />
    <path d="M 22 236 L 38 236 L 30 256 Z" fill={RED} />
  </svg>
);

/** One student's column on the scoreboard: three questions, then a total. */
const Column: React.FC<{ frame: number; name: string; answers: { text: string; at: number; score: 0 | 1; mark: "tick" | "cross" | "none" }[]; totalAt: number; win?: boolean }> = ({ frame, name, answers, totalAt, win }) => {
  const total = answers.filter((a) => frame >= sec(a.at + 0.5)).reduce((t, a) => t + a.score, 0);
  const trophy = pop(frame, T.bluffing);
  return (
    <div style={{ width: 640, borderRadius: 32, backgroundColor: PAPER, color: colors.ink, padding: "36px 44px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.35)", position: "relative" }}>
      <div style={{ fontSize: 52, fontWeight: 800, marginBottom: 20 }}>{name}</div>
      {answers.map((a, i) => {
        const o = ramp(frame, a.at, 0.25);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, height: 96, opacity: o }}>
            <div style={{ fontSize: 44, fontWeight: 700, opacity: 0.5, width: 64 }}>Q{i + 1}</div>
            <div style={{ flex: 1, fontSize: 50, fontWeight: 700, color: PEN, fontStyle: "italic", whiteSpace: "nowrap" }}>{a.text}</div>
            <div style={{ width: 70 }}>{a.mark !== "none" ? <Mark kind={a.mark} p={ramp(frame, a.at + 0.35, 0.3)} size={64} /> : null}</div>
            <div style={{ width: 50, fontSize: 56, fontWeight: 800, color: a.score ? "#1F9D74" : RED, opacity: ramp(frame, a.at + 0.5, 0.2) }}>{a.score}</div>
          </div>
        );
      })}
      <div style={{ height: 6, backgroundColor: colors.ink, opacity: 0.6, margin: "14px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 60, fontWeight: 800, opacity: ramp(frame, totalAt, 0.3) }}>
        <span>Total</span>
        <span style={{ color: win ? "#1F9D74" : RED }}>{total}</span>
      </div>
      {win ? (
        <div style={{ position: "absolute", right: -50, top: -70, transform: `rotate(10deg) scale(${Math.min(1.1, trophy)})`, opacity: Math.min(1, trophy) }}>
          <svg width={150} height={150} viewBox="0 0 150 150" aria-hidden>
            <path d="M 40 20 H 110 V 60 a 35 35 0 0 1 -70 0 Z" fill={colors.yellow} />
            <path d="M 40 30 H 18 a 22 22 0 0 0 26 38 M 110 30 H 132 a 22 22 0 0 1 -26 38" fill="none" stroke={colors.yellow} strokeWidth={10} />
            <rect x={66} y={92} width={18} height={26} fill={colors.yellow} />
            <rect x={44} y={116} width={62} height={18} rx={6} fill={colors.yellow} />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

const S3Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);

  // The red pen dashes across the sheet on "marked": cross, tick.
  const penX = interpolate(frame, [sec(T.because), sec(T.marked), sec(T.marked + 0.5), sec(T.marked + 0.9)], [1250, 1010, 1010, 1010], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const penY = interpolate(frame, [sec(T.marked), sec(T.marked + 0.45), sec(T.marked + 0.5), sec(T.marked + 0.9)], [330, 330, 520, 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleWords = ["Why", "Language", "Models", "Hallucinate"];

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={0} />

      {/* 1 · How it gets marked: the red pen */}
      <AbsoluteFill style={{ opacity: f(P.pen) }}>
        <div style={{ position: "absolute", left: 360, top: 220, width: 820, height: 620, borderRadius: 24, backgroundColor: PAPER, color: colors.ink, padding: "48px 60px", boxSizing: "border-box", transform: "rotate(-2deg)", boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 2, marginBottom: 40 }}>EXAM</div>
          {[["Q1", "Around 1350", "cross"], ["Q2", "Paris", "tick"]].map(([q, a, m], i) => (
            <div key={q} style={{ display: "flex", alignItems: "center", gap: 30, height: 150 }}>
              <div style={{ fontSize: 52, fontWeight: 700, opacity: 0.5 }}>{q}</div>
              <div style={{ fontSize: 60, fontWeight: 700, color: PEN, fontStyle: "italic", flex: 1 }}>{a}</div>
              <Mark kind={m as "tick" | "cross"} p={ramp(frame, T.marked + (i === 0 ? 0.05 : 0.55), 0.3)} size={100} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: penX, top: penY - 230, transform: "rotate(25deg)", transformOrigin: "50% 100%", opacity: ramp(frame, T.because - 0.2, 0.3) }}>
          <RedPen />
        </div>
      </AbsoluteFill>

      {/* 2 · The paper */}
      <AbsoluteFill style={{ opacity: f(P.paper) }}>
        <div
          style={{
            position: "absolute", left: 300, top: 200, width: 980, height: 760, borderRadius: 18, backgroundColor: colors.white, color: colors.ink,
            padding: "60px 72px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
            transform: `translateY(${(1 - ramp(frame, P.paper[0], 0.5)) * 80}px) rotate(1deg)`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 44, fontWeight: 700, opacity: 0.6 }}>
            <span style={{ opacity: ramp(frame, T.openai - 0.2, 0.3) }}>OpenAI researchers</span>
            <span style={{ opacity: ramp(frame, T.y2025 - 0.2, 0.3) }}>2025</span>
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.1, margin: "50px 0 50px", display: "flex", flexWrap: "wrap", gap: "0 24px" }}>
            {titleWords.map((w, i) => {
              const lit = ramp(frame, T.title + i * ((T.titleEnd - T.title) / 4), 0.2);
              return (
                <span key={w} style={{ position: "relative" }}>
                  {w}
                  <span style={{ position: "absolute", left: 0, bottom: 4, height: 18, width: `${lit * 100}%`, backgroundColor: colors.yellow, opacity: 0.6, zIndex: -1 }} />
                </span>
              );
            })}
          </div>
          {[94, 88, 97, 72, 90, 60].map((w, i) => (
            <div key={i} style={{ height: 18, borderRadius: 9, width: `${w}%`, backgroundColor: "rgba(20,22,28,0.14)", marginBottom: 22 }} />
          ))}
          {/* "Their answer is that exam" */}
          <div style={{ position: "absolute", right: 60, bottom: 50 }}>
            <Stamp p={pop(frame, T.exam - 0.15)} color={colors.ink} size={60} rotate={-8}>
              = THE EXAM
            </Stamp>
          </div>
        </div>
      </AbsoluteFill>

      {/* 3 · Scoring: the honest student vs the bluffer */}
      <AbsoluteFill style={{ opacity: f(P.board) }}>
        <div style={{ position: "absolute", left: 140, top: 190, display: "flex", gap: 160 }}>
          <Column
            frame={frame}
            name="Honest"
            totalAt={T.zero2 + 0.4}
            answers={[
              { text: "Paris", at: T.right - 0.1, score: 1, mark: "tick" },
              { text: "I don't know", at: T.idk - 0.1, score: 0, mark: "none" },
              { text: "I don't know", at: T.idk + 0.4, score: 0, mark: "none" },
            ]}
          />
          <Column
            frame={frame}
            name="Bluffer"
            totalAt={T.zero2 + 0.4}
            win
            answers={[
              { text: "Paris", at: T.right - 0.1, score: 1, mark: "tick" },
              { text: "Around 1350", at: T.wrong - 0.1, score: 0, mark: "cross" },
              { text: "Blue whale", at: T.idk + 0.4, score: 1, mark: "tick" },
            ]}
          />
        </div>
      </AbsoluteFill>

      {/* 4 · The birthday test */}
      <AbsoluteFill style={{ opacity: f(P.bday) }}>
        <div style={{ position: "absolute", left: 180, top: 200, transform: `translateY(${(1 - ramp(frame, P.bday[0], 0.4)) * 40}px)` }}>
          <ChatWindow width={1180} height={800}>
            <ChatBubble from="me" o={pop(frame, T.asked - 0.2)} fontSize={50}>
              When is the researcher's birthday?{" "}
              <span style={{ color: colors.yellow, opacity: ramp(frame, T.told - 0.1, 0.3) }}>Only answer if you know.</span>
            </ChatBubble>
            {[["3 July", T.three], ["15 June", T.three2], ["1 January", T.dates]].map(([d, at], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <ChatBubble from="ai" o={pop(frame, at as number)} fontSize={54}>
                  It's {d}.
                </ChatBubble>
                <Mark kind="cross" p={ramp(frame, T.allWrong + i * 0.1, 0.25)} size={76} color={colors.coral} />
              </div>
            ))}
          </ChatWindow>
          {/* a cake icon: "a stranger's birthday" */}
          <svg style={{ position: "absolute", right: -40, top: -60, opacity: Math.min(1, pop(frame, T.facts)) }} width={170} height={170} viewBox="0 0 170 170" aria-hidden>
            <rect x={25} y={80} width={120} height={70} rx={14} fill={colors.periwinkle} />
            <rect x={25} y={100} width={120} height={14} fill={colors.white} opacity={0.6} />
            <rect x={80} y={40} width={10} height={40} rx={4} fill={colors.white} />
            <path d="M 85 14 C 95 28, 92 38, 85 40 C 78 38, 75 28, 85 14 Z" fill={colors.yellow} />
            <text x={85} y={140} textAnchor="middle" fontSize={34} fontWeight={800} fill={colors.ink}>?</text>
          </svg>
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e3s3" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S3 — question one: why make things up at all? Edit only this file for S3 changes.
export const S3: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S3Content />
    </LineWipeIn>
  </SceneShell>
);
