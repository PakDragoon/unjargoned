import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { ExamBook, Mark, PAPER, PEN, Pencil, RED, Strike, Wave } from "../Props";
import { scene } from "../timeline";

const S = scene("S6");

// Times (s) from the S6 word timings in captions.json. Re-voice S6 → re-check these.
const T = {
  why: 0.24, guesser: 2.88, marked: 3.56, exam: 4.92, blank: 5.68, zero: 6.2, bluffs: 7.54,
  right: 8.7, wrong: 9.78, voice: 11.12, cantHear: 13.18, difference: 13.8,
  sounding: 15.12, beingRight: 16.78, treat: 18.36, fast: 19.28, student: 19.62, expert: 20.7, book: 21.7, check: 23.2,
};

// Recap on one canvas: blank = 0 → two identical answers → the headline → "fast student, not an expert": book + check.
const P = { exam: [0.0, 8.22], twins: [8.22, 14.78], head: [14.78, 18.04], advice: [18.04, 99] } as const;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.guesser), mood: "neutral" },
  { at: sec(T.zero), mood: "sad" },
  { at: sec(T.bluffs), mood: "smug" },
  { at: sec(T.right), mood: "confused" },
  { at: sec(T.sounding), mood: "aha" },
  { at: sec(T.treat), mood: "happy" },
  { at: sec(T.expert), mood: "deadpan" },
  { at: sec(T.book), mood: "happy" },
  { at: sec(T.check), mood: "relieved" },
];

const ROUTE = hops([
  { at: 0, x: 1560, y: 860 },
  { at: sec(T.bluffs - 0.3), x: 1300, y: 620 }, // to the bluff box with its pencil
  { at: sec(T.right), x: 960, y: 920 }, // under the twin answers
  { at: sec(T.sounding), x: 1600, y: 880 },
  { at: sec(T.fast), x: 820, y: 860 }, // zips across: "a very fast student"
  { at: sec(T.fast + 0.45), x: 1180, y: 860 },
  { at: sec(T.check - 0.2), x: 1300, y: 700 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.2 },
  { at: sec(T.bluffs - 0.3), x: -0.8, y: 0.2 },
  { at: sec(T.right), x: -0.8, y: -0.5 },
  { at: sec(T.wrong), x: 0.8, y: -0.5 },
  { at: sec(T.sounding), x: -0.8, y: -0.3 },
  { at: sec(T.fast + 0.45), x: 0.7, y: -0.4 },
  { at: sec(T.book), x: -0.8, y: -0.3 },
  { at: sec(T.check - 0.2), x: -0.8, y: 0.2 },
]);

