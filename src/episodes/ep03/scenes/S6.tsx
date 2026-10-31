import React from "react";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S6");

// Scene S6 — placeholder until G3. Edit only this file for S6 changes.
export const S6: React.FC = () => <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc} />;
