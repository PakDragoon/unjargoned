import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily, SHORT } from "../../shared/brand";
import { LogoMark, Wordmark } from "../../shared/Logo";
import captions from "./captions.json";
import shorts from "./shorts.json";
import { S1 } from "./scenes/S1";
import { S7 } from "./scenes/S7";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";

// Vertical Shorts (1080×1920) cut from scenes (spec in shorts.json): hook title, the scene in a window that follows the
// action (per-clip `cam` keys: centre x + zoom, so the subject stays big on a phone), big burned-in captions (current
// word in yellow), logo. Layout keeps clear of the Shorts UI: captions end above the bottom overlay (~1540) and stay
// left of the right-hand buttons. Render muted at full quality; tools/shorts.py adds the matching audio cut.

type Word = { word: string; start: number; end: number };
type CamKey = [number, number, number]; // [scene seconds, centre x (scene px), zoom]
type Clip = { scene: string; from: number; to: number; cam?: CamKey[]; captions?: boolean };
type Spec = { hook: string; hookHighlight: string; clips: Clip[] };

const WORDS = captions as Record<string, Word[]>;
const SPECS = shorts as unknown as Record<string, Spec>;
const SCENES: Record<string, React.FC> = { S1, S2, S3, S4, S5, S6, S7 };

const WIN_CY = 909; // the scene window's vertical centre
const camAt = (keys: CamKey[] | undefined, t: number) => {
  const k = keys && keys.length ? keys : [[0, 960, 0.85] as CamKey];
  let i = 0;
  while (i < k.length - 1 && t > k[i + 1][0]) i++;
  const [t0, x0, z0] = k[i];
  const [t1, x1, z1] = k[Math.min(i + 1, k.length - 1)];
  const u = t1 > t0 ? Math.max(0, Math.min(1, (t - t0) / (t1 - t0))) : 0;
  const e = u * u * (3 - 2 * u);
  const z = z0 + (z1 - z0) * e;
  const half = 540 / z;
  return { z, x: Math.max(half, Math.min(1920 - half, x0 + (x1 - x0) * e)) };
};

/** The scene, framed by its camera keys; the window's height follows the zoom (16:9 scene height). */
const SceneWindow: React.FC<{ clip: Clip; Scene: React.FC }> = ({ clip, Scene }) => {
  const frame = useCurrentFrame();
  const { x, z } = camAt(clip.cam, clip.from + frame / SHORT.fps);
  const h = 1080 * z;
  return (
    <div style={{ position: "absolute", left: 0, top: WIN_CY - h / 2, width: 1080, height: h, overflow: "hidden", borderTop: `4px solid ${colors.line}`, borderBottom: `4px solid ${colors.line}` }}>
      <div style={{ position: "absolute", left: 540 - x * z, top: 0, width: 1920, height: 1080, transform: `scale(${z})`, transformOrigin: "top left" }}>
        <Sequence from={-Math.round(clip.from * SHORT.fps)}>
          <Scene />
        </Sequence>
      </div>
    </div>
  );
};

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
        position: "absolute", left: 70, right: 150, top: 1405, textAlign: "center", fontSize: 92, fontWeight: 800,
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
      <div style={{ position: "absolute", left: 70, right: 70, top: 190, textAlign: "center", fontSize: 84, fontWeight: 800, lineHeight: 1.1 }}>
        {spec.hook}
        <span style={{ color: colors.yellow }}>{spec.hookHighlight}</span>
      </div>
      {spec.clips.map((c, i) => {
        const from = at;
        at += clipFrames(c);
        const Scene = SCENES[c.scene];
        return (
          <Sequence key={i} from={from} durationInFrames={clipFrames(c)}>
            <SceneWindow clip={c} Scene={Scene} />
            {c.captions === false ? null : <Captions clip={c} first={i === 0} />}
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
export const Short4: React.FC = () => <ShortFrame id="Short4" />;
