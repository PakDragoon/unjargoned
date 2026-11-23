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
} from "../../../models/Editorial";
export const S1 = ({ words }: SceneProps) => {
  const { t } = useBeat(words);
  const slam = progress(t, 0, 0.18);
  return (
    <Stage short title="One AI for everything?" label="THE HOOK">
      <Prompt x={475} y={808} w={790} h={405} name="ChatGPT" t={t} />
      <div
        style={{
          ...box(280, 858),
          transform: `rotate(-12deg) scale(${1.35 - 0.35 * slam})`,
        }}
      >
        <Stamp text="STOP" size={111} />
      </div>
      <Actor
        x={160 + 68 * slam}
        y={1014 - 65 * Math.sin(Math.PI * slam)}
        t={t}
        r={85}
      />
      <Foley at={0.14} name="slap" />
    </Stage>
  );
};
