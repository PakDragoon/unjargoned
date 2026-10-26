import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fontFamily } from "./brand";
import { Dot, MOODS, Mood } from "./Dot";

/** Model sheet: every Dot mood at Ep 1 size, plus the tail following a move (onion skin). */
export const DotSheet: React.FC = () => {
  const moods = Object.keys(MOODS) as Mood[];
  const colW = 260;
  const left = (1920 - colW * 7) / 2 + colW / 2;
  // Tail demo: Dot hops right→left along an arc; three frames mid-move, then at rest.
  const path = (f: number) => {
    const t = Math.min(1, Math.max(0, f / 48));
    const e = t * t * (3 - 2 * t);
    return { x: 1560 - e * 1250, y: 1000 - Math.sin(e * Math.PI) * 110 };
  };
  const ghosts = [10, 22, 34, 70];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
      <div style={{ position: "absolute", left: 60, top: 36, fontSize: 48, fontWeight: 800 }}>
        Dot · <span style={{ color: colors.yellow }}>{moods.length} moods</span>
        <span style={{ color: colors.subtext, fontWeight: 600, fontSize: 36 }}> (Ep 1 rig, radius 80 px)</span>
      </div>
      {moods.map((m, i) => {
        const cx = left + (i % 7) * colW;
        const cy = 250 + Math.floor(i / 7) * 290;
        return (
          <React.Fragment key={m}>
            <Dot x={cx - 50} y={cy} size={80} mood={m} blinks={false} seed={m} tailLength={0.6} />
            <div
              style={{
                position: "absolute", left: cx - colW / 2, top: cy + 105, width: colW, textAlign: "center",
                fontSize: 44, fontWeight: 600, color: colors.subtext,
              }}
            >
              {m}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 60, top: 790, fontSize: 36, color: colors.subtext }}>
        tail follows the move (3 frames mid-hop, then rest)
      </div>
      {ghosts.map((g, i) => (
        <Dot
          key={g}
          path={path}
          frame={g}
          size={80}
          mood={i === ghosts.length - 1 ? "happy" : "surprised"}
          blinks={false}
          seed={`g${g}`}
          opacity={i === ghosts.length - 1 ? 1 : 0.35 + i * 0.15}
        />
      ))}
    </AbsoluteFill>
  );
};
