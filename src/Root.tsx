import React from "react";
import { Folder } from "remotion";
import { Ep02Compositions } from "./episodes/ep02/Ep02";

// Add one <Folder> per episode. Each episode lives in src/episodes/epNN/.
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="ep02">
      <Ep02Compositions />
    </Folder>
  </>
);
