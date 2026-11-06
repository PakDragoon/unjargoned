import React from "react";
import { Composition, Series } from "remotion";
import { SHORT, VIDEO } from "../../shared/brand";
import { Short1, Short2, Short3, shortFrames } from "./Shorts";
import { ThumbA, ThumbB } from "./Thumbnails";
import { scenes, totalFrames } from "./timeline";
import { KIT, Kit } from "./Kit";
import { RigSheet } from "./RigSheet";
import { StyleA, StyleB } from "./StyleFrames";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S3b } from "./scenes/S3b";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";
import { S7 } from "./scenes/S7";

const components: Record<string, React.FC> = { S1, S2, S3, S3b, S4, S5, S6, S7 };

/** Full episode: every scene in order. Render this ONCE, at the end. */
export const Ep04Full: React.FC = () => (
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

/** One composition per scene (Ep04-S1 … Ep04-S7) + Ep04-Full. + Shorts and thumbnails. */
export const Ep04Compositions: React.FC = () => (
  <>
    <Composition id="Ep04-StyleA" component={StyleA} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep04-StyleB" component={StyleB} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep04-RigSheet" component={RigSheet} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep04-Kit" component={Kit} durationInFrames={1} fps={VIDEO.fps} width={KIT.width} height={KIT.height} />
    {scenes.map((s) => (
      <Composition
        key={s.id}
        id={`Ep04-${s.id}`}
        component={components[s.id]}
        durationInFrames={s.frames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    ))}
    <Composition id="Ep04-Short1" component={Short1} durationInFrames={shortFrames("Short1")} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    <Composition id="Ep04-Short2" component={Short2} durationInFrames={shortFrames("Short2")} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    <Composition id="Ep04-Short3" component={Short3} durationInFrames={shortFrames("Short3")} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    <Composition id="Ep04-ThumbA" component={ThumbA} durationInFrames={1} fps={VIDEO.fps} width={1280} height={720} />
    <Composition id="Ep04-ThumbB" component={ThumbB} durationInFrames={1} fps={VIDEO.fps} width={1280} height={720} />
    <Composition id="Ep04-Full" component={Ep04Full} durationInFrames={totalFrames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
