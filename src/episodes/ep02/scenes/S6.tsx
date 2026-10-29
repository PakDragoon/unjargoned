import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { scene } from "../timeline";

const S = scene("S6");

// Times (s) from the S6 word timings in captions.json. Re-voice S6 → re-check these.
const T = {
  chop: 2.4, guess: 5.5, pick: 9.5, add: 11.8, again: 13.1, noFinished: 14.8, finishedX: 16.2, built: 17.4,
  callback: 20.6, notice: 22.4, sounds: 25.3, is: 26.9, same: 28.8, last: 30.2,
};

const TRACK: MoodKey[] = [
  { at: 0, mood: "relieved" },
  { at: sec(T.noFinished), mood: "neutral" },
  { at: sec(T.callback), mood: "happy" },
  { at: sec(T.notice), mood: "curious" },
  { at: sec(T.same), mood: "relieved" },
  { at: sec(T.last), mood: "worried" },
];

const CX = 860;
const CY = 590;
const R = 290;
// Clockwise from the top: chop → guess → pick → add.
const NODES = [
  { label: "chop", sub: "into tokens", at: T.chop, angle: -90 },
  { label: "guess", sub: "from patterns", at: T.guess, angle: 0 },
  { label: "pick", sub: "a little random", at: T.pick, angle: 90 },
  { label: "add", sub: "to the answer", at: T.add, angle: 180 },
];
const rad = (a: number) => (a * Math.PI) / 180;

