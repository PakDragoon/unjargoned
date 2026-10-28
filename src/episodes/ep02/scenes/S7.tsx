import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { EndScreen } from "../../../shared/EndScreen";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S7");

// Times (s) from the S7 word timings in captions.json. Re-voice S7 → re-check these.
const T = { not: 0.7, makesUp: 2.9, hallucination: 6.4, next: 7.6, subscribe: 9.6, comments: 12.8, question: 14.7, endScreen: 18.1 };

const TRACK: MoodKey[] = [
  { at: 0, mood: "worried" },
  { at: sec(T.makesUp), mood: "surprised" },
  { at: sec(T.next), mood: "smug" },
  { at: sec(T.subscribe), mood: "happy" },
  { at: sec(T.comments), mood: "curious" },
  { at: sec(T.endScreen), mood: "happy" },
];

const S7Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pushEnd = sec(T.endScreen);

  // The two circles from S6 slide apart; the part that only "sounds right" fills coral.
  const gap = interpolate(ramp(frame, 0, T.not + 0.3), [0, 1], [70, 380]);
  const coral = ramp(frame, T.makesUp, 0.5);
  const vennO = 1 - ramp(frame, T.next, 0.4);
  const titleO = during(frame, T.next + 0.1, T.endScreen - 0.2, 0.4);
  const askO = during(frame, T.comments, T.endScreen - 0.2, 0.4);
  const endO = ramp(frame, T.endScreen, 0.5);
  const lx = 900 - gap / 2;
  const rx = 900 + gap / 2;

  return (
    <AbsoluteFill style={{ transform: `scale(${frame < pushEnd ? pushIn(frame, pushEnd) : 1})` }}>
      <AbsoluteFill style={{ opacity: vennO }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }} aria-hidden>
          <mask id="s7-only-sounds">
            <rect width={1920} height={1080} fill="black" />
            <circle cx={lx} cy={540} r={260} fill="white" />
            <circle cx={rx} cy={540} r={260} fill="black" />
          </mask>
          <circle cx={lx} cy={540} r={260} fill={colors.periwinkle} fillOpacity={0.14} />
          <rect width={1920} height={1080} fill={colors.coral} opacity={0.85 * coral} mask="url(#s7-only-sounds)" />
          <circle cx={lx} cy={540} r={260} fill="none" stroke={colors.periwinkle} strokeWidth={10} />
          <circle cx={rx} cy={540} r={260} fill={colors.mint} fillOpacity={0.14} stroke={colors.mint} strokeWidth={10} />
        </svg>
        <div style={{ position: "absolute", left: lx - 480, top: 140, width: 480, textAlign: "center", fontSize: 64, fontWeight: 800, color: colors.periwinkle }}>
          sounds right
        </div>
        <div style={{ position: "absolute", left: rx, top: 140, width: 480, textAlign: "center", fontSize: 64, fontWeight: 800, color: colors.mint }}>
          is right
        </div>
        <div
          style={{
            position: "absolute", left: lx - 260, top: 860, width: 520, textAlign: "center", fontSize: 60, fontWeight: 800,
            color: colors.coral, opacity: ramp(frame, T.hallucination, 0.3), transform: `scale(${0.8 + 0.2 * Math.min(1, pop(frame, T.hallucination))})`,
          }}
        >
          hallucination
        </div>
      </AbsoluteFill>

      {/* Next episode */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28, opacity: titleO }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: colors.subtext, letterSpacing: 6 }}>NEXT</div>
        <div style={{ fontSize: 120, fontWeight: 800, color: colors.coral, transform: `scale(${0.9 + 0.1 * Math.min(1, pop(frame, T.next + 0.1))})` }}>
          Why AI Hallucinates
        </div>
        <div
          style={{
            marginTop: 20, padding: "20px 56px", borderRadius: 999, backgroundColor: colors.yellow, color: colors.ink, fontSize: 56, fontWeight: 800,
            opacity: Math.min(1, pop(frame, T.subscribe)), transform: `scale(${0.7 + 0.3 * Math.min(1, pop(frame, T.subscribe))})`,
          }}
        >
          Subscribe
        </div>
      </AbsoluteFill>

      {/* The comment prompt */}
      <div
        style={{
          position: "absolute", left: 180, top: 800, width: 1220, padding: "24px 40px", borderRadius: "40px 40px 40px 12px",
          boxSizing: "border-box", backgroundColor: colors.panel, border: `4px solid ${colors.line}`, fontSize: 48, fontWeight: 700, opacity: askO,
          transform: `translateY(${(1 - askO) * 30}px)`,
        }}
      >
        <span style={{ color: colors.subtext }}>In the comments: </span>
        <span style={{ opacity: ramp(frame, T.question, 0.3) }}>what's the strangest thing an AI has ever told you?</span>
      </div>

      <EndScreen o={endO} dot={false} prompt="What's the strangest thing an AI has ever told you? Tell me in the comments." />

      <Dot x={1560} y={900} track={TRACK} seed="s7" look={{ x: 0, y: -0.15 }} />
    </AbsoluteFill>
  );
};

// Scene S7 — next: Why AI Hallucinates, then the 8 s end screen. Edit only this file for S7 changes.
export const S7: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S7Content />
    </FadeIn>
  </SceneShell>
);