const S6Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);
  const dot = ROUTE.path(frame);
  const writing = frame >= sec(T.bluffs) && frame < sec(T.bluffs + 0.6);
  const speed = during(frame, T.fast - 0.5, T.fast + 0.5, 0.1);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      {/* 1 · A guesser, marked like a student: blank = 0, so it bluffs */}
      <AbsoluteFill style={{ opacity: f(P.exam) }}>
        <div style={{ position: "absolute", left: 220, top: 220, width: 900, borderRadius: 24, backgroundColor: PAPER, color: colors.ink, padding: "44px 56px", boxSizing: "border-box", transform: "rotate(-1.5deg)", boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: 2, marginBottom: 30, opacity: ramp(frame, T.marked - 0.2, 0.3) }}>EXAM</div>
          {[0, 1].map((row) => (
            <div key={row} style={{ display: "flex", alignItems: "center", gap: 30, height: 150, opacity: row === 0 ? ramp(frame, T.blank - 0.4, 0.3) : ramp(frame, T.bluffs - 0.4, 0.3) }}>
              <div style={{ width: 440, height: 110, borderRadius: 16, border: `5px solid ${colors.ink}`, boxSizing: "border-box", display: "flex", alignItems: "center", paddingLeft: 26, fontSize: 60, fontWeight: 700, color: PEN, fontStyle: "italic" }}>
                {row === 1 && frame >= sec(T.bluffs + 0.1) ? "Around 1350" : ""}
              </div>
              <div style={{ fontSize: 96, fontWeight: 800, color: row === 0 ? RED : "#C98A00", opacity: Math.min(1, pop(frame, row === 0 ? T.zero : T.bluffs + 0.7)) }}>{row === 0 ? "0" : "1?"}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* 2 · Right and wrong, same confident voice */}
      <AbsoluteFill style={{ opacity: f(P.twins) }}>
        {[
          { text: "Sharks are older than trees.", ok: true, x: 140 },
          { text: "The first email was sent in 1952.", ok: false, x: 960 },
        ].map((t, i) => (
          <div key={t.text} style={{ position: "absolute", left: t.x, top: 300, width: 740, opacity: Math.min(1, pop(frame, i === 0 ? T.right - 0.2 : T.wrong - 0.2)) }}>
            <div style={{ padding: "34px 40px", borderRadius: "40px 40px 40px 12px", backgroundColor: colors.panel, border: `5px solid ${colors.line}`, fontSize: 56, fontWeight: 700, lineHeight: 1.2, minHeight: 150, boxSizing: "border-box" }}>{t.text}</div>
            <div style={{ marginTop: 26 }}>
              <Wave w={620} p={ramp(frame, T.voice - 0.3, 0.8)} />
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontSize: 220, fontWeight: 800, color: colors.yellow, opacity: Math.min(1, pop(frame, T.cantHear)), transform: `scale(${Math.min(1.05, pop(frame, T.cantHear))})` }}>?</div>
      </AbsoluteFill>

      {/* 3 · The headline */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: f(P.head) }}>
        <div style={{ fontSize: 120, fontWeight: 800, textAlign: "center", lineHeight: 1.15, marginRight: 200 }}>
          <span style={{ opacity: Math.min(1, pop(frame, T.sounding - 0.1)) }}>
            Sounding <span style={{ color: colors.yellow }}>sure</span>
          </span>
          <br />
          <span style={{ color: colors.coral, opacity: Math.min(1, pop(frame, T.beingRight - 0.6)) }}>≠</span>{" "}
          <span style={{ opacity: Math.min(1, pop(frame, T.beingRight - 0.3)) }}>being right</span>
        </div>
      </AbsoluteFill>

      {/* 4 · A very fast student, not an expert. Give it the book. Check its work. */}
      <AbsoluteFill style={{ opacity: f(P.advice) }}>
        {/* the "expert" rosette, struck through */}
        <div style={{ position: "absolute", left: 170, top: 220, display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, pop(frame, T.expert - 0.4)) }}>
          <svg width={110} height={140} viewBox="0 0 110 140" aria-hidden>
            <path d="M 30 70 L 18 136 L 42 122 L 55 140 L 60 76 Z M 80 70 L 92 136 L 68 122 L 55 140 L 50 76 Z" fill={colors.periwinkle} />
            <circle cx={55} cy={50} r={44} fill={colors.periwinkle} />
            <circle cx={55} cy={50} r={28} fill="none" stroke={colors.ink} strokeWidth={6} />
          </svg>
          <span style={{ position: "relative", fontSize: 80, fontWeight: 800, color: colors.subtext }}>
            expert
            <Strike p={ramp(frame, T.expert + 0.15, 0.3)} width={14} />
          </span>
        </div>
        <div style={{ position: "absolute", left: 640, top: 400 }}>
          <ExamBook s={0.75} open={ramp(frame, T.book, 0.6)} />
        </div>
        {/* the answer sheet gets checked */}
        <div style={{ position: "absolute", left: 1050, top: 330, width: 520, borderRadius: 22, backgroundColor: PAPER, color: colors.ink, padding: "34px 40px", boxSizing: "border-box", boxShadow: "0 24px 50px rgba(0,0,0,0.35)", opacity: ramp(frame, T.book + 0.3, 0.3) }}>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 2, marginBottom: 20 }}>ANSWER</div>
          {[86, 70, 80].map((w, i) => (
            <div key={i} style={{ height: 16, borderRadius: 8, width: `${w}%`, backgroundColor: "rgba(59,91,219,0.45)", marginBottom: 16 }} />
          ))}
          <div style={{ position: "absolute", right: 26, top: 24 }}>
            <Mark kind="tick" p={ramp(frame, T.check, 0.35)} size={100} />
          </div>
        </div>
        {/* speed lines behind Dot as it zips across */}
        <div style={{ position: "absolute", left: dot.x - 360, top: dot.y - 40, display: "flex", flexDirection: "column", gap: 22, opacity: speed }}>
          {[220, 300, 180].map((w, i) => (
            <div key={i} style={{ width: w, height: 10, borderRadius: 5, backgroundColor: colors.yellow, marginLeft: 300 - w }} />
          ))}
        </div>
      </AbsoluteFill>

      <Pencil x={dot.x} y={dot.y} o={during(frame, T.bluffs - 0.3, P.exam[1], 0.2)} wiggle={writing ? Math.sin(frame * 1.8) * 14 : 0} />
      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e3s6" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S6 — the big payoff. Edit only this file for S6 changes.
export const S6: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S6Content />
    </FadeIn>
  </SceneShell>
);
