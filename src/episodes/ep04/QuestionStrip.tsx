import React from "react";
import { colors } from "../../shared/brand";
import { AllowCard, HandShape } from "./Props";

// Ep 4 progress strip: the three promises from S2 as objects, not words — a hand (what it can do),
// a notebook (does it remember you), and the "Allow?" card (the step it skipped). The "Allow?" card stays an
// empty dashed outline until S5 closes the open loop (`allowFill` 0→1).
const TILE = 112;

const Tile: React.FC<{ on: boolean; done: boolean; children: React.ReactNode }> = ({ on, done, children }) => (
  <div
    style={{
      width: TILE * 1.5, height: TILE, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: on ? "rgba(255,201,60,0.16)" : done ? "rgba(94,230,184,0.12)" : colors.panel,
      border: `5px solid ${on ? colors.yellow : done ? colors.mint : colors.line}`, boxSizing: "border-box",
      transform: `scale(${on ? 1.08 : 1})`,
    }}
  >
    {children}
  </div>
);

export const NotebookIcon: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 48 60" aria-hidden>
    <rect x={2} y={2} width={44} height={56} rx={7} fill={colors.periwinkle} />
    <rect x={2} y={2} width={9} height={56} rx={4} fill="#6F86E0" />
    <rect x={34} y={2} width={6} height={56} fill={colors.yellow} />
  </svg>
);

/** `active`: 0 hand, 1 notebook, 2 allow (−1 none). `answered`: how many are done (mint). `o`: fade/scale-in (S2 shrink). */
export const QuestionStrip: React.FC<{ active: number; answered?: number; allowFill?: number; o?: number }> = ({ active, answered = 0, allowFill = 0, o = 1 }) => (
  <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", gap: 28, justifyContent: "center", opacity: o }}>
    <Tile on={active === 0} done={answered > 0}>
      <svg width={84} height={84} viewBox="-50 -50 100 100" aria-hidden><HandShape cx={0} cy={0} r={36} /></svg>
    </Tile>
    <Tile on={active === 1} done={answered > 1}>
      <NotebookIcon size={68} />
    </Tile>
    <Tile on={active === 2} done={answered > 2}>
      <AllowCard w={128} empty={1 - allowFill} showButtons={false} />
    </Tile>
  </div>
);
