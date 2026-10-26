import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { colors, fontFamily } from "./brand";

type Props = {
  /** e.g. "S4" */
  sceneId: string;
  title: string;
  /** Path under public/, e.g. "episodes/ep02/audio/S4.wav". Omit until the voice exists. */
  audioSrc?: string;
  children?: React.ReactNode;
};

/**
 * Common wrapper for every scene: brand background + the scene's voice track.
 * With no children it renders a placeholder card, so a scene is previewable
 * (with audio) before its animation is built.
 */
export const SceneShell: React.FC<Props> = ({ sceneId, title, audioSrc, children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      {children ?? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 24 }}>
          <div style={{ color: colors.yellow, fontSize: 56, fontWeight: 800 }}>{sceneId}</div>
          <div style={{ fontSize: 72, fontWeight: 800, textAlign: "center", maxWidth: 1500 }}>{title}</div>
          <div style={{ color: colors.subtext, fontSize: 32 }}>placeholder — animation not built yet</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
