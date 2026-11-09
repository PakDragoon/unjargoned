import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../../shared/brand";
import { EggCarton } from "./Props";
import { Figure2, SHOULDER_L, SHOULDER_R, handFrame } from "./Rig";
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

/* ── v2 thumbnails (Nov 2026, after a 2% CTR start): the AI and the $31 story in ONE picture ── */

/** A receipt card with the coral total; `byAI` adds an "Ordered by: AI" line. Drawn at 1× in a ~300 px wide box. */
const BigReceipt: React.FC<{ w: number; byAI?: boolean; total?: string }> = ({ w, byAI = false, total = "$31.43" }) => (
  <div style={{ width: w, padding: `${w * 0.1}px ${w * 0.09}px ${w * 0.16}px`, boxSizing: "border-box", backgroundColor: "#F7F2E6", clipPath: "polygon(0 0, 100% 0, 100% 95%, 90% 100%, 80% 95%, 70% 100%, 60% 95%, 50% 100%, 40% 95%, 30% 100%, 20% 95%, 10% 100%, 0 95%)", fontFamily: inter, color: colors.ink }}>
    {byAI ? (
      <div style={{ fontWeight: 900, fontSize: w * 0.1, lineHeight: 1.05 }}>Ordered by:<br /><span style={{ backgroundColor: "#8EA7FF", padding: `0 ${w * 0.02}px`, borderRadius: w * 0.02 }}>AI agent</span></div>
    ) : (
      [64, 48].map((x, i) => <div key={i} style={{ height: w * 0.04, width: `${x}%`, borderRadius: 6, backgroundColor: "rgba(20,22,28,0.22)", marginBottom: w * 0.05 }} />)
    )}
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: w * 0.06, fontWeight: 900, fontSize: w * 0.085 }}><span>EGGS ×12</span></div>
    <div style={{ borderTop: `${w * 0.018}px dashed rgba(20,22,28,0.4)`, marginTop: w * 0.04, paddingTop: w * 0.03, fontWeight: 900, fontSize: w * 0.09, letterSpacing: 2 }}>TOTAL</div>
    <div style={{ fontWeight: 900, fontSize: w * 0.26, lineHeight: 1, color: "#E0533B", letterSpacing: -w * 0.008 }}>{total}</div>
  </div>
);

/** C · "IT PAID?!": the agent (pink brain, goggles) holds the egg carton up high like a trophy, the $31.43 receipt
 *  dangling from it; shocked Dot bottom-left. The carton is placed from the rig (on the raised fist). */
const FIGC = { size: 640 };
const RAISE_R = { x: 560, y: 250 };
export const ThumbC: React.FC = () => {
  const k = FIGC.size / 900;
  const figLeft = 270 - 300 * k;
  const figTop = 60;
  const fist = handFrame(SHOULDER_R, RAISE_R, "natural", 62, 140, 130, 300).at;
  const fx = figLeft + fist.x * k;
  const fy = figTop + fist.y * k;
  return (
    <WarmBackdrop>
      <Glow x={430} y={300} r={300} color="#FFF3C4" />
      {/* the receipt hangs from the carton's bottom edge, right of the hand; the carton sits in the raised fist
          (both drawn behind the figure so the glove visibly grips the carton) */}
      <div style={{ position: "absolute", left: fx + 10, top: fy - 6, transform: "rotate(7deg)", transformOrigin: "30% 0", filter: outline }}>
        <BigReceipt w={230} />
      </div>
      <div style={{ position: "absolute", left: fx - 120, top: fy - 150, transform: "rotate(-6deg)", filter: outline }}>
        <EggCarton w={260} />
      </div>
      <div style={{ position: "absolute", left: figLeft, top: figTop, filter: "drop-shadow(0 18px 20px rgba(60,20,0,0.45))" }}>
        <Figure2
          size={FIGC.size}
          eyes={1}
          look={{ x: 0.5, y: -0.6 }}
          left={{ target: { x: 176, y: 598 }, pose: "relaxed", thumb: "up" }}
          right={{ target: RAISE_R, pose: "grip", thumb: "up" }}
        />
      </div>
      <ThumbDot x={110} y={620} r={105} face="shocked" />
      <Shout size={150} style={{ right: 40, top: 40 }}>
        IT
        <br />
        <span style={{ color: colors.yellow }}>PAID?!</span>
      </Shout>
    </WarmBackdrop>
  );
};

/** D · "AI DID THIS?!": shocked Dot holds up a giant receipt that says "Ordered by: AI agent" and $31.43. */
export const ThumbD: React.FC = () => (
  <WarmBackdrop>
    <Glow x={560} y={400} r={280} color="#FFF6D6" />
    <div style={{ position: "absolute", left: 410, top: 150, transform: "rotate(-5deg)", filter: outline }}>
      <BigReceipt w={330} byAI />
    </div>
    <ThumbDot x={190} y={560} r={200} face="shocked" arm={{ x: 430, y: 470 }} />
    <Shout size={128} style={{ right: 36, top: 40 }}>
      AI DID
      <br />
      <span style={{ color: colors.yellow }}>THIS?!</span>
    </Shout>
  </WarmBackdrop>
);
