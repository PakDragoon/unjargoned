import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S4");

// Times (s) from the S4 word timings in captions.json. Re-voice S4 → re-check these.
const T = {
  rs: 1.82, three: 4.1, chatgpt: 6.66, two: 8.46, why: 10.12, saying: 11.9, lie: 14.9,
  letters: 16.6, chunks: 18.68, tokens: 19.38, message: 20.6, chopped: 21.44, piece: 23.42,
  strawberry: 25.6, likeThis: 27.58, imagine: 28.9, emoji: 30.68, ask: 32.48, picture: 34.24,
  problem: 38.62, typed: 41.26, onlyChunks: 43.04, soIt: 45.86, guesses: 47.64, two2: 48.88, newer: 51.04,
  spelling: 53.44, count: 54.2, still: 55.62, trip: 58.22,
};

// o200k_base (GPT-4o and later), verified offline with js-tiktoken.
const GROUPS = [
  { letters: "st", id: 302 },
  { letters: "raw", id: 1618 },
  { letters: "berry", id: 19772 },
];
const R_INDEXES = [2, 7, 8]; // the r's in s-t-r-a-w-b-e-r-r-y
const MESSAGE = [
  { t: "How", id: 5299 }, { t: " many", id: 1991 }, { t: " r", id: 428 }, { t: "'s", id: 885 },
  { t: " are", id: 553 }, { t: " in", id: 306 }, { t: ' "', id: 392 }, { t: "st", id: 302 },
  { t: "raw", id: 1618 }, { t: "berry", id: 19772 }, { t: '"?', id: 69029 },
];

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.two), mood: "surprised" },
  { at: sec(T.why), mood: "neutral" },
  { at: sec(14.5), mood: "smug" },
  { at: sec(T.letters), mood: "neutral" },
  { at: sec(T.chunks), mood: "curious" },
  { at: sec(T.likeThis), mood: "aha" },
  { at: sec(T.emoji), mood: "curious" },
  { at: sec(T.picture), mood: "confused" },
  { at: sec(T.problem), mood: "neutral" },
  { at: sec(T.guesses), mood: "curious" },
  { at: sec(T.two2), mood: "deadpan" },
  { at: sec(T.newer), mood: "neutral" },
  { at: sec(T.count + 0.4), mood: "happy" },
  { at: sec(57.6), mood: "worried" },
];

const Label: React.FC<{ o: number; children: React.ReactNode; color?: string }> = ({ o, children, color = colors.subtext }) => (
  <div
    style={{
      position: "absolute", top: 230, left: 120, right: 120, textAlign: "center",
      fontSize: 64, fontWeight: 600, color, opacity: o, transform: `translateY(${(1 - o) * 16}px)`,
    }}
  >
    {children}
  </div>
);

/**
 * "strawberry" as letters that can light up, split into token tiles,
 * explode into single-letter boxes, and show token numbers.
 */
const Word: React.FC<{
  split: number; explode: number; dim: number; lit: number[]; numbers: number; counts: number[]; size?: number;
}> = ({ split, explode, dim, lit, numbers, counts, size = 170 }) => {
  let idx = 0;
  const tile = split * (1 - explode);
  return (
    <div style={{ display: "flex", alignItems: "center", filter: dim > 0 ? `blur(${dim * 5}px)` : undefined }}>
      {GROUPS.map((g) => (
        <div
          key={g.id}
          style={{
            position: "relative", display: "flex", margin: `0 ${split * 18}px`,
            padding: `${tile * 14}px ${tile * 40}px`, borderRadius: 36,
            boxShadow: `inset 0 0 0 8px ${interpolateColors(tile, [0, 1], ["rgba(255,201,60,0)", colors.yellow])}`,
            backgroundColor: interpolateColors(tile, [0, 1], ["rgba(28,31,39,0)", colors.panel]),
          }}
        >
          {[...g.letters].map((ch) => {
            const i = idx++;
            const color = interpolateColors(lit[i] ?? 0, [0, 1], [colors.white, colors.yellow]);
            return (
              <div
                key={i}
                style={{
                  position: "relative", margin: `0 ${explode * 8}px`, padding: `0 ${explode * 14}px`, borderRadius: 22,
                  backgroundColor: interpolateColors(explode, [0, 1], ["rgba(28,31,39,0)", colors.panel]),
                  fontSize: size, fontWeight: 800, lineHeight: 1.15, letterSpacing: -2,
                  color: interpolateColors(dim, [0, 1], [color, colors.lineStrong]),
                }}
              >
                {ch}
                {counts[i] ? (
                  <div
                    style={{
                      position: "absolute", top: -78, left: 0, right: 0, textAlign: "center",
                      fontSize: 64, fontWeight: 800, color: colors.mint, opacity: counts[i],
                      transform: `scale(${0.6 + 0.4 * counts[i]})`,
                    }}
                  >
                    {R_INDEXES.indexOf(i) + 1}
                  </div>
                ) : null}
              </div>
            );
          })}
          <div
            style={{
              position: "absolute", top: "100%", left: -100, right: -100, marginTop: 28, textAlign: "center",
              fontSize: 72, fontWeight: 800, color: colors.periwinkle, opacity: numbers,
              transform: `translateY(${(1 - numbers) * -20}px)`,
            }}
          >
            {g.id}
          </div>
        </div>
      ))}
    </div>
  );
};

