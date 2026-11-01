import React from "react";
import { colors } from "../../shared/brand";

const QUESTIONS = ["Why make things up?", "Why so sure?", "Protect yourself"];
// Short answers: once a question is answered, its chip flips to this (mint = settled).
const ANSWERS = ["Always answers", "Never wobbles", "Open · Book · Check"];

/** Progress strip: the three questions from S2, the current one in yellow; answered ones show their answer in mint. */
export const QuestionStrip: React.FC<{ active: number; answered?: number }> = ({ active, answered = 0 }) => (
  <div style={{ position: "absolute", top: 56, left: 120, right: 120, display: "flex", gap: 24, justifyContent: "center" }}>
    {QUESTIONS.map((q, i) => {
      const done = i < answered;
      const on = i === active && !done;
      return (
        <div
          key={q}
          style={{
            padding: "14px 32px",
            borderRadius: 999,
            fontSize: 44,
            fontWeight: 600,
            whiteSpace: "nowrap",
            backgroundColor: on ? colors.yellow : done ? "rgba(94,230,184,0.14)" : colors.panel,
            color: on ? colors.ink : done ? colors.mint : colors.subtext,
            border: `3px solid ${on ? colors.yellow : done ? colors.mint : colors.line}`,
          }}
        >
          {done ? "✓" : i + 1} · {done ? ANSWERS[i] : q}
        </div>
      );
    })}
  </div>
);

/** The answer card at the end of each question: the one-line answer, held on screen while it's said. */
export const AnswerCard: React.FC<{ n: number; text: React.ReactNode; p: number }> = ({ n, text, p }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: 36, padding: "40px 64px", borderRadius: 40, backgroundColor: colors.panel,
      border: `6px solid ${colors.mint}`, opacity: Math.min(1, p), transform: `scale(${0.85 + 0.15 * Math.min(1, p)})`,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 40, fontWeight: 800, color: colors.mint, letterSpacing: 3 }}>ANSWER</div>
      <div style={{ fontSize: 110, fontWeight: 800, color: colors.mint, lineHeight: 1 }}>{n}</div>
    </div>
    <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>{text}</div>
  </div>
);
