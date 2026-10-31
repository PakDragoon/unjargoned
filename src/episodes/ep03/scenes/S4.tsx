import React from "react";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S4");

// Scene S4 — placeholder until G3. Edit only this file for S4 changes.
export const S4: React.FC = () => <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc} />;
