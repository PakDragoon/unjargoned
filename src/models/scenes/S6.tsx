import React from "react";
import {
  box,
  Foley,
  IndexCard,
  progress,
  SceneProps,
  Stage,
  useBeat,
} from "../Editorial";
export const S6 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  return (
    <Stage title="The 10-second cheat sheet" label="FIELD GUIDE / RECAP">
      {["everyday", "nuanced", "video", "hard"].map((word, i) => {
        const active = progress(t, cue(word));
        return (
          <div
            key={word}
            style={{
              ...box(105 + i * 435, 340 + (i % 2) * 25 - active * 18, 405),
              height: 254,
              transform: `rotate(${(i - 1.5) * 2}deg)`,
            }}
          >
            <IndexCard n={i} />
            <Foley at={cue(word)} name="paper" />
          </div>
        );
      })}
      <div style={{ ...box(105, 767, 835), fontSize: 48, fontWeight: 700 }}>
        What happens when AI starts working while you sleep? →
      </div>
    </Stage>
  );
};
