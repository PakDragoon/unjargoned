import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { box, SceneProps } from "../../models/Editorial";
import { HEAD, C } from "../dots/theme";
export const Captions = ({ words }: SceneProps) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const current = words.findIndex(([, a, b]) => a <= t && t < b);
  if (current < 0) return null;
  const start = current - (current % 3);
  return (
    <div
      style={{
        ...box(70, 1325, 830),
        textAlign: "center",
        fontFamily: HEAD,
        fontWeight: 700,
        fontSize: 56,
        lineHeight: 1.18,
      }}
    >
      {words.slice(start, start + 3).map(([text, a], i) => (
        <span
          key={a}
          style={{
            display: "inline-block",
            margin: 4,
            padding: "5px 12px",
            background: i + start === current ? C.red : C.ink,
            color: i + start === current ? C.ink : C.paper,
            transform: `translateY(${i + start === current ? -5 : 0}px)`,
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
};
