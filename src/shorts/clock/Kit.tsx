import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors, fontFamily, SHORT } from "../../shared/brand";
import { LogoMark, Wordmark } from "../../shared/Logo";
import { INK, OUT, PAPER, PAPER_SHADE, SHADOW } from "../../shared/Rig";
import { clamp01, kk, lerp } from "../../episodes/ep05/Common";

// Shared kit for the two clock Shorts (A: the 2024 test, B: ClockBench then vs now). Native 1080×1920, 30 fps.
// One continuous shot per Short; every beat is keyed to the voice's word times (captions.json), with an estimate
// from the script until the voice exists. Layout keeps clear of the Shorts UI: nothing important under y≈130,
// captions at 1405 (ending above the bottom overlay), the lower right (x > 930, y > 1000) left for the buttons.

export const RED = "#D2452F"; // stamp ink: reads on paper and on the dark stage (coral is too pale on paper)
export const W = SHORT.width;
export const H = SHORT.height;
export const FLOOR_Y = 1300;
export const CLOCK = { x: 540, y: 640, r: 330 };

/* ───────────── Timeline (one scene per spoken line) ───────────── */

type Word = { word: string; start: number; end: number };
type VoScene = { id: string; title: string; estSeconds: number; tailSeconds?: number; vo: string };
export type Line = { id: string; start: number; dur: number; frames: number; audioSrc?: string; words: Word[] };

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
const scriptWords = (vo: string) => vo.replace(/\[[^\]]*\]|\{\w+\}/g, " ").split(/\s+/).filter(Boolean);

export const makeTimeline = (vo: { scenes: VoScene[] }, durations: Record<string, number>, captions: Record<string, Word[]>, base: string) => {
  let at = 0;
  const lines: Line[] = vo.scenes.map((s) => {
    const voiced = durations[s.id] !== undefined;
    const dur = voiced ? durations[s.id] : s.estSeconds;
    const frames = Math.ceil((dur + (s.tailSeconds ?? 0.2)) * SHORT.fps);
    // Word times relative to the Short: from Whisper, or spread evenly over the estimate.
    const est = scriptWords(s.vo);
    const words: Word[] = voiced && captions[s.id]
      ? captions[s.id].map((w) => ({ ...w, start: w.start + at, end: w.end + at }))
      : est.map((w, i) => ({ word: w, start: at + (dur * i) / est.length, end: at + (dur * (i + 1)) / est.length }));
    const line: Line = { id: s.id, start: at, dur, frames, audioSrc: voiced ? `${base}/audio/${s.id}.wav` : undefined, words };
    at += frames / SHORT.fps;
    return line;
  });
  const L = (id: string) => {
    const l = lines.find((x) => x.id === id);
    if (!l) throw new Error(`Unknown line ${id}`);
    return l;
  };
  /** Start (s) of the n-th occurrence of `word` in line `id` (as written in the script, e.g. "swapped"). */
  const w = (id: string, word: string, n = 1): number => {
    const hits = L(id).words.filter((x) => norm(x.word) === norm(word));
    if (!hits[n - 1]) throw new Error(`"${word}" #${n} not in ${id}`);
    return hits[n - 1].start;
  };
  const total = lines.reduce((s, l) => s + l.frames, 0);
  return { lines, L, w, total };
};

/* ───────────── The stage (vertical) ───────────── */

