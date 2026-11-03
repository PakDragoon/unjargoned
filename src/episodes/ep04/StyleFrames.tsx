import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fontFamily } from "../../shared/brand";
import { Dot } from "../../shared/Dot";
import { EggCarton } from "./Props";
import { Figure2, INK, OUT, PAPER, SHADOW, SHOULDER_L, Stage, handFrame } from "./Rig";

// A: the card arm, raised with the elbow out; the card sits in the fist (placed from the rig, not by eye).
const CARD_ARM = { target: { x: 112, y: 196 }, bend: -1 as const };
const CARD = handFrame(SHOULDER_L, CARD_ARM.target, CARD_ARM.bend, 66);

// Revamp style frames for the S1 opening (one still each). The agent — jar head, paper body, gloved hands on arms —
// presses "Buy" itself. A: wide, the agent at a shop kiosk with the card held up. B: over-the-shoulder close-up.

/** A shop screen as a paper cut-out device: dark bezel, light page, the carton, a price, and a big yellow Buy. */
const ShopScreen: React.FC<{ w: number; press?: number; pressX?: number }> = ({ w, press = 0, pressX = 0.25 }) => {
  const h = w * 0.66;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.045, backgroundColor: "#2B3142", border: `${OUT}px solid ${INK}`, boxSizing: "border-box", padding: w * 0.03, filter: `drop-shadow(10px 12px 0 ${SHADOW})`, fontFamily }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.025, backgroundColor: "#F7F2E6", overflow: "hidden" }}>
        {/* top bar: search + cart */}
        <div style={{ position: "absolute", left: w * 0.04, right: w * 0.04, top: w * 0.035, height: w * 0.06, display: "flex", alignItems: "center", gap: w * 0.02 }}>
          <div style={{ flex: 1, height: "100%", borderRadius: 999, border: `${w * 0.005}px solid #D8D0BE`, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", paddingLeft: w * 0.025, fontSize: w * 0.03, fontWeight: 600, color: colors.ink }}>eggs</div>
          <svg width={w * 0.06} height={w * 0.06} viewBox="0 0 50 50" aria-hidden><path d="M 4 8 H 12 L 18 34 H 40 L 46 16 H 15" fill="none" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" /><circle cx={20} cy={42} r={4} fill={colors.ink} /><circle cx={38} cy={42} r={4} fill={colors.ink} /></svg>
        </div>
        {/* product */}
        <div style={{ position: "absolute", right: w * 0.06, top: w * 0.15, width: w * 0.42, display: "flex", flexDirection: "column", alignItems: "center", gap: w * 0.02 }}>
          <EggCarton w={w * 0.36} />
          <div style={{ fontSize: w * 0.05, fontWeight: 800, color: colors.ink }}>$13.19</div>
        </div>
        {/* the Buy button: yellow = the thing to watch */}
        <div style={{ position: "absolute", left: w * 0.07, top: w * 0.36, width: w * 0.36, height: w * 0.13, borderRadius: w * 0.065, backgroundColor: colors.yellow, border: `${OUT}px solid ${INK}`, boxSizing: "border-box", boxShadow: `0 ${w * 0.014 * (1 - press)}px 0 ${INK}`, translate: `0 ${w * 0.012 * press}px`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: w * 0.065, fontWeight: 800, color: colors.ink }}>
          Buy
        </div>
        {/* press ripple */}
        <div style={{ position: "absolute", left: w * pressX - w * 0.09, top: w * 0.425 - w * 0.09, width: w * 0.18, height: w * 0.18, borderRadius: "50%", border: `${w * 0.008}px solid ${colors.white}`, opacity: 0.8 * press }} />
      </div>
    </div>
  );
};

/** A plain bank card held in the hand (no brand). Drawn in figure units. */
const HeldCard: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-70} y={-44} width={140} height={88} rx={12} fill="#8EA7FF" stroke={INK} strokeWidth={OUT * 0.8} />
    <rect x={-52} y={-24} width={28} height={20} rx={4} fill={colors.yellow} stroke={INK} strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-52 + i * 28} y={16} width={20} height={6} rx={3} fill={PAPER} opacity={0.9} />)}
  </g>
);

/** A · wide: the agent at a shop kiosk, card held up, pressing Buy. */
export const StyleA: React.FC = () => (
  <AbsoluteFill style={{ fontFamily }}>
    <Stage spotX={900} floorY={830} />
    {/* kiosk stand + screen */}
    <div style={{ position: "absolute", left: 1080, top: 640, width: 40, height: 200, backgroundColor: "#3A3F4D", border: `${OUT}px solid ${INK}`, boxSizing: "border-box" }} />
    <div style={{ position: "absolute", left: 990, top: 820, width: 220, height: 30, borderRadius: 15, backgroundColor: "#3A3F4D", border: `${OUT}px solid ${INK}`, boxSizing: "border-box" }} />
    <div style={{ position: "absolute", left: 790, top: 300 }}>
      <ShopScreen w={640} press={1} />
    </div>
    {/* the agent */}
    <div style={{ position: "absolute", left: 420, top: 160 }}>
      <Figure2
        size={720}
        eyes={1}
        look={{ x: 0.9, y: 0.35 }}
        notebook={1}
        left={{ target: CARD_ARM.target, pose: "grip", thumb: "up", bend: CARD_ARM.bend }}
        right={{ target: { x: 620, y: 440 }, pose: "point", thumb: "up", press: 1 }}
      >
        <HeldCard x={CARD.at.x} y={CARD.at.y} rot={CARD.angle + 90} />
      </Figure2>
    </div>
    <Dot x={1640} y={880} mood="curious" blinks={false} seed="sfA" look={{ x: -0.8, y: -0.5 }} />
  </AbsoluteFill>
);

/** B · over the shoulder: the jar head big in the foreground, its arm reaching into the screen to press Buy. */
export const StyleB: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
    <Stage spotX={1150} floorY={980} />
    <div style={{ position: "absolute", left: 770, top: 110 }}>
      <ShopScreen w={1060} press={1} pressX={0.13} />
    </div>
    <div style={{ position: "absolute", left: -250, top: 330 }}>
      <Figure2
        size={1500}
        eyes={1}
        look={{ x: 0.9, y: -0.4 }}
        notebook={1}
        right={{ target: { x: 617, y: 241 }, pose: "point", thumb: "up", press: 1 }}
      />
    </div>
    <Dot x={1700} y={960} mood="surprised" blinks={false} seed="sfB" look={{ x: -0.9, y: -0.6 }} />
  </AbsoluteFill>
);
