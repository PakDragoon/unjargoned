import React from "react";
import { Composition, Series } from "remotion";
import { VIDEO } from "../../shared/brand";
import { scenes, totalFrames } from "./timeline";
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
export const Ep03Full: React.FC = () => (
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

/** One composition per scene (Ep03-S1 … Ep03-S7) + Ep03-Full. Shorts and thumbnails are added at G5. */
export const Ep03Compositions: React.FC = () => (
  <>
    {scenes.map((s) => (
      <Composition
        key={s.id}
        id={`Ep03-${s.id}`}
        component={components[s.id]}
        durationInFrames={s.frames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    ))}
    <Composition id="Ep03-Full" component={Ep03Full} durationInFrames={totalFrames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
  </>
);
