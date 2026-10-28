import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S3");

// Times (s) from the S3 word timings in captions.json. Re-voice S3 → re-check these.
const T = {
  knew: 2.4, hundred: 4.7, learned: 6.4, giant: 9.0, worksheet: 10.8, cat: 13.6, mountain: 17.3,
  books: 18.6, websites: 19.5, articles: 19.8, guessed: 22.3, checked: 23.9, adjusted: 26.2, again: 28.2,
  billions: 29.4, facts: 31.3, factsX: 32.5, blanks: 34.0, called: 36.0, model: 38.1, assistant: 39.5,
  underneath: 43.3, player: 45.5,
};

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.hundred), mood: "happy" },
  { at: sec(T.giant), mood: "surprised" },
  { at: sec(T.worksheet), mood: "neutral" },
  { at: sec(T.checked), mood: "confused" },
  { at: sec(T.again + 0.4), mood: "happy" },
  { at: sec(T.billions), mood: "aha" },
  { at: sec(T.facts), mood: "neutral" },
  { at: sec(T.blanks), mood: "happy" },
  { at: sec(T.model), mood: "aha" },
  { at: sec(T.underneath), mood: "smug" },
];

const PAPER = "#F3EBDD";

/** The school worksheet: the scene's single hero. */
const Worksheet: React.FC<{ fill: string; fillO: number; mark: "tick" | "cross" | null; markO: number; sentenceO: number }> = ({
  fill, fillO, mark, markO, sentenceO,
}) => (
  <div
    style={{
      width: 1080, height: 560, borderRadius: 24, backgroundColor: PAPER, color: colors.ink, padding: "56px 72px",
      boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 56, transform: "rotate(-1.5deg)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
    }}
  >
    <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: 1 }}>Fill in the blank</div>
    <div style={{ fontSize: 66, fontWeight: 700, display: "flex", alignItems: "baseline", gap: 18, whiteSpace: "nowrap", opacity: sentenceO }}>
      The cat sat on the
      <span style={{ position: "relative", display: "inline-block", width: 190, textAlign: "center" }}>
        <span style={{ color: "#3B5BDB", opacity: fillO }}>{fill}</span>
        <span style={{ position: "absolute", left: 0, right: 0, bottom: -8, height: 8, borderRadius: 4, backgroundColor: colors.ink }} />
      </span>
      .
      <span style={{ width: 90, display: "inline-flex", justifyContent: "center", opacity: markO, transform: `scale(${0.6 + 0.4 * markO})` }}>
        {mark === "tick" ? (
          <svg width={84} height={84} viewBox="0 0 84 84" aria-hidden>
            <path d="M 12 44 L 34 66 L 74 18" fill="none" stroke="#1F9D74" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : mark === "cross" ? (
          <svg width={84} height={84} viewBox="0 0 84 84" aria-hidden>
            <path d="M 16 16 L 68 68 M 68 16 L 16 68" fill="none" stroke="#E0533B" strokeWidth={14} strokeLinecap="round" />
          </svg>
        ) : null}
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 26, opacity: 0.25 }}>
      {[680, 560].map((w) => (
        <div key={w} style={{ width: w, height: 14, borderRadius: 7, backgroundColor: colors.ink }} />
      ))}
    </div>
  </div>
);

/** A little gauge whose needle is "the adjustment". */
const Dial: React.FC<{ angle: number; o: number }> = ({ angle, o }) => (
  <svg width={220} height={140} viewBox="0 0 220 140" style={{ opacity: o }} aria-hidden>
    <path d="M 20 120 A 90 90 0 0 1 200 120" fill="none" stroke={colors.lineStrong} strokeWidth={16} strokeLinecap="round" />
    <line x1={110} y1={120} x2={110 + Math.cos(((angle - 90) * Math.PI) / 180) * 80} y2={120 + Math.sin(((angle - 90) * Math.PI) / 180) * 80} stroke={colors.yellow} strokeWidth={12} strokeLinecap="round" />
    <circle cx={110} cy={120} r={14} fill={colors.yellow} />
  </svg>
);

