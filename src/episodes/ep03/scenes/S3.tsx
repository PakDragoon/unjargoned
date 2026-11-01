import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { ExamSheet, Mark, Pencil, Stamp } from "../Props";
import { AnswerCard, QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S3");

// Times (s) from the S3 word timings in captions.json. Re-voice S3 → re-check these.
const T = {
  why: 1.46, quick: 3.78, exam: 5.48, noClue: 7.64, leave: 9.08, zero: 10.46, make: 11.78, guess: 12.22, lucky: 13.1,
  youd: 14.9, everyone: 16.46, learns: 18.22, millions: 20.68, marked: 23.34, right: 24.42, wrong: 25.74, idk: 27.4,
  overTime: 29.46, pushed: 30.76, guessing: 33.16, idkNever: 34.52, habit: 36.54, always: 38.08,
  researchers: 40.24, openai: 40.56, y2025: 44.94, asked: 46.36, only: 49.56, three: 51.32, three2: 52.74, dates: 53.36,
  allWrong: 54.38, answer: 55.56, trained: 57.44,
};

// Shots: the viewer's own exam (blank or guess?) → millions of marked questions → the needle swings to "guess"
// → the habit → the OpenAI paper + birthday test → ANSWER 1.
const P = { quiz: [0, 17.9], train: [17.9, 36.3], habit: [36.3, 40.0], paper: [40.0, 46.1], bday: [46.1, 55.3], answer: [55.3, 99] } as const;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.noClue), mood: "worried" },
  { at: sec(T.zero), mood: "sad" },
  { at: sec(T.make), mood: "intrigued" },
  { at: sec(T.youd), mood: "smug" },
  { at: sec(T.learns), mood: "curious" },
  { at: sec(T.idk + 0.3), mood: "confused" },
  { at: sec(T.pushed), mood: "intrigued" },
  { at: sec(T.habit), mood: "aha" },
  { at: sec(T.researchers), mood: "curious" },
  { at: sec(T.three), mood: "worried" },
  { at: sec(T.allWrong), mood: "panic" },
  { at: sec(T.answer), mood: "happy" },
];

// Dot: writes the guess on the sheet, joins the crowd at "Guess", watches the marking, rides the needle, stands by the answer.
const ROUTE = hops([
  { at: 0, x: 1580, y: 860 },
  { at: sec(T.make - 0.1), x: 1150, y: 690 }, // onto the sheet beside answer B, writes the guess
  { at: sec(T.youd + 0.2), x: 1580, y: 900 }, // under the "Guess" crowd
  { at: sec(T.learns + 0.3), x: 1620, y: 880 },
  { at: sec(T.pushed - 0.2), x: 330, y: 620 }, // up-left of the needle, watching it swing
  { at: sec(T.habit), x: 1600, y: 860 },
  { at: sec(T.answer + 0.2), x: 1640, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.2 },
  { at: sec(T.make - 0.1), x: -0.8, y: 0.3 },
  { at: sec(T.youd + 0.2), x: -0.8, y: -0.4 },
  { at: sec(T.learns + 0.3), x: -0.8, y: -0.3 },
  { at: sec(T.pushed - 0.2), x: 0.9, y: -0.4 },
  { at: sec(T.habit), x: -0.8, y: -0.2 },
  { at: sec(T.three), x: -0.8, y: 0.3 },
  { at: sec(T.answer + 0.2), x: -0.8, y: -0.2 },
]);

/** One marked practice question card. */
const QCard: React.FC<{ mark: "tick" | "cross" | "idk"; p: number }> = ({ mark, p }) => (
  <div style={{ width: 230, height: 150, borderRadius: 20, backgroundColor: "#F3EBDD", padding: "18px 22px", boxSizing: "border-box", position: "relative", boxShadow: "0 14px 30px rgba(0,0,0,0.35)" }}>
    {[80, 60, 70].map((w, i) => (
      <div key={i} style={{ height: 12, borderRadius: 6, width: `${w}%`, backgroundColor: "rgba(20,22,28,0.2)", marginBottom: 12 }} />
    ))}
    <div style={{ position: "absolute", right: 10, bottom: 6 }}>
      {mark === "idk" ? (
        <div style={{ fontSize: 40, fontWeight: 800, color: "#E0533B", opacity: p }}>0</div>
      ) : (
        <Mark kind={mark} p={p} size={60} />
      )}
    </div>
  </div>
);

