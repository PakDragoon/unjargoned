// Separate entry for the v2 Tactile Editorial build:  npx remotion studio src/dots/index.ts
import React from "react";
import { AbsoluteFill, Audio, Composition, Folder, Sequence, staticFile } from "remotion";
import { FPS, SceneKey, sceneFrames, SceneFade } from "./kit";
import { Sfx } from "./Sfx";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";
import { S7 } from "./scenes/S7";
import { Subscribe, SUB_FRAMES } from "./scenes/Subscribe";

const SCENES: { id: string; key: SceneKey; C: React.FC }[] = [
  { id: "S1", key: "long_scene1", C: S1 },
  { id: "S2", key: "long_scene2", C: S2 },
  { id: "S3", key: "long_scene3", C: S3 },
  { id: "S4", key: "long_scene4", C: S4 },
  { id: "S5", key: "long_scene5", C: S5 },
  { id: "S6", key: "long_scene6", C: S6 },
  { id: "S7", key: "long_scene7", C: S7 },
];

const Scene: React.FC<{ s: (typeof SCENES)[number]; fade?: boolean }> = ({ s, fade = true }) => {
  const total = sceneFrames(s.key);
  const body = (
    <AbsoluteFill>
      <s.C />
      <Audio src={staticFile(`audio/${s.key}.mp3`)} />
      <Sfx scene={s.key} />
    </AbsoluteFill>
  );
  return fade ? <SceneFade total={total}>{body}</SceneFade> : body;
};

// The approved Subscribe sting plays between Scene 4 (shredder) and Scene 5 ("What could go wrong?").
const STING_AFTER = "S4";
const ORDER: { id: string; frames: number; el: (fade: boolean) => React.ReactNode }[] = SCENES.flatMap((s) => {
  const scene = { id: s.id, frames: sceneFrames(s.key), el: (fade: boolean) => <Scene s={s} fade={fade} /> };
  if (s.id !== STING_AFTER) return [scene];
  return [scene, { id: "Subscribe", frames: SUB_FRAMES, el: () => <SceneFade total={SUB_FRAMES}><Subscribe /></SceneFade> }];
});

const Full: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: "#F7F4EB" }}>
      {ORDER.map((o, i) => {
        const from = at;
        at += o.frames;
        // first scene opens hard (no fade from cream); the others fade in/out
        return (
          <Sequence key={o.id} from={from} durationInFrames={o.frames}>
            {o.el(i > 0)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const total = ORDER.reduce((a, o) => a + o.frames, 0);

export const DotsRoot: React.FC = () => (
  <>
    <Folder name="Dots-LongForm">
      <Composition id="Dots-Full" component={Full} durationInFrames={total} fps={FPS} width={1920} height={1080} />
      {SCENES.map((s) => (
        <Composition key={s.id} id={`Dots-${s.id}`} component={() => <Scene s={s} fade={false} />}
          durationInFrames={sceneFrames(s.key)} fps={FPS} width={1920} height={1080} />
      ))}
      <Composition id="Dots-Subscribe" component={Subscribe} durationInFrames={SUB_FRAMES} fps={FPS} width={1920} height={1080} />
    </Folder>
  </>
);