const S3Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Heard it a hundred times → a giant pile.
  const titleO = during(frame, 0.2, T.knew, 0.3);
  const gridO = during(frame, T.knew + 0.2, T.worksheet, 0.4);
  const zoom = interpolate(ramp(frame, T.giant - 0.6, 1.4), [0, 1], [1, 0.22]);
  const cols = 44;
  const rows = 26;

  // The worksheet loop.
  const sheetO = during(frame, T.worksheet, T.facts, 0.4) + during(frame, T.blanks, durationInFrames / 30 + 1, 0.4);
  const fast = frame >= sec(T.billions) && frame < sec(T.facts);
  const fastWords = ["mat", "hat", "mat", "sofa", "mat", "mat", "rug", "mat"];
  const step = Math.floor((frame - sec(T.billions)) / 3);
  let fill = "";
  let fillO = 0;
  let mark: "tick" | "cross" | null = null;
  let markO = 0;
  if (fast) {
    fill = fastWords[step % fastWords.length];
    fillO = 1;
    mark = fill === "mat" ? "tick" : "cross";
    markO = 1;
  } else if (frame >= sec(T.blanks)) {
    fill = "mat"; fillO = 1; mark = "tick"; markO = 1;
  } else if (frame >= sec(T.again)) {
    fill = "mat"; fillO = ramp(frame, T.again, 0.2); mark = "tick"; markO = pop(frame, T.again + 0.4);
  } else if (frame >= sec(T.guessed)) {
    fill = "hat"; fillO = ramp(frame, T.guessed, 0.2) * (1 - ramp(frame, T.again - 0.3, 0.2));
    mark = "cross"; markO = Math.min(1, pop(frame, T.checked)) * (1 - ramp(frame, T.again - 0.3, 0.2));
  }
  const needle = fast
    ? -30 + random(`n${step}`) * 60
    : interpolate(ramp(frame, T.adjusted, 0.5), [0, 1], [-40, -22]);
  const dialO = during(frame, T.guessed, T.facts, 0.3);
  const count = interpolate(frame, [sec(T.billions), sec(T.facts - 0.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const counter = Math.floor(Math.pow(count, 3) * 1_000_000_000);
  const pileO = during(frame, T.mountain, T.guessed, 0.4);

  // Not a list of facts.
  const factsO = during(frame, T.facts, T.blanks, 0.3);
  const assist = during(frame, T.assistant, T.underneath + 0.4, 0.4);
  const lift = ramp(frame, T.underneath, 0.6);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={0} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: titleO }}>
        <div style={{ fontSize: 110, fontWeight: 800 }}>
          Guessing from <span style={{ color: colors.yellow }}>what?</span>
        </div>
      </AbsoluteFill>

      {/* "Once upon a time…" heard over and over */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: gridO, overflow: "hidden" }}>
        <div style={{ transform: `scale(${zoom})`, display: "grid", gridTemplateColumns: `repeat(${cols}, 150px)`, gap: 24 }}>
          {[...Array(cols * rows)].map((_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const near = Math.abs(c - cols / 2 + 0.5) < 5 && Math.abs(r - rows / 2 + 0.5) < 3.5;
            const appear = near ? T.knew + 0.4 + random(`c${i}`) * 2.4 : T.giant - 0.6 + random(`c${i}`) * 1.2;
            const o = ramp(frame, appear, 0.15);
            return (
              <div key={i} style={{ width: 150, height: 96, borderRadius: 14, backgroundColor: colors.panel, border: `3px solid ${colors.line}`, opacity: o, padding: 16, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ width: 90, height: 12, borderRadius: 6, backgroundColor: colors.yellow }} />
                <div style={{ width: 110, height: 10, borderRadius: 5, backgroundColor: colors.lineStrong }} />
                <div style={{ width: 70, height: 10, borderRadius: 5, backgroundColor: colors.lineStrong }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontSize: 72, fontWeight: 800,
          opacity: during(frame, T.hundred, T.giant - 0.4, 0.3),
        }}
      >
        "Once upon a <span style={{ color: colors.yellow }}>time</span>" × 100
      </div>

      {/* The worksheet */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: Math.min(1, sheetO) }}>
        <div style={{ position: "relative", transform: `translateX(${-190}px)` }}>
          {/* a pile of text behind it */}
          {[3, 2, 1].map((k) => (
            <div
              key={k}
              style={{
                position: "absolute", inset: 0, borderRadius: 24, backgroundColor: PAPER, opacity: pileO * (0.35 + 0.15 * (3 - k)),
                transform: `translate(${k * 26}px, ${k * -22}px) rotate(${k * 2}deg)`,
              }}
            />
          ))}
          <div style={{ transform: `translateY(${lift * -40}px)` }}>
            <Worksheet fill={fill} fillO={fillO} mark={mark} markO={markO} sentenceO={ramp(frame, T.cat, 0.3)} />
          </div>
          {/* assistant training wraps it in a chat bubble */}
          <div
            style={{
              position: "absolute", inset: -40, borderRadius: 60, border: `10px solid ${colors.periwinkle}`, opacity: assist,
              transform: `translateY(${lift * -120}px)`,
            }}
          />
          <div
            style={{
              position: "absolute", left: -40, bottom: -130, fontSize: 56, fontWeight: 700, color: colors.periwinkle, opacity: assist,
              transform: `translateY(${lift * -120}px)`,
            }}
          >
            "Happy to help!"
          </div>
        </div>
      </AbsoluteFill>

      {/* books, websites, articles */}
      <div style={{ position: "absolute", right: 140, top: 300, display: "flex", flexDirection: "column", gap: 24, opacity: pileO }}>
        {[["books", T.books], ["websites", T.websites], ["articles", T.articles]].map(([w, t]) => {
          const p = pop(frame, t as number);
          return (
            <div key={w} style={{ fontSize: 52, fontWeight: 700, padding: "14px 32px", borderRadius: 999, backgroundColor: colors.panel, border: `4px solid ${colors.line}`, opacity: Math.min(1, p), transform: `scale(${0.7 + 0.3 * Math.min(1, p)})` }}>
              {w}
            </div>
          );
        })}
      </div>

      {/* the adjustment dial and the "billions" counter */}
      <div style={{ position: "absolute", right: 120, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: dialO }}>
        <Dial angle={needle} o={1} />
        <div style={{ fontSize: 44, fontWeight: 600, color: colors.subtext }}>adjust</div>
        <div style={{ marginTop: 30, fontSize: 52, fontWeight: 800, color: colors.yellow, opacity: ramp(frame, T.billions, 0.2), fontVariantNumeric: "tabular-nums" }}>
          {counter.toLocaleString("en-US")}
        </div>
        <div style={{ fontSize: 44, fontWeight: 600, color: colors.subtext, opacity: ramp(frame, T.billions, 0.2) }}>times</div>
      </div>

      {/* Not a list of facts */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: factsO }}>
        <div style={{ position: "relative", width: 460, height: 560, borderRadius: 28, backgroundColor: colors.panel, border: `6px solid ${colors.lineStrong}`, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 4 }}>FACTS</div>
          {[300, 340, 260, 320, 220].map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.subtext }} />
              <div style={{ width: w - 40, height: 16, borderRadius: 8, backgroundColor: colors.lineStrong }} />
            </div>
          ))}
          <svg width={460} height={560} viewBox="0 0 460 560" style={{ position: "absolute", left: -6, top: -6 }} aria-hidden>
            <line x1={40} y1={520} x2={40 + 380 * ramp(frame, T.factsX, 0.3)} y2={520 - 480 * ramp(frame, T.factsX, 0.3)} stroke={colors.coral} strokeWidth={24} strokeLinecap="round" opacity={ramp(frame, T.factsX, 0.05)} />
          </svg>
        </div>
      </AbsoluteFill>

      {/* Named: a language model */}
      <div
        style={{
          position: "absolute", left: 120, right: 400, top: 870, textAlign: "center", fontSize: 72, fontWeight: 800,
          opacity: during(frame, T.called, T.assistant, 0.3),
        }}
      >
        This kind of AI is a <span style={{ color: colors.yellow, opacity: ramp(frame, T.model, 0.3) }}>language model</span>
      </div>
      <div
        style={{
          position: "absolute", left: 120, right: 400, top: 870, textAlign: "center", fontSize: 64, fontWeight: 800,
          opacity: ramp(frame, T.player, 0.3),
        }}
      >
        the world's best <span style={{ color: colors.yellow }}>fill-in-the-blank</span> player
      </div>

      <Dot x={1560} y={900} track={TRACK} seed="s3" look={{ x: 0, y: -0.15 }} />
    </AbsoluteFill>
  );
};

// Scene S3 — guessing from what? Edit only this file for S3 changes.
export const S3: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S3Content />
    </LineWipeIn>
  </SceneShell>
);
