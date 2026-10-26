import { loadFont } from "@remotion/google-fonts/BricolageGrotesque";

// Unjargoned brand tokens (source: Master Handoff → channel/brand + fine details).
export const colors = {
  ink: "#14161C", // background
  yellow: "#FFC93C", // "the thing to watch" — always means the main subject
  panel: "#1C1F27",
  line: "#2A2E39",
  lineStrong: "#3A3F4D",
  subtext: "#B9BDC8",
  mint: "#5EE6B8", // approved / correct
  coral: "#FF8A5C", // errors, wrong answers
  periwinkle: "#8EA7FF", // secondary object
  white: "#FFFFFF",
} as const;

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export const SHORT = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;
