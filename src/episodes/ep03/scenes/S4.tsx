import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow, StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { Mark, PAPER, RED, Stamp, Wave } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S4");

// Times (s) from the S4 word timings in captions.json. Re-voice S4 → re-check these.
const T = {
  why: 1.5, remember: 3.86, guessing: 4.58, realFact: 6.44, madeUp: 7.4, machine: 8.5, voice: 10.16, wobble: 12.72, wrong: 13.48,
  training: 14.9, assistant: 16.0, marked: 16.78, sureAnswer: 18.42, beats: 18.96, notSure: 19.58,
  airline: 21.62, chatbot: 22.26, canada: 22.88, grandmother: 24.62, died: 25.66, ticket: 27.84, claim: 28.84, discount: 30.06, later: 30.56,
  website: 32.34, opposite: 33.2, y2024: 34.54, tribunal: 35.94, pay: 37.24, its: 38.12, mistake: 39.1,
};

// Shots: one guess slot drops a true and a made-up answer, same look, same voice → helper training rated the same way
// → the airline chatbot vs the airline's own page → the tribunal: pay.
const P = { twins: [0.0, 14.42], rating: [14.42, 20.75], airline: [20.75, 34.11], ruling: [34.11, 99] } as const;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.realFact), mood: "intrigued" },
  { at: sec(T.voice), mood: "confused" },
  { at: sec(T.wrong + 0.2), mood: "surprised" },
  { at: sec(T.training), mood: "neutral" },
  { at: sec(T.notSure), mood: "deadpan" },
  { at: sec(T.airline), mood: "curious" },
  { at: sec(T.grandmother), mood: "sad" },
  { at: sec(T.claim), mood: "neutral" },
  { at: sec(T.opposite), mood: "worried" },
  { at: sec(T.tribunal), mood: "surprised" },
  { at: sec(T.pay + 0.2), mood: "relieved" },
];

// Dot: under the guess slot, peeking between the twin bubbles, beside the ratings, by the airline chat, by the gavel.
const ROUTE = hops([
  { at: 0, x: 1600, y: 860 },
  { at: sec(T.voice + 0.2), x: 960, y: 900 }, // between the two bubbles, trying to tell them apart
  { at: sec(T.training + 0.2), x: 1600, y: 860 },
  { at: sec(T.airline + 0.3), x: 1640, y: 880 },
  { at: sec(T.website + 0.2), x: 1500, y: 860 },
  { at: sec(T.tribunal - 0.1), x: 1620, y: 860 },
]);
const LOOK = glances([
  { at: 0, x: -0.6, y: -0.6 },
  { at: sec(T.voice + 0.2), x: -0.8, y: -0.4 },
  { at: sec(T.wobble), x: 0.8, y: -0.4 },
  { at: sec(T.wrong), x: -0.8, y: -0.4 },
  { at: sec(T.training + 0.2), x: -0.8, y: -0.2 },
  { at: sec(T.airline + 0.3), x: -0.8, y: -0.3 },
  { at: sec(T.website + 0.2), x: -0.6, y: -0.5 },
  { at: sec(T.tribunal - 0.1), x: -0.8, y: -0.3 },
]);

const TWINS = [
  { text: "Sharks are older than trees.", ok: true },
  { text: "The first email was sent in 1952.", ok: false },
];

/** Plane icon for the airline chat header (generic, no livery). */
const Plane: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 56 56" aria-hidden>
    <path d="M 28 4 C 31 4 32 8 32 12 V 22 L 52 32 V 37 L 32 31 V 42 L 38 47 V 51 L 28 48 L 18 51 V 47 L 24 42 V 31 L 4 37 V 32 L 24 22 V 12 C 24 8 25 4 28 4 Z" fill={colors.periwinkle} />
  </svg>
);

