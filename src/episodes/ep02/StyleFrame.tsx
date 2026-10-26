import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fontFamily } from "../../shared/brand";
import { Dot } from "../../shared/Dot";
import { QuestionStrip } from "./QuestionStrip";

// G1 style frame: the S4 token beat. Split verified with OpenAI's o200k_base
// tokenizer (GPT-4o and later): "strawberry" → st | raw | berry = 302 · 1618 · 19772.
const TOKENS = [
  { text: "st", id: 302 },
  { text: "raw", id: 1618 },
  { text: "berry", id: 19772 },
];
export const StyleFrame: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
    <QuestionStrip active={1} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", gap: 36 }}>
        {TOKENS.map((t) => (
          <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div
              style={{
                padding: "18px 48px",
                borderRadius: 36,
                backgroundColor: colors.panel,
                border: `8px solid ${colors.yellow}`,
                fontSize: 160,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -2,
              }}
            >
              {t.text}
            </div>
            <div style={{ fontSize: 72, fontWeight: 800, color: colors.periwinkle }}>{t.id}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 56, fontWeight: 600, color: colors.subtext, marginTop: 8 }}>3 tokens, 0 letters</div>
    </AbsoluteFill>
    <Dot x={330} y={860} size={92} tailLength={2.2} mood="curious" look={{ x: 0.4, y: -0.3 }} blinks={false} />
  </AbsoluteFill>
);

/** One still sheet for G1: style frame on top, Dot model sheet below. */
export const G1Sheet: React.FC<{ Sheet: React.FC }> = ({ Sheet }) => (
  <AbsoluteFill style={{ backgroundColor: colors.line }}>
    <div style={{ position: "absolute", top: 0, left: 0, width: 1920, height: 1080 }}>
      <StyleFrame />
    </div>
    <div style={{ position: "absolute", top: 1100, left: 0, width: 1920, height: 1080, overflow: "hidden" }}>
      <Sheet />
    </div>
  </AbsoluteFill>
);
