import React from "react";
import {
  Audio,
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CloudWindow } from "../shorts/dots/kit";
import { C, HEAD, MONO } from "../shorts/dots/theme";
import { Sfx, type SfxName } from "../shorts/dots/common";
import { TheDot } from "../dots/kit";

export type Word = [string, number, number];
export type SceneProps = { words: Word[] };
export const progress = (t: number, at: number, duration = 0.45) =>
  1 - (1 - Math.min(1, Math.max(0, (t - at) / duration))) ** 3;
export function useBeat(words: Word[]) {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  function cue(token: string) {
    const found = words.find(([word]) =>
      word
        .toLowerCase()
        .split(/[—–]/)
        .some((part) => part.replace(/^[^a-z]+|[^a-z]+$/g, "") === token),
    );
    if (!found) throw new Error("Missing narration cue " + token);
    return found[1];
  }
  return { t, cue };
}

export const Foley = ({ at, name }: { at: number; name: SfxName }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} layout="none">
      <Sfx name={name} at={0} />
    </Sequence>
  );
};
export const Voice = ({ file }: { file: string | null }) =>
  file ? <Audio src={staticFile(file)} /> : null;

export const box = (
  left: number,
  top: number,
  width?: number,
): React.CSSProperties => ({ position: "absolute", left, top, width });
export const panel: React.CSSProperties = {
  background: "#fffdf6",
  border: "3px solid #141414",
  boxShadow: "8px 8px 0 #141414",
  boxSizing: "border-box",
};
export const mono: React.CSSProperties = {
  fontFamily: MONO,
  fontWeight: 650,
  letterSpacing: 1.5,
};
export const Stage: React.FC<
  React.PropsWithChildren<{ title: string; label: string; short?: boolean }>
> = ({ title, label, short, children }) => (
  <AbsoluteFill
    style={{
      background: C.paper,
      color: C.ink,
      fontFamily: HEAD,
      overflow: "hidden",
    }}
  >
    <svg
      width="100%"
      height="100%"
      style={{ position: "absolute", opacity: 0.055 }}
    >
      <filter id="fibres">
        <feTurbulence
          type="fractalNoise"
          baseFrequency=".8"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#fibres)" />
    </svg>
    <div
      style={{
        ...box(short ? 76 : 98, short ? 172 : 65, short ? 820 : 1720),
        borderTop: "5px solid",
        paddingTop: 18,
        ...mono,
        fontSize: short ? 25 : 26,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>UNJARGONED</span>
      <span>{label}</span>
    </div>
    <div
      style={{
        ...box(short ? 74 : 94, short ? 265 : 135, short ? 835 : 1720),
        fontSize: short ? 92 : 106,
        fontWeight: 700,
        letterSpacing: -5,
        lineHeight: 1.02,
      }}
    >
      {title}
    </div>
    {children}
  </AbsoluteFill>
);

export const Stamp = ({ text, size = 34 }: { text: string; size?: number }) => (
  <span
    style={{
      display: "inline-block",
      background: C.red,
      color: C.ink,
      border: "3px solid",
      padding: "5px 15px",
      ...mono,
      fontSize: size,
      lineHeight: 1.15,
      fontWeight: 800,
      transform: "rotate(-2deg)",
    }}
  >
    {text}
  </span>
);

export const Prompt = ({
  x,
  y,
  w,
  h,
  name,
  t,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  t: number;
}) => (
  <CloudWindow rect={{ cx: x, cy: y, w, h }} url={name}>
    <div
      style={{
        background: "#fffdf6",
        height: "100%",
        padding: "35px 22px",
        boxSizing: "border-box",
        fontSize: w > 600 ? 55 : 33,
        letterSpacing: -1,
      }}
    >
      Ask anything<span style={{ color: C.red }}>...</span>
      <span style={{ opacity: Math.floor(t * 2) % 2 }}>▏</span>
    </div>
  </CloudWindow>
);

export const Actor = ({
  x,
  y,
  t,
  glasses = false,
  worried = false,
  r = 62,
}: {
  x: number;
  y: number;
  t: number;
  glasses?: boolean;
  worried?: boolean;
  r?: number;
}) => {
  const cy = y + 3 * Math.sin(t * 3);
  return (
    <>
      <TheDot
        x={x}
        y={cy}
        r={r}
        look={Math.sin(t * 0.6)}
        mood={worried ? "worried" : "happy"}
      />
      {glasses && (
        <svg
          style={box(x - r * 0.81, cy - r * 0.44)}
          width={r * 1.65}
          height={r * 0.65}
          viewBox="0 0 104 40"
          fill="none"
          stroke={C.ink}
          strokeWidth="5"
        >
          <rect x="4" y="4" width="40" height="30" rx="9" />
          <rect x="60" y="4" width="40" height="30" rx="9" />
          <path d="M44 15 Q52 9 60 15" />
        </svg>
      )}
    </>
  );
};

export const taxonomy = [
  ["ChatGPT", "Everyday & voice"],
  ["Claude", "Writing & code"],
  ["Gemini", "Video, files & Google"],
  ["Thinking / open", "Hard logic & local"],
];
export const IndexCard = ({
  n,
  short = false,
}: {
  n: number;
  short?: boolean;
}) => (
  <div
    style={{
      ...panel,
      padding: short ? "12px 32px" : "33px 24px",
      height: "100%",
      borderTop: "12px solid #141414",
    }}
  >
    <div style={{ ...mono, fontSize: short ? 23 : 20, color: "#545149" }}>
      FIELD CARD / 0{n + 1}
    </div>
    <div
      style={{
        fontSize: short ? 57 : 44,
        letterSpacing: -2,
        fontWeight: 700,
        margin: short ? "4px 0 6px" : "12px 0 24px",
      }}
    >
      {taxonomy[n][0]}
    </div>
    <Stamp
      size={short ? 32 : 21}
      text={(short && n === 2
        ? "Video & huge files"
        : taxonomy[n][1]
      ).toUpperCase()}
    />
  </div>
);
