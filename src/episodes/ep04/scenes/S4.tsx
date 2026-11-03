import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { ChatBubble, ChatWindow } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { Figure, NoteIcon, Notebook } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S4");

// Times (s) from the S4 word timings in captions.json. Re-voice S4 → re-check these.
const T = {
  remember: 0.9, surprise: 2.74, doesnt: 4.3, newChat: 5.66, fresh: 6.76, first: 8.64,
  how: 10.22, mushrooms: 12.0, notebook: 13.26, say: 14.68, writes: 16.62, down: 17.02, next: 17.84, answers: 19.2, reads: 20.22, notes: 20.68,
  believes: 22.4, there: 23.32, even: 24.18, old: 25.08, wrong: 25.48, thatsWhy: 26.26, open: 28.06, delete: 28.98, line: 29.68, switch: 30.26, off: 30.64,
  isnt: 31.72, remembering: 32.22, its: 33.44, reading: 33.72,
};

// Phases: one chat, then a blank new chat (the brain forgot) → the notebook: write, then read first → it believes old
// notes too → you can open, delete, switch off → record scratch: "It's reading" (notebook swings to camera).
const P = { forget: [0, 9.9], note: [9.9, 21.9], old: [21.9, 26.15], controls: [26.15, 31.5], read: [31.5, 99] } as const;

const FIG = { left: 150, top: 330, size: 600 };
const K = FIG.size / 900;
const JAR = { x: FIG.left + 300 * K, y: FIG.top + 170 * K };

const NB = { left: 640, top: 300, w: 240 }; // notebook beside the figure (phase 2–3)
const NB_C = { left: 790, top: 220, w: 340 }; // turned to the viewer (phase 4)
const lineY = (nb: { top: number; w: number }, i: number) => nb.top + nb.w * 0.16 + nb.w * 0.085 + i * nb.w * 0.24;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.doesnt), mood: "surprised" },
  { at: sec(T.newChat + 0.2), mood: "confused" },
  { at: sec(T.notebook), mood: "aha" },
  { at: sec(T.writes), mood: "happy" },
  { at: sec(T.believes), mood: "curious" },
  { at: sec(T.old), mood: "deadpan" },
  { at: sec(T.thatsWhy), mood: "neutral" },
  { at: sec(T.delete), mood: "smug" },
  { at: sec(T.isnt), mood: "neutral" },
  { at: sec(T.its), mood: "smug" },
];

const ROUTE = hops([
  { at: 0, x: 1720, y: 950 },
  { at: sec(T.newChat + 0.3), x: 1620, y: 920 },
  { at: sec(T.notebook - 0.4), x: 690, y: 820 }, // under the notebook
  { at: sec(T.believes - 0.3), x: 1250, y: 930 },
  { at: sec(T.delete - 0.4), x: 1330, y: 650 }, // beside the bin: bins the line itself
  { at: sec(T.isnt - 0.2), x: 1440, y: 880 },
]);
const LOOK = glances([
  { at: 0, x: 0.2, y: -0.8 },
  { at: sec(T.doesnt - 0.2), x: -0.9, y: -0.6 }, // the eraser on the jar
  { at: sec(T.newChat + 0.3), x: -0.2, y: -0.8 },
  { at: sec(T.notebook - 0.4), x: -0.6, y: -0.3 },
  { at: sec(T.next), x: 0.6, y: -0.7 },
  { at: sec(T.reads), x: -0.9, y: -0.9 }, // the line flying into the jar
  { at: sec(T.believes - 0.3), x: 0.3, y: -0.8 },
  { at: sec(T.delete - 0.4), x: -0.8, y: 0 },
  { at: sec(T.isnt - 0.2), x: -0.8, y: -0.5 },
]);

