import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../../shared/brand";
import { Glow, Shout, ThumbDot, WarmBackdrop } from "./ThumbStyle";

// Ep 3 thumbnails in the Ep 1 style (warm blurred backdrop, shaded Dot holding ONE hero, outlined words top-right).
// Bottom-right ~20% kept empty for YouTube's duration badge. Check at 168×94.
const { fontFamily: inter } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });
const outline = `drop-shadow(5px 0 0 ${colors.ink}) drop-shadow(-5px 0 0 ${colors.ink}) drop-shadow(0 5px 0 ${colors.ink}) drop-shadow(0 -5px 0 ${colors.ink}) drop-shadow(0 18px 20px rgba(60,20,0,0.45))`;

/** A · "CONFIDENTLY WRONG": smug Dot holds up an exam answer it's sure of, with a huge red cross on it. */
export const ThumbA: React.FC = () => (
  <WarmBackdrop>
    <Glow x={580} y={500} r={240} color="#FFF6D6" />
    <div style={{ position: "absolute", left: 360, top: 330, transform: "rotate(-8deg)", filter: outline }}>
      <div style={{ position: "relative", width: 420, height: 340, borderRadius: 26, backgroundColor: "#F3EBDD", padding: "34px 36px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: inter, fontWeight: 900, fontSize: 44, color: colors.ink, letterSpacing: 2 }}>EXAM</div>
        <div style={{ marginTop: 26, height: 150, borderRadius: 18, border: `7px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: inter, fontWeight: 900, fontSize: 108, color: "#3B5BDB", fontStyle: "italic" }}>
          1952!
        </div>
        <svg style={{ position: "absolute", left: -30, top: -20 }} width={480} height={380} viewBox="0 0 480 380" aria-hidden>
          <path d="M 70 90 L 410 300 M 410 90 L 70 300" stroke="#E0533B" strokeWidth={26} strokeLinecap="round" opacity={0.92} />
        </svg>
      </div>
    </div>
    <ThumbDot x={170} y={560} r={210} face="smug" arm={{ x: 410, y: 655 }} />
    <Shout size={116} style={{ right: 40, top: 36 }}>
      CONFIDENTLY
      <br />
      <span style={{ color: colors.coral }}>WRONG</span>
    </Shout>
  </WarmBackdrop>
);

/** B · "IT'S BLUFFING": smug Dot holds a giant yellow speech bubble with a bold "!". */
export const ThumbB: React.FC = () => (
  <WarmBackdrop>
    <Glow x={590} y={480} r={240} color="#FFF3C4" />
    <svg style={{ position: "absolute", left: 380, top: 330, filter: outline }} width={400} height={345} viewBox="0 0 440 380" aria-hidden>
      <path d="M 60 20 H 380 A 50 50 0 0 1 430 70 V 250 A 50 50 0 0 1 380 300 H 170 L 80 370 L 100 300 H 60 A 50 50 0 0 1 10 250 V 70 A 50 50 0 0 1 60 20 Z" fill={colors.yellow} />
      <rect x={196} y={70} width={52} height={150} rx={26} fill={colors.ink} />
      <circle cx={222} cy={260} r={28} fill={colors.ink} />
    </svg>
    <ThumbDot x={170} y={560} r={210} face="smug" arm={{ x: 430, y: 620 }} />
    <Shout size={140} style={{ right: 40, top: 40 }}>
      IT'S
      <br />
      <span style={{ color: colors.yellow }}>BLUFFING</span>
    </Shout>
  </WarmBackdrop>
);