export const VStage: React.FC<{ spotX?: number }> = ({ spotX = 540 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
    <defs>
      <radialGradient id="vspot" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFE7B0" stopOpacity={0.16} />
        <stop offset="100%" stopColor="#FFE7B0" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="vcone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE7B0" stopOpacity={0.08} />
        <stop offset="100%" stopColor="#FFE7B0" stopOpacity={0} />
      </linearGradient>
      <filter id="vblur"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect width={W} height={H} fill={colors.ink} />
    <g filter="url(#vblur)" opacity={0.5}>
      <rect x={-60} y={220} width={200} height={300} rx={30} fill="#232838" transform="rotate(-6 40 370)" />
      <rect x={930} y={1020} width={220} height={180} rx={30} fill="#232838" transform="rotate(5 1040 1110)" />
    </g>
    <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="#1B1F2A" />
    <line x1={0} y1={FLOOR_Y} x2={W} y2={FLOOR_Y} stroke="#262B3A" strokeWidth={4} />
    <path d={`M ${spotX - 220} 0 L ${spotX + 220} 0 L ${spotX + 470} ${FLOOR_Y + 100} L ${spotX - 470} ${FLOOR_Y + 100} Z`} fill="url(#vcone)" />
    <ellipse cx={spotX} cy={FLOOR_Y + 50} rx={480} ry={90} fill="url(#vspot)" />
  </svg>
);

/* ───────────── The clock ───────────── */

export type HandSpec = {
  /** degrees clockwise from 12 */ angle: number;
  /** length as a fraction of the radius */ len: number;
  /** width as a fraction of the radius */ width: number;
  fill?: string;
  /** 0→1 yellow halo ("the thing to watch") */ glow?: number;
};
/** Hour/minute angles for a time, e.g. 5:45 → hour 172.5°, minute 270°. */
export const anglesFor = (h: number, m: number) => ({ hour: ((h % 12) + m / 60) * 30, minute: m * 6 });
export const HOUR_HAND = { len: 0.5, width: 0.085 };
export const MINUTE_HAND = { len: 0.8, width: 0.05 };
export const lerpHand = (a: HandSpec, b: HandSpec, k: number): HandSpec => ({
  angle: lerp(a.angle, b.angle, k), len: lerp(a.len, b.len, k), width: lerp(a.width, b.width, k),
  fill: k < 0.5 ? a.fill : b.fill, glow: lerp(a.glow ?? 0, b.glow ?? 0, k),
});

/** Tip of a hand in the clock's own coordinates (centre 0,0). */
export const handTip = (r: number, h: Pick<HandSpec, "angle" | "len">, extra = 0) => {
  const a = ((h.angle - 90) * Math.PI) / 180;
  return { x: Math.cos(a) * r * (h.len + extra), y: Math.sin(a) * r * (h.len + extra) };
};

const Hand: React.FC<{ r: number; h: HandSpec }> = ({ r, h }) => {
  const len = r * h.len;
  const wd = Math.max(6, r * h.width);
  const tail = r * 0.12;
  const d = `M ${-wd / 2} ${tail} L ${-wd / 2} ${-len + wd / 2} Q 0 ${-len - wd * 0.4} ${wd / 2} ${-len + wd / 2} L ${wd / 2} ${tail} Z`;
  return (
    <g transform={`rotate(${h.angle})`}>
      {h.glow ? <path d={d} fill="none" stroke={colors.yellow} strokeOpacity={0.55 * h.glow} strokeWidth={wd * 0.9 + 18} strokeLinejoin="round" /> : null}
      <path d={d} transform="translate(6 8)" fill={SHADOW} />
      <path d={d} fill={h.fill ?? INK} stroke={INK} strokeWidth={Math.max(3, OUT * r / 330)} strokeLinejoin="round" />
    </g>
  );
};

/** Cut-paper analog clock: paper face, ink rim, offset paper shadow, 12 numerals, minute ticks, two hands. */
export const Clock: React.FC<{ r: number; hour: HandSpec; minute: HandSpec; numerals?: boolean; dimNumerals?: number; children?: React.ReactNode }> = ({ r, hour, minute, numerals = true, children }) => {
  const s = r / 330;
  return (
    <svg width={r * 2 + 60} height={r * 2 + 60} viewBox={`${-r - 30} ${-r - 30} ${r * 2 + 60} ${r * 2 + 60}`} style={{ overflow: "visible", display: "block" }} aria-hidden>
      <circle cx={10 * s} cy={14 * s} r={r} fill={SHADOW} />
      <circle r={r} fill={PAPER} stroke={INK} strokeWidth={OUT * 1.6 * s} />
      <circle r={r * 0.9} fill="none" stroke={PAPER_SHADE} strokeWidth={4 * s} />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const a = (i * 6 * Math.PI) / 180;
        const r0 = r * (big ? 0.84 : 0.875);
        return (
          <line key={i} x1={Math.sin(a) * r0} y1={-Math.cos(a) * r0} x2={Math.sin(a) * r * 0.9} y2={-Math.cos(a) * r * 0.9}
            stroke={INK} strokeWidth={(big ? 7 : 3) * s} strokeLinecap="round" />
        );
      })}
      {numerals
        ? Array.from({ length: 12 }, (_, i) => {
            const n = i + 1;
            const a = (n * 30 * Math.PI) / 180;
            return (
              <text key={n} x={Math.sin(a) * r * 0.67} y={-Math.cos(a) * r * 0.67} textAnchor="middle" dominantBaseline="central"
                fontFamily={fontFamily} fontWeight={800} fontSize={r * 0.2} fill={INK}>
                {n}
              </text>
            );
          })
        : null}
      {children}
      <Hand r={r} h={hour} />
      <Hand r={r} h={minute} />
      <circle r={r * 0.055} fill={INK} />
      <circle r={r * 0.022} fill={PAPER} />
    </svg>
  );
};

