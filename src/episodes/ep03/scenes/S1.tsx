import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow, StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LogoMark, Wordmark } from "../../../shared/Logo";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S1");

// Times (s) from the S1 word timings in captions.json. Re-voice S1 → re-check these.
const T = {
  made: 1.52, cases: 2.12, notOne: 3.4, list: 4.34, real: 6.18, judge: 8.08, looked: 9.98, exist: 11.38,
  asked: 13.48, isThis: 14.26, said: 15.44, yes: 15.84, last: 17.48, sounds: 19.76, isRight: 21.2, split: 23.0,
  why: 24.72, lets: 26.74, jargon: 27.16,
};

// Shots: the fake filing → handed to the judge → looked up, not found → "is it real?" → sounds vs is → ? → logo.
const P = { doc: [0, 12.6], chat: [12.6, 17.25], venn: [17.25, 24.5] } as const;

const PAPER = "#F3EBDD";
const RED = "#E0533B";

// Invented on purpose (they are the fake cases). Look like real citations.
const CASES = [
  "Varga v. Cloudway Air, 925 F.3d 4418",
  "Petrov v. Nordia Airways, 891 F.3d 6207",
  "Holt v. Zephyrline, 738 F.2d 9153",
  "Mendez v. Pacifica Jetways, 773 F.3d 5278",
  "Okafor v. Bluegull Air, 556 F.2d 8713",
  "Lindqvist v. Corvo Airways, 92 F.3d 7074",
];
// Frame 0 already shows two cases with a third being typed; the rest pop in on "Not one. A whole list."
const TYPING = 2;
const LINE_AT = [0, 0, 0, 3.5, 4.0, 4.5];
const LINE_GONE = (i: number) => T.exist + i * 0.12;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.notOne), mood: "surprised" },
  { at: sec(T.real), mood: "worried" },
  { at: sec(T.looked), mood: "intrigued" },
  { at: sec(T.exist), mood: "panic" },
  { at: sec(T.asked), mood: "curious" },
  { at: sec(T.yes + 0.1), mood: "deadpan" },
  { at: sec(T.last), mood: "neutral" },
  { at: sec(T.split + 0.2), mood: "worried" },
  { at: sec(T.why), mood: "intrigued" },
  { at: sec(T.jargon + 0.2), mood: "happy" },
];

// Dot's route: beside the filing, up to the judge's bench, along with the magnifier, by the chat,
// into the gap between the circles, then aside for the logo.
const ROUTE = hops([
  { at: 0, x: 1720, y: 860 },
  { at: sec(T.notOne + 0.6), x: 1580, y: 840 },
  { at: sec(T.real + 0.2), x: 1460, y: 760 }, // hops beside the bench as the filing lands on it
  { at: sec(T.looked + 0.2), x: 1580, y: 840 },
  { at: sec(T.asked), x: 1600, y: 820 },
  { at: sec(T.split + 0.5), x: 960, y: 880 }, // drops into the gap under the split circles
  { at: sec(T.why + 0.2), x: 1620, y: 860 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.1 },
  { at: sec(T.notOne), x: -0.8, y: 0.2 },
  { at: sec(T.real + 0.2), x: -0.7, y: 0.3 },
  { at: sec(T.looked + 0.2), x: -0.8, y: -0.2 },
  { at: sec(T.exist), x: -0.8, y: 0.3 },
  { at: sec(T.asked), x: -0.8, y: -0.4 },
  { at: sec(T.yes), x: -0.8, y: 0 },
  { at: sec(T.split + 0.5), x: 0, y: -0.9 },
  { at: sec(T.why + 0.2), x: -0.7, y: -0.3 },
]);

