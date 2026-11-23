// ChatGPT Dots Short — "Tactile Editorial Illustration" style lock (spec §3). Standalone: imports nothing from episodes.
import { continueRender, delayRender, spring, interpolate, staticFile } from "remotion";

export const W = 1080;
export const H = 1920;
export const FPS = 60;

export const C = {
  paper: "#F7F4EB", // warm cream paper (background)
  sand: "#EAE4D3", // secondary surface / cards
  ink: "#141414", // strokes, text
  red: "#FF4D2D", // accent, alerts, TheDot
  yellow: "#F5C84C", // sticky note / highlight
  slate: "#1C1E24", // night / cloud — only inside CloudWindow
  green: "#2FA866", // the spec's "small green checkmarks"
  paperWarm: "#F6EEDB",
};

export const STROKE = 3;
export const SHADOW = "6px 6px 0px #141414";
export const DROP = "drop-shadow(6px 6px 0px #141414)";

// Fonts are served from public/fonts (variable woff2, latin) so renders never depend on Google's CDN.
export const HEAD = "DotsGrotesk";
export const MONO = "DotsMono";
if (typeof window !== "undefined" && "FontFace" in window) {
  const handle = delayRender("dots-fonts");
  Promise.all(
    [
      [HEAD, "fonts/SpaceGrotesk-latin.woff2", "300 700"],
      [MONO, "fonts/JetBrainsMono-latin.woff2", "100 800"],
    ].map(([family, file, weight]) =>
      new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight }).load().then((f) => (document.fonts as unknown as { add: (x: FontFace) => void }).add(f)),
    ),
  ).then(() => continueRender(handle), () => continueRender(handle));
}

// Spec spring: mass 0.8, stiffness 180, damping 14.
export const SPRING = { mass: 0.8, stiffness: 180, damping: 14 };

/** Spring 0→1 starting at `at` seconds (frame-based, deterministic). */
export const pop = (frame: number, at: number, config = SPRING) =>
  spring({ frame: frame - Math.round(at * FPS), fps: FPS, config });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** Linear ramp 0→1 over [a, b] seconds, at time t (seconds). */
export const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
export const easeIn = (p: number) => p * p * p;

/** Damped oscillation after an impact at `at` (s): 1 at impact, settles to 0. */
export const wobble = (t: number, at: number, k = 9, w = 26) =>
  t < at ? 0 : Math.exp(-(t - at) * k) * Math.cos((t - at) * w);
