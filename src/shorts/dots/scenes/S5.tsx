// Scene 5 — Seamless Loop Bridge. "[curious] Which means for the first time, AI isn't a tool you open — [pause] it's an
// employee that NEVER logs off, so..."  Ends on Scene 1's frame-0 composition (open lid at LID_START, empty set) for the loop.
import React from "react";
import { interpolateColors } from "remotion";
import { C, MONO, easeOut, pop, ramp } from "../theme";
import { CloudWindow, LaptopProp, MoonBadge, Overlay, Paper, Pill, TheDot, Tether, dotPose, inWin } from "../kit";
import { DOT_REST, LAPTOP, MOON, MOON_S, SEAM, Sfx, TETHER_FROM, TETHER_TO, Voice, WIN0, WIN1, lerpRect, seconds, useT, zoomP } from "../common";
import { Desktop } from "./Desktop";
import { LID_START } from "./S1";

export const T = { means: 0.16, first: 0.96, ai: 2.12, tool: 3.0, open: 3.42, its: 4.72, employee: 4.88, never: 5.68, logsOff: 6.06, so: 7.08 };
const ZOOM = 1.0;
const OUT = 6.45; // set packs away, Dot drops home
const DROP_AT = 6.5;
const DROP = 0.55;

export const S5: React.FC = () => {
  const t = useT();
  const f = t * 60;
  const END = seconds("scene5");
  const z = 1 - zoomP(t / ZOOM);
  const rect = lerpRect(WIN0, WIN1, z);
  const k = 1 + z * 1.3;
  const world: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: `${WIN0.cx}px ${WIN0.cy}px`,
    transform: `translateY(${z * 220}px) scale(${k})`,
    opacity: 1 - z,
  };
  const away = 1 - pop(f, OUT); // 1 → 0 as the set packs away
  const bg = interpolateColors(ramp(t, OUT, END - 0.3), [0, 1], [C.paperWarm, C.paper]);

  const rest = inWin(WIN0, DOT_REST.u, DOT_REST.v);
  const pose = dotPose(t, rest, [
    { at: T.its + 0.02, dur: 0.34, to: rest, arc: 110 }, // happy bounce
    { at: T.its + 0.4, dur: 0.24, to: rest, arc: 50 },
    { at: DROP_AT, dur: DROP, to: [SEAM[0], SEAM[1] - 28], arc: 90 },
  ]);
  if (t < ZOOM) {
    const p = inWin(rect, DOT_REST.u, DOT_REST.v);
    pose.x = p[0];
    pose.y = p[1];
  }
  // Dot sinks into the seam, then the lid springs open to LID_START on the last frame.
  const sink = ramp(t, DROP_AT + DROP, DROP_AT + DROP + 0.12);
  if (sink > 0) {
    pose.sy = 1 - sink;
    pose.sx = 1 + sink * 0.7;
    pose.y = SEAM[1] - 28 * pose.sy;
  }
  const lidOpen = ramp(t, DROP_AT + DROP + 0.12, END);
  const angle = LID_START * easeOut(lidOpen);
  const lidKick = (1 - lidOpen) * lidOpen * 0.5;

  const strike = ramp(t, T.open, T.open + 0.25);
  const toolS = pop(f, T.ai - 0.05) * (1 - ramp(t, T.never - 0.25, T.never - 0.05));
  const neverS = pop(f, T.never - 0.05) * away;

  return (
    <Paper color={bg}>
      {z < 1 && (
        <div style={world}>
          <MoonBadge x={MOON[0]} y={MOON[1]} s={MOON_S * away} />
          <Tether from={TETHER_FROM} to={TETHER_TO} t={t} draw={away} />
          <LaptopProp x={LAPTOP.x} y={LAPTOP.y} scale={LAPTOP.s} angle={angle} bounce={lidKick} zzz={ramp(t, 1.0, 1.4) * away} />
        </div>
      )}
      {away > 0.01 && (
        <CloudWindow rect={rect} scale={away} clock={z > 0.5 ? "24/7" : undefined}>
          {z > 0.02 && <Desktop t={t + 3.7} cards={[1, 1, 1]} checks={[1, 1, 1]} clock={1} opacity={ramp(z, 0.5, 1)} />}
          <div style={{ position: "absolute", left: 22, top: 18, fontFamily: MONO, fontWeight: 600, fontSize: 20, color: C.paper, letterSpacing: "0.04em", opacity: ramp(t, ZOOM - 0.2, ZOOM) }}>
            <span style={{ color: C.red }}>●</span> STILL RUNNING
          </div>
        </CloudWindow>
      )}
      <Pill x={540} y={WIN0.cy - WIN0.h / 2 - 6} s={pop(f, T.employee - 0.05) * away} rot={-3} bg={C.yellow} size={36} text="EMPLOYEE · ON SHIFT 24/7" />

      {/* "a tool you open" → struck → "never logs off" */}
      {toolS > 0.01 && (
        <>
          <Pill x={540} y={1300} s={toolS} mono size={30} bg={C.sand} text="A TOOL YOU OPEN" />
          <Overlay>
            <line x1={540 - 175} y1={1300} x2={540 - 175 + 350 * strike} y2={1300} stroke={C.red} strokeWidth={8} strokeLinecap="round" opacity={toolS} />
          </Overlay>
        </>
      )}
      <Pill x={540} y={1300} s={neverS} mono size={30} bg={C.red} color={C.paper} rot={-2} text="NEVER LOGS OFF" />

      {sink < 1 && <TheDot pose={pose} trailOn={t > DROP_AT ? "paper" : "slate"} />}

      <Voice id="scene5" />
      <Sfx at={0} name="whoosh" vol={0.45} />
      <Sfx at={T.ai - 0.05} name="pop" vol={0.3} />
      <Sfx at={T.open} name="snap" vol={0.35} />
      <Sfx at={T.its + 0.02} name="hop" vol={0.35} />
      <Sfx at={T.employee - 0.05} name="stamp" vol={0.45} />
      <Sfx at={T.never - 0.05} name="pop" vol={0.35} />
      <Sfx at={DROP_AT} name="hop" vol={0.3} />
    </Paper>
  );
};
