import React from "react";
import { Composition, Series } from "remotion";
import { SHORT, VIDEO } from "../../shared/brand";
import { scenes, totalFrames } from "./timeline";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S4b } from "./scenes/S4b";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";
import { S7 } from "./scenes/S7";
import { G1Sheet, StyleFrame } from "./StyleFrame";
import { ThumbA, ThumbB, ThumbC } from "./Thumbnails";
import { Short1, Short2, Short3, shortFrames } from "./Shorts";
import { DotSheet } from "../../shared/DotSheet";

const components: Record<string, React.FC> = { S1, S2, S3, S4, S4b, S5, S6, S7 };

/** Full episode: every scene in order. Render this ONCE, at the end. */
export const Ep02Full: React.FC = () => (
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

/** One composition per scene (Ep02-S1 … Ep02-S7) + Ep02-Full. */
export const Ep02Compositions: React.FC = () => (
  <>
    {scenes.map((s) => (
      <Composition
        key={s.id}
        id={`Ep02-${s.id}`}
        component={components[s.id]}
        durationInFrames={s.frames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    ))}
    <Composition id="Ep02-Short1" component={Short1} durationInFrames={shortFrames("Short1")} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    <Composition id="Ep02-Short2" component={Short2} durationInFrames={shortFrames("Short2")} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    <Composition id="Ep02-Short3" component={Short3} durationInFrames={shortFrames("Short3")} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    <Composition id="Ep02-ThumbA" component={ThumbA} durationInFrames={1} fps={VIDEO.fps} width={1280} height={720} />
    <Composition id="Ep02-ThumbB" component={ThumbB} durationInFrames={1} fps={VIDEO.fps} width={1280} height={720} />
    <Composition id="Ep02-ThumbC" component={ThumbC} durationInFrames={1} fps={VIDEO.fps} width={1280} height={720} />
    <Composition id="Ep02-StyleFrame" component={StyleFrame} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep02-G1Sheet" component={() => <G1Sheet Sheet={DotSheet} />} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={2180} />
    <Composition
      id="Ep02-Full"
      component={Ep02Full}
      durationInFrames={totalFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);
