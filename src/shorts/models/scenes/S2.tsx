import React from "react";
import {
  box,
  Foley,
  IndexCard,
  progress,
  SceneProps,
  Stage,
  useBeat,
} from "../../../models/Editorial";
export const S2 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  return (
    <Stage short title="Pick by the job." label="THE BIG THREE">
      {[0, cue("writing"), cue("analyzing")].map((at, i) => {
        const p = progress(t, at, 0.32);
        return (
          <div
            key={i}
            style={{
              ...box(90, 495 + i * 234, 774),
              height: 205,
              opacity: p,
              transform: `translateY(${-95 * (1 - p)}px) rotate(${i - 1}deg)`,
            }}
          >
            <IndexCard n={i} short />
            <Foley name="whoosh" at={at} />
            <Foley name="stamp" at={at + 0.25} />
          </div>
        );
      })}
    </Stage>
  );
};