/** The viewer's message, chopped into its real tokens, each flipping to its number. */
const Message: React.FC<{ split: number; frame: number }> = ({ split, frame }) => (
  <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "flex-start" }}>
    {MESSAGE.map((m, i) => {
      const n = ramp(frame, T.piece + i * 0.08, 0.25);
      return (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: `0 ${split * 7}px` }}>
          <div
            style={{
              whiteSpace: "pre", fontSize: 60, fontWeight: 600, padding: `8px ${split * 16}px`, borderRadius: 18,
              border: `5px solid ${interpolateColors(split, [0, 1], ["rgba(255,201,60,0)", colors.yellow])}`,
              backgroundColor: interpolateColors(split, [0, 1], ["rgba(28,31,39,0)", colors.panel]),
            }}
          >
            {split > 0.5 ? m.t.trim() : m.t}
          </div>
          <div style={{ marginTop: 16, fontSize: 44, fontWeight: 800, color: colors.periwinkle, opacity: n }}>{m.id}</div>
        </div>
      );
    })}
  </div>
);

/** Drawn strawberry (no platform emoji). */
const Strawberry: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 200 220" aria-hidden>
    <path d="M100 212 C 42 192 10 124 28 80 C 46 44 154 44 172 80 C 190 124 158 192 100 212 Z" fill="#F0545C" />
    {[[70, 100], [110, 92], [145, 110], [55, 140], [95, 130], [135, 145], [80, 170], [115, 175], [100, 200 - 40]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={4.5} ry={7} fill={colors.yellow} transform={`rotate(${(x - 100) / 3} ${x} ${y})`} />
    ))}
    <path d="M100 66 L62 44 L84 58 L56 70 L92 70 L100 92 L108 70 L144 70 L116 58 L138 44 Z" fill={colors.mint} />
    <rect x={96} y={22} width={8} height={36} rx={4} fill={colors.mint} />
  </svg>
);

const Bubble: React.FC<{ o: number; align: "left" | "right"; children: React.ReactNode }> = ({ o, align, children }) => (
  <div
    style={{
      alignSelf: align === "right" ? "flex-end" : "flex-start", opacity: Math.min(1, o),
      transform: `scale(${0.7 + 0.3 * o})`, transformOrigin: align === "right" ? "bottom right" : "bottom left",
      backgroundColor: colors.panel, border: `4px solid ${colors.line}`, padding: "24px 40px",
      borderRadius: align === "right" ? "44px 44px 12px 44px" : "44px 44px 44px 12px", fontSize: 64, fontWeight: 600,
    }}
  >
    {children}
  </div>
);

