import React from "react";
import {
  Actor,
  box,
  Foley,
  Prompt,
  SceneProps,
  Stage,
  Stamp,
  useBeat,
} from "../Editorial";
export const S1 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  const gemini = cue("gemini");
  const claude = cue("claude");
  const selected = t >= claude ? 1 : t >= gemini ? 2 : -1;
  return (
    <Stage title="Which box would you open?" label="FIELD GUIDE / THE CHOICE">
      {["ChatGPT", "Claude", "Gemini", "DeepSeek"].map((name, i) => {
        const x = 283 + i * 445;
        return (
          <React.Fragment key={name}>
            <Prompt x={x} y={565} w={392} h={244} name={name} t={t} />
            {i === selected && (
              <div
                style={{
                  ...box(x - 204, 435, 408),
                  height: 260,
                  border: "8px solid #FF4D2D",
                  borderRadius: 28,
                  boxSizing: "border-box",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
      <div style={box(106, 310)}>
        <Stamp
          size={34}
          text={t >= cue("rough") ? "REWRITE THE EXPLANATION" : "FIND THE DIAGRAM"}
        />
      </div>
      <Actor
        x={selected === 1 ? 728 : selected === 2 ? 1173 : 520}
        y={805}
        t={t}
        worried={selected < 0}
      />
      <Foley at={0} name="pop" />
      <Foley at={gemini} name="ding" />
      <Foley at={claude} name="click" />
    </Stage>
  );
};
