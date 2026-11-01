import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow, StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { Mark, PAPER, RED, Stamp, Wave } from "../Props";
import { AnswerCard, QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S4");

// Times (s) from the S4 word timings in captions.json. Re-voice S4 → re-check these.
const T = {
  why: 1.52, think: 3.62, notSure: 5.38, um: 6.4, iThink: 7.26, maybe: 8.5, doubt: 10.88, wobble: 12.0, warning: 12.82,
  aiDoesnt: 14.38, remember: 16.12, builds: 16.78, oneGuess: 17.78, same: 20.54, trueOrNot: 21.3, realFact: 23.06, madeUp: 24.14,
  calm: 25.7, voice: 26.7, airline: 28.52, chatbot: 29.12, grandmother: 31.7, claim: 34.06, later: 35.46, website: 37.24,
  opposite: 38.08, tribunal: 39.22, pay: 40.46, answer: 41.8, never: 43.12, wrong: 44.54,
};

// Shots: a person who isn't sure (you can hear it) → AI doesn't wobble → same slot, same voice, true or not
// → the airline chatbot vs its own website, the airline pays → ANSWER 2.
const P = { human: [0, 14.2], vs: [14.2, 16.45], twins: [16.45, 27.75], airline: [27.75, 41.6], answer: [41.6, 99] } as const;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.um), mood: "confused" },
  { at: sec(T.warning), mood: "worried" },
  { at: sec(T.aiDoesnt), mood: "deadpan" },
  { at: sec(T.builds), mood: "curious" },
  { at: sec(T.calm), mood: "confused" },
  { at: sec(T.voice + 0.3), mood: "surprised" },
  { at: sec(T.airline), mood: "curious" },
  { at: sec(T.grandmother), mood: "sad" },
  { at: sec(T.opposite), mood: "worried" },
  { at: sec(T.pay), mood: "relieved" },
  { at: sec(T.answer), mood: "happy" },
];

const ROUTE = hops([
  { at: 0, x: 1600, y: 880 },
  { at: sec(T.warning + 0.2), x: 1500, y: 600 }, // next to the warning sign
  { at: sec(T.aiDoesnt + 0.1), x: 960, y: 920 }, // between the person and the AI
  { at: sec(T.calm), x: 960, y: 920 },
  { at: sec(T.airline + 0.3), x: 1640, y: 900 },
  { at: sec(T.tribunal - 0.5), x: 980, y: 965 }, // clears the PAY stamp, watches from under the chat
  { at: sec(T.answer + 0.2), x: 1640, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.2 },
  { at: sec(T.warning + 0.2), x: -0.8, y: 0 },
  { at: sec(T.aiDoesnt + 0.1), x: -0.8, y: -0.5 },
  { at: sec(T.aiDoesnt + 1.0), x: 0.8, y: -0.5 },
  { at: sec(T.realFact), x: -0.8, y: -0.5 },
  { at: sec(T.madeUp), x: 0.8, y: -0.5 },
  { at: sec(T.airline + 0.3), x: -0.8, y: -0.3 },
  { at: sec(T.tribunal - 0.5), x: 0.8, y: -0.5 },
  { at: sec(T.answer + 0.2), x: -0.8, y: -0.2 },
]);

const TWINS = [
  { text: "Sharks are older than trees.", ok: true },
  { text: "The first email was sent in 1952.", ok: false },
];

/** A simple drawn person (generic, no face detail beyond the brand style). */
const Person: React.FC = () => (
  <svg width={200} height={230} viewBox="0 0 200 230" aria-hidden>
    <circle cx={100} cy={70} r={56} fill={colors.periwinkle} />
    <path d="M 20 230 C 20 160, 60 135, 100 135 C 140 135, 180 160, 180 230 Z" fill={colors.periwinkle} />
    <circle cx={80} cy={66} r={7} fill={colors.ink} />
    <circle cx={120} cy={66} r={7} fill={colors.ink} />
    <path d="M 82 96 Q 92 90 100 96 T 118 96" fill="none" stroke={colors.ink} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

/** A shaky, uneven voice line (the human's doubt), vs <Wave> which is steady. */
const ShakyWave: React.FC<{ frame: number; w: number; p: number }> = ({ frame, w, p }) => {
  const bars = 22;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 90, width: w }}>
      {Array.from({ length: bars }, (_, i) => {
        const h = 10 + 70 * Math.abs(Math.sin(i * 2.7 + frame * 0.35) * Math.cos(i * 1.3 - frame * 0.21));
        return <div key={i} style={{ flex: 1, height: h * Math.min(1, Math.max(0, p * bars - i)), borderRadius: 6, backgroundColor: colors.periwinkle, transform: `translateY(${Math.sin(frame * 0.6 + i) * 4}px)` }} />;
      })}
    </div>
  );
};