/** Where the yellow runner is on the loop (degrees), so Dot can watch it from the middle. */
const runnerAt = (s: number) =>
  interpolate(
    s,
    [T.chop, T.guess - 0.4, T.guess, T.pick - 0.4, T.pick, T.add - 0.4, T.add, T.again, T.again + 1.2],
    [-90, -90, 0, 0, 90, 90, 180, 180, 270 + 360],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// Dot sits in the middle of the loop watching it run, then by the empty "finished answer?" box.
const ROUTE = hops([
  { at: 0, x: 1600, y: 900 }, { at: sec(2.0), x: CX, y: CY }, { at: sec(T.noFinished), x: 1450, y: 700 },
  { at: sec(T.built), x: 1600, y: 900 }, { at: sec(T.same), x: 1600, y: 900 },
]);
const look = (frame: number) => {
  const s = frame / 30;
  if (s >= 2.0 && s < T.noFinished) {
    const a = rad(runnerAt(s));
    return { x: Math.cos(a) * 0.9, y: Math.sin(a) * 0.8 };
  }
  if (s >= T.noFinished && s < T.built) return { x: -0.6, y: -0.2 };
  return { x: -0.4, y: -0.3 };
};

const S6Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = frame / 30;

  const loopO = during(frame, 0.3, T.noFinished, 0.4);
  // The yellow dot runs the loop: node to node as each is named, then a full lap on "again".
  const runner = runnerAt(s);
  const lit = (at: number) => ramp(frame, at, 0.25);

  const finishedO = during(frame, T.noFinished, T.built, 0.3);
  const words = ["Once", "upon", "a", "time"];
  const sentenceO = during(frame, T.built, T.notice, 0.3);
  const noticeO = during(frame, T.notice, T.sounds, 0.4);
  const vennO = ramp(frame, T.sounds, 0.4);
  const gap = interpolate(ramp(frame, T.same, 0.9), [0, 1], [380, 70]);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})` }}>
      {/* The whole loop */}
      <AbsoluteFill style={{ opacity: loopO }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }} aria-hidden>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={colors.line} strokeWidth={14} />
          <circle cx={CX + Math.cos(rad(runner)) * R} cy={CY + Math.sin(rad(runner)) * R} r={22} fill={colors.yellow} opacity={ramp(frame, T.chop, 0.2)} />
        </svg>
        {NODES.map((n) => {
          const x = CX + Math.cos(rad(n.angle)) * R;
          const y = CY + Math.sin(rad(n.angle)) * R;
          const l = lit(n.at);
          const p = pop(frame, n.at);
          return (
            <div key={n.label} style={{ position: "absolute", left: x - 110, top: y - 110, width: 220, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 220, height: 220, borderRadius: 110, backgroundColor: colors.panel,
                  border: `8px solid ${interpolateColors(l, [0, 1], [colors.line, colors.yellow])}`, boxSizing: "border-box",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, fontWeight: 800,
                  color: interpolateColors(l, [0, 1], [colors.subtext, colors.white]), transform: `scale(${0.9 + 0.1 * Math.min(1.2, p)})`,
                }}
              >
                {n.label}
              </div>
            </div>
          );
        })}
        {/* sub-labels sit outside the ring so they never cover it */}
        {NODES.map((n) => {
          const side = n.angle === 0 ? { left: CX + R + 130, top: CY - 30 } : n.angle === 180 ? { left: CX - R - 520, top: CY - 30, width: 390, textAlign: "right" as const } : n.angle === -90 ? { left: CX + 130, top: CY - R - 30 } : { left: CX + 130, top: CY + R - 30 };
          return (
            <div key={n.sub} style={{ position: "absolute", ...side, fontSize: 48, fontWeight: 600, color: colors.subtext, opacity: lit(n.at + 0.2) }}>
              {n.sub}
            </div>
          );
        })}
      </AbsoluteFill>

      {/* No finished answer waiting */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: finishedO }}>
        <div style={{ position: "relative", width: 760, height: 300, borderRadius: 40, border: `8px dashed ${colors.lineStrong}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 700, color: colors.subtext }}>
          a finished answer?
          <svg width={760} height={300} viewBox="0 0 760 300" style={{ position: "absolute", left: -8, top: -8 }} aria-hidden>
            <line x1={60} y1={260} x2={60 + 640 * ramp(frame, T.finishedX, 0.3)} y2={260 - 220 * ramp(frame, T.finishedX, 0.3)} stroke={colors.coral} strokeWidth={20} strokeLinecap="round" opacity={ramp(frame, T.finishedX, 0.05)} />
          </svg>
        </div>
      </AbsoluteFill>

      {/* Built one guess at a time, like "Once upon a…" */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: sentenceO }}>
        <div style={{ display: "flex", gap: 36, fontSize: 130, fontWeight: 800 }}>
          {words.map((w, i) => {
            const p = pop(frame, T.built + i * 0.35);
            const callback = i < 3 ? ramp(frame, T.callback, 0.3) : 0;
            return (
              <span
                key={w}
                style={{
                  opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * -50}px)`,
                  color: interpolateColors(callback, [0, 1], [colors.white, colors.yellow]),
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: noticeO }}>
        <div style={{ fontSize: 96, fontWeight: 800 }}>
          Notice what it's <span style={{ color: colors.yellow }}>guessing</span>…
        </div>
      </AbsoluteFill>

      {/* Sounds right vs is right */}
      <AbsoluteFill style={{ opacity: vennO }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }} aria-hidden>
          <circle cx={900 - gap / 2} cy={540} r={260} fill={colors.periwinkle} fillOpacity={0.14} stroke={colors.periwinkle} strokeWidth={10} />
          <circle
            cx={900 + gap / 2} cy={540} r={260} fill={colors.mint} fillOpacity={0.14} stroke={colors.mint} strokeWidth={10}
            opacity={ramp(frame, T.is, 0.3)}
          />
        </svg>
        <div style={{ position: "absolute", left: 900 - gap / 2 - 480, top: 140, width: 480, textAlign: "center", fontSize: 64, fontWeight: 800, color: colors.periwinkle }}>
          sounds right
        </div>
        <div style={{ position: "absolute", left: 900 + gap / 2, top: 140, width: 480, textAlign: "center", fontSize: 64, fontWeight: 800, color: colors.mint, opacity: ramp(frame, T.is, 0.3) }}>
          is right
        </div>
        <div style={{ position: "absolute", left: 120, right: 400, top: 880, textAlign: "center", fontSize: 56, fontWeight: 600, color: colors.subtext, opacity: ramp(frame, T.same, 0.4) }}>
          most of the time, the same thing
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="s6" look={look} tailLength={0.55} />
    </AbsoluteFill>
  );
};

// Scene S6 — putting it together. Edit only this file for S6 changes.
export const S6: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S6Content />
    </FadeIn>
  </SceneShell>
);
