import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "./brand";
import { Dot } from "./Dot";
import { LogoMark, Wordmark } from "./Logo";

/**
 * End screen layout (as Ep 1): a 16:9 slot on the left for YouTube's "Watch next" video element
 * and a round slot on the right for the Subscribe element. Place those elements over these slots.
 */
export const EndScreen: React.FC<{ o: number; prompt?: React.ReactNode; dot?: boolean }> = ({ o, prompt, dot = true }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <div style={{ position: "absolute", left: 120, top: 72, display: "flex", alignItems: "center", gap: 18 }}>
      <LogoMark size={84} />
      <Wordmark fontSize={56} />
    </div>
    <div style={{ position: "absolute", left: 120, top: 260, fontSize: 44, fontWeight: 800, color: colors.subtext, letterSpacing: 2 }}>
      WATCH NEXT
    </div>
    <div
      style={{
        position: "absolute", left: 120, top: 330, width: 880, height: 495, borderRadius: 28,
        backgroundColor: colors.panel, border: `4px solid ${colors.line}`, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div style={{ opacity: 0.25 }}>
        <LogoMark size={260} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 1220, top: 380, width: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div
        style={{
          width: 300, height: 300, borderRadius: 150, backgroundColor: colors.panel, border: `6px solid ${colors.yellow}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <LogoMark size={220} />
      </div>
      <div style={{ fontSize: 52, fontWeight: 800 }}>Subscribe</div>
    </div>
    {prompt ? (
      <div style={{ position: "absolute", left: 120, top: 880, width: 1000, fontSize: 44, fontWeight: 600, color: colors.subtext }}>{prompt}</div>
    ) : null}
    {dot ? <Dot x={1560} y={900} mood="happy" seed="end" /> : null}
  </AbsoluteFill>
);
