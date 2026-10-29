import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors, fontFamily, SHORT } from "../../shared/brand";
import { LogoMark, Wordmark } from "../../shared/Logo";
import captions from "./captions.json";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";

// Vertical Shorts cut from a scene: hook title, the 16:9 scene in the middle (66%, sides trimmed slightly), big burned-in
// captions (current word in yellow), logo. Voice comes from the scene; the music bed sits under it.

type Word = { word: string; start: number; end: number };
const WORDS = captions as Record<string, Word[]>;

type ShortSpec = {
  scene: React.FC;
  sceneId: string;
  from: number; // seconds into the scene
  to: number;
  hook: React.ReactNode;
  musicFrom: number; // seconds into the track
};

export const SHORTS: Record<string, ShortSpec> = {
  Short1: {
    scene: S4, sceneId: "S4", from: 1.45, to: 59.2, musicFrom: 23,
    hook: <>Why can't ChatGPT count the <span style={{ color: colors.yellow }}>r's in strawberry?</span></>,
  },
  Short2: {
    scene: S5, sceneId: "S5", from: 1.4, to: 45.3, musicFrom: 30,
    hook: <>Why does ChatGPT give <span style={{ color: colors.yellow }}>different answers?</span></>,
  },
};

export const shortFrames = (id: string) => Math.ceil((SHORTS[id].to - SHORTS[id].from) * SHORT.fps);

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

const Captions: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const t = spec.from + frame / SHORT.fps;
  const words = WORDS[spec.sceneId].filter((w) => w.start >= spec.from - 0.05);
  // The cut starts mid-sentence ("…how many r's"): capitalise the first word.
  const first = words[0] ? { ...words[0], word: words[0].word[0].toUpperCase() + words[0].word.slice(1) } : null;
  const groups = chunks(first ? [first, ...words.slice(1)] : words);
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
  const spec = SHORTS[id];
  const Scene = spec.scene;
  const startFrame = Math.round(spec.from * SHORT.fps);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 200, textAlign: "center", fontSize: 88, fontWeight: 800, lineHeight: 1.1 }}>
        {spec.hook}
      </div>
      <div style={{ position: "absolute", left: 0, top: 560, width: 1080, height: 713, overflow: "hidden", borderTop: `4px solid ${colors.line}`, borderBottom: `4px solid ${colors.line}` }}>
        <div style={{ position: "absolute", left: -93.5, top: 0, width: 1920, height: 1080, transform: "scale(0.66)", transformOrigin: "top left" }}>
          <Sequence from={-startFrame}>
            <Scene />
          </Sequence>
        </div>
      </div>
      <Captions spec={spec} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <LogoMark size={86} />
        <Wordmark fontSize={58} />
      </div>
      <Audio src={staticFile("episodes/ep02/music/fade.mp3")} startFrom={Math.round(spec.musicFrom * SHORT.fps)} volume={0.2} />
    </AbsoluteFill>
  );
};

export const Short1: React.FC = () => <ShortFrame id="Short1" />;
export const Short2: React.FC = () => <ShortFrame id="Short2" />;
