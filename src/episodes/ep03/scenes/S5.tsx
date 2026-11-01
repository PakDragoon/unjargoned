import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { ExamBook, Magnifier, PAPER, RED, Stamp } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S5");

// Times (s) from the S5 word timings in captions.json. Re-voice S5 → re-check these.
const T = {
  protect: 1.84, habits: 3.28, one: 4.82, sources: 5.72, open: 7.3, lawyer: 8.9, asked: 10.06, gotCases: 11.46, notReal: 13.0,
  link: 14.42, nothing: 15.58, two: 16.7, openBook: 17.76, paste: 19.46, letter: 20.8, webpage: 21.36, rules: 22.1, only: 23.82,
  guesses: 25.32, farLess: 28.4, never: 30.26, three: 31.64, check: 32.22, bluff: 34.22,
  names: 35.46, numbers: 35.76, dates: 36.2, quotes: 36.56,
};

// Left: the checklist builds. Right: one stage per habit.
const P = { h1: [4.72, 16.5], h2: [16.5, 31.43], h3: [31.43, 99] } as const;
const STAGE_X = 700;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.one), mood: "intrigued" },
  { at: sec(T.open + 0.3), mood: "surprised" },
  { at: sec(T.lawyer), mood: "smug" },
  { at: sec(T.notReal), mood: "deadpan" },
  { at: sec(T.two), mood: "curious" },
  { at: sec(T.openBook + 0.2), mood: "happy" },
  { at: sec(T.guesses), mood: "relieved" },
  { at: sec(T.never), mood: "intrigued" },
  { at: sec(T.three), mood: "curious" },
  { at: sec(T.names), mood: "aha" },
];

// Dot: clicks the source link itself, sits by the open book, points at the sliver, carries the magnifier.
const ROUTE = hops([
  { at: 0, x: 1640, y: 880 },
  { at: sec(T.open - 0.2), x: 1060, y: 640 }, // just under the link it clicks
  { at: sec(T.lawyer), x: 1660, y: 880 },
  { at: sec(T.openBook - 0.3), x: 1000, y: 880 }, // under the book
  { at: sec(T.guesses), x: 1660, y: 880 },
  { at: sec(T.never - 0.3), x: 1120, y: 975 }, // under the meter, eyeing the sliver that's left
  { at: sec(T.check), x: 1660, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.3 },
  { at: sec(T.open - 0.2), x: 0.2, y: -0.9 },
  { at: sec(T.lawyer), x: -0.8, y: 0.1 },
  { at: sec(T.openBook - 0.3), x: -0.8, y: -0.4 },
  { at: sec(T.paste), x: 0.6, y: -0.6 },
  { at: sec(T.guesses), x: -0.8, y: 0.2 },
  { at: sec(T.never - 0.3), x: 0.6, y: -0.8 },
  { at: sec(T.check), x: -0.9, y: -0.2 },
]);

const ITEMS = [
  { n: 1, label: "Open the sources", at: T.one },
  { n: 2, label: "Give it the book", at: T.two },
  { n: 3, label: "Check the details", at: T.three },
];

const LinkChip: React.FC<{ text: string; dead?: number; pulse?: number }> = ({ text, dead = 0, pulse = 0 }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: 14, padding: "16px 26px", borderRadius: 18, fontSize: 44, fontWeight: 700,
      backgroundColor: colors.ink, border: `4px solid ${dead > 0.5 ? colors.coral : pulse > 0 ? colors.yellow : colors.line}`,
      color: dead > 0.5 ? colors.coral : colors.periwinkle, textDecoration: "underline", transform: `scale(${1 + 0.05 * pulse})`,
    }}
  >
    <svg width={34} height={34} viewBox="0 0 34 34" aria-hidden>
      <path d="M 14 20 L 20 14 M 11 15 L 7 19 a 5 5 0 0 0 8 8 L 19 23 M 15 11 L 19 7 a 5 5 0 0 1 8 8 L 23 19" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" />
    </svg>
    {text}
  </div>
);

