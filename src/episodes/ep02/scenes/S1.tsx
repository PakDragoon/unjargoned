import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow, StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey } from "../../../shared/Dot";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S1");

// Times (s) from the S1 word timings in captions.json. Re-voice S1 → re-check these.
const T = {
  question: 0.4, answer: 2.8, wordByWord: 5.7, where: 6.6, person: 8.5, personX: 9.5, page: 10.6, pageX: 11.6,
  lookup: 12.7, lookupX: 15.0, soWhere: 16.5, test: 19.2, sentence: 20.4, blankFill: 25.0, didnt: 25.8,
};

const TRACK: MoodKey[] = [
  { at: 0, mood: "neutral" },
  { at: sec(T.where), mood: "curious" },
  { at: sec(T.soWhere), mood: "intrigued" },
  { at: sec(T.test), mood: "neutral" },
  { at: sec(T.didnt), mood: "smug" },
];

const ANSWER = "Rainbows form when sunlight passes through raindrops. Each drop bends the light and splits it into colours.";

/** Three simple drawn ideas that get crossed out. */
const Person: React.FC = () => (
  <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden>
    <circle cx={100} cy={58} r={34} fill={colors.subtext} />
    <path d="M 44 150 Q 44 100 100 100 Q 156 100 156 150 Z" fill={colors.subtext} />
    <rect x={28} y={150} width={144} height={30} rx={8} fill={colors.lineStrong} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={40 + i * 26} y={158} width={18} height={6} rx={3} fill={colors.panel} />
    ))}
  </svg>
);
const WebPage: React.FC = () => (
  <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden>
    <rect x={20} y={30} width={160} height={140} rx={16} fill="none" stroke={colors.subtext} strokeWidth={10} />
    <line x1={20} y1={64} x2={180} y2={64} stroke={colors.subtext} strokeWidth={10} />
    {[92, 116, 140].map((y, i) => (
      <rect key={y} x={44} y={y - 5} width={i === 2 ? 70 : 112} height={10} rx={5} fill={colors.lineStrong} />
    ))}
  </svg>
);
const Magnifier: React.FC = () => (
  <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden>
    <circle cx={86} cy={86} r={52} fill="none" stroke={colors.subtext} strokeWidth={14} />
    <line x1={124} y1={124} x2={172} y2={172} stroke={colors.subtext} strokeWidth={20} strokeLinecap="round" />
  </svg>
);

const Idea: React.FC<{ o: number; crossed: number; label: string; children: React.ReactNode }> = ({ o, crossed, label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: o, transform: `scale(${0.7 + 0.3 * Math.min(1, o)})` }}>
    <div style={{ position: "relative", opacity: 1 - crossed * 0.45 }}>
      {children}
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ position: "absolute", left: 0, top: 0 }} aria-hidden>
        <line x1={24} y1={176} x2={24 + 152 * crossed} y2={176 - 152 * crossed} stroke={colors.coral} strokeWidth={16} strokeLinecap="round" opacity={crossed > 0 ? 1 : 0} />
      </svg>
    </div>
    <div style={{ fontSize: 44, fontWeight: 600, color: colors.subtext }}>{label}</div>
  </div>
);

const S1Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Chat window: centred, then slides left to make room for the three ideas.
  const chatO = 1 - ramp(frame, T.soWhere, 0.4);
  const slide = ramp(frame, T.where, 0.6);
  const chatX = interpolate(slide, [0, 1], [0, -330]);
  const chatScale = interpolate(slide, [0, 1], [1, 0.9]);

  const ideasO = during(frame, T.where + 0.3, T.soWhere, 0.4);
  const qO = during(frame, T.soWhere + 0.2, T.test, 0.3);
  const blankO = ramp(frame, T.test, 0.4);
  const time = pop(frame, T.blankFill);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      {/* The chat that answers "word by word" */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: chatO }}>
        <div style={{ transform: `translateX(${chatX}px) scale(${chatScale})` }}>
          <ChatWindow width={1000} height={640}>
            <ChatBubble from="me" o={pop(frame, T.question)}>How do rainbows form?</ChatBubble>
            <ChatBubble from="ai" o={frame >= sec(T.answer) ? 1 : 0}>
              <StreamText text={ANSWER} frame={frame} from={sec(T.answer)} to={sec(T.wordByWord)} />
            </ChatBubble>
          </ChatWindow>
        </div>
      </AbsoluteFill>

      {/* Not a person, not a web page, not a search */}
      <div style={{ position: "absolute", right: 140, top: 200, display: "flex", flexDirection: "column", gap: 28, opacity: ideasO }}>
        <Idea o={pop(frame, T.person)} crossed={ramp(frame, T.personX, 0.3)} label="a person typing">
          <Person />
        </Idea>
        <div style={{ display: "flex", gap: 40 }}>
          <Idea o={pop(frame, T.page)} crossed={ramp(frame, T.pageX, 0.3)} label="a web page">
            <WebPage />
          </Idea>
          <Idea o={pop(frame, T.lookup)} crossed={ramp(frame, T.lookupX, 0.3)} label="a search">
            <Magnifier />
          </Idea>
        </div>
      </div>

      {/* So where does it come from? */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: qO }}>
        <div style={{ fontSize: 110, fontWeight: 800, textAlign: "center" }}>
          So where does it <span style={{ color: colors.yellow }}>come from?</span>
        </div>
      </AbsoluteFill>

      {/* Quick test */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: blankO, flexDirection: "column", gap: 40 }}>
        <div style={{ fontSize: 56, fontWeight: 600, color: colors.subtext, opacity: ramp(frame, T.test, 0.3) }}>Finish this sentence:</div>
        <div style={{ fontSize: 150, fontWeight: 800, display: "flex", alignItems: "baseline", gap: 36, opacity: ramp(frame, T.sentence, 0.4) }}>
          <span>Once upon a</span>
          <span style={{ position: "relative", display: "inline-block", width: 380, textAlign: "center" }}>
            <span style={{ color: colors.yellow, display: "inline-block", transform: `scale(${time})`, opacity: Math.min(1, time) }}>time</span>
            <span style={{ position: "absolute", left: 0, right: 0, bottom: -6, height: 12, borderRadius: 6, backgroundColor: colors.yellow }} />
          </span>
        </div>
      </AbsoluteFill>

      <Dot x={1560} y={900} track={TRACK} seed="s1" look={{ x: 0, y: -0.15 }} />
    </AbsoluteFill>
  );
};

// Scene S1 — hook. Edit only this file for S1 changes.
export const S1: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <S1Content />
  </SceneShell>
);
