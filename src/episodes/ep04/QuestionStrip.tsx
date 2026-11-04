import React from "react";
import { colors } from "../../shared/brand";
import { AllowCard } from "./Props";
import { INK, PAPER, SHADOW } from "./Rig";
import { ArmGlyph, NotebookGlyph } from "./World";

// Ep 4 progress strip (revamp: cut-paper cards, as pinned on the board in S2): an arm with its glove (what it can do),
// the notebook (does it remember you), and the "Allow?" card (the step it skipped). The "Allow?" card stays an empty
// dashed outline until S5 closes the open loop (`allowFill` 0→1).
const TILE = 112;

const Tile: React.FC<{ on: boolean; done: boolean; children: React.ReactNode }> = ({ on, done, children }) => (
  <div
    style={{
      position: "relative", width: TILE * 1.5, height: TILE, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: PAPER, border: `6px solid ${on ? colors.yellow : INK}`, boxSizing: "border-box", overflow: "hidden",
      filter: `drop-shadow(6px 8px 0 ${SHADOW})`, scale: `${on ? 1.08 : 1}`, opacity: on || done ? 1 : 0.92,
    }}
  >
    {children}
    {done ? (
      <div style={{ position: "absolute", right: 6, top: 6, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.mint, border: `4px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={16} height={16} viewBox="0 0 84 84" aria-hidden><path d="M 12 44 L 34 66 L 74 18" fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    ) : null}
  </div>
);

export const NotebookIcon: React.FC<{ size?: number }> = ({ size = 64 }) => <NotebookGlyph size={size} />;

/** `active`: 0 hand, 1 notebook, 2 allow (−1 none). `answered`: how many are done (mint tick). `o`: fade/scale-in (S2 shrink). */
export const QuestionStrip: React.FC<{ active: number; answered?: number; allowFill?: number; o?: number }> = ({ active, answered = 0, allowFill = 0, o = 1 }) => (
  <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", gap: 28, justifyContent: "center", opacity: o }}>
    <Tile on={active === 0} done={answered > 0}>
      <div style={{ position: "absolute", left: 18, bottom: 0 }}><ArmGlyph size={TILE - 6} /></div>
    </Tile>
    <Tile on={active === 1} done={answered > 1}>
      <NotebookGlyph size={76} />
    </Tile>
    <Tile on={active === 2} done={answered > 2}>
      <div style={{ position: "relative" }}>
        <AllowCard w={128} empty={1 - allowFill} showButtons={false} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#9A8F78", opacity: 1 - allowFill }}>Allow?</div>
      </div>
    </Tile>
  </div>
);
