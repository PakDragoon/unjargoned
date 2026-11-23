import React from "react";
import { Composition, OffthreadVideo, Series, staticFile } from "remotion";
import { Voice, type Word } from "./Editorial";
import durations from "./durations.json";
import timings from "./words.json";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";
// Five-second master of the approved 60 fps Dots sting, sampled at this timeline’s 30 fps.
const STING_FRAMES = 150;

const scenes = [S1, S2, S3, S4, S5, S6];
const dimensions = { width: 1920, height: 1080, fps: 30 };
const Scene = ({ index }: { index: number }) => {
  const Content = scenes[index];
  const words = timings[index] as Word[];
  return (
    <>
      <Content words={words} />
      <Voice file={durations[index].file} />
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
      return index === 3
        ? [
            scene,
            <Series.Sequence key="subscribe" durationInFrames={STING_FRAMES}>
              <OffthreadVideo src={staticFile("models/subscribe.mp4")} />
            </Series.Sequence>,
          ]
        : [scene];
    })}
  </Series>
);
export const Root = () => (
  <>
    <Composition
      id="Models-Full"
      component={Full}
      {...dimensions}
      durationInFrames={durations.reduce((n, s) => n + s.frames, STING_FRAMES)}
    />
    {scenes.map((_, index) => (
      <Composition
        key={index}
        id={`Models-S${index + 1}`}
        component={Scene}
        defaultProps={{ index }}
        {...dimensions}
        durationInFrames={durations[index].frames}
      />
    ))}
  </>
);
