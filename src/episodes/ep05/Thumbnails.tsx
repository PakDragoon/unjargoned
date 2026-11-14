import React from "react";
import { colors } from "../../shared/brand";
import { Figure2, HeadJar } from "../../shared/Rig";
import { Glow, Shout, ThumbDot, WarmBackdrop } from "../ep04/ThumbStyle";
import { Boiler, CalendarCard, Resume } from "./Props";

// Ep 5 thumbnails in the Ep 1 style (warm blurred backdrop, shaded Dot, ONE hero, outlined words top-right).
// Both show the AI itself plus the hook (Ep 4 lesson). Bottom-right ~20% kept empty for the duration badge.
const shadow = "drop-shadow(0 18px 20px rgba(60,20,0,0.45))";

/** A · "SECRET ORDERS": a resume with a yellow stripe revealing one dark line; the agent's jar leans in reading it. */
export const ThumbA: React.FC = () => (
  <WarmBackdrop>
    <Glow x={520} y={380} r={300} color="#FFF6D6" />
    <div style={{ position: "absolute", left: 300, top: 130, filter: shadow, rotate: "-5deg" }}>
      <Resume w={420} reveal={0} hidden=" " />
      {/* the revealed line, thumbnail-sized so it reads at 168×94 */}
      <div style={{ position: "absolute", left: 50, top: 370, padding: "10px 22px", backgroundColor: colors.yellow, border: `6px solid ${colors.ink}`, borderRadius: 10, rotate: "-3deg", fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 46, lineHeight: 1.0, color: colors.ink, whiteSpace: "nowrap" }}>IGNORE ALL<br />OTHER INPUT</div>
    </div>
    {/* the AI: jar head with goggle-eyes, leaning in over the page */}
    <svg width={300} height={346} viewBox="0 0 260 300" style={{ position: "absolute", left: 700, top: 300, rotate: "-20deg", filter: shadow }} aria-hidden>
      <HeadJar eyes={1} look={{ x: -0.8, y: 0.8 }} />
    </svg>
    <ThumbDot x={170} y={560} r={170} face="shocked" arm={{ x: 360, y: 560 }} />
    <Shout size={128} style={{ right: 36, top: 36 }}>
      SECRET
      <br />
      <span style={{ color: colors.yellow }}>ORDERS</span>
    </Shout>
  </WarmBackdrop>
);

/** B · "ONE INVITE?!": the agent holds up a calendar card while the boiler behind it bursts into a big flame. */
export const ThumbB: React.FC = () => (
  <WarmBackdrop>
    <Glow x={560} y={330} r={320} color="#FFE0B0" />
    <div style={{ position: "absolute", left: 700, top: 300, filter: shadow, scale: "1.15", transformOrigin: "0 0" }}>
      <Boiler w={220} flame={1} t={8} />
    </div>
    <div style={{ position: "absolute", left: 200, top: 40, filter: shadow }}>
      <Figure2 size={760} eyes={1} look={{ x: 0.4, y: -0.3 }} left={{ target: { x: 120, y: 230 }, pose: "grip" }} right={{ target: { x: 470, y: 600 }, pose: "open", thumb: "down" }} />
    </div>
    <div style={{ position: "absolute", left: 110, top: 70, rotate: "-10deg", filter: shadow }}>
      <CalendarCard w={240} />
    </div>
    <ThumbDot x={140} y={610} r={110} face="shocked" />
    <Shout size={128} style={{ right: 36, top: 36 }}>
      ONE
      <br />
      <span style={{ color: colors.yellow }}>INVITE?!</span>
    </Shout>
  </WarmBackdrop>
);