/** A clock at a fixed time with the house hand sizes. */
export const ClockAt: React.FC<{ r: number; h: number; m: number }> = ({ r, h, m }) => {
  const a = anglesFor(h, m);
  return <Clock r={r} hour={{ angle: a.hour, ...HOUR_HAND }} minute={{ angle: a.minute, ...MINUTE_HAND }} />;
};

/* ───────────── Stamps, chips, badges ───────────── */

/** The AI's answer as a red rubber stamp: small "AI said:" over a big time and a cross. `t` = seconds since it landed. */
export const AnswerStamp: React.FC<{ time: string; t: number; size?: number }> = ({ time, t, size = 1 }) => {
  const land = clamp01(t / 0.18);
  const settle = t < 0 ? 0 : Math.exp(-t * 5) * Math.cos(t * 22);
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center", padding: `${10 * size}px ${34 * size}px ${4 * size}px`,
      border: `${11 * size}px solid ${RED}`, borderRadius: 26 * size, color: RED, fontFamily, fontWeight: 800, lineHeight: 1,
      rotate: `${-9 + 4 * settle}deg`, scale: `${1 + 0.9 * (1 - land) + 0.04 * settle}`, opacity: land,
      backgroundColor: "rgba(239,230,210,0.82)", boxShadow: `6px 8px 0 ${SHADOW}`,
    }}>
      <span style={{ fontSize: 46 * size, letterSpacing: 1 }}>AI said:</span>
      <span style={{ fontSize: 150 * size, letterSpacing: -3, display: "flex", alignItems: "center", gap: 18 * size }}>
        {time}
        <Cross size={86 * size} />
      </span>
    </div>
  );
};