const S3Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);
  const dot = ROUTE.path(frame);
  const writing = frame >= sec(T.make + 0.1) && frame < sec(T.lucky - 0.1);

  // The marking conveyor: cards slide left across the screen, each gets marked as it passes the pen.
  const conveyor = (frame - sec(T.millions - 0.4)) / 30; // seconds since it started
  const marks: ("tick" | "cross" | "idk")[] = ["tick", "cross", "idk", "tick", "cross", "tick", "idk", "cross"];

  // The needle: from the middle, pushed toward "Guess".
  const needle = interpolate(frame, [sec(T.pushed), sec(T.guessing + 0.4)], [0, 55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={0} answered={frame >= sec(T.answer + 0.4) ? 1 : 0} />

      {/* 1 · Quick test: blank or guess? */}
      <AbsoluteFill style={{ opacity: f(P.quiz) }}>
        <div style={{ position: "absolute", left: 120, top: 200, transform: `translateY(${(1 - ramp(frame, T.quick - 0.2, 0.4)) * 60}px)` }}>
          <ExamSheet frame={frame} big t={{ write: T.make, sounds: T.guess, zero: T.zero, maybe: T.lucky, correct: 999 }} />
        </div>
        {/* What would you do? */}
        <div style={{ position: "absolute", left: 1260, top: 300, display: "flex", flexDirection: "column", gap: 40, opacity: ramp(frame, T.youd - 0.3, 0.3) }}>
          {[
            { label: "Leave it blank", pick: false },
            { label: "Guess", pick: true },
          ].map((b) => {
            const picked = b.pick && frame >= sec(T.youd + 0.6);
            return (
              <div key={b.label} style={{ width: 460, padding: "28px 0", textAlign: "center", borderRadius: 999, fontSize: 60, fontWeight: 800, backgroundColor: picked ? colors.yellow : colors.panel, color: picked ? colors.ink : colors.subtext, border: `5px solid ${picked ? colors.yellow : colors.line}` }}>
                {b.label}
              </div>
            );
          })}
          {/* "Everyone does": a crowd of little dots piles onto Guess */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: 460, justifyContent: "center" }}>
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white, opacity: Math.min(1, pop(frame, T.everyone + i * 0.05)), transform: `scale(${Math.min(1, pop(frame, T.everyone + i * 0.05))})` }} />
            ))}
          </div>
        </div>
      </AbsoluteFill>

      {/* 2 · Millions of practice questions, each marked: right 1, wrong 0, "I don't know" 0 */}
      <AbsoluteFill style={{ opacity: f(P.train) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, height: 200, overflow: "hidden", opacity: ramp(frame, T.millions - 0.4, 0.3) }}>
          {marks.map((m, i) => {
            const x = 1920 - ((conveyor * 520 + i * 300) % 2400);
            const markP = x < 900 ? 1 : 0;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: 20 }}>
                <QCard mark={m} p={markP} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 900, top: 0, width: 8, height: 200, backgroundColor: colors.yellow, borderRadius: 4 }} />
        </div>
        <div style={{ position: "absolute", left: 160, top: 470, display: "flex", gap: 40 }}>
          {[
            { label: "Right", score: "1", at: T.right, good: true },
            { label: "Wrong", score: "0", at: T.wrong, good: false },
            { label: "“I don't know”", score: "0", at: T.idk, good: false },
          ].map((r) => {
            const p = pop(frame, r.at - 0.1);
            return (
              <div key={r.label} style={{ width: 440, padding: "30px 0", borderRadius: 32, backgroundColor: colors.panel, border: `5px solid ${r.good ? colors.mint : colors.line}`, textAlign: "center", opacity: Math.min(1, p) * (1 - ramp(frame, T.overTime - 0.3, 0.3)), transform: `scale(${0.8 + 0.2 * Math.min(1, p)})` }}>
                <div style={{ fontSize: 56, fontWeight: 800 }}>{r.label}</div>
                <div style={{ fontSize: 130, fontWeight: 800, color: r.good ? colors.mint : colors.coral, lineHeight: 1.1 }}>{r.score}</div>
              </div>
            );
          })}
        </div>
        {/* the needle, pushed toward "Guess" */}
        <div style={{ position: "absolute", left: 560, top: 430, width: 800, height: 420, opacity: ramp(frame, T.overTime, 0.35), transform: `translateY(${(1 - ramp(frame, T.overTime, 0.4)) * 40}px)` }}>
          <svg width={800} height={420} viewBox="0 0 800 420" aria-hidden>
            <path d="M 80 380 A 320 320 0 0 1 720 380" fill="none" stroke={colors.line} strokeWidth={26} strokeLinecap="round" />
            <path d="M 400 60 A 320 320 0 0 1 720 380" fill="none" stroke={colors.yellow} strokeWidth={26} strokeLinecap="round" opacity={ramp(frame, T.guessing, 0.3)} />
            <g transform={`rotate(${needle} 400 380)`}>
              <line x1={400} y1={380} x2={400} y2={110} stroke={colors.white} strokeWidth={14} strokeLinecap="round" />
            </g>
            <circle cx={400} cy={380} r={26} fill={colors.white} />
          </svg>
          <div style={{ position: "absolute", left: -60, top: 400, width: 380, textAlign: "center", fontSize: 54, fontWeight: 800, color: colors.subtext, opacity: 1 - 0.6 * ramp(frame, T.idkNever, 0.3) }}>"I don't know"</div>
          <div style={{ position: "absolute", right: -40, top: 400, width: 300, textAlign: "center", fontSize: 54, fontWeight: 800, color: frame >= sec(T.guessing) ? colors.yellow : colors.subtext }}>Guess</div>
        </div>
      </AbsoluteFill>

      {/* 3 · The habit */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: f(P.habit) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, marginRight: 240 }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: colors.subtext, opacity: ramp(frame, T.habit - 0.1, 0.3) }}>it learns one habit:</div>
          <Stamp p={pop(frame, T.always - 0.05)} color={colors.yellow} size={130} rotate={-4}>
            ALWAYS ANSWER
          </Stamp>
        </div>
      </AbsoluteFill>

      {/* 4 · The paper (proof) */}
      <AbsoluteFill style={{ opacity: f(P.paper) }}>
        <div style={{ position: "absolute", left: 300, top: 220, width: 980, borderRadius: 18, backgroundColor: colors.white, color: colors.ink, padding: "56px 72px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", transform: `translateY(${(1 - ramp(frame, P.paper[0], 0.5)) * 80}px) rotate(1deg)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 44, fontWeight: 700, opacity: 0.6 }}>
            <span>OpenAI researchers</span>
            <span style={{ opacity: ramp(frame, T.y2025 - 0.2, 0.3) }}>2025</span>
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.1, margin: "44px 0" }}>Why Language Models Hallucinate</div>
          {[94, 88, 97, 72].map((w, i) => (
            <div key={i} style={{ height: 18, borderRadius: 9, width: `${w}%`, backgroundColor: "rgba(20,22,28,0.14)", marginBottom: 22 }} />
          ))}
        </div>
      </AbsoluteFill>

      {/* 5 · The birthday test */}
      <AbsoluteFill style={{ opacity: f(P.bday) }}>
        <div style={{ position: "absolute", left: 180, top: 200 }}>
          <ChatWindow width={1180} height={800}>
            <ChatBubble from="me" o={pop(frame, T.asked - 0.2)} fontSize={50}>
              When is the researcher's birthday?{" "}
              <span style={{ color: colors.yellow, opacity: ramp(frame, T.only - 0.3, 0.3) }}>Only answer if you know.</span>
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
        </div>
      </AbsoluteFill>

      {/* 6 · Answer 1 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: f(P.answer) }}>
        <div style={{ marginRight: 200 }}>
          <AnswerCard n={1} p={pop(frame, T.answer)} text={<>It's trained to <span style={{ color: colors.yellow }}>always answer</span>.</>} />
        </div>
      </AbsoluteFill>

      <Pencil x={dot.x} y={dot.y} o={during(frame, T.make - 0.4, P.quiz[1] - 3.5, 0.2)} wiggle={writing ? Math.sin(frame * 1.7) * 14 : 0} />
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
