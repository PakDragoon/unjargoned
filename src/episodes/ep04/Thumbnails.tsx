import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../../shared/brand";
import { EggCarton } from "./Props";
import { Figure2 } from "./Rig";
import { Glow, Shout, ThumbDot, WarmBackdrop } from "./ThumbStyle";

// Ep 4 thumbnails in the Ep 1 style (warm blurred backdrop, shaded Dot, ONE hero, outlined words top-right).
// Title: "Chatbots Talk. AI Agents Do Things." — the thumbnail adds the story, not the title's words.
// Bottom-right ~20% kept empty for YouTube's duration badge. Check at 168×94.
const { fontFamily: inter } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });
const outline = `drop-shadow(5px 0 0 ${colors.ink}) drop-shadow(-5px 0 0 ${colors.ink}) drop-shadow(0 5px 0 ${colors.ink}) drop-shadow(0 -5px 0 ${colors.ink}) drop-shadow(0 18px 20px rgba(60,20,0,0.45))`;

/** A · "IT BOUGHT EGGS?!": shocked Dot holds the egg carton; the long receipt hangs off it with a huge $31.43. */
export const ThumbA: React.FC = () => (
  <WarmBackdrop>
    <Glow x={600} y={420} r={260} color="#FFF6D6" />
    {/* the receipt, hanging from under the carton */}
    <div style={{ position: "absolute", left: 450, top: 360, transform: "rotate(7deg)", transformOrigin: "50% 0", filter: outline }}>
      <div style={{ width: 330, padding: "70px 28px 40px", boxSizing: "border-box", backgroundColor: "#F7F2E6", clipPath: "polygon(0 0, 100% 0, 100% 95%, 90% 100%, 80% 95%, 70% 100%, 60% 95%, 50% 100%, 40% 95%, 30% 100%, 20% 95%, 10% 100%, 0 95%)" }}>
        {[64, 48, 56].map((w, i) => <div key={i} style={{ height: 12, width: `${w}%`, borderRadius: 6, backgroundColor: "rgba(20,22,28,0.22)", marginBottom: 14 }} />)}
        <div style={{ borderTop: "6px dashed rgba(20,22,28,0.4)", marginTop: 8, paddingTop: 10, fontFamily: inter, fontWeight: 900, fontSize: 30, color: colors.ink, letterSpacing: 2 }}>TOTAL</div>
        <div style={{ fontFamily: inter, fontWeight: 900, fontSize: 84, lineHeight: 1, color: "#E0533B", letterSpacing: -3 }}>$31.43</div>
      </div>
    </div>
    {/* the carton (the hero), held up by Dot */}
    <div style={{ position: "absolute", left: 410, top: 240, transform: "rotate(-6deg)", filter: outline }}>
      <EggCarton w={390} />
    </div>
    <ThumbDot x={180} y={560} r={200} face="shocked" arm={{ x: 430, y: 420 }} />
    <Shout size={118} style={{ right: 40, top: 34 }}>
      IT BOUGHT
      <br />
      <span style={{ color: colors.yellow }}>EGGS?!</span>
    </Shout>
  </WarmBackdrop>
);

/** B · "IT GOT HANDS": the agent (pink brain in the jar, goggles) throws up its blue-gloved hands; shocked Dot beside it. */
export const ThumbB: React.FC = () => (
  <WarmBackdrop>
    <Glow x={430} y={300} r={280} color="#FFF3C4" />
    <div style={{ position: "absolute", left: 425 - 333, top: 14, filter: "drop-shadow(0 18px 20px rgba(60,20,0,0.45))" }}>
      <Figure2
        size={1000}
        eyes={1}
        look={{ x: 0.2, y: -0.2 }}
        left={{ target: { x: 112, y: 236 }, pose: "open", thumb: "up" }}
        right={{ target: { x: 488, y: 236 }, pose: "open", thumb: "down" }}
      />
    </div>
    <ThumbDot x={120} y={600} r={125} face="shocked" />
    <Shout size={142} style={{ right: 36, top: 40 }}>
      IT GOT
      <br />
      <span style={{ color: colors.yellow }}>HANDS</span>
    </Shout>
  </WarmBackdrop>
);
