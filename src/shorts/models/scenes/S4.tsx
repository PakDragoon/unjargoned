import React from "react";
import {
  box,
  Foley,
  mono,
  panel,
  progress,
  SceneProps,
  Stage,
  taxonomy,
  useBeat,
} from "../../../models/Editorial";
export const S4 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  const linkCue = cue("below");
  const arrow = progress(t, linkCue, 0.2);
  return (
    <Stage short title="Your pocket cheat sheet" label="RELATED VIDEO">
      {taxonomy.map(([name, label], i) => {
        const p = progress(t, i * 0.11, 0.6);
        return (
          <div
            key={name}
            style={{
              ...box(90 + i * 10, 568 + i * 100 + (1 - p) * 100, 735),
              ...panel,
              padding: "23px 30px 36px",
              transform: `rotate(${(i - 1.5) * 1.8}deg)`,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <strong style={{ fontSize: 35 }}>{name}</strong>
            <span
              style={{
                ...mono,
                fontSize: 20,
                background: "#FF4D2D",
                padding: 8,
              }}
            >
              {label.toUpperCase()}
            </span>
          </div>
        );
      })}
      <svg
        style={{ ...box(330, 1015 + 8 * Math.sin(t * 4)), opacity: arrow, transform: `translateY(${(arrow - 1) * 30}px)` }}
        width="210"
        height="230"
        viewBox="0 0 200 220"
      >
        <path
          d="M74 10h52v105h55L98 201 16 115h58z"
          fill="#FF4D2D"
          stroke="#141414"
          strokeWidth="6"
        />
      </svg>
      <Foley at={linkCue} name="pop" />
    </Stage>
  );
};