const S4Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Word states across the scene.
  const wordIn = Math.min(ramp(frame, 0.3, 0.4), 1 - ramp(frame, T.message - 0.2, 0.4));
  const wordBack = during(frame, T.strawberry + 0.4, T.imagine, 0.4);
  const wordEnd = ramp(frame, T.problem, 0.4);
  const wordO = Math.max(wordIn, wordBack, wordEnd);
  const lit = [...Array(10)].map((_, i) =>
    R_INDEXES.includes(i) ? Math.min(ramp(frame, T.rs + R_INDEXES.indexOf(i) * 0.15, 0.25), 1 - ramp(frame, T.why, 0.4)) +
      (frame > sec(T.newer) ? ramp(frame, T.count + R_INDEXES.indexOf(i) * 0.3, 0.2) * (1 - ramp(frame, T.still, 0.3)) : 0) : 0,
  );
  const counts = [...Array(10)].map((_, i) =>
    R_INDEXES.includes(i) ? pop(frame, T.count + R_INDEXES.indexOf(i) * 0.3) * (1 - ramp(frame, T.still, 0.3)) : 0,
  );
  const split = frame < sec(T.problem)
    ? ramp(frame, T.likeThis, 0.35) * (1 - ramp(frame, T.imagine, 0.3))
    : 1;
  const explode = ramp(frame, T.spelling, 0.45) * (1 - ramp(frame, T.still, 0.35));
  const dim = ramp(frame, T.letters, 0.6);
  const numbers = frame < sec(T.problem) ? during(frame, T.likeThis + 0.5, T.imagine, 0.3) : 0;
  const wordY = interpolate(ramp(frame, T.why, 0.5), [0, 1], [0, 30]) - 90 * during(frame, T.guesses, T.newer, 0.4);

  // "Three" badge and the wrong answer.
  const threeO = pop(frame, T.three) * (1 - ramp(frame, T.why, 0.3));
  const answer = pop(frame, T.chatgpt) * (1 - ramp(frame, T.why, 0.3));
  const typing = frame < sec(T.two);

  // Message → tokens.
  const msgO = during(frame, T.message, T.strawberry, 0.35);
  const msgSplit = ramp(frame, T.chopped, 0.35);

  // Text-a-strawberry analogy.
  const thread = during(frame, T.emoji - 0.4, T.problem, 0.35);
  const b1 = pop(frame, T.emoji);
  const b2 = pop(frame, T.ask);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={1} />

      <Label o={during(frame, T.saying, T.letters, 0.3)}>
        it guesses the next{" "}
        <span style={{ position: "relative", color: colors.white }}>
          word
          <span
            style={{
              position: "absolute", left: -6, top: "54%", height: 10, borderRadius: 5, backgroundColor: colors.coral,
              width: `${ramp(frame, T.lie, 0.3) * 108}%`,
            }}
          />
        </span>
      </Label>
      <Label o={during(frame, T.chunks, T.strawberry, 0.3)}>
        it sees chunks = <span style={{ color: colors.yellow, opacity: ramp(frame, T.tokens, 0.3) }}>tokens</span>
      </Label>
      <Label o={during(frame, T.likeThis + 0.6, T.imagine, 0.3)}>3 tokens, 0 letters</Label>
      <Label o={during(frame, T.picture, T.problem, 0.3)} color={colors.coral}>no letters in the picture</Label>
      <Label o={during(frame, T.typed, T.guesses, 0.3)}>
        even typed, it gets <span style={{ color: colors.yellow }}>chunks</span>, not letters
      </Label>
      <Label o={during(frame, T.guesses, T.newer, 0.3)}>
        so it <span style={{ color: colors.yellow }}>guesses</span>…{" "}
        <span style={{ color: colors.coral, opacity: ramp(frame, T.two2 + 0.3, 0.3) }}>"two" sounds right</span>
      </Label>

      {/* How many r's? It guesses, and "2" wins */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center",
          opacity: during(frame, T.guesses, T.newer, 0.3),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 34px", borderRadius: 28, backgroundColor: colors.panel, border: `4px solid ${colors.line}` }}>
          {([["2", 0.58, colors.coral], ["3", 0.31, colors.lineStrong], ["1", 0.07, colors.lineStrong]] as const).map(([w, pr, c], i) => (
            <div
              key={w}
              style={{
                display: "flex", alignItems: "center", gap: 24, padding: "4px 14px", borderRadius: 18,
                boxShadow: i === 0 && frame >= sec(T.two2) ? `0 0 0 6px ${colors.coral}` : "none",
              }}
            >
              <div style={{ width: 70, fontSize: 60, fontWeight: 800, color: i === 0 ? colors.coral : colors.subtext }}>{w}</div>
              <div style={{ width: 420 * pr * ramp(frame, T.guesses + 0.1 + i * 0.1, 0.4), height: 28, borderRadius: 14, backgroundColor: c }} />
            </div>
          ))}
        </div>
      </div>

      {/* The word itself */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: wordO, transform: `translateY(${wordY}px)` }}>
        <Word split={split} explode={explode} dim={frame < sec(T.strawberry) ? dim : 0} lit={lit} numbers={numbers} counts={counts} />
      </AbsoluteFill>

      {/* "Three." and ChatGPT's confident "two" */}
      <div
        style={{
          position: "absolute", left: 560, top: 680, fontSize: 72, fontWeight: 800, color: colors.mint,
          opacity: threeO, transform: `scale(${threeO})`,
        }}
      >
        3 r's
      </div>
      <div style={{ position: "absolute", right: 240, top: 660, display: "flex", flexDirection: "column" }}>
        <Bubble o={answer} align="left">
          {typing ? (
            <span style={{ color: colors.subtext, letterSpacing: 8 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 6 + i)) }}>●</span>
              ))}
            </span>
          ) : (
            <span>
              It has <span style={{ color: colors.coral, fontWeight: 800 }}>2</span> r's.
            </span>
          )}
        </Bubble>
      </div>

      {/* Your message → chunks → numbers */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: msgO }}>
        <Message split={msgSplit} frame={frame} />
      </AbsoluteFill>

      {/* Texting a strawberry */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: thread }}>
        <div style={{ width: 560, display: "flex", flexDirection: "column", gap: 28, marginTop: 60 }}>
          <Bubble o={b1} align="right">
            <Strawberry size={230} />
          </Bubble>
          <Bubble o={b2} align="right">how many r's?</Bubble>
        </div>
      </AbsoluteFill>

      <Dot x={1560} y={880} track={TRACK} look={{ x: 0, y: -0.15 }} seed="s4" />
    </AbsoluteFill>
  );
};

// Scene S4 — the strawberry problem (tokens). Edit only this file for S4 changes.
export const S4: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S4Content />
    </LineWipeIn>
  </SceneShell>
);
