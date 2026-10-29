import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily, SHORT } from "../../shared/brand";
import { LogoMark, Wordmark } from "../../shared/Logo";
import captions from "./captions.json";
import shorts from "./shorts.json";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";

// Vertical Shorts cut from scenes (spec in shorts.json): hook title, the 16:9 scene in the middle
// (66%, sides trimmed slightly), big burned-in captions (current word in yellow), logo.
// Render muted; tools/shorts.py adds the matching audio cut from the episode mix (voice, music, SFX).

type Word = { word: string; start: number; end: number };
type Clip = { scene: string; from: number; to: number };
type Spec = { hook: string; hookHighlight: string; clips: Clip[] };

const WORDS = captions as Record<string, Word[]>;
const SPECS = shorts as unknown as Record<string, Spec>;
const SCENES: Record<string, React.FC> = { S1, S2, S4, S5 };

const clipFrames = (c: Clip) => Math.ceil((c.to - c.from) * SHORT.fps);
export const shortFrames = (id: string) => SPECS[id].clips.reduce((n, c) => n + clipFrames(c), 0);

/** Words grouped into short caption chunks (≤3 words, break after punctuation). */
const chunks = (words: Word[]): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!…:]$/.test(w.word)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{ clip: Clip; first: boolean }> = ({ clip, first }) => {
  const frame = useCurrentFrame();
  const t = clip.from + frame / SHORT.fps;
  const words = WORDS[clip.scene].filter((w) => w.start >= clip.from - 0.05 && w.start < clip.to);
  // A cut that starts mid-sentence ("…how many r's"): capitalise its first word.
  const lead = first && words[0] ? [{ ...words[0], word: words[0].word[0].toUpperCase() + words[0].word.slice(1) }] : words.slice(0, 1);
  const groups = chunks([...lead, ...words.slice(1)]);
  const idx = groups.findIndex((g, i) => t >= g[0].start - 0.05 && (i === groups.length - 1 || t < groups[i + 1][0].start - 0.05));
  if (idx < 0) return null;
  const g = groups[idx];
  if (t > g[g.length - 1].end + 0.8) return null;
  const pop = interpolate(t - g[0].start, [0, 0.12], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute", left: 60, right: 60, top: 1350, textAlign: "center", fontSize: 104, fontWeight: 800,
        lineHeight: 1.1, transform: `scale(${pop})`,
      }}
    >
      {g.map((w, i) => (
        <span key={i} style={{ color: t >= w.start && t < w.end + 0.15 ? colors.yellow : colors.white }}>
          {w.word}
          {i < g.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

const ShortFrame: React.FC<{ id: string }> = ({ id }) => {
  const spec = SPECS[id];
  let at = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 200, textAlign: "center", fontSize: 88, fontWeight: 800, lineHeight: 1.1 }}>
        {spec.hook}
        <span style={{ color: colors.yellow }}>{spec.hookHighlight}</span>
      </div>
      {spec.clips.map((c, i) => {
        const from = at;
        at += clipFrames(c);
        const Scene = SCENES[c.scene];
        return (
          <Sequence key={i} from={from} durationInFrames={clipFrames(c)}>
            <div style={{ position: "absolute", left: 0, top: 560, width: 1080, height: 713, overflow: "hidden", borderTop: `4px solid ${colors.line}`, borderBottom: `4px solid ${colors.line}` }}>
              <div style={{ position: "absolute", left: -93.5, top: 0, width: 1920, height: 1080, transform: "scale(0.66)", transformOrigin: "top left" }}>
                <Sequence from={-Math.round(c.from * SHORT.fps)}>
                  <Scene />
                </Sequence>
              </div>
            </div>
            <Captions clip={c} first={i === 0} />
          </Sequence>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <LogoMark size={86} />
        <Wordmark fontSize={58} />
      </div>
    </AbsoluteFill>
  );
};

export const Short1: React.FC = () => <ShortFrame id="Short1" />;
export const Short2: React.FC = () => <ShortFrame id="Short2" />;
export const Short3: React.FC = () => <ShortFrame id="Short3" />;
