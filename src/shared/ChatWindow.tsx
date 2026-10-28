import React from "react";
import { colors } from "./brand";

/** A generic chat app window (no logos): header dots, message area, input bar. */
export const ChatWindow: React.FC<{
  width: number;
  height: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, children, style }) => (
  <div
    style={{
      width, height, borderRadius: 40, backgroundColor: colors.panel, border: `4px solid ${colors.line}`,
      display: "flex", flexDirection: "column", overflow: "hidden", ...style,
    }}
  >
    <div style={{ height: 64, borderBottom: `4px solid ${colors.line}`, display: "flex", alignItems: "center", gap: 14, padding: "0 28px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.lineStrong }} />
      ))}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, padding: 32 }}>{children}</div>
    <div style={{ margin: 24, height: 72, borderRadius: 36, border: `4px solid ${colors.line}` }} />
  </div>
);

/** Chat bubble. `from="me"` sits right; the assistant sits left. `o` = 0–1 pop. */
export const ChatBubble: React.FC<{ from: "me" | "ai"; o?: number; children: React.ReactNode; fontSize?: number }> = ({
  from, o = 1, children, fontSize = 52,
}) => (
  <div
    style={{
      alignSelf: from === "me" ? "flex-end" : "flex-start", maxWidth: "88%", opacity: Math.min(1, o),
      transform: `scale(${0.75 + 0.25 * o})`, transformOrigin: from === "me" ? "bottom right" : "bottom left",
      backgroundColor: from === "me" ? colors.lineStrong : colors.ink, border: `4px solid ${colors.line}`,
      padding: "20px 32px", fontSize, fontWeight: 600, lineHeight: 1.25,
      borderRadius: from === "me" ? "36px 36px 10px 36px" : "36px 36px 36px 10px",
    }}
  >
    {children}
  </div>
);

/** Text that appears word by word between two frames. */
export const StreamText: React.FC<{ text: string; frame: number; from: number; to: number }> = ({ text, frame, from, to }) => {
  const words = text.split(" ");
  const shown = Math.max(0, Math.min(words.length, Math.floor(((frame - from) / Math.max(1, to - from)) * words.length) + 1));
  return (
    <span>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < shown ? 1 : 0 }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
};
