import React from "react";
import { colors } from "../../shared/brand";

const QUESTIONS = ["From what?", "Counting letters", "Different answers"];

/** Progress strip: the three questions from S2, the current one in yellow. */
export const QuestionStrip: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: "absolute", top: 56, left: 120, right: 120, display: "flex", gap: 24, justifyContent: "center" }}>
    {QUESTIONS.map((q, i) => (
      <div
        key={q}
        style={{
          padding: "14px 32px",
          borderRadius: 999,
          fontSize: 44,
          fontWeight: 600,
          backgroundColor: i === active ? colors.yellow : colors.panel,
          color: i === active ? colors.ink : colors.subtext,
          border: `3px solid ${i === active ? colors.yellow : colors.line}`,
        }}
      >
        {i + 1} · {q}
      </div>
    ))}
  </div>
);
