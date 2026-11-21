// Foley cues per scene, anchored to word timings (frame offsets match the scene animations).
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SceneKey, useCues } from "./kit";

type Cue = [sound: string, word: string, nth: number, offset: number, volume: number];

const CUES: Record<SceneKey, Cue[]> = {
  long_scene1: [
    ["typing", "For", 1, 10, 0.35], ["click", "closed", 1, 12, 0.5], ["freeze", "froze", 1, -6, 0.45],
    ["bounce", "email", 1, 10, 0.4], ["bounce", "deadline", 1, 10, 0.4], ["bounce", "finger", 1, 14, 0.4],
    ["shatter", "ended", 1, 0, 0.5], ["chord", "ended", 1, 8, 0.22], ["pop", "Dots", 1, 0, 0.35],
  ],
  long_scene2: [
    ["inkstrike", "always-on", 1, -14, 0.5], ["pop", "always-on", 1, 8, 0.3], ["whoosh", "Instead", 1, 0, 0.3],
    ["jingle", "You", 1, -20, 0.4], ["whoosh", "watch", 1, -10, 0.3], ["whoosh", "track", 1, -10, 0.3],
    ["tick", "and", 2, 0, 0.25], ["zipper", "laptop", 1, 30, 0.45], ["pop", "powered", 1, 10, 0.4],
  ],
  long_scene3: [
    ["whoosh", "Under", 1, -20, 0.3], ["slide", "goal", 1, -6, 0.35], ["stamp", "checklist", 1, 0, 0.5],
    ["scurry", "websites", 1, -10, 0.35], ["scurry", "files", 1, -10, 0.35], ["scurry", "notes", 1, -10, 0.35],
    ["trickle", "time", 2, 0, 0.3], ["error", "stuck", 1, -20, 0.35], ["bell", "ask", 1, 4, 0.5],
  ],
  long_scene4: [
    ["pop", "persistent", 1, 0, 0.3], ["slap", "correct", 1, 16, 0.5], ["slap", "schedule", 1, 16, 0.5],
    ["slap", "good", 1, 16, 0.5], ["slap", "you", 2, 16, 0.5], ["slap", "Here's", 1, 34, 0.5],
    ["squeak", "delete", 1, 0, 0.45], ["stamp", "memory", 2, 0, 0.5], ["whoosh", "eraser", 1, -20, 0.3],
    ["shredder", "resetting", 1, 0, 0.45],
  ],
  long_scene5: [
    ["alert", "Now", 1, 0, 0.35], ["stamp", "Now", 1, 6, 0.4], ["slide", "emailing", 1, -20, 0.35],
    ["slide", "tricked", 1, -20, 0.35], ["pop", "money", 1, 0, 0.4], ["slide", "OpenAI", 1, 0, 0.3],
    ["slam", "held", 1, -2, 0.55],
  ],
  long_scene6: [
    ["stamp", "cage", 1, 0, 0.3], ["padlock", "locked", 1, -2, 0.5], ["padlock", "locked", 1, 10, 0.5],
    ["pop", "Second", 1, 0, 0.3], ["scanner", "inspects", 1, 0, 0.35], ["clank", "catching", 1, 30, 0.45],
    ["pop", "Wallet", 1, -10, 0.35], ["chime", "control", 1, 2, 0.5],
  ],
  long_scene7: [
    ["pop", "biggest", 1, 0, 0.3], ["whoosh", "For", 1, 0, 0.3], ["typing", "prompt", 1, -20, 0.25],
    ["whoosh", "Starting", 1, -10, 0.3], ["printer", "delegation", 1, 0, 0.35], ["toggle", "switch", 1, 0, 0.55],
    ["outro", "If", 1, 0, 0.25],
  ],
};

export const Sfx: React.FC<{ scene: SceneKey }> = ({ scene }) => {
  const cue = useCues(scene);
  return (
    <>
      {CUES[scene].map(([s, w, n, off, vol], i) => (
        <Sequence key={i} from={Math.max(0, cue(w, n) + off)} layout="none">
          <Audio src={staticFile(`sfx-dots/${s}.mp3`)} volume={vol} />
        </Sequence>
      ))}
    </>
  );
};
