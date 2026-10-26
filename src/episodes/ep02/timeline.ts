import { VIDEO } from "../../shared/brand";
import vo from "./vo.json";
import durations from "./durations.json";

// Scene length = its voice length (written by tools/tts.py into durations.json).
// Until the voice exists, the script's estimate is used and there is no audio.
const TAIL_SECONDS = 0.4; // breathing room after the last word of each scene

export type SceneInfo = {
  id: string;
  title: string;
  frames: number;
  audioSrc?: string;
};

const measured = durations as Record<string, number>;

export const scenes: SceneInfo[] = vo.scenes.map((s) => {
  const audioSeconds = measured[s.id];
  const endScreen = "endScreenSeconds" in s ? (s.endScreenSeconds as number) : 0;
  const seconds = (audioSeconds ?? s.estSeconds) + TAIL_SECONDS + endScreen;
  return {
    id: s.id,
    title: s.title,
    frames: Math.ceil(seconds * VIDEO.fps),
    audioSrc: audioSeconds !== undefined ? `episodes/ep02/audio/${s.id}.wav` : undefined,
  };
});

export const scene = (id: string): SceneInfo => {
  const found = scenes.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown scene ${id}`);
  return found;
};

export const totalFrames = scenes.reduce((sum, s) => sum + s.frames, 0);
