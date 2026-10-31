import React from "react";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S3");

// Scene S3 — placeholder until G3. Edit only this file for S3 changes.
export const S3: React.FC = () => <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc} />;
