import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { ChatBubble, ChatWindow, StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S5");

// Times (s) from the S5 word timings in captions.json. Re-voice S5 → re-check these.
const T = {
  ask: 1.5, twice: 2.6, answers: 4.4, why: 6.0, top: 8.6, notTop: 9.2, restaurant: 10.6, usual: 13.2, almost: 16.3,
  setting: 18.3, dial: 18.72, temperature: 22.18, adventureDial: 24.48, down: 26.62, every: 28.44, boring: 30.98,
  up: 32.46, adventurous: 33.28, creative: 34.78, tooFar: 35.78, nonsense: 36.9, keeps: 38.6, word: 41.82,
  after: 43.1, end: 44.42,
};

const TRACK: MoodKey[] = [
  { at: 0, mood: "neutral" },
  { at: sec(T.answers), mood: "surprised" },
  { at: sec(T.why), mood: "curious" },
  { at: sec(T.usual), mood: "happy" },
  { at: sec(T.almost), mood: "intrigued" },
  { at: sec(T.setting), mood: "neutral" },
  { at: sec(T.boring), mood: "deadpan" },
  { at: sec(T.up), mood: "intrigued" },
  { at: sec(T.nonsense), mood: "panic" },
  { at: sec(T.keeps), mood: "relieved" },
  { at: sec(T.word), mood: "curious" },
];

const PAPER = "#F3EBDD";
const DISHES = [
  { name: "Pasta", p: 0.62, note: "your usual" },
  { name: "Curry", p: 0.24 },
  { name: "Tacos", p: 0.1 },
  { name: "Ice-cream soup", p: 0.03, nonsense: true },
];

/** Which dish the ring is on at a given time (null = no ring). */
const ringAt = (s: number): number | null => {
  if (s >= T.usual && s < T.almost) return 0;
  if (s >= T.almost && s < T.setting) return 1;
  if (s >= T.every && s < T.up) return 0;
  if (s >= T.up + 0.5 && s < T.adventurous + 0.5) return 1;
  if (s >= T.adventurous + 0.5 && s < T.creative) return 2;
  if (s >= T.creative && s < T.nonsense) return 1;
  if (s >= T.nonsense && s < T.keeps) return 3;
  return null;
};

/** Temperature 0–1 over the scene. */
const tempAt = (frame: number) => {
  const keys: [number, number][] = [
    [T.setting, 0.35], [T.down, 0.35], [T.down + 0.5, 0.05], [T.up, 0.05], [T.up + 0.6, 0.6],
    [T.tooFar, 0.6], [T.tooFar + 0.6, 1], [T.keeps, 1], [T.keeps + 0.7, 0.3],
  ];
  return interpolate(frame, keys.map(([s]) => sec(s)), keys.map(([, v]) => v), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

// Dot's route: by the two chats, beside the menu, then it rides the adventure dial (sits on top of the
// fill, so it climbs and drops with the temperature), and hops off when the branching sentences start.
const RIDE_X = 1090 + 190;
const rideY = (frame: number) => Math.max(215, 686 - 456 * tempAt(frame) - 66); // stops below the progress strip
const HOPS = hops([
  { at: 0, x: 1600, y: 900 }, { at: sec(T.answers), x: 1600, y: 900 }, { at: sec(T.restaurant + 0.1), x: 1130, y: 760 },
  { at: sec(T.setting + 0.3), x: RIDE_X, y: rideY(sec(T.setting + 0.3)) },
  { at: sec(T.word + 0.6) - 16, x: RIDE_X, y: 686 - 456 * 0.3 - 66 }, // where the ride ends (dial at "a little")
  { at: sec(T.word + 0.6), x: 1600, y: 900 },
]);
const ridePath = (frame: number) =>
  frame >= sec(T.setting + 0.3) && frame < sec(T.word + 0.6) - 16 ? { x: RIDE_X, y: rideY(frame) } : HOPS.path(frame);
const LOOK = glances([
  { at: 0, x: -0.3, y: -0.2 }, { at: sec(T.restaurant + 0.1), x: -0.7, y: -0.2 }, { at: sec(T.setting + 0.3), x: -0.7, y: 0.1 },
  { at: sec(T.word + 0.6), x: -0.5, y: -0.2 },
]);

const S5Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = frame / 30;

  const chatsO = 1 - ramp(frame, T.why - 0.2, 0.3);
  const optsO = during(frame, T.why, T.restaurant - 0.2, 0.3);
  const menuO = during(frame, T.restaurant, T.word - 0.4, 0.4);
  const sliderO = during(frame, T.setting, T.word - 0.4, 0.4);
  const branchO = ramp(frame, T.word - 0.3, 0.4);
  const temp = tempAt(frame);
  const ring = ringAt(s);
  // The ring "stamps" the usual three times on "every single time".
  const stamp = s >= T.every && s < T.up ? 1 + 0.12 * Math.max(0, Math.sin(((s - T.every) / 0.8) * Math.PI * 2)) : 1;
  const optRing = s < T.notTop ? 0 : 2;

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      <QuestionStrip active={2} />

      {/* Same question, two different answers */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 60, opacity: chatsO }}>
        {["A cat!", "A parrot!"].map((a, i) => (
          <ChatWindow key={a} width={680} height={460} style={{ transform: `translateY(${40}px)` }}>
            <ChatBubble from="me" o={pop(frame, i === 0 ? T.ask : T.twice)}>Name a fun pet.</ChatBubble>
            <ChatBubble from="ai" o={pop(frame, T.answers + i * 0.3)}>
              <span style={{ color: i === 1 ? colors.yellow : colors.white }}>{a}</span>
            </ChatBubble>
          </ChatWindow>
        ))}
      </AbsoluteFill>

      {/* It doesn't always pick the top guess */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: optsO }}>
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div style={{ fontSize: 84, fontWeight: 800 }}>The best pet is a</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "28px 36px", borderRadius: 32, backgroundColor: colors.panel, border: `4px solid ${colors.line}` }}>
            {[["cat", 0.41], ["dog", 0.33], ["parrot", 0.12]].map(([w, p], i) => (
              <div
                key={w}
                style={{
                  display: "flex", alignItems: "center", gap: 24, padding: "6px 16px", borderRadius: 20,
                  boxShadow: i === optRing && s >= T.top ? `0 0 0 6px ${colors.yellow}` : "none",
                }}
              >
                <div style={{ width: 170, fontSize: 56, fontWeight: 700 }}>{w}</div>
                <div style={{ width: 360 * (p as number) * ramp(frame, T.why + 0.2 + i * 0.1, 0.4), height: 30, borderRadius: 15, backgroundColor: i === 0 ? colors.yellow : colors.lineStrong }} />
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      {/* The restaurant menu */}
      <div style={{ position: "absolute", left: 200, top: 200, opacity: menuO, transform: `translateY(${(1 - menuO) * 30}px)` }}>
        <div style={{ width: 820, borderRadius: 28, backgroundColor: PAPER, color: colors.ink, padding: "44px 56px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 8, textAlign: "center", marginBottom: 30 }}>MENU</div>
          {DISHES.map((d, i) => {
            const on = ring === i;
            const nonsenseO = d.nonsense ? 0.35 + 0.65 * ramp(frame, T.tooFar, 0.4) : 1;
            return (
              <div
                key={d.name}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", margin: "6px 0",
                  borderRadius: 24, opacity: nonsenseO,
                  boxShadow: on ? `0 0 0 8px ${d.nonsense ? colors.coral : colors.yellow}` : "none",
                  transform: on ? `scale(${stamp})` : "none",
                }}
              >
                <div style={{ fontSize: 56, fontWeight: 700, color: d.nonsense ? "#C9452E" : colors.ink }}>
                  {d.name}
                  {d.note ? <span style={{ fontSize: 44, fontWeight: 600, opacity: 0.55 }}> · {d.note}</span> : null}
                </div>
                <div style={{ width: 200, height: 24, borderRadius: 12, backgroundColor: "rgba(20,22,28,0.12)" }}>
                  <div style={{ width: 200 * Math.max(0.04, d.p), height: 24, borderRadius: 12, backgroundColor: d.nonsense ? "#C9452E" : colors.ink }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 34, textAlign: "center", fontSize: 56, fontWeight: 600, color: colors.subtext, opacity: during(frame, T.boring, T.up, 0.3) }}>
          safe, but a bit boring
        </div>
        <div style={{ marginTop: -70, textAlign: "center", fontSize: 56, fontWeight: 600, color: colors.coral, opacity: during(frame, T.nonsense, T.keeps, 0.3) }}>
          too hot: nonsense
        </div>
      </div>

      {/* Temperature slider */}
      <div style={{ position: "absolute", left: 1090, width: 380, top: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, opacity: sliderO }}>
        <div style={{ position: "relative", width: 64, height: 520, borderRadius: 32, backgroundColor: colors.panel, border: `4px solid ${colors.line}` }}>
          <div
            style={{
              position: "absolute", left: 8, right: 8, bottom: 8, height: 40 + temp * 456, borderRadius: 24,
              background: `linear-gradient(to top, ${colors.periwinkle}, ${temp > 0.8 ? colors.coral : colors.yellow})`,
            }}
          />
          <div
            style={{
              position: "absolute", left: 90, bottom: 8 + temp * 456, fontSize: 48, fontWeight: 800, color: colors.yellow, whiteSpace: "nowrap",
              opacity: during(frame, T.keeps + 0.6, T.word - 0.4, 0.3),
            }}
          >
            ← ChatGPT
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: colors.yellow, opacity: ramp(frame, T.adventureDial, 0.3) }}>adventure dial</div>
          <div style={{ fontSize: 44, fontWeight: 600, color: colors.subtext, opacity: ramp(frame, T.temperature, 0.3) }}>(temperature)</div>
        </div>
      </div>

      {/* One word changes, everything after it changes */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: branchO }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, fontSize: 72, fontWeight: 800, marginRight: 240 }}>
          <div>The best pet is a</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 70 }}>
            {[["cat", "because it purrs."], ["parrot", "because it can talk."]].map(([w, rest], i) => (
              <div key={w} style={{ whiteSpace: "nowrap", opacity: ramp(frame, T.word + i * 0.25, 0.3) }}>
                <span style={{ color: colors.yellow }}>{w},</span>{" "}
                <span style={{ color: colors.subtext }}>
                  <StreamText text={rest} frame={frame} from={sec(T.after)} to={sec(T.end)} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      <Dot path={ridePath} squash={HOPS.squash} size={72} track={TRACK} seed="s5" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S5 — same question, different answers (temperature). Edit only this file for S5 changes.
export const S5: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S5Content />
    </LineWipeIn>
  </SceneShell>
);
