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
      {[0, cue("rewriting"), cue("finding")].map((at, i) => {
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
            <svg
              style={box(581, 25)}
              width="140"
              height="70"
              viewBox="0 0 140 70"
              fill="none"
              stroke="#141414"
              strokeWidth="4"
            >
              {i === 0 ? (
                <>
                  <path d="M4 30v10m8-17v24m9-32v40m9-32v24m8-17v10" />
                  <rect x="68" y="17" width="61" height="39" fill="#F7F4EB" />
                  <path d="m69 18 29 22 30-22" />
                </>
              ) : i === 1 ? (
                <>
                  <path d="m28 18-19 17 19 17m26-34 19 17-19 17m-8-38-11 41" />
                  <path d="m88 51 31-32 9 9-31 32-12 3z" fill="#FF4D2D" />
                </>
              ) : (
                <>
                  <rect x="6" y="10" width="121" height="50" rx="6" />
                  <path d="m25 21 20 13-20 13z" fill="#FF4D2D" />
                  <path d="M56 35h55m-19-9v18" />
                </>
              )}
            </svg>
            <Foley name="whoosh" at={at} />
            <Foley name="stamp" at={at + 0.25} />
          </div>
        );
      })}
    </Stage>
  );
};
