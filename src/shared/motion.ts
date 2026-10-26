import { Easing, interpolate, spring } from "remotion";
import { VIDEO } from "./brand";

/** Seconds → frames. */
export const sec = (s: number) => Math.round(s * VIDEO.fps);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 between two times (seconds), eased. */
export const ramp = (frame: number, fromSec: number, durSec = 0.3) =>
  interpolate(frame, [sec(fromSec), sec(fromSec) + Math.max(1, sec(durSec))], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

/** 1 while inside [inSec, outSec), fading over `durSec` at each end. */
export const during = (frame: number, inSec: number, outSec: number, durSec = 0.3) =>
  Math.min(ramp(frame, inSec, durSec), 1 - ramp(frame, outSec, durSec));

/** Springy pop-in (0→1 with a little overshoot) starting at `fromSec`. */
export const pop = (frame: number, fromSec: number) =>
  spring({ frame: frame - sec(fromSec), fps: VIDEO.fps, config: { damping: 12, stiffness: 160, mass: 0.6 } });

/** The house slow push-in: 3% over the whole shot. */
export const pushIn = (frame: number, durationInFrames: number) =>
  interpolate(frame, [0, durationInFrames], [1, 1.03], clamp);