/** A notebook line lifting out and flying into the jar (icon + a short line). */
const FlyingNote: React.FC<{ from: { x: number; y: number }; k: number; icon: "mushroom" | "dog" }> = ({ from, k, icon }) => {
  const e = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, k)));
  const x = from.x + (JAR.x - from.x) * e;
  const y = from.y + (JAR.y - from.y) * e - Math.sin(e * Math.PI) * 140;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${1 - 0.5 * e})`, opacity: k > 0 && k < 1 ? 1 : 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 14, backgroundColor: "#F3EBDD", boxShadow: `0 0 24px ${colors.yellow}` }}>
        <NoteIcon kind={icon} size={44} crossed />
        <div style={{ width: 70, height: 9, borderRadius: 5, backgroundColor: "rgba(20,22,28,0.3)" }} />
      </div>
    </div>
  );
};

const S4Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const f = (r: readonly [number, number], d = 0.3) => during(frame, r[0], r[1], d);

  // forget
  const erase = ramp(frame, T.doesnt - 0.2, 0.8);
  const eraserO = during(frame, T.doesnt - 0.3, T.doesnt + 0.75, 0.12);
  const blankIn = ramp(frame, T.newChat - 0.15, 0.45);

  // notebook (beside the figure, then turned to the viewer)
  const nbIn = ramp(frame, T.say - 0.2, 0.4);
  const turn = ramp(frame, T.thatsWhy, 0.7);
  const nb = {
    left: interpolate(turn, [0, 1], [NB.left, NB_C.left]),
    top: interpolate(turn, [0, 1], [NB.top, NB_C.top]),
    w: interpolate(turn, [0, 1], [NB.w, NB_C.w]),
  };
  const writing = t > T.writes - 0.2 && t < T.down + 0.4;
  const mushO = ramp(frame, T.writes - 0.1, 0.5);
  const dogO = ramp(frame, T.even - 0.3, 0.3);
  const dogGone = ramp(frame, T.delete + 0.2, 0.45);
  const scratch = ramp(frame, T.isnt - 0.15, 0.5); // notebook swings to camera
  const reading = during(frame, T.its - 0.1, 99, 0.3);

  const mushFly = interpolate(t, [T.answers - 0.1, T.reads + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dogFly = interpolate(t, [T.there + 0.6, T.old + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jarGlow = Math.max(during(frame, T.reads + 0.2, T.notes + 0.6, 0.15), during(frame, T.old, T.wrong + 0.3, 0.15));

  // chat states: 0 first chat, 1 blank (forgot), 2 pizza (with notes), 3 dog reply
  const chatO = Math.max(f([0, T.how - 0.2]), f([T.say - 0.3, T.next - 0.1]), f([T.next - 0.1, P.old[1]]));
  const mode = t < T.how - 0.2 ? (blankIn > 0 ? 1 : 0) : t < T.next - 0.1 ? 0 : 2;
  const toggle = ramp(frame, T.switch, 0.25);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <QuestionStrip active={1} answered={1} />

      {/* The figure (hands + eyes; the notebook drops into the pocket) */}
      <div style={{ position: "absolute", left: FIG.left, top: FIG.top, opacity: 1 - ramp(frame, T.thatsWhy - 0.2, 0.5) }}>
        <Figure size={FIG.size} hands={1} eyes={1} notebook={t < T.notebook - 0.05 ? 0 : pop(frame, T.notebook)} look={{ x: 0.9, y: -0.2 }} glow={jarGlow} />
      </div>
      {/* eraser wipes across the brain */}
      <div style={{ position: "absolute", left: JAR.x - 120 + 220 * erase, top: JAR.y - 40 + Math.sin(erase * 18) * 18, opacity: eraserO, transform: "rotate(-18deg)" }}>
        <div style={{ width: 120, height: 66, borderRadius: 12, backgroundColor: "#F49AB0", boxShadow: "inset -22px 0 0 #6F86E0" }} />
      </div>
      <div style={{ position: "absolute", left: JAR.x - 110, top: JAR.y - 70, width: 220 * erase, height: 140, borderRadius: 30, backgroundColor: colors.white, opacity: 0.35 * eraserO }} />

      {/* Chat windows */}
      <div style={{ position: "absolute", left: 900, top: 220, opacity: chatO }}>
        <ChatWindow width={860} height={620}>
          {mode === 0 ? <ChatBubble from="me" o={pop(frame, t < T.how ? 0.5 : T.say - 0.1)} fontSize={50}>I hate mushrooms.</ChatBubble> : null}
          {mode === 2 ? (
            <>
              <ChatBubble from="me" o={pop(frame, T.next + 0.1)} fontSize={50}>Pizza for tonight?</ChatBubble>
              {t < T.old ? (
                <ChatBubble from="ai" o={pop(frame, T.notes + 0.1)} fontSize={50}>Mushroom-free pizza, then?</ChatBubble>
              ) : (
                <ChatBubble from="ai" o={pop(frame, T.old)} fontSize={50}>Sorry, I know you don't like dogs!</ChatBubble>
              )}
            </>
          ) : null}
        </ChatWindow>
        {/* the new, blank chat slides over the first */}
        {mode === 1 ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - blankIn) * 1000}px)` }}>
            <ChatWindow width={860} height={620}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: colors.subtext, fontWeight: 600, opacity: ramp(frame, T.fresh, 0.3) }}>New chat</div>
            </ChatWindow>
          </div>
        ) : null}
      </div>

      {/* "How does it know?" — a mushroom with a question beside the jar */}
      <div style={{ position: "absolute", left: JAR.x + 140, top: JAR.y - 200, opacity: during(frame, T.how, T.notebook + 0.2, 0.2), transform: `scale(${Math.min(1, pop(frame, T.how))})`, display: "flex", alignItems: "center", gap: 8 }}>
        <NoteIcon kind="mushroom" size={90} />
        <div style={{ fontSize: 90, fontWeight: 800, color: colors.yellow }}>?</div>
      </div>

      {/* The notebook */}
      <div
        style={{
          position: "absolute", left: nb.left, top: nb.top, opacity: nbIn,
          transform: `perspective(1400px) translateY(${120 * scratch}px) rotateY(${-14 * (1 - turn)}deg) scale(${1 + 0.55 * scratch})`, transformOrigin: "50% 50%",
          filter: reading > 0 ? `drop-shadow(0 0 ${40 * reading}px rgba(255,201,60,0.6))` : undefined,
        }}
      >
        <Notebook
          w={nb.w}
          open={ramp(frame, T.say, 0.5)}
          lines={[
            { icon: "mushroom", crossed: true, o: mushO, glow: Math.max(during(frame, T.answers - 0.3, T.reads + 0.3, 0.2), reading) },
            { icon: "dog", crossed: true, o: dogO, gone: dogGone, glow: during(frame, T.there + 0.3, T.old + 0.2, 0.2) },
          ]}
        />
        {/* pencil while writing */}
        <svg style={{ position: "absolute", left: nb.w * 0.55 + (writing ? Math.sin(frame * 1.8) * 16 : 0), top: lineY({ top: 0, w: nb.w }, 0) - 150, opacity: during(frame, T.writes - 0.4, T.down + 0.6, 0.15), transform: "rotate(30deg)" }} width={34} height={150} viewBox="0 0 40 170" aria-hidden>
          <rect x={6} y={0} width={28} height={24} rx={6} fill={colors.coral} />
          <rect x={6} y={24} width={28} height={112} fill={colors.yellow} />
          <path d="M 6 136 L 34 136 L 20 168 Z" fill="#F3EBDD" />
        </svg>
      </div>
      <FlyingNote from={{ x: NB.left + NB.w * 0.4, y: lineY(NB, 0) }} k={mushFly} icon="mushroom" />
      <FlyingNote from={{ x: NB.left + NB.w * 0.4, y: lineY(NB, 1) }} k={dogFly} icon="dog" />

      {/* Controls: a bin for the old line, a big switch */}
      <AbsoluteFill style={{ opacity: f(P.controls) }}>
        <svg style={{ position: "absolute", left: 1180, top: 560 }} width={120} height={140} viewBox="0 0 120 140" aria-hidden>
          <rect x={14} y={30} width={92} height={104} rx={14} fill={colors.lineStrong} />
          <rect x={4} y={14} width={112} height={18} rx={9} fill={colors.subtext} transform={`rotate(${-25 * during(frame, T.delete, T.line + 0.3, 0.15)} 10 24)`} />
          {[40, 60, 80].map((x) => <rect key={x} x={x - 3} y={48} width={6} height={70} rx={3} fill={colors.ink} opacity={0.6} />)}
        </svg>
        <div style={{ position: "absolute", left: 1180, top: 330, width: 220, height: 110, borderRadius: 55, backgroundColor: toggle > 0.5 ? colors.lineStrong : colors.mint, border: `6px solid ${colors.line}`, opacity: ramp(frame, T.switch - 0.6, 0.3) }}>
          <div style={{ position: "absolute", top: 8, left: 8 + 110 * (1 - toggle), width: 82, height: 82, borderRadius: 41, backgroundColor: colors.white }} />
        </div>
      </AbsoluteFill>

      {/* Dot's new dog (the old note is wrong) */}
      <div style={{ position: "absolute", left: 1250 - 170, top: 930 - 30, opacity: during(frame, T.old - 0.2, T.thatsWhy + 0.2, 0.2) }}>
        <NoteIcon kind="dog" size={90} />
      </div>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s4" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S4 — second stop: does it remember you? Edit only this file for S4 changes.
export const S4: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S4Content />
    </LineWipeIn>
  </SceneShell>
);
