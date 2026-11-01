import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { EndScreen } from "../../../shared/EndScreen";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { PAPER } from "../Props";
import { scene } from "../timeline";

const S = scene("S7");

// Times (s) from the S7 word timings in captions.json. Re-voice S7 → re-check these.
const T = { soFar: 0.16, talks: 1.46, act: 3.3, flight: 4.04, email: 5.02, money: 5.82, agent: 7.58, next: 8.86, subscribe: 10.5, endScreen: 12.09 };

const TRACK: MoodKey[] = [
  { at: 0, mood: "neutral" },
  { at: sec(T.act), mood: "surprised" },
  { at: sec(T.money), mood: "worried" },
  { at: sec(T.agent), mood: "intrigued" },
  { at: sec(T.subscribe), mood: "happy" },
];

const ROUTE = hops([
  { at: 0, x: 1600, y: 880 },
  { at: sec(T.agent), x: 1450, y: 700 },
  { at: sec(T.subscribe), x: 1600, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.2 },
  { at: sec(T.flight), x: -0.8, y: -0.6 },
  { at: sec(T.money), x: -0.8, y: 0.4 },
  { at: sec(T.agent), x: -0.8, y: 0 },
]);

/** A drawn arm reaching out of the chat window, holding a thing. */
const Arm: React.FC<{ p: number; angle: number; children: React.ReactNode }> = ({ p, angle, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${angle}deg)`, transformOrigin: "0 0" }}>
    <div style={{ width: 300 * Math.min(1, p), height: 22, borderRadius: 11, backgroundColor: colors.lineStrong }} />
    <div style={{ position: "absolute", left: 300 * Math.min(1, p) - 20, top: -50, transform: `rotate(${-angle}deg) scale(${Math.min(1, p)})`, opacity: Math.min(1, p) }}>{children}</div>
  </div>
);

const S7Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const actO = 1 - ramp(frame, T.agent - 0.3, 0.35);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      {/* The chat that only talks… then grows arms */}
      <AbsoluteFill style={{ opacity: actO }}>
        <div style={{ position: "absolute", left: 560, top: 280 }}>
          <ChatWindow width={700} height={480}>
            <ChatBubble from="ai" o={pop(frame, 0.1)} fontSize={50}>Here's what you could do…</ChatBubble>
            <div style={{ display: "flex", gap: 10, paddingLeft: 10, opacity: during(frame, 0.6, T.act, 0.2) }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.subtext, transform: `translateY(${Math.sin(frame / 4 + i) * 6}px)` }} />
              ))}
            </div>
          </ChatWindow>
          {/* arms: ticket (up-left), envelope (right), coin (down-left) */}
          <div style={{ position: "absolute", left: 40, top: 60 }}>
            <Arm p={ramp(frame, T.flight - 0.3, 0.35)} angle={-150}>
              <div style={{ padding: "16px 22px", borderRadius: 14, backgroundColor: PAPER, color: colors.ink, fontSize: 44, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
                <svg width={40} height={40} viewBox="0 0 56 56" aria-hidden><path d="M 28 4 C 31 4 32 8 32 12 V 22 L 52 32 V 37 L 32 31 V 42 L 38 47 V 51 L 28 48 L 18 51 V 47 L 24 42 V 31 L 4 37 V 32 L 24 22 V 12 C 24 8 25 4 28 4 Z" fill={colors.ink} /></svg>
                TICKET
              </div>
            </Arm>
          </div>
          <div style={{ position: "absolute", left: 680, top: 200 }}>
            <Arm p={ramp(frame, T.email - 0.3, 0.35)} angle={-20}>
              <svg width={140} height={100} viewBox="0 0 140 100" aria-hidden>
                <rect x={4} y={4} width={132} height={92} rx={12} fill={PAPER} />
                <path d="M 8 10 L 70 58 L 132 10" fill="none" stroke={colors.ink} strokeWidth={8} strokeLinejoin="round" />
              </svg>
            </Arm>
          </div>
          <div style={{ position: "absolute", left: 60, top: 440 }}>
            <Arm p={ramp(frame, T.money - 0.3, 0.35)} angle={150}>
              <svg width={110} height={110} viewBox="0 0 110 110" aria-hidden>
                <circle cx={55} cy={55} r={50} fill={colors.yellow} />
                <circle cx={55} cy={55} r={36} fill="none" stroke={colors.ink} strokeWidth={6} />
                <text x={55} y={72} textAnchor="middle" fontSize={50} fontWeight={800} fill={colors.ink}>$</text>
              </svg>
            </Arm>
          </div>
        </div>
      </AbsoluteFill>

      {/* Next episode card */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: during(frame, T.agent - 0.2, T.endScreen - 0.1, 0.35) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, marginRight: 200 }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: colors.subtext, letterSpacing: 4, opacity: ramp(frame, T.next - 0.2, 0.3) }}>NEXT EPISODE</div>
          <div style={{ fontSize: 120, fontWeight: 800, transform: `scale(${Math.min(1.05, pop(frame, T.agent - 0.2))})` }}>
            What Is an <span style={{ color: colors.yellow }}>AI Agent</span>?
          </div>
          <div
            style={{
              marginTop: 20, padding: "20px 56px", borderRadius: 999, backgroundColor: colors.yellow, color: colors.ink, fontSize: 56, fontWeight: 800,
              opacity: Math.min(1, pop(frame, T.subscribe - 0.1)), transform: `scale(${0.7 + 0.3 * Math.min(1, pop(frame, T.subscribe - 0.1))})`,
            }}
          >
            Subscribe
          </div>
        </div>
      </AbsoluteFill>

      <EndScreen o={ramp(frame, T.endScreen, 0.4)} prompt="What would you never let an AI do for you? Tell me in the comments." />

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e3s7" look={LOOK} opacity={1 - ramp(frame, T.endScreen, 0.3)} />
    </AbsoluteFill>
  );
};

// Scene S7 — next: What Is an AI Agent?, then the 8 s end screen. Edit only this file for S7 changes.
export const S7: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S7Content />
    </FadeIn>
  </SceneShell>
);
