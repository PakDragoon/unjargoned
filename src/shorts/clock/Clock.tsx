import React from "react";
import { Composition } from "remotion";
import { SHORT } from "../../shared/brand";
import { ShortA, tlA } from "./ShortA";
import { ShortB, tlB } from "./ShortB";

// Standalone clock Shorts (native 1080×1920). Render muted, then mix (G2).
export const ClockShortsCompositions: React.FC = () => (
  <>
    <Composition id="ClockA" component={ShortA} durationInFrames={tlA.total} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
    <Composition id="ClockB" component={ShortB} durationInFrames={tlB.total} fps={SHORT.fps} width={SHORT.width} height={SHORT.height} />
  </>
);
