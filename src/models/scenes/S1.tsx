import React from "react";
import {
  Actor,
  box,
  Foley,
  progress,
  Prompt,
  SceneProps,
  Stage,
  Stamp,
  useBeat,
} from "../Editorial";
export const S1 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  const turn = cue("mistake");
  const walk = progress(t, 0, turn + 2);
  const x = 190 + walk * 1450;
  return (
    <Stage title="Four apps. One blank box." label="THE ILLUSION">
      {["ChatGPT", "Claude", "Gemini", "DeepSeek"].map((name, i) => {
        const enter = progress(t, i * 0.2);
        return (
          <Prompt
            key={name}
            x={282 + 445 * i}
            y={528 + (1 - enter) * 320}
            w={392}
            h={241}
            name={name}
            t={t}
          />
        );
      })}
      {t > turn && (
        <svg
          width={125}
          height={125}
          style={box(x, 721)}
          fill="none"
          stroke="#141414"
          strokeWidth="9"
          strokeLinecap="round"
        >
          <path d={`M41 86Q105 68 54 ${32 + 5 * Math.sin(t * 9)}`} />
          <circle cx="53" cy={32 + 5 * Math.sin(t * 9)} r="10" fill="#F7F4EB" />
        </svg>
      )}
      <Actor x={x} y={788 - 18 * Math.abs(Math.sin(walk * 25))} t={t} worried />
      {t >= turn && (
        <div style={box(100, 824)}>
          <Stamp
            text={
              t < cue("buckets")
                ? "SAME INTERFACE ≠ SAME STRENGTHS"
                : "FOUR BUCKETS"
            }
          />
        </div>
      )}
      <div
        style={{
          ...box(x + 40, 665),
          fontSize: 52,
          transform: `rotate(${8 * Math.sin(t * 3)}deg)`,
        }}
      >
        ?
      </div>
      <Foley at={turn} name="click" />
    </Stage>
  );
};
