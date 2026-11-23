import React from "react";
import {
  box,
  Foley,
  panel,
  SceneProps,
  Stage,
  Stamp,
  useBeat,
} from "../../../models/Editorial";
import { Prop } from "../../../models/Props";
export const S3 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  return (
    <Stage
      short
      title="Think it through. Or run it locally."
      label="TWO MORE OPTIONS"
    >
      {["THINKING MODE", "DEEPSEEK / LLAMA"].map((label, i) => (
        <div
          key={label}
          style={{
            ...box(88, 570 + 300 * i, 775),
            ...panel,
            height: 257,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 15,
            transform: `rotate(${i ? 1 : -1}deg)`,
          }}
        >
          <Prop
            kind={i ? "laptop" : "scratchpad"}
            width={255}
            step={Math.min(3, Math.floor(Math.max(0, t - cue("thinking")) * 2))}
          />
          <div>
            <Stamp text={label} size={29} />
            <div style={{ fontSize: 38, fontWeight: 700, marginTop: 20 }}>
              {i ? "On your laptop" : "Check the logic"}
            </div>
          </div>
        </div>
      ))}
      <Foley at={cue("thinking")} name="tick" />
      <Foley at={cue("double-checks")} name="ding" />
      <Foley at={cue("locally")} name="vault" />
    </Stage>
  );
};
