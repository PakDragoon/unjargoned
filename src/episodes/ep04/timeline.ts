import { VIDEO } from "../../shared/brand";
import vo from "./vo.json";
import durations from "./durations.json";
import captions from "./captions.json";

// Scene length = its voice length (written by tools/tts.py into durations.json).
// Until the voice exists, the script's estimate is used and there is no audio.
const TAIL_SECONDS = 0.4; // breathing room after the last word of each scene (vo.json "tailSeconds" overrides per scene)

export type SceneInfo = {
  id: string;
  title: string;
  frames: number;
  audioSrc?: string;
  /** Ep 4: seconds into the scene where the end screen starts building (under the VO). */
  endScreenAt?: number;
};

type Word = { word: string; start: number; end: number };
const words = captions as Record<string, Word[]>;

const measured = durations as Record<string, number>;

export const scenes: SceneInfo[] = vo.scenes.map((s) => {
  const audioSeconds = measured[s.id];
  const endScreen = "endScreenSeconds" in s ? (s.endScreenSeconds as number) : 0;
  const tail = "tailSeconds" in s ? (s.tailSeconds as number) : TAIL_SECONDS; // S1: a ~1 s breath after "Let's un-jargon it." (logo holds)
  const voiceEnd = (audioSeconds ?? s.estSeconds) + tail;
  // Ep 4 ending: the end screen builds under the last line, and its 8 s count from that word ("Until").
  const fromWord = "endScreenFromWord" in s ? (s.endScreenFromWord as string) : undefined;
  const cue = fromWord ? words[s.id]?.find((w) => w.word.replace(/[^A-Za-z']/g, "") === fromWord) : undefined;
  const endScreenAt = fromWord ? (cue?.start ?? voiceEnd) : endScreen ? voiceEnd : undefined;
  const seconds = endScreenAt !== undefined && endScreen ? Math.max(voiceEnd, endScreenAt + endScreen) : voiceEnd;
  return {
    id: s.id,
    title: s.title,
    frames: Math.ceil(seconds * VIDEO.fps),
    audioSrc: audioSeconds !== undefined ? `episodes/ep04/audio/${s.id}.wav` : undefined,
    endScreenAt,
  };
});

export const scene = (id: string): SceneInfo => {
  const found = scenes.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown scene ${id}`);
  return found;
};

export const totalFrames = scenes.reduce((sum, s) => sum + s.frames, 0);