const S4Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);
  const reveal = ramp(frame, T.wrong, 0.3);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={1} />

      {/* 1 · Same machine, same voice */}
      <AbsoluteFill style={{ opacity: f(P.twins) }}>
        {/* the guess slot (Ep 2's yellow dashed box) */}
        <div
          style={{
            position: "absolute", left: 760, top: 190, width: 400, height: 150, borderRadius: 30, border: `8px dashed ${colors.yellow}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 800, color: colors.yellow,
            transform: `scale(${0.8 + 0.2 * Math.min(1, pop(frame, T.remember - 0.2))})`, opacity: Math.min(1, pop(frame, T.remember - 0.2)),
          }}
        >
          sounds right
        </div>
        {TWINS.map((t, i) => {
          const at = i === 0 ? T.realFact - 0.1 : T.madeUp;
          const p = pop(frame, at);
          const x = i === 0 ? 120 : 940;
          return (
            <div key={t.text} style={{ position: "absolute", left: x, top: 430, width: 740, opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * -140}px)` }}>
              <div
                style={{
                  padding: "34px 40px", borderRadius: "40px 40px 40px 12px", backgroundColor: colors.panel, fontSize: 56, fontWeight: 700, lineHeight: 1.2,
                  border: `5px solid ${reveal > 0.5 ? (t.ok ? colors.mint : colors.coral) : colors.line}`, minHeight: 150, boxSizing: "border-box",
                }}
              >
                {t.text}
              </div>
              <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 20 }}>
                <svg width={52} height={52} viewBox="0 0 52 52" aria-hidden style={{ opacity: ramp(frame, T.voice - 0.3, 0.3) }}>
                  <path d="M 6 18 H 16 L 30 6 V 46 L 16 34 H 6 Z" fill={colors.subtext} />
                  <path d="M 37 16 a 14 14 0 0 1 0 20" fill="none" stroke={colors.subtext} strokeWidth={5} strokeLinecap="round" />
                </svg>
                <Wave w={560} p={ramp(frame, T.voice - 0.3, 1.0)} />
              </div>
              <div style={{ position: "absolute", right: -20, top: -50 }}>
                <Mark kind={t.ok ? "tick" : "cross"} p={ramp(frame, T.wrong + 0.1, 0.3)} size={96} color={t.ok ? colors.mint : colors.coral} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* 2 · Helper training, marked the same way: sure beats unsure */}
      <AbsoluteFill style={{ opacity: f(P.rating) }}>
        <div style={{ position: "absolute", left: 200, top: 260, display: "flex", flexDirection: "column", gap: 60 }}>
          {[
            { text: "Definitely 1952!", score: "+1", good: true, at: T.sureAnswer - 0.2 },
            { text: "I'm not sure.", score: "0", good: false, at: T.notSure - 0.2 },
          ].map((r) => (
            <div key={r.text} style={{ display: "flex", alignItems: "center", gap: 50, opacity: Math.min(1, pop(frame, r.at)) }}>
              <div style={{ width: 760, padding: "34px 44px", borderRadius: "40px 40px 40px 12px", backgroundColor: colors.panel, border: `5px solid ${colors.line}`, fontSize: 64, fontWeight: 700 }}>
                {r.text}
              </div>
              <div
                style={{
                  width: 180, height: 180, borderRadius: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 84, fontWeight: 800,
                  backgroundColor: r.good ? colors.yellow : colors.panel, color: r.good ? colors.ink : colors.subtext, border: `6px solid ${r.good ? colors.yellow : colors.line}`,
                  transform: `scale(${Math.min(1.1, pop(frame, r.at + 0.5))})`, opacity: Math.min(1, pop(frame, r.at + 0.5)),
                }}
              >
                {r.score}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* 3 · The airline chatbot vs the airline's own page */}
      <AbsoluteFill style={{ opacity: f(P.airline) }}>
        <div style={{ position: "absolute", left: 130, top: 170, transform: `translateY(${(1 - ramp(frame, P.airline[0], 0.4)) * 40}px)` }}>
          <ChatWindow width={1060} height={700}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 44, fontWeight: 800, color: colors.subtext, marginTop: -10 }}>
              <Plane /> Airline help chat
            </div>
            <ChatBubble from="me" o={pop(frame, T.grandmother - 0.6)} fontSize={48}>
              My grandmother just died. Is there a funeral discount?
            </ChatBubble>
            <ChatBubble from="ai" o={frame >= sec(T.ticket - 0.6) ? 1 : 0} fontSize={48}>
              <StreamText text="Yes! Buy a full-price ticket now, and claim the discount later, within 90 days." frame={frame} from={sec(T.ticket - 0.6)} to={sec(T.later)} />
            </ChatBubble>
          </ChatWindow>
        </div>
        {/* the airline's own web page says the opposite */}
        <div
          style={{
            position: "absolute", left: 1150, top: 300, width: 600, borderRadius: 24, backgroundColor: PAPER, color: colors.ink, padding: "34px 40px",
            boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", transform: `rotate(3deg) translateX(${(1 - ramp(frame, T.website - 0.2, 0.4)) * 400}px)`,
            opacity: ramp(frame, T.website - 0.2, 0.3),
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 800, opacity: 0.55, marginBottom: 18 }}>Airline website</div>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.2 }}>
            Funeral discounts <span style={{ color: RED }}>can't</span> be claimed after you travel.
          </div>
        </div>
        <div style={{ position: "absolute", left: 1060, top: 420, fontSize: 150, fontWeight: 800, color: colors.coral, opacity: Math.min(1, pop(frame, T.opposite)), transform: `scale(${Math.min(1.1, pop(frame, T.opposite))})` }}>
          ≠
        </div>
      </AbsoluteFill>

      {/* 4 · The tribunal: the airline pays */}
      <AbsoluteFill style={{ opacity: f(P.ruling) }}>
        <div style={{ position: "absolute", left: 220, top: 230, display: "flex", alignItems: "center", gap: 70 }}>
          <div style={{ position: "relative", transform: "scale(0.62)", transformOrigin: "left center" }}>
            <ChatWindow width={1000} height={520}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 44, fontWeight: 800, color: colors.subtext }}>
                <Plane /> Airline help chat
              </div>
              <ChatBubble from="ai" fontSize={48}>…claim the discount later, within 90 days.</ChatBubble>
            </ChatWindow>
          </div>
        </div>
        {/* gavel strike */}
        <svg style={{ position: "absolute", left: 1000, top: 170, opacity: ramp(frame, T.y2024 - 0.2, 0.3) }} width={400} height={360} viewBox="0 0 400 360" aria-hidden>
          <g transform={`rotate(${-45 + 45 * ramp(frame, T.tribunal - 0.2, 0.15)} 200 320)`}>
            <rect x={110} y={40} width={180} height={90} rx={20} fill={colors.periwinkle} />
            <rect x={186} y={124} width={28} height={196} rx={14} fill={colors.periwinkle} />
          </g>
          <rect x={60} y={326} width={280} height={28} rx={10} fill={colors.lineStrong} />
        </svg>
        <div style={{ position: "absolute", left: 1000, top: 590 }}>
          <Stamp p={pop(frame, T.pay - 0.1)} color={colors.yellow} size={150} rotate={-8}>
            PAY
          </Stamp>
        </div>
        <div style={{ position: "absolute", left: 220, top: 760, display: "flex", gap: 30, fontSize: 56, fontWeight: 800 }}>
          <span style={{ opacity: ramp(frame, T.its - 0.1, 0.25) }}>its chatbot,</span>
          <span style={{ color: colors.yellow, opacity: ramp(frame, T.mistake - 0.1, 0.25) }}>its mistake</span>
        </div>
        <div style={{ position: "absolute", left: 220, top: 160, fontSize: 48, fontWeight: 700, color: colors.subtext, opacity: ramp(frame, T.y2024 - 0.2, 0.3) }}>
          Canada, 2024 · tribunal ruling
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e3s4" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S4 — question two: why does it sound so sure? Edit only this file for S4 changes.
export const S4: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S4Content />
    </LineWipeIn>
  </SceneShell>
);
