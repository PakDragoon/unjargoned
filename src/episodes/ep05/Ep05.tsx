import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "../../shared/brand";
import { KIT, Kit } from "./Kit";
import { StyleA, StyleB } from "./StyleFrames";

/** Ep 5 compositions. G1: kit sheet + S1 style frames. Scenes, Full, Shorts and thumbnails join from G2. */
export const Ep05Compositions: React.FC = () => (
  <>
    <Composition id="Ep05-StyleA" component={StyleA} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep05-StyleB" component={StyleB} durationInFrames={1} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="Ep05-Kit" component={Kit} durationInFrames={1} fps={VIDEO.fps} width={KIT.width} height={KIT.height} />
  </>
);