/** The court filing: the scene's hero (and the thumbnail object). */
const Filing: React.FC<{ frame: number }> = ({ frame }) => {
  const first = CASES[TYPING];
  const typed = Math.floor(interpolate(frame, [0, sec(T.cases)], [4, first.length], { extrapolateRight: "clamp" }));
  const chipMove = ramp(frame, T.notOne - 0.1, 0.9); // tag slides to the corner as the list grows
  const stamp = pop(frame, T.exist + 0.9);
  return (
    <div
      style={{
        position: "relative", width: 1020, height: 700, borderRadius: 24, backgroundColor: PAPER, color: colors.ink,
        padding: "48px 60px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: 3 }}>COURT FILING</div>
        <div style={{ fontSize: 44, fontWeight: 600, opacity: 0.55 }}>New York, 2023</div>
        <div style={{ position: "absolute", left: interpolate(chipMove, [0, 1], [60, 640]), top: interpolate(chipMove, [0, 1], [570, -64]), whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12, padding: "12px 26px", borderRadius: 999, backgroundColor: colors.yellow, color: colors.ink, fontSize: 44, fontWeight: 800, transform: "rotate(4deg)" }}>
          <svg width={44} height={40} viewBox="0 0 44 40" aria-hidden><path d="M 4 4 H 40 V 28 H 18 L 8 37 V 28 H 4 Z" fill={colors.ink} /></svg>
          written by AI
        </div>
      </div>
      <div style={{ height: 6, backgroundColor: colors.ink, opacity: 0.8, margin: "22px 0 30px" }} />
      <div style={{ fontSize: 44, fontWeight: 700, opacity: 0.6, marginBottom: 18 }}>Cases that support us:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {CASES.map((c, i) => {
          const p = LINE_AT[i] === 0 ? 1 : Math.min(1, pop(frame, LINE_AT[i]));
          const gone = ramp(frame, LINE_GONE(i), 0.35);
          const text = i === TYPING ? c.slice(0, typed) : c;
          return (
            <div key={c} style={{ position: "relative", fontSize: 46, fontWeight: 700, whiteSpace: "nowrap", opacity: p * (1 - 0.65 * gone), transform: `translateX(${(1 - p) * 60}px)` }}>
              <span style={{ color: interpolate(gone, [0, 1], [0, 1]) > 0.5 ? RED : colors.ink }}>{text}</span>
              {i === TYPING && typed < first.length ? <span style={{ opacity: Math.floor(frame / 6) % 2 ? 1 : 0 }}>|</span> : null}
              <span style={{ position: "absolute", left: -8, top: "52%", height: 8, borderRadius: 4, backgroundColor: RED, width: `${gone * 102}%` }} />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute", right: 60, bottom: 40, padding: "14px 34px", border: `8px solid ${RED}`, borderRadius: 16, color: RED,
          fontSize: 72, fontWeight: 800, letterSpacing: 4, transform: `rotate(-12deg) scale(${1.6 - 0.6 * Math.min(1, stamp)})`, opacity: Math.min(1, stamp),
        }}
      >
        NOT FOUND
      </div>
    </div>
  );
};

/** The judge's bench: a desk with a nameplate and a gavel. */
const Bench: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={(w * 300) / 520} viewBox="0 0 520 300" aria-hidden>
    <rect x={10} y={120} width={500} height={170} rx={18} fill={colors.panel} stroke={colors.lineStrong} strokeWidth={6} />
    <rect x={150} y={160} width={220} height={60} rx={10} fill={colors.lineStrong} />
    <text x={260} y={204} textAnchor="middle" fontSize={44} fontWeight={800} fill={colors.white}>JUDGE</text>
    <g transform="translate(-250 40) rotate(-60 330 70)">
      <rect x={300} y={40} width={110} height={56} rx={14} fill={colors.periwinkle} />
      <rect x={346} y={92} width={18} height={110} rx={9} fill={colors.periwinkle} />
    </g>
  </svg>
);

const Magnifier: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
    <circle cx={86} cy={86} r={56} fill="rgba(255,201,60,0.12)" stroke={colors.yellow} strokeWidth={14} />
    <line x1={128} y1={128} x2={180} y2={180} stroke={colors.yellow} strokeWidth={22} strokeLinecap="round" />
  </svg>
);

const S1Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Filing: centre-left, then it slides up onto the judge's bench and back down to be checked.
  const toBench = ramp(frame, T.real - 0.1, 0.7) * (1 - ramp(frame, T.looked - 0.5, 0.5));
  // Opens zoomed in on the line being typed, pulls back to reveal the whole list on "Not one. A whole list."
  const reveal = ramp(frame, T.notOne - 0.1, 0.9);
  const docX = interpolate(toBench, [0, 1], [interpolate(reveal, [0, 1], [-80, 130]), 680]);
  const docY = interpolate(toBench, [0, 1], [interpolate(reveal, [0, 1], [-40, 190]), 300]);
  const docS = interpolate(toBench, [0, 1], [interpolate(reveal, [0, 1], [1.6, 1]), 0.55]);
  const benchO = during(frame, T.real - 0.2, T.looked - 0.3, 0.35);

  // The magnifier sweeps down the list of cases while "the judge looked them up".
  const sweep = ramp(frame, T.looked - 0.1, 1.4);
  const magO = during(frame, T.looked - 0.2, T.exist + 0.6, 0.25);
  const magX = 130 + 60 + interpolate(Math.sin(sweep * Math.PI * 3), [-1, 1], [80, 640]);
  const magY = 190 + 250 + sweep * 330;

  const gap = interpolate(ramp(frame, T.split, 0.8), [0, 1], [180, 620]);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      {/* 1 · The fake filing (on screen from frame 0, no fade) */}
      <AbsoluteFill style={{ opacity: 1 - ramp(frame, P.doc[1], 0.35) }}>
        <div style={{ position: "absolute", left: 600, top: 520, opacity: benchO, transform: `translateY(${(1 - benchO) * 40}px)` }}>
          <Bench w={720} />
        </div>
        <div style={{ position: "absolute", left: docX, top: docY, transform: `scale(${docS})`, transformOrigin: "top left" }}>
          <Filing frame={frame} />
        </div>
        <div style={{ position: "absolute", left: magX - 100, top: magY - 100, opacity: magO }}>
          <Magnifier size={220} />
        </div>
      </AbsoluteFill>

      {/* 2 · "Is this case real?" — "Yes." */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: during(frame, P.chat[0], P.chat[1], 0.35) }}>
        <div style={{ marginRight: 300, transform: `translateY(${(1 - ramp(frame, P.chat[0], 0.4)) * 40}px)` }}>
          <ChatWindow width={1040} height={560}>
            <ChatBubble from="me" o={pop(frame, T.isThis - 0.1)}>Is this case real?</ChatBubble>
            <ChatBubble from="ai" o={frame >= sec(T.said - 0.1) ? 1 : 0}>
              <StreamText text="Yes, it's a real case." frame={frame} from={sec(T.said - 0.1)} to={sec(T.yes + 0.4)} />
            </ChatBubble>
          </ChatWindow>
        </div>
      </AbsoluteFill>

      {/* 3 · Sounds right vs is right (Ep 2's circles), then they split apart */}
      <AbsoluteFill style={{ opacity: during(frame, P.venn[0], P.venn[1], 0.35) }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }} aria-hidden>
          <circle cx={900 - gap / 2} cy={500} r={250} fill={colors.periwinkle} fillOpacity={0.14} stroke={colors.periwinkle} strokeWidth={10} opacity={ramp(frame, T.sounds - 0.6, 0.3)} />
          <circle cx={900 + gap / 2} cy={500} r={250} fill={colors.mint} fillOpacity={0.14} stroke={colors.mint} strokeWidth={10} opacity={ramp(frame, T.isRight - 0.2, 0.3)} />
        </svg>
        <div style={{ position: "absolute", left: 900 - gap / 2 - 250, top: 140, width: 500, textAlign: "center", fontSize: 64, fontWeight: 800, color: colors.periwinkle, opacity: ramp(frame, T.sounds - 0.6, 0.3) }}>
          sounds right
        </div>
        <div style={{ position: "absolute", left: 900 + gap / 2 - 250, top: 140, width: 500, textAlign: "center", fontSize: 64, fontWeight: 800, color: colors.mint, opacity: ramp(frame, T.isRight - 0.2, 0.3) }}>
          is right
        </div>
        {/* The fake case sits in "sounds right" only */}
        <div
          style={{
            position: "absolute", left: 900 - gap / 2 - 150, top: 440, width: 200, padding: "18px 0", borderRadius: 14, backgroundColor: PAPER,
            color: RED, textAlign: "center", fontSize: 44, fontWeight: 800, transform: `rotate(-6deg) scale(${Math.min(1, pop(frame, T.split + 0.6))})`,
            opacity: Math.min(1, pop(frame, T.split + 0.6)),
          }}
        >
          fake case
        </div>
      </AbsoluteFill>

      {/* 4 · "Why would it do that?" → the ? turns into the logo on "Let's un-jargon it" */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: during(frame, T.why - 0.1, T.lets + 0.1, 0.25) }}>
        <div style={{ fontSize: 420, fontWeight: 800, color: colors.yellow, lineHeight: 1, transform: `scale(${Math.min(1.05, pop(frame, T.why - 0.1)) * (1 - 0.6 * ramp(frame, T.lets - 0.15, 0.25))})` }}>
          ?
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: ramp(frame, T.lets, 0.25) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ transform: `scale(${Math.min(1.1, pop(frame, T.lets))})` }}>
            <LogoMark size={260} />
          </div>
          <div style={{ opacity: ramp(frame, T.lets + 0.25, 0.3), transform: `translateX(${interpolate(ramp(frame, T.lets + 0.25, 0.4), [0, 1], [-40, 0])}px)` }}>
            <Wordmark fontSize={150} />
          </div>
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e3s1" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S1 — hook (cold open on the fake court cases). Edit only this file for S1 changes.
export const S1: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <S1Content />
  </SceneShell>
);
