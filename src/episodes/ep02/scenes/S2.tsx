import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S2");

// Times (s) from the S2 word timings in captions.json. Re-voice S2 → re-check these.
const T = {
  machine: 3.8, aha: 5.0, soFar: 6.2, thatsIt: 15.9, oneGuess: 20.3, three: 22.3,
  q1: 24.2, q2: 25.6, q3: 27.7, strip: 29.9,
};

// Each guess: when the options appear, when the top one drops into the sentence.
const GUESSES = [
  { at: 8.1, land: 10.6, options: [["there", 0.62], ["in", 0.21], ["a", 0.08]] as const },
  { at: 12.7, land: 13.5, options: [["was", 0.71], ["lived", 0.18], ["were", 0.05]] as const },
  { at: 14.2, land: 14.6, options: [["a", 0.66], ["an", 0.15], ["one", 0.09]] as const },
];
const START = ["Once", "upon", "a", "time"];

const QUESTIONS = ["Guessing from what?", "Why can't it count letters?", "Why different answers?"];

const TRACK: MoodKey[] = [
  { at: 0, mood: "neutral" },
  { at: sec(T.aha), mood: "aha" },
  { at: sec(T.soFar), mood: "curious" },
  { at: sec(10.6), mood: "happy" },
  { at: sec(T.thatsIt), mood: "neutral" },
  { at: sec(T.oneGuess), mood: "happy" },
  { at: sec(T.three), mood: "curious" },
];

const Options: React.FC<{ frame: number; g: (typeof GUESSES)[number] }> = ({ frame, g }) => {
  const o = during(frame, g.at, g.land + 0.15, 0.2);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute", bottom: "100%", right: -6, marginBottom: 36, transform: `scale(${0.85 + 0.15 * o})`,
        transformOrigin: "bottom right", opacity: o, display: "flex", flexDirection: "column", gap: 12,
        padding: "20px 28px", borderRadius: 28, backgroundColor: colors.panel, border: `4px solid ${colors.line}`,
      }}
    >
      {g.options.map(([w, p], i) => {
        const grow = ramp(frame, g.at + 0.1 + i * 0.08, 0.35);
        return (
          <div key={w} style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 150, fontSize: 48, fontWeight: 700, color: i === 0 ? colors.yellow : colors.subtext }}>{w}</div>
            <div style={{ width: 260 * p * grow, height: 26, borderRadius: 13, backgroundColor: i === 0 ? colors.yellow : colors.lineStrong }} />
          </div>
        );
      })}
    </div>
  );
};

const S2Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const openO = 1 - ramp(frame, T.machine - 0.2, 0.3);
  const headO = during(frame, T.machine, T.soFar - 0.1, 0.3);
  const builderO = during(frame, T.soFar, T.three, 0.4);
  const soFar = ramp(frame, T.soFar + 0.2, 0.8);
  const landed = GUESSES.filter((g) => frame >= sec(g.land));
  const lastLand = landed.length ? landed[landed.length - 1].land : -1;

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      {/* "Once upon a time" carried over from S1 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: openO }}>
        <div style={{ fontSize: 150, fontWeight: 800 }}>
          Once upon a <span style={{ color: colors.yellow }}>time</span>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: headO }}>
        <div style={{ fontSize: 110, fontWeight: 800, textAlign: "center", transform: `scale(${0.9 + 0.1 * pop(frame, T.machine)})` }}>
          ChatGPT is a<br />
          <span style={{ color: colors.yellow }}>guessing machine</span>
        </div>
      </AbsoluteFill>

      {/* The sentence grows one guess at a time */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: builderO }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 84, fontWeight: 800, marginTop: 200 }}>
          {START.map((w, i) => (
            <span key={i} style={{ position: "relative" }}>
              {w}
              <span
                style={{
                  position: "absolute", left: 0, bottom: -4, height: 10, borderRadius: 5, backgroundColor: colors.periwinkle,
                  width: `${Math.max(0, Math.min(1, soFar * 4 - i)) * 100}%`, opacity: 1 - ramp(frame, 7.6, 0.4),
                }}
              />
            </span>
          ))}
          {landed.map((g) => {
            const p = pop(frame, g.land);
            const fresh = 1 - ramp(frame, g.land + 0.5, 0.4);
            return (
              <span
                key={g.land}
                style={{
                  display: "inline-block", transform: `translateY(${(1 - Math.min(1, p)) * -60}px)`,
                  color: interpolateColors(fresh, [0, 1], [colors.white, colors.yellow]),
                }}
              >
                {g.options[0][0]}
              </span>
            );
          })}
          {/* The yellow "guess" slot */}
          <span
            style={{
              position: "relative", width: 180 * (1 - ramp(frame, T.thatsIt, 0.4)), height: 100, boxSizing: "border-box", borderRadius: 24, border: `6px dashed ${colors.yellow}`,
              opacity: ramp(frame, 7.4, 0.3) * (1 - ramp(frame, T.thatsIt, 0.4)),
              transform: `scale(${lastLand > 0 ? 0.92 + 0.08 * Math.min(1, pop(frame, lastLand)) : 1})`,
            }}
          >
            {GUESSES.map((g) => (
              <Options key={g.at} frame={frame} g={g} />
            ))}
          </span>
        </div>
        <div
          style={{
            position: "absolute", top: 240, left: 120, right: 120, textAlign: "center", fontSize: 64, fontWeight: 600, color: colors.subtext,
            opacity: during(frame, 17.3, T.three, 0.3),
          }}
        >
          every answer = <span style={{ color: interpolateColors(ramp(frame, T.oneGuess, 0.3), [0, 1], [colors.white, colors.yellow]) }}>one guess at a time</span>
        </div>
      </AbsoluteFill>

      {/* Three questions, then they become the progress strip */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - ramp(frame, T.strip, 0.4) }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 60 }}>
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
                <span
                  style={{
                    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.yellow, color: colors.ink,
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
                  }}
                >
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

      <Dot x={1560} y={900} track={TRACK} seed="s2" look={{ x: 0, y: -0.15 }} />
    </AbsoluteFill>
  );
};

// Scene S2 — it's a guessing machine. Edit only this file for S2 changes.
export const S2: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S2Content />
    </FadeIn>
  </SceneShell>
);
