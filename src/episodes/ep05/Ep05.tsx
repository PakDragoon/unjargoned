import React from "react";
import { Composition, Series } from "remotion";
import { VIDEO } from "../../shared/brand";
import { SceneShell } from "../../shared/SceneShell";
import { KIT, Kit } from "./Kit";
import { StyleA, StyleB } from "./StyleFrames";
import { scene, scenes, totalFrames } from "./timeline";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S2b } from "./scenes/S2b";
import { S3 } from "./scenes/S3";
import { S3b } from "./scenes/S3b";
import { S3c } from "./scenes/S3c";

const placeholder = (id: string): React.FC => () => {
  const s = scene(id);
  return <SceneShell sceneId={s.id} title={s.title} audioSrc={s.audioSrc} />;
};
const built: Record<string, React.FC> = { S1, S2, S2b, S3, S3b, S3c };
const components: Record<string, React.FC> = Object.fromEntries(scenes.map((s) => [s.id, built[s.id] ?? placeholder(s.id)]));

/** Full episode: every scene in order. Render this ONCE, at the end. */
export const Ep05Full: React.FC = () => (
  <Series>
    {scenes.map((s) => {
      const C = components[s.id];
      return (
        <Series.Sequence key={s.id} durationInFrames={s.frames}>
          <C />
        </Series.Sequence>
      );
    })}
  </Series>
);

/** Ep 5 compositions: kit + style frames, one per scene (Ep05-S1 …), and Ep05-Full. */
export const Ep05Compositions: React.FC = () => (
  <>
    <Composition id="Ep05-StyleA" component={StyleA} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep05-StyleB" component={StyleB} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep05-Kit" component={Kit} durationInFrames={1} fps={VIDEO.fps} width={KIT.width} height={KIT.height} />
    {scenes.map((s) => (
      <Composition key={s.id} id={`Ep05-${s.id}`} component={components[s.id]} durationInFrames={s.frames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    ))}
    <Composition id="Ep05-Full" component={Ep05Full} durationInFrames={totalFrames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
