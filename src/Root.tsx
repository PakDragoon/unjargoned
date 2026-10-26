import React from "react";
import { Composition, Folder } from "remotion";
import { Ep02Compositions } from "./episodes/ep02/Ep02";
import { DotSheet } from "./shared/DotSheet";
import { VIDEO } from "./shared/brand";

// Add one <Folder> per episode. Each episode lives in src/episodes/epNN/.
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="kit">
      <Composition id="Kit-DotMoods" component={DotSheet} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    </Folder>
    <Folder name="ep02">
      <Ep02Compositions />
    </Folder>
  </>
);