const Plane: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 56 56" aria-hidden>
    <path d="M 28 4 C 31 4 32 8 32 12 V 22 L 52 32 V 37 L 32 31 V 42 L 38 47 V 51 L 28 48 L 18 51 V 47 L 24 42 V 31 L 4 37 V 32 L 24 22 V 12 C 24 8 25 4 28 4 Z" fill={colors.periwinkle} />
  </svg>
);

const S4Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);
  const reveal = ramp(frame, T.voice + 0.3, 0.3);
  const shake = (amt: number) => `translate(${Math.sin(frame * 1.3) * amt}px, ${Math.cos(frame * 1.7) * amt * 0.6}px) rotate(${Math.sin(frame * 0.9) * amt * 0.3}deg)`;

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={1} answered={frame >= sec(T.answer + 0.4) ? 2 : 1} />

      {/* 1 · A person who isn't sure: you can hear it */}
      <AbsoluteFill style={{ opacity: f(P.human) }}>
        <div style={{ position: "absolute", left: 220, top: 380, opacity: Math.min(1, pop(frame, T.think - 0.2)) }}>
          <Person />
        </div>
        <div style={{ position: "absolute", left: 470, top: 260, width: 900 }}>
          <div style={{ padding: "34px 44px", borderRadius: "40px 40px 40px 12px", backgroundColor: colors.panel, border: `5px solid ${colors.line}`, fontSize: 72, fontWeight: 700, minHeight: 120, opacity: ramp(frame, T.um - 0.2, 0.2) }}>
            <span style={{ display: "inline-block", transform: shake(3), opacity: ramp(frame, T.um - 0.1, 0.15) }}>Um…</span>{" "}
            <span style={{ display: "inline-block", transform: shake(3), opacity: ramp(frame, T.iThink - 0.1, 0.15) }}>I think it's…</span>{" "}
            <span style={{ display: "inline-block", transform: shake(4), opacity: ramp(frame, T.maybe - 0.1, 0.15), color: colors.subtext }}>maybe Tuesday?</span>
          </div>
          <div style={{ marginTop: 30, opacity: ramp(frame, T.um, 0.3) }}>
            <ShakyWave frame={frame} w={760} p={ramp(frame, T.um, 2.6)} />
          </div>
        </div>
        {/* the wobble is a warning sign */}
        <svg style={{ position: "absolute", left: 1390, top: 280, opacity: Math.min(1, pop(frame, T.warning - 0.1)), transform: `scale(${Math.min(1.1, pop(frame, T.warning - 0.1))})` }} width={220} height={200} viewBox="0 0 220 200" aria-hidden>
          <path d="M 110 12 L 208 186 H 12 Z" fill={colors.yellow} stroke={colors.yellow} strokeWidth={14} strokeLinejoin="round" />
          <rect x={100} y={64} width={20} height={66} rx={10} fill={colors.ink} />
          <circle cx={110} cy={154} r={12} fill={colors.ink} />
        </svg>
      </AbsoluteFill>

      {/* 2 · AI doesn't wobble: the shaky line vs a steady one */}
      <AbsoluteFill style={{ opacity: f(P.vs) }}>
        {[
          { who: "person", x: 150 },
          { who: "AI", x: 1010 },
        ].map((c) => (
          <div key={c.who} style={{ position: "absolute", left: c.x, top: 330, width: 760 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: c.who === "AI" ? colors.yellow : colors.periwinkle, marginBottom: 20 }}>{c.who === "AI" ? "AI" : "A person"}</div>
            <div style={{ padding: "30px 40px", borderRadius: "40px 40px 40px 12px", backgroundColor: colors.panel, border: `5px solid ${colors.line}`, fontSize: 60, fontWeight: 700, marginBottom: 26 }}>
              {c.who === "AI" ? "It's Tuesday." : <span style={{ display: "inline-block", transform: shake(3) }}>Um… maybe Tuesday?</span>}
            </div>
            {c.who === "AI" ? <Wave w={640} p={ramp(frame, T.aiDoesnt, 0.6)} color={colors.yellow} /> : <ShakyWave frame={frame} w={640} p={1} />}
          </div>
        ))}
      </AbsoluteFill>

      {/* 3 · Every guess made the same way: true and made-up answers, same calm voice */}
      <AbsoluteFill style={{ opacity: f(P.twins) }}>
        <div style={{ position: "absolute", left: 760, top: 190, width: 400, height: 150, borderRadius: 30, border: `8px dashed ${colors.yellow}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 800, color: colors.yellow, transform: `scale(${0.8 + 0.2 * Math.min(1, pop(frame, T.builds - 0.2))})`, opacity: Math.min(1, pop(frame, T.builds - 0.2)) }}>
          next guess
        </div>
        {/* a stream of identical little guesses dropping out of the slot */}
        <div style={{ position: "absolute", left: 940, top: 350, display: "flex", flexDirection: "column", gap: 14, opacity: during(frame, T.oneGuess - 0.2, T.realFact - 0.3, 0.3) }}>
          {[0, 1, 2].map((i) => {
            const y = ((frame - sec(T.oneGuess)) * 6 + i * 70) % 210;
            return <div key={i} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.yellow, transform: `translateY(${y}px)`, opacity: 0.85 }} />;
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontSize: 60, fontWeight: 800, opacity: during(frame, T.same - 0.2, T.realFact - 0.3, 0.3) }}>
          same way, <span style={{ color: colors.yellow }}>true or not</span>
        </div>
        {TWINS.map((t, i) => {
          const at = i === 0 ? T.realFact - 0.1 : T.madeUp - 0.1;
          const p = pop(frame, at);
          const x = i === 0 ? 120 : 940;
          return (
            <div key={t.text} style={{ position: "absolute", left: x, top: 430, width: 740, opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * -140}px)` }}>
              <div style={{ padding: "34px 40px", borderRadius: "40px 40px 40px 12px", backgroundColor: colors.panel, fontSize: 56, fontWeight: 700, lineHeight: 1.2, border: `5px solid ${reveal > 0.5 ? (t.ok ? colors.mint : colors.coral) : colors.line}`, minHeight: 150, boxSizing: "border-box" }}>
                {t.text}
              </div>
              <div style={{ marginTop: 26 }}>
                <Wave w={560} p={ramp(frame, T.calm - 0.4, 1.0)} />
              </div>
              <div style={{ position: "absolute", right: -20, top: -50 }}>
                <Mark kind={t.ok ? "tick" : "cross"} p={ramp(frame, T.voice + 0.3, 0.3)} size={96} color={t.ok ? colors.mint : colors.coral} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* 4 · The airline chatbot vs the airline's own page → the airline pays */}
      <AbsoluteFill style={{ opacity: f(P.airline) }}>
        <div style={{ position: "absolute", left: 130, top: 170, transform: `translateY(${(1 - ramp(frame, P.airline[0], 0.4)) * 40}px)` }}>
          <ChatWindow width={1060} height={700}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 44, fontWeight: 800, color: colors.subtext, marginTop: -10 }}>
              <Plane /> Airline help chat
            </div>
            <ChatBubble from="me" o={pop(frame, T.grandmother - 0.6)} fontSize={48}>
              My grandmother just died. Is there a funeral discount?
            </ChatBubble>
            <ChatBubble from="ai" o={frame >= sec(T.claim - 0.6) ? 1 : 0} fontSize={48}>
              <StreamText text="Yes! Buy your ticket now, and claim the discount later, within 90 days." frame={frame} from={sec(T.claim - 0.6)} to={sec(T.later)} />
            </ChatBubble>
          </ChatWindow>
        </div>
        <div style={{ position: "absolute", left: 1150, top: 300, width: 600, borderRadius: 24, backgroundColor: PAPER, color: colors.ink, padding: "34px 40px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", transform: `rotate(3deg) translateX(${(1 - ramp(frame, T.website - 0.2, 0.4)) * 400}px)`, opacity: ramp(frame, T.website - 0.2, 0.3) }}>
          <div style={{ fontSize: 40, fontWeight: 800, opacity: 0.55, marginBottom: 18 }}>Airline website</div>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.2 }}>
            Funeral discounts <span style={{ color: RED }}>can't</span> be claimed after you travel.
          </div>
        </div>
        <div style={{ position: "absolute", left: 1060, top: 420, fontSize: 150, fontWeight: 800, color: colors.coral, opacity: Math.min(1, pop(frame, T.opposite)), transform: `scale(${Math.min(1.1, pop(frame, T.opposite))})` }}>≠</div>
        {/* tribunal: the airline pays */}
        <div style={{ position: "absolute", left: 1180, top: 700, display: "flex", alignItems: "center", gap: 30 }}>
          <svg width={150} height={140} viewBox="0 0 400 360" aria-hidden style={{ opacity: ramp(frame, T.tribunal - 0.4, 0.2) }}>
            <g transform={`rotate(${-45 + 45 * ramp(frame, T.tribunal - 0.1, 0.15)} 200 320)`}>
              <rect x={110} y={40} width={180} height={90} rx={20} fill={colors.periwinkle} />
              <rect x={186} y={124} width={28} height={196} rx={14} fill={colors.periwinkle} />
            </g>
            <rect x={60} y={326} width={280} height={28} rx={10} fill={colors.lineStrong} />
          </svg>
          <Stamp p={pop(frame, T.pay - 0.1)} color={colors.yellow} size={110} rotate={-8}>PAY</Stamp>
        </div>
      </AbsoluteFill>

      {/* 5 · Answer 2 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: f(P.answer) }}>
        <div style={{ marginRight: 200 }}>
          <AnswerCard n={2} p={pop(frame, T.answer)} text={<>It <span style={{ color: colors.yellow }}>never wobbles</span>, even when it's wrong.</>} />
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
