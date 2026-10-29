import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../../shared/brand";
import { Dot } from "../../shared/Dot";
import { Strawberry } from "./scenes/S4";

// Thumbnails (1280×720). House rules: 3–4 words, one hero, bottom-right 20% left empty for the
// duration badge, Inter Black for the words. Check at 168×94 (see out/thumbs/check.png).
const { fontFamily: inter } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });

const Words: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({ children, size, style }) => (
  <div style={{ fontFamily: inter, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color: colors.white, ...style }}>
    {children}
  </div>
);

/** A · the strawberry problem: one hero, a wrong "2". */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ink }}>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 55%, rgba(255,201,60,0.18), rgba(20,22,28,0) 55%)" }} />
    <div style={{ position: "absolute", left: 60, top: 120, transform: "rotate(-8deg)" }}>
      <Strawberry size={440} />
    </div>
    <div
      style={{
        position: "absolute", left: 380, top: 70, padding: "10px 38px", borderRadius: "48px 48px 48px 12px",
        backgroundColor: colors.coral, color: colors.ink, fontFamily: inter, fontWeight: 900, fontSize: 150, lineHeight: 1,
        transform: "rotate(6deg)", boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
      }}
    >
      2
    </div>
    <Words size={150} style={{ position: "absolute", left: 590, top: 130, width: 680 }}>
      HOW MANY
      <br />
      <span style={{ color: colors.yellow }}>R'S?</span>
    </Words>
    <Dot x={455} y={625} size={85} mood="surprised" blinks={false} seed="tA" tailLength={1.1} />
  </AbsoluteFill>
);

/** B · it's just guessing: the reveal of the whole episode. */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ink }}>
    <div
      style={{
        position: "absolute", left: 60, top: 70, width: 760, padding: "30px 40px", borderRadius: 40, backgroundColor: colors.panel,
        border: `6px solid ${colors.line}`, fontFamily: inter, fontWeight: 800, fontSize: 64, color: colors.white, lineHeight: 1.15,
      }}
    >
      Once upon a{" "}
      <span style={{ display: "inline-block", width: 190, borderBottom: `10px solid ${colors.yellow}`, color: colors.yellow }}>time?</span>
    </div>
    <Words size={150} style={{ position: "absolute", left: 60, top: 330, width: 900 }}>
      IT'S JUST
      <br />
      <span style={{ color: colors.yellow }}>GUESSING</span>
    </Words>
    <Dot x={960} y={210} size={150} mood="smug" blinks={false} seed="tB" tailLength={1.0} />
  </AbsoluteFill>
);

/** C · what ChatGPT actually sees. */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ink }}>
    <Words size={110} style={{ position: "absolute", left: 60, top: 60 }}>
      AI SEES <span style={{ color: colors.yellow }}>THIS</span>
    </Words>
    <div style={{ position: "absolute", left: 60, top: 250, display: "flex", gap: 22 }}>
      {["st", "raw", "berry"].map((t) => (
        <div
          key={t}
          style={{
            padding: "6px 30px", borderRadius: 30, backgroundColor: colors.panel, border: `10px solid ${colors.yellow}`,
            fontFamily: inter, fontWeight: 900, fontSize: 150, color: colors.white, lineHeight: 1.1, letterSpacing: -4,
          }}
        >
          {t}
        </div>
      ))}
    </div>
    <Dot x={230} y={590} size={100} mood="panic" blinks={false} seed="tC" tailLength={1.2} />
  </AbsoluteFill>
);
