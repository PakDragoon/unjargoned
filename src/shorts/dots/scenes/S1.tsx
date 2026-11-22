// Scene 1 — The Swipe Gate. "[curious] If you close your laptop tonight, [pause] ChatGPT doesn't actually turn off anymore."
import React from "react";
import { interpolateColors } from "remotion";
import { C, MONO, easeIn, pop, ramp, wobble } from "../theme";
import { CloudWindow, DustPuff, LaptopProp, MoonBadge, Paper, TheDot, Tether, dotPose, inWin } from "../kit";
import { DOT_REST, LAPTOP, MOON, MOON_S, SEAM, Sfx, TETHER_FROM, TETHER_TO, Voice, WIN0, useT } from "../common";

// Word times (s) from Whisper on public/audio/short_scene1.mp3.
export const T = { close: 0.24, tonight: 0.98, chatgpt: 2.62, doesnt: 3.36, actually: 3.9, turnOff: 4.18, anymore: 4.82 };

export const LID_START = 95; // lid angle on frame 0 — Scene 5 ends on exactly this (loop)
const IMPACT = 0.3;

export const S1: React.FC = () => {
  const t = useT();
  const angle = t < IMPACT ? LID_START * (1 - easeIn(t / IMPACT)) : 0;
  const bounce = wobble(t, IMPACT, 10, 30);
  const bg = interpolateColors(ramp(t, 1.2, 1.9), [0, 1], [C.paper, C.paperWarm]);

  const win = pop(t * 60, T.chatgpt - 0.05);
  const rest = inWin(WIN0, DOT_REST.u, DOT_REST.v);
  const LEAP = T.doesnt + 0.12;
  const pose = dotPose(t, [SEAM[0], SEAM[1] - 28], [{ at: LEAP, dur: 0.72, to: [rest[0], rest[1]], arc: 170 }]);
  // Squeeze out of the closed seam: flat → round.
  const out = ramp(t, T.doesnt - 0.15, LEAP);
  const dotOn = t >= T.doesnt - 0.15;
  if (t < LEAP) {
    pose.sy = 0.25 + 0.75 * out;
    pose.sx = 1.7 - 0.7 * out;
    pose.y = SEAM[1] - 28 * pose.sy;
  }
  const status = pop(t * 60, LEAP + 0.85);

  return (
    <Paper color={bg}>
      <MoonBadge x={MOON[0]} y={MOON[1]} s={pop(t * 60, 1.35) * MOON_S} />
      <Tether from={TETHER_FROM} to={TETHER_TO} t={t} draw={ramp(t, T.chatgpt + 0.1, T.chatgpt + 0.5)} />
      <LaptopProp x={LAPTOP.x} y={LAPTOP.y} scale={LAPTOP.s} angle={angle} bounce={bounce} zzz={pop(t * 60, 0.75) * (1 - ramp(t, T.doesnt - 0.2, T.doesnt))} />
      <DustPuff x={LAPTOP.x} y={LAPTOP.y + 100} spread={300} p={ramp(t, IMPACT, IMPACT + 0.5)} />
      {win > 0.01 && (
        <CloudWindow rect={WIN0} scale={win}>
          <div style={{ position: "absolute", left: 22, top: 18, fontFamily: MONO, fontWeight: 600, fontSize: 20, color: C.paper, opacity: status, letterSpacing: "0.04em" }}>
            <span style={{ color: C.red }}>●</span> STILL RUNNING
          </div>
        </CloudWindow>
      )}
      {dotOn && <TheDot pose={pose} trailOn="paper" />}

      <Voice id="scene1" />
      <Sfx at={0.2} name="slam" vol={0.75} />
      <Sfx at={0.32} name="thud" vol={0.5} />
      <Sfx at={1.35} name="chime" vol={0.35} />
      <Sfx at={T.chatgpt - 0.05} name="pop" vol={0.35} />
      <Sfx at={LEAP} name="hop" vol={0.4} />
      <Sfx at={LEAP + 0.72} name="thud" vol={0.25} />
    </Paper>
  );
};
