// ChatGPT Dots Short — its own Remotion entry (src/shorts/dots/index.ts). 1080x1920 @ 60 fps; scene lengths from durations.json.
import React from "react";
import { Composition, Folder, Series } from "remotion";
import { FPS, H, W } from "./theme";
import { frames, SceneId } from "./common";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";

const SCENES: [SceneId, React.FC][] = [
  ["scene1", S1],
  ["scene2", S2],
  ["scene3", S3],
  ["scene4", S4],
  ["scene5", S5],
];

export const DotsShort: React.FC = () => (
  <Series>
    {SCENES.map(([id, S]) => (
      <Series.Sequence key={id} durationInFrames={frames(id)}>
        <S />
      </Series.Sequence>
    ))}
  </Series>
);

export const Root: React.FC = () => (
  <Folder name="DotsShort">
    <Composition id="DotsShort-Full" component={DotsShort} durationInFrames={SCENES.reduce((n, [id]) => n + frames(id), 0)} fps={FPS} width={W} height={H} />
    {SCENES.map(([id, S], i) => (
      <Composition key={id} id={`DotsShort-S${i + 1}`} component={S} durationInFrames={frames(id)} fps={FPS} width={W} height={H} />
    ))}
  </Folder>
);
