import React from "react";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S7");

// Scene S7 — placeholder until G3. Edit only this file for S7 changes.
export const S7: React.FC = () => <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc} />;
