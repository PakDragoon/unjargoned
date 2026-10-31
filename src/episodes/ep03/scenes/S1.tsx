import React from "react";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S1");

// Scene S1 — placeholder until G3. Edit only this file for S1 changes.
export const S1: React.FC = () => <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc} />;
