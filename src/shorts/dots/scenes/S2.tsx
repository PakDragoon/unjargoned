// Scene 2 — The Premise. "OpenAI just started rolling out something called "Dots" to regular twenty-dollar ChatGPT users —
// [pause] and it gives your AI its OWN private computer in the cloud."
import React from "react";
import { C, MONO, pop, ramp } from "../theme";
import { CloudWindow, LaptopProp, MoonBadge, Paper, Pill, TheDot, Tether, dotPose, inWin } from "../kit";
import { DOT_REST, LAPTOP, MOON, MOON_S, Sfx, TETHER_FROM, TETHER_TO, Voice, WIN0, WIN1, lerpRect, useT, zoomP } from "../common";
import { Desktop, onCard } from "./Desktop";

export const T = { dots: 2.18, twenty: 3.36, users: 4.96, and: 6.36, own: 7.62, computer: 8.36, cloud: 9.28 };
const ZOOM = 0.9;
const BOOT = [4.9, 6.3];
const ZIPS = [6.95, 7.6, 8.25]; // dot leaves for card i
const ZIP = 0.34;

export const S2: React.FC = () => {
  const t = useT();
  const f = t * 60;
  const z = zoomP(t / ZOOM);
  const rect = lerpRect(WIN0, WIN1, z);

  // World behind the window flies past the camera.
  const k = 1 + z * 1.3;
  const world: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: `${WIN0.cx}px ${WIN0.cy}px`,
    transform: `translateY(${z * 220}px) scale(${k})`,
    opacity: 1 - z,
  };

  const rest = inWin(WIN1, DOT_REST.u, DOT_REST.v);
  const pose = dotPose(t, rest, [
    ...ZIPS.map((at, i) => ({ at, dur: ZIP, to: onCard(i), arc: i === 0 ? 120 : 90 })),
    { at: 8.95, dur: 0.4, to: rest, arc: 140 },
    { at: 9.5, dur: 0.24, to: [rest[0], rest[1] - 0.01], arc: 60 },
  ]);
  if (t < ZOOM) {
    const p = inWin(rect, DOT_REST.u, DOT_REST.v);
    pose.x = p[0];
    pose.y = p[1];
  }

  const cards = [0, 1, 2].map((i) => pop(f, T.and + 0.05 + i * 0.14));
  const checks = ZIPS.map((at) => pop(f, at + ZIP + 0.05));
  const clock = pop(f, T.and + 0.35);
  const boot = ramp(t, BOOT[0], BOOT[1]);
  const booting = t > BOOT[0] - 0.1 && t < T.and + 0.1;
  const stamp = pop(f, T.dots - 0.08);
  const stampS = stamp <= 0.01 ? 0 : 1.9 - 0.9 * stamp + 0.05 * pop(f, T.twenty) * (1 - ramp(t, T.twenty + 0.3, T.twenty + 0.6));

  return (
    <Paper color={C.paperWarm}>
      {z < 1 && (
        <div style={world}>
          <MoonBadge x={MOON[0]} y={MOON[1]} s={MOON_S} />
          <Tether from={TETHER_FROM} to={TETHER_TO} t={t} />
          <LaptopProp x={LAPTOP.x} y={LAPTOP.y} scale={LAPTOP.s} angle={0} />
        </div>
      )}
      <CloudWindow rect={rect} clock={t > T.and ? "24/7" : undefined}>
        {booting && (
          <div style={{ position: "absolute", left: 0, right: 0, top: "40%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: 1 - ramp(t, T.and - 0.05, T.and + 0.1) }}>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 28, color: C.paper, letterSpacing: "0.06em" }}>BOOTING DOT-SESSION…</div>
            <div style={{ width: 460, height: 30, border: `3px solid ${C.paper}`, borderRadius: 15, padding: 4, boxSizing: "border-box" }}>
              <div style={{ width: `${boot * 100}%`, height: "100%", background: C.yellow, borderRadius: 10 }} />
            </div>
          </div>
        )}
        {t > T.and && <Desktop t={t - T.and} cards={cards} checks={checks} clock={clock} />}
      </CloudWindow>
      <Pill x={540} y={WIN1.cy - WIN1.h / 2 - 6} s={stampS} rot={-3} bg={C.yellow} size={40} text={<>CHATGPT DOTS <span style={{ opacity: 0.55 }}>//</span> $20 PLUS</>} />
      <Pill x={540} y={WIN1.cy + WIN1.h / 2 - 130} s={pop(f, T.own - 0.05)} rot={2} bg={C.paper} mono size={28} text="YOUR AI'S OWN PC · IN THE CLOUD" />
      <TheDot pose={pose} trailOn="slate" />

      <Voice id="scene2" />
      <Sfx at={0} name="whoosh" vol={0.45} />
      <Sfx at={T.dots - 0.08} name="stamp" vol={0.7} />
      {Array.from({ length: 10 }).map((_, i) => (
        <Sfx key={`k${i}`} at={BOOT[0] + i * 0.13 + (i % 3) * 0.02} name="click" vol={0.35} />
      ))}
      {[0, 1, 2].map((i) => (
        <Sfx key={`c${i}`} at={T.and + 0.05 + i * 0.14} name="pop" vol={0.3} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <Sfx key={`t${i}`} at={T.and + 0.5 + i * 0.5} name="tick" vol={0.22} />
      ))}
      {ZIPS.map((at, i) => (
        <React.Fragment key={`z${i}`}>
          <Sfx at={at} name="hop" vol={0.3} />
          <Sfx at={at + ZIP + 0.05} name="pop" vol={0.3} />
        </React.Fragment>
      ))}
      <Sfx at={T.own - 0.05} name="pop" vol={0.3} />
    </Paper>
  );
};
