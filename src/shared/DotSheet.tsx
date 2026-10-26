import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fontFamily } from "./brand";
import { Dot, MOODS, Mood } from "./Dot";

/** Model sheet: every Dot mood, plus the tail following a move (onion skin). */
export const DotSheet: React.FC = () => {
  const moods = Object.keys(MOODS) as Mood[];
  const colW = 300;
  const left = (1920 - colW * 6) / 2 + colW / 2;
  // Tail demo: Dot hops along an arc; three frames mid-move, then at rest.
  const path = (f: number) => {
    const t = Math.min(1, Math.max(0, f / 48));
    const e = t * t * (3 - 2 * t);
    return { x: 260 + e * 1300, y: 1010 - Math.sin(e * Math.PI) * 110 };
  };
  const ghosts = [10, 22, 34, 70];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
      <div style={{ position: "absolute", left: 60, top: 36, fontSize: 48, fontWeight: 800 }}>
        Dot · <span style={{ color: colors.yellow }}>12 moods</span>
      </div>
      {moods.map((m, i) => {
        const cx = left + (i % 6) * colW;
        const cy = 230 + Math.floor(i / 6) * 300;
        return (
          <React.Fragment key={m}>
            <Dot x={cx + 40} y={cy} size={80} mood={m} blinks={false} seed={m} tailLength={1.6} />
            <div
              style={{
                position: "absolute",
                left: cx - colW / 2,
                top: cy + 110,
                width: colW,
                textAlign: "center",
                fontSize: 44,
                fontWeight: 600,
                color: colors.subtext,
              }}
            >
              {m}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 60, top: 770, fontSize: 36, color: colors.subtext }}>
        tail follows the move (3 frames mid-hop, then rest)
      </div>
      {ghosts.map((g, i) => (
        <Dot
          key={g}
          path={path}
          frame={g}
          size={60}
          mood={i === ghosts.length - 1 ? "happy" : "aha"}
          blinks={false}
          seed={`g${g}`}
          opacity={i === ghosts.length - 1 ? 1 : 0.35 + i * 0.15}
        />
      ))}
    </AbsoluteFill>
  );
};