export const Cross: React.FC<{ size: number; color?: string }> = ({ size, color = RED }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden>
    <path d="M -34 -34 L 34 34 M 34 -34 L -34 34" stroke={color} strokeWidth={20} strokeLinecap="round" />
  </svg>
);
export const Tick: React.FC<{ size: number; color?: string }> = ({ size, color = colors.mint }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden>
    <path d="M -36 2 L -10 28 L 38 -28" fill="none" stroke={color} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Round badge with a tick or cross (paper disc, ink rim) for card corners. */
export const Badge: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 76 }) => (
  <div style={{ width: size, height: size, borderRadius: size, backgroundColor: ok ? colors.mint : colors.coral, border: `${Math.max(4, size * 0.07)}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `4px 6px 0 ${SHADOW}` }}>
    {ok ? <Tick size={size * 0.62} color={INK} /> : <Cross size={size * 0.55} color={INK} />}
  </div>
);

/** A time written on a small paper card (an AI's answer, or the real time). */
export const TimeCard: React.FC<{ text: string; tone: "wrong" | "right" | "plain"; w?: number; glow?: number }> = ({ text, tone, w = 150, glow = 0 }) => (
  <div style={{
    width: w, height: w * 0.7, borderRadius: 18, backgroundColor: PAPER, border: `${OUT}px solid ${INK}`,
    boxShadow: `5px 7px 0 ${SHADOW}${glow ? `, 0 0 0 ${8 * glow}px rgba(255,201,60,0.55)` : ""}`,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 800, fontSize: w * 0.33,
    color: tone === "wrong" ? RED : tone === "right" ? "#1E8C66" : INK, letterSpacing: -1,
  }}>
    {text}
  </div>
);

/** A role tag that sits on a hand ("HOUR" / "MINUTES"). */
export const Tag: React.FC<{ text: string; tone: "yellow" | "red" }> = ({ text, tone }) => (
  <div style={{
    padding: "8px 22px", borderRadius: 999, fontFamily, fontWeight: 800, fontSize: 40, letterSpacing: 1,
    backgroundColor: tone === "yellow" ? colors.yellow : RED, color: tone === "yellow" ? INK : colors.white,
    border: `5px solid ${INK}`, boxShadow: `4px 6px 0 ${SHADOW}`, whiteSpace: "nowrap",
  }}>
    {text}
  </div>
);

/** Screen pill ("2024 test"). */
export const TopPill: React.FC<{ o?: number; children: React.ReactNode }> = ({ o = 1, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", opacity: o }}>
    <div style={{ padding: "12px 34px", borderRadius: 999, backgroundColor: colors.panel, border: `3px solid ${colors.lineStrong}`, fontSize: 44, fontWeight: 700, color: colors.subtext }}>
      {children}
    </div>
  </div>
);

/** Absolutely placed child, centred on (x, y). */
export const At: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number; z?: number; children: React.ReactNode }> = ({ x, y, s = 1, rot = 0, o = 1, z, children }) => (
  <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: `${s}`, rotate: `${rot}deg`, opacity: o, zIndex: z }}>{children}</div>
);

/** Springy 0→1 pop (seconds). */
export const popAt = (t: number, t0: number) => {
  if (t < t0) return 0;
  const d = t - t0;
  return 1 - Math.exp(-d * 8) * Math.cos(d * 16);
};

/* ───────────── Captions + frame ───────────── */

const SHOWN: [RegExp, string][] = [
  [/^nine-thirty/i, "9:30"],
];

const chunks = (words: Word[]): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!…:]["”]?$/.test(w.word)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

/** Big burned-in captions, ≤3 words, the spoken word in yellow (Ep 5 Shorts style). */
export const Captions: React.FC<{ lines: Line[]; t: number }> = ({ lines, t }) => {
  const groups = lines.flatMap((l) => chunks(l.words));
  const idx = groups.findIndex((g, i) => t >= g[0].start - 0.05 && (i === groups.length - 1 || t < groups[i + 1][0].start - 0.05));
  if (idx < 0) return null;
  const g = groups[idx];
  if (t > g[g.length - 1].end + 0.8) return null;
  const pop = interpolate(t - g[0].start, [0, 0.12], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = (s: string) => SHOWN.reduce((acc, [re, to]) => acc.replace(re, to), s);
  return (
    <div style={{ position: "absolute", left: 70, right: 150, top: 1405, textAlign: "center", fontSize: 88, fontWeight: 800, lineHeight: 1.1, transform: `scale(${pop})`, textShadow: `0 6px 0 ${colors.ink}` }}>
      {g.map((w, i) => (
        <span key={i} style={{ color: t >= w.start && t < w.end + 0.15 ? colors.yellow : colors.white }}>
          {shown(w.word)}
          {i < g.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

/** The Short's frame: stage, the voice line by line, the scene (a function of t in seconds), captions, logo. */
export const ShortFrame: React.FC<{ lines: Line[]; spotX?: number; children: (t: number) => React.ReactNode }> = ({ lines, spotX, children }) => {
  const frame = useCurrentFrame();
  const t = frame / SHORT.fps;
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white, overflow: "hidden" }}>
      <VStage spotX={spotX} />
      {lines.map((l) => {
        const at = from;
        from += l.frames;
        return l.audioSrc ? (
          <Sequence key={l.id} from={at} durationInFrames={l.frames}>
            <Audio src={staticFile(l.audioSrc)} />
          </Sequence>
        ) : null;
      })}
      {children(t)}
      <Captions lines={lines} t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <LogoMark size={74} />
        <Wordmark fontSize={50} />
      </div>
    </AbsoluteFill>
  );
};
