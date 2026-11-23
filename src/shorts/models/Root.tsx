import React from "react";
import { Composition, Series } from "remotion";
import { Voice, type Word } from "../../models/Editorial";
import durations from "./durations.json";
import timings from "./words.json";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { Captions } from "./Captions";

const scenes = [S1, S2, S3, S4];
const dimensions = { width: 1080, height: 1920, fps: 60 };
const Scene = ({ index }: { index: number }) => {
  const Content = scenes[index];
  const words = timings[index] as Word[];
  return (
    <>
      <Content words={words} />
      <Voice file={durations[index].file} />
      <Captions words={words} />
    </>
  );
};
const Full = () => (
  <Series>
    {scenes.flatMap((_, index) => {
      const scene = (
        <Series.Sequence key={index} durationInFrames={durations[index].frames}>
          <Scene index={index} />
        </Series.Sequence>
      );
      return [scene];
    })}
  </Series>
);
export const Root = () => (
  <>
    <Composition
      id="ModelsShort-Full"
      component={Full}
      {...dimensions}
      durationInFrames={durations.reduce((n, s) => n + s.frames, 0)}
    />
    {scenes.map((_, index) => (
      <Composition
        key={index}
        id={`ModelsShort-S${index + 1}`}
        component={Scene}
        defaultProps={{ index }}
        {...dimensions}
        durationInFrames={durations[index].frames}
      />
    ))}
  </>
);