const S5Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);
  const active = frame >= sec(T.three) ? 2 : frame >= sec(T.two) ? 1 : frame >= sec(T.one) ? 0 : -1;

  // Habit 2: the "how much it guesses" meter drops when it has the book.
  const guessLevel = interpolate(frame, [sec(T.guesses), sec(T.farLess)], [1, 0.14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Habit 3: magnifier sweeps the answer, then each risky detail lights up.
  const magT = ramp(frame, T.check, 3.2);
  const magX = STAGE_X + 60 + magT * 820;
  const magY = 440 + Math.sin(magT * Math.PI * 2) * 60;
  const hl = (at: number) => ({
    backgroundColor: frame >= sec(at) ? "rgba(255,201,60,0.35)" : "transparent",
    boxShadow: frame >= sec(at) ? `0 0 0 4px ${colors.yellow}` : "none", borderRadius: 10, padding: "0 6px",
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={2} />

      {/* The checklist */}
      <div style={{ position: "absolute", left: 120, top: 230, display: "flex", flexDirection: "column", gap: 36 }}>
        {ITEMS.map((it, i) => {
          const p = pop(frame, it.at - 0.1);
          const done = frame >= sec((ITEMS[i + 1]?.at ?? 99) - 0.2);
          return (
            <div key={it.n} style={{ display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, p) * (i === active ? 1 : 0.55), transform: `translateX(${(1 - Math.min(1, p)) * -60}px)` }}>
              <div style={{ width: 84, height: 84, borderRadius: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 800, backgroundColor: i === active ? colors.yellow : colors.panel, color: i === active ? colors.ink : colors.subtext, border: `4px solid ${i === active ? colors.yellow : colors.line}` }}>
                {done ? "✔" : it.n}
              </div>
              <div style={{ fontSize: 50, fontWeight: 800, width: 440, lineHeight: 1.1 }}>{it.label}</div>
            </div>
          );
        })}
      </div>

      {/* Habit 1 · Open the sources */}
      <AbsoluteFill style={{ opacity: f(P.h1) }}>
        <div style={{ position: "absolute", left: STAGE_X, top: 210, width: 1000, display: "flex", flexDirection: "column", gap: 26 }}>
          <ChatBubble from="ai" o={pop(frame, T.sources - 0.6)} fontSize={50}>
            Here are cases that support you:
          </ChatBubble>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18, opacity: ramp(frame, T.sources - 0.2, 0.3) }}>
            <LinkChip text="Varga v. Cloudway Air" dead={ramp(frame, T.open + 0.2, 0.2)} />
            <LinkChip text="Holt v. Zephyrline" pulse={during(frame, T.link, T.nothing + 0.6, 0.2)} />
          </div>
        </div>
        {/* the click: page not found */}
        <div style={{ position: "absolute", left: STAGE_X + 640, top: 360, opacity: during(frame, T.open + 0.2, T.lawyer + 0.3, 0.2) }}>
          <div style={{ width: 420, padding: "30px 34px", borderRadius: 24, backgroundColor: colors.panel, border: `5px solid ${colors.coral}`, transform: `scale(${Math.min(1.05, pop(frame, T.open + 0.2))})` }}>
            <div style={{ fontSize: 90, fontWeight: 800, color: colors.coral, lineHeight: 1 }}>404</div>
            <div style={{ fontSize: 46, fontWeight: 700 }}>Page not found</div>
          </div>
        </div>
        {/* the lawyer's filing, again */}
        <div style={{ position: "absolute", left: STAGE_X + 80, top: 640, opacity: during(frame, T.lawyer, P.h1[1], 0.3), transform: `translateY(${(1 - ramp(frame, T.lawyer, 0.4)) * 60}px)` }}>
          <div style={{ position: "relative", width: 640, padding: "28px 36px", borderRadius: 20, backgroundColor: PAPER, color: colors.ink, boxSizing: "border-box", boxShadow: "0 24px 50px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>COURT FILING</div>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 16, borderRadius: 8, width: `${[90, 76, 84][i]}%`, backgroundColor: "rgba(20,22,28,0.25)", marginBottom: 14, opacity: frame >= sec(T.gotCases - 0.3 + i * 0.15) ? 1 : 0 }} />
            ))}
            <div style={{ position: "absolute", right: -30, top: 40 }}>
              <Stamp p={pop(frame, T.notReal)} size={56}>NOT FOUND</Stamp>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Habit 2 · Make it an open-book exam */}
      <AbsoluteFill style={{ opacity: f(P.h2) }}>
        <div style={{ position: "absolute", left: STAGE_X + 200, top: 300 }}>
          <ExamBook s={0.7} open={ramp(frame, T.openBook, 0.6)} />
        </div>
        <div style={{ position: "absolute", left: STAGE_X + 500, top: 200 }}>
          <ChatWindow width={600} height={520}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {[["letter", T.letter], ["web page", T.webpage], ["rules", T.rules]].map(([l, at]) => (
                <div key={l as string} style={{ padding: "12px 22px", borderRadius: 14, backgroundColor: PAPER, color: colors.ink, fontSize: 40, fontWeight: 800, opacity: Math.min(1, pop(frame, (at as number) - 0.1)), transform: `translateX(${(1 - Math.min(1, pop(frame, (at as number) - 0.1))) * -300}px)` }}>
                  <svg width={30} height={36} viewBox="0 0 30 36" aria-hidden style={{ marginRight: 10, verticalAlign: "-4px" }}>
                    <path d="M 3 2 H 20 L 27 9 V 34 H 3 Z" fill="none" stroke={colors.ink} strokeWidth={3.5} strokeLinejoin="round" />
                    <path d="M 8 16 H 22 M 8 22 H 22 M 8 28 H 17" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
                  </svg>
                  {l as string}
                </div>
              ))}
            </div>
            <ChatBubble from="me" o={pop(frame, T.only - 0.4)} fontSize={44}>
              Answer only from these.
            </ChatBubble>
          </ChatWindow>
        </div>
        {/* how much it guesses */}
        <div style={{ position: "absolute", left: STAGE_X + 500, top: 750, width: 600, opacity: ramp(frame, T.guesses - 0.4, 0.3) }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: colors.subtext, marginBottom: 12 }}>guessing</div>
          <div style={{ position: "relative", height: 56, borderRadius: 28, backgroundColor: colors.panel, border: `4px solid ${colors.line}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${guessLevel * 100}%`, borderRadius: 28, backgroundColor: frame >= sec(T.never - 0.2) ? colors.coral : colors.yellow }} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 120, fontSize: 48, fontWeight: 800, opacity: ramp(frame, T.never - 0.2, 0.3) }}>
            far less, <span style={{ color: colors.coral }}>not never</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Habit 3 · Double-check what's easiest to bluff */}
      <AbsoluteFill style={{ opacity: f(P.h3) }}>
        <div style={{ position: "absolute", left: STAGE_X, top: 260, width: 1000 }}>
          <ChatBubble from="ai" o={pop(frame, T.three)} fontSize={58}>
            <span style={hl(T.names)}>Dr. Lena Ortiz</span> said <span style={hl(T.quotes)}>“Trust the data”</span> on <span style={hl(T.dates)}>4 May 2021</span>, citing{" "}
            <span style={hl(T.numbers)}>37</span> studies.
          </ChatBubble>
          <div style={{ display: "flex", gap: 20, marginTop: 50 }}>
            {[["NAMES", T.names], ["NUMBERS", T.numbers], ["DATES", T.dates], ["QUOTES", T.quotes]].map(([l, at]) => (
              <div key={l as string} style={{ padding: "14px 26px", borderRadius: 999, backgroundColor: colors.yellow, color: colors.ink, fontSize: 44, fontWeight: 800, opacity: Math.min(1, pop(frame, at as number)), transform: `scale(${Math.min(1.08, pop(frame, at as number))})` }}>
                {l as string}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: magX - 110, top: magY - 110, opacity: during(frame, T.check - 0.1, 99, 0.3) }}>
          <Magnifier size={220} />
        </div>
      </AbsoluteFill>

      {/* cursor that clicks the first link */}
      <svg style={{ position: "absolute", left: STAGE_X + 300, top: 400, opacity: during(frame, T.open - 0.5, T.open + 0.5, 0.15), transform: `scale(${frame >= sec(T.open) && frame < sec(T.open + 0.15) ? 0.85 : 1})` }} width={60} height={80} viewBox="0 0 60 80" aria-hidden>
        <path d="M 6 4 L 6 62 L 20 50 L 30 74 L 40 70 L 30 46 L 50 46 Z" fill={colors.white} stroke={colors.ink} strokeWidth={4} />
      </svg>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e3s5" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S5 — question three: how do you protect yourself? Edit only this file for S5 changes.
export const S5: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S5Content />
    </LineWipeIn>
  </SceneShell>
);
