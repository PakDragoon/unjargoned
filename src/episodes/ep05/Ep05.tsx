import React from "react";
import { Composition, Series } from "remotion";
import { SHORT, VIDEO } from "../../shared/brand";
import { SceneShell } from "../../shared/SceneShell";
import { KIT, Kit } from "./Kit";
import { Short1, Short2, Short3, Short4, shortFrames } from "./Shorts";
import { ThumbA, ThumbB } from "./Thumbnails";
import { StyleA, StyleB } from "./StyleFrames";
import { scene, scenes, totalFrames } from "./timeline";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S2b } from "./scenes/S2b";
import { S3 } from "./scenes/S3";
import { S3b } from "./scenes/S3b";
import { S3c } from "./scenes/S3c";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S5b } from "./scenes/S5b";
import { S6 } from "./scenes/S6";
import { S7 } from "./scenes/S7";

const placeholder = (id: string): React.FC => () => {
  const s = scene(id);
  return <SceneShell sceneId={s.id} title={s.title} audioSrc={s.audioSrc} />;
};
const built: Record<string, React.FC> = { S1, S2, S2b, S3, S3b, S3c, S4, S5, S5b, S6, S7 };
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
    {([["Short1", Short1], ["Short2", Short2], ["Short3", Short3], ["Short4", Short4]] as const).map(([id, C]) => (
      <Composition key={id} id={`Ep05-${id}`} component={C} durationInFrames={shortFrames(id)} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    ))}
    <Composition id="Ep05-ThumbA" component={ThumbA} durationInFrames={1} fps={VIDEO.fps} width={1280} height={720} />
    <Composition id="Ep05-ThumbB" component={ThumbB} durationInFrames={1} fps={VIDEO.fps} width={1280} height={720} />
    <Composition id="Ep05-Full" component={Ep05Full} durationInFrames={totalFrames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
