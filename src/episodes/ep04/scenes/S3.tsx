import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { ChatBubble, ChatWindow } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, pushIn, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { BrainShape, EggCarton, EyeShape, Figure, HandShape, HelperBox, PriceTag, ProductTile, ShopPage, ToolBelt } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { scene } from "../timeline";

const S = scene("S3");

// Times (s) from the S3 word timings in captions.json. Re-voice S3 → re-check these.
const T = {
  hands: 1.7, handsIn: 3.08, internet: 6.18, email: 7.52, calendar: 8.74, shop: 10.08,
  odd: 11.2, cant: 12.9, itself: 13.82, ask: 15.32, search: 16.16, please: 16.88, simple: 17.98, clicking: 19.32,
  tells: 20.2, happened: 21.16,
  askChat: 22.36, list: 24.92, askAgent: 25.78, opens: 27.04, searches: 27.82, compares: 28.58, fills: 29.2, cart: 29.6,
  but: 30.7, eyes: 33.62, looks: 34.86, did: 36.04,
  look1: 37.36, think: 37.56, doo: 37.76, again: 38.14, round: 39.42, done: 41.1,
  chatTells: 42.14, agentDoes: 43.84, doesIt: 44.48,
};

// Phases (one hero each): figure + tool belt → helper box (the brain only asks) → chatbot vs agent split →
// eyes → the loop → "tells… does".
const P = {
  belt: [0, 11.0], helper: [11.0, 22.1], split: [22.1, 30.5], eyes: [30.5, 36.9], loop: [36.9, 42.0], punch: [42.0, 99],
} as const;

// The figure stays in one place whenever it's on screen (continuity across scenes).
const FIG = { left: 150, top: 330, size: 600 };
const K = FIG.size / 900;
const fp = (x: number, y: number) => ({ x: FIG.left + x * K, y: FIG.top + y * K });
const SLOT_L = fp(100, 566);
const SLOT_R = fp(500, 566);
const JAR_TOP = fp(300, 40);
const JAR_MID = fp(300, 170);

// Helper box (phase 2) and where the hands hang from its ports.
const HB = { left: 740, top: 600, w: 300 };
const HB_SLOT = { x: HB.left + HB.w / 2, y: HB.top + 20 };
const PORT_L = { x: HB.left + HB.w * 0.38, y: HB.top + HB.w * 0.78 - 45 };
const PORT_R = { x: HB.left + HB.w * 0.7, y: HB.top + HB.w * 0.78 - 45 };
const HANG_L = { x: PORT_L.x, y: PORT_L.y + 90 };
const HANG_R = { x: PORT_R.x, y: PORT_R.y + 90 };

// Tool belt: big and central while the tools are named, then slides right for the helper.
const BELT_A = { left: 700, top: 560, w: 800 };
const BELT_B = { left: 1220, top: 640, w: 600 };
const basketAt = (b: { left: number; top: number; w: number }) => ({ x: b.left + b.w * 0.93, y: b.top + b.w * 0.135 });

// The loop.
const LOOP = { x: 1200, y: 610, r: 250 };
const LAP = 0.95; // seconds per lap of the yellow dot
const RUN_FROM = 38.3;
const dotAngle = (t: number) => -90 + (360 * Math.max(0, Math.min(t, T.done) - RUN_FROM)) / LAP;
const onLoop = (deg: number, r = LOOP.r) => ({ x: LOOP.x + r * Math.cos((deg * Math.PI) / 180), y: LOOP.y + r * Math.sin((deg * Math.PI) / 180) });

// Dot rides the loop just behind the yellow dot, then hops off when the tick lands.
const RIDE = [38.5, T.done] as const;
const ridePos = (t: number) => onLoop(dotAngle(t) - 34, LOOP.r + 100);
const RIDE_START = ridePos(RIDE[0]);
const RIDE_END = ridePos(RIDE[1]);
const OFF = { x: 1660, y: 900 };
const AFTER = { at: 42.3, x: 940, y: 960 };

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(11.9), mood: "neutral" },
  { at: sec(T.cant), mood: "surprised" },
  { at: sec(T.ask), mood: "curious" },
  { at: sec(T.askChat), mood: "curious" },
  { at: sec(T.cart), mood: "happy" },
  { at: sec(T.but), mood: "neutral" },
  { at: sec(T.eyes), mood: "aha" },
  { at: sec(T.look1), mood: "happy" },
  { at: sec(T.done), mood: "relieved" },
];

// Route: by the figure → at the belt → onto the helper box (the tap) → down to watch → left half → right half →
// middle → by the figure → onto the loop (ride, custom path below) → off → centre for the punchline.
const ROUTE = hops([
  { at: 0, x: 760, y: 880 },
  { at: sec(3.4), x: 1600, y: 900 },
  { at: sec(12.3), x: 1110, y: 560 }, // lands on the helper box: the tap
  { at: sec(14.9), x: 1170, y: 930 },
  { at: sec(22.6), x: 470, y: 970 },
  { at: sec(26.0), x: 1450, y: 990 },
  { at: sec(29.9), x: 960, y: 980 },
  { at: sec(31.2), x: 760, y: 860 },
  { at: sec(RIDE[0]), x: RIDE_START.x, y: RIDE_START.y },
]);
const AFTER_HOP = hops([
  { at: sec(RIDE[1]), x: RIDE_END.x, y: RIDE_END.y },
  { at: sec(41.6), x: OFF.x, y: OFF.y },
  { at: sec(AFTER.at), x: AFTER.x, y: AFTER.y },
]);
const dotPath = (frame: number) => {
  const t = frame / 30;
  if (t < RIDE[0]) return ROUTE.path(frame);
  if (t < RIDE[1]) return ridePos(t);
  return AFTER_HOP.path(frame);
};
const dotSquash = (frame: number) => Math.max(ROUTE.squash(frame), AFTER_HOP.squash(frame));

const LOOK = glances([
  { at: 0, x: -0.8, y: -0.5 }, // the jar
  { at: sec(3.4), x: -0.8, y: -0.4 }, // the belt
  { at: sec(12.3), x: -0.7, y: 0.5 }, // into the slot under it
  { at: sec(14.9), x: -0.9, y: -0.6 }, // the bubble rising from the jar
  { at: sec(17.4), x: -0.4, y: -0.4 }, // into the slot
  { at: sec(18.2), x: 0.9, y: -0.6 }, // the hand reaching the basket
  { at: sec(20.2), x: -0.9, y: -0.5 }, // result back to the jar
  { at: sec(22.6), x: 0.2, y: -0.8 },
  { at: sec(26.0), x: 0, y: -0.9 },
  { at: sec(29.9), x: 0.8, y: -0.7 },
  { at: sec(31.2), x: -0.8, y: -0.8 },
  { at: sec(RIDE[0]), x: -0.6, y: 0 },
  { at: sec(41.6), x: -0.9, y: -0.3 },
  { at: sec(AFTER.at), x: 0.7, y: -0.6 },
]);

/** A loop station: a round tile holding an icon, highlighted (yellow ring) when its word is said. */
const Station: React.FC<{ at: { x: number; y: number }; on: number; children: React.ReactNode }> = ({ at, on, children }) => (
  <div
    style={{
      position: "absolute", left: at.x - 70, top: at.y - 70, width: 140, height: 140, borderRadius: 70, backgroundColor: colors.panel,
      border: `6px solid ${on > 0.5 ? colors.yellow : colors.line}`, display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${1 + 0.15 * Math.sin(Math.min(1, on) * Math.PI)})`, boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

const S3Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const { durationInFrames } = useVideoConfig();
  const f = (r: readonly [number, number]) => during(frame, r[0], r[1], 0.35);
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const arc = (a: { x: number; y: number }, b: { x: number; y: number }, k: number, lift = 120) => {
    const e = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, k)));
    return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - Math.sin(e * Math.PI) * lift };
  };

  // ── Figure state across the scene ──
  const figO = Math.max(during(frame, -1, P.split[0], 0.35), during(frame, P.eyes[0], P.loop[1], 0.35));
  const hands = frame < sec(T.handsIn - 0.05) ? 0 : pop(frame, T.handsIn);
  const handsAway = t >= T.cant && t < P.eyes[0];
  const eyes = t < T.eyes - 0.05 ? 0 : pop(frame, T.eyes);
  const figLook = t >= P.loop[0] ? { x: 1, y: 0.1 } : t >= T.looks ? { x: 1, y: -0.35 } : { x: 0.4, y: 0.1 };
  const resultBack = ramp(frame, T.tells, 0.8);
  const jarGlow = during(frame, T.tells + 0.8, T.happened + 0.6, 0.2);

  // ── Phase 1: belt ──
  const beltMove = ramp(frame, T.odd - 0.1, 0.7);
  const belt = { left: lerp(BELT_A.left, BELT_B.left, beltMove), top: lerp(BELT_A.top, BELT_B.top, beltMove), w: lerp(BELT_A.w, BELT_B.w, beltMove) };
  const toolsShown = [T.internet, T.email, T.calendar, T.shop].map((at) => (t < at - 0.05 ? 0 : pop(frame, at)));
  const beltO = Math.max(f(P.belt), f(P.helper));

  // ── Phase 2: helper ──
  const helperIn = t < T.odd + 0.6 ? 0 : pop(frame, T.odd + 0.6);
  const fly = ramp(frame, T.cant, 0.9); // hands lift off the figure and plug into the helper
  const handL = arc(SLOT_L, HANG_L, fly, 140);
  const reach = ramp(frame, T.simple - 0.1, 0.55) - ramp(frame, T.clicking + 0.2, 0.5);
  const basket = basketAt(BELT_B);
  const handR0 = arc(SLOT_R, HANG_R, fly, 140);
  const handR = { x: lerp(handR0.x, basket.x - 10, reach), y: lerp(handR0.y, basket.y + 70, reach) };
  const press = during(frame, T.simple + 0.65, T.simple + 1.05, 0.1);
  const basketFlash = during(frame, T.simple + 0.7, T.clicking + 0.3, 0.15);
  const bubbleIn = pop(frame, T.ask);
  const bubbleGo = ramp(frame, T.please + 0.2, 0.55);
  const bubble = arc({ x: JAR_TOP.x + 330, y: JAR_TOP.y + 70 }, { x: HB_SLOT.x, y: HB_SLOT.y }, bubbleGo, 120);
  const slotGlow = during(frame, T.please + 0.6, T.simple + 0.4, 0.15);
  const result = arc({ x: HB_SLOT.x, y: HB_SLOT.y - 40 }, JAR_MID, resultBack, 180);
  const resultO = during(frame, T.tells - 0.05, T.happened + 0.1, 0.12);
  const handsO = during(frame, T.cant - 0.05, P.helper[1], 0.3);

  // ── Phase 3: split ──
  const typed = "eggs".slice(0, Math.floor(interpolate(t, [T.searches - 0.2, T.searches + 0.4], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const tilesIn = pop(frame, T.compares);
  const picked = t >= T.compares + 0.55;
  const cartN = t >= T.cart ? 1 : 0;
  const cursorKeys: [number, number, number][] = [
    [T.opens, 1170, 330], [T.searches + 0.5, 1170, 330], [T.compares + 0.5, 1230, 450], [T.fills + 0.1, 1230, 450], [T.cart, 1768, 320],
  ];
  const cursor = (() => {
    let p = { x: cursorKeys[0][1], y: cursorKeys[0][2] };
    for (let i = 1; i < cursorKeys.length; i++) {
      const [at, x, y] = cursorKeys[i];
      const [pat] = cursorKeys[i - 1];
      const k = Math.max(0, Math.min(1, (t - pat) / Math.max(0.01, at - pat)));
      if (t >= pat) p = { x: lerp(p.x, x, Easing.inOut(Easing.cubic)(k)), y: lerp(p.y, y, Easing.inOut(Easing.cubic)(k)) };
    }
    return p;
  })();
  const typing = t > T.searches - 0.2 && t < T.searches + 0.45 ? Math.sin(frame * 2.2) * 8 : 0;
  const cursorPress = Math.max(during(frame, T.compares + 0.45, T.compares + 0.75, 0.08), during(frame, T.cart - 0.05, T.cart + 0.25, 0.08));

  // ── Phase 5: loop ──
  const ring = ramp(frame, P.loop[0] + 0.1, 0.4);
  const runO = t >= RUN_FROM - 0.1 ? 1 : 0;
  const runner = onLoop(dotAngle(t));
  const stationOn = (at: number) => (t >= at ? Math.min(1, (t - at) / 0.3) : 0);
  const lapFlash = (deg: number) => {
    // a station lights again each time the runner passes it
    const a = ((dotAngle(t) - deg) % 360 + 360) % 360;
    return t > RUN_FROM && t < T.done && a < 25 ? 1 : 0;
  };
  const tick = ramp(frame, T.done, 0.35);

  return (
    <AbsoluteFill style={{ transform: `scale(${pushIn(frame, durationInFrames)})`, fontFamily }}>
      <QuestionStrip active={0} />

      {/* Tool belt (phase 1 central, phase 2 to the right) */}
      <div style={{ position: "absolute", left: belt.left, top: belt.top, opacity: beltO }}>
        <ToolBelt w={belt.w} shown={toolsShown} strap={ramp(frame, T.internet - 0.6, 0.5)} />
        <div style={{ position: "absolute", left: belt.w * 0.83 - 6, top: -6, width: belt.w * 0.2 + 12, height: belt.w * 0.27 + 12, borderRadius: 28, border: `6px solid ${colors.yellow}`, opacity: basketFlash, boxSizing: "border-box" }} />
      </div>

      {/* Helper box with cables to the hands */}
      <AbsoluteFill style={{ opacity: f(P.helper) }}>
        <div style={{ position: "absolute", left: HB.left, top: HB.top, transform: `scale(${Math.max(0, helperIn)})`, transformOrigin: "50% 100%" }}>
          <HelperBox w={HB.w} slotGlow={slotGlow} light={t >= T.simple + 0.7 ? 1 : 0} />
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: handsO * ramp(frame, T.itself - 0.2, 0.3) }} aria-hidden>
          <path d={`M ${PORT_L.x} ${PORT_L.y} Q ${PORT_L.x} ${(PORT_L.y + handL.y) / 2 + 30} ${handL.x} ${handL.y - 30}`} stroke={colors.lineStrong} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M ${PORT_R.x} ${PORT_R.y} Q ${(PORT_R.x + handR.x) / 2} ${Math.max(PORT_R.y, handR.y) + 80} ${handR.x} ${handR.y - 30}`} stroke={colors.lineStrong} strokeWidth={10} fill="none" strokeLinecap="round" />
        </svg>
      </AbsoluteFill>

      {/* The figure */}
      <div style={{ position: "absolute", left: FIG.left, top: FIG.top, opacity: figO }}>
        <Figure size={FIG.size} brain={1} hands={hands} eyes={eyes} handsAway={handsAway} look={figLook} glow={jarGlow} />
      </div>

      {/* Flying / plugged-in hands (phase 2) */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: handsO }} aria-hidden>
        <HandShape cx={handL.x} cy={handL.y} r={30} />
        <HandShape cx={handR.x} cy={handR.y} r={30} flip press={press} />
      </svg>

      {/* "search for eggs, please" rises from the jar and drops into the helper's slot */}
      <div
        style={{
          position: "absolute", left: bubble.x, top: bubble.y, opacity: f([T.ask - 0.1, T.please + 0.7]),
          transform: `translate(-50%, -100%) scale(${Math.min(1, bubbleIn) * (1 - 0.85 * bubbleGo)})`, transformOrigin: "50% 100%",
        }}
      >
        <div style={{ position: "relative", padding: "18px 30px", borderRadius: 30, backgroundColor: colors.white, color: colors.ink, fontSize: 44, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 16px 30px rgba(0,0,0,0.35)" }}>
          search for eggs, please
          <div style={{ position: "absolute", left: -18, bottom: 22, width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderRight: `24px solid ${colors.white}` }} />
        </div>
      </div>

      {/* The result card slides back up into the jar */}
      <div style={{ position: "absolute", left: result.x, top: result.y, opacity: resultO, transform: `translate(-50%, -50%) scale(${1 - 0.5 * resultBack})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 22, backgroundColor: colors.panel, border: `5px solid ${colors.mint}` }}>
          <EggCarton w={110} />
          <svg width={56} height={56} viewBox="0 0 84 84" aria-hidden><path d="M 12 44 L 34 66 L 74 18" fill="none" stroke={colors.mint} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      {/* Phase 3: chatbot (left) vs agent (right) */}
      <AbsoluteFill style={{ opacity: f(P.split) }}>
        <div style={{ position: "absolute", left: 960, top: 170, bottom: 60, width: 4, borderRadius: 2, backgroundColor: colors.line }} />
        <ChatWindow width={760} height={640} style={{ position: "absolute", left: 110, top: 220 }}>
          <ChatBubble from="me" o={pop(frame, T.askChat + 0.1)} fontSize={46}>Cheap eggs?</ChatBubble>
          <ChatBubble from="ai" o={pop(frame, T.list - 0.9)} fontSize={42}>
            Here's a list:
            {["A local store", "A big supermarket", "A delivery app"].map((s, i) => (
              <div key={s} style={{ opacity: ramp(frame, T.list - 0.7 + i * 0.25, 0.2), fontWeight: 600, fontSize: 38, color: colors.subtext }}>• {s}</div>
            ))}
          </ChatBubble>
        </ChatWindow>
        <div style={{ position: "absolute", left: 990, top: 210, transform: `scale(${Math.min(1, pop(frame, T.opens - 0.15))})`, transformOrigin: "50% 50%" }}>
          <ShopPage w={860} query={typed} cart={cartN} cartPop={ramp(frame, T.cart, 0.35)}>
            <div style={{ display: "flex", gap: 40, justifyContent: "center", paddingTop: 10, transform: `scale(${Math.min(1, tilesIn)})`, opacity: Math.min(1, tilesIn * 2) }}>
              <ProductTile w={220} picked={picked ? 1 : 0}><EggCarton w={170} /><PriceTag price="$4.99" w={130} yellow={picked} /></ProductTile>
              <ProductTile w={220}><EggCarton w={170} /><PriceTag price="$6.49" w={130} /></ProductTile>
            </div>
          </ShopPage>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: during(frame, T.opens + 0.05, P.split[1] - 0.2, 0.2) }} aria-hidden>
          <HandShape cx={cursor.x + typing} cy={cursor.y + 50} r={40} press={cursorPress} />
        </svg>
      </AbsoluteFill>

      {/* Phase 4: eyes check the last click (the cart badge) */}
      <AbsoluteFill style={{ opacity: f(P.eyes) }}>
        <div style={{ position: "absolute", left: 1090, top: 340 }}>
          <ShopPage w={680} query="eggs" cart={1} cartPop={ramp(frame, T.looks + 0.2, 0.4)}>
            <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
              <ProductTile w={170} picked={1}><EggCarton w={130} /><PriceTag price="$4.99" w={104} yellow /></ProductTile>
              <ProductTile w={170}><EggCarton w={130} /><PriceTag price="$6.49" w={104} /></ProductTile>
            </div>
          </ShopPage>
          <div style={{ position: "absolute", left: 680 - 74, top: 50, width: 70, height: 70, borderRadius: 35, border: `6px solid ${colors.yellow}`, opacity: ramp(frame, T.looks, 0.3), transform: `scale(${1 + 0.3 * during(frame, T.looks, T.did, 0.3)})` }} />
        </div>
      </AbsoluteFill>

      {/* Phase 5: the loop — look, think, do, look again */}
      <AbsoluteFill style={{ opacity: f(P.loop) }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <circle cx={LOOP.x} cy={LOOP.y} r={LOOP.r} fill="none" stroke={colors.yellow} strokeWidth={14} strokeDasharray={`${2 * Math.PI * LOOP.r * ring} 9999`} transform={`rotate(-90 ${LOOP.x} ${LOOP.y})`} strokeLinecap="round" />
          <circle cx={runner.x} cy={runner.y} r={22} fill={colors.yellow} opacity={runO * (1 - tick)} />
        </svg>
        <Station at={onLoop(-90)} on={Math.max(stationOn(T.look1), lapFlash(-90))}>
          <svg width={90} height={90} viewBox="-45 -45 90 90" aria-hidden><EyeShape cx={0} cy={0} r={34} look={{ x: 0.4, y: 0 }} /></svg>
        </Station>
        <Station at={onLoop(0)} on={Math.max(stationOn(T.think), lapFlash(0))}>
          <svg width={100} height={80} viewBox="0 0 200 160" aria-hidden><BrainShape x={0} y={0} /></svg>
        </Station>
        <Station at={onLoop(90)} on={Math.max(stationOn(T.doo), lapFlash(90))}>
          <svg width={90} height={90} viewBox="-50 -50 100 100" aria-hidden><HandShape cx={0} cy={0} r={38} /></svg>
        </Station>
        <Station at={onLoop(180)} on={Math.max(stationOn(T.again), lapFlash(180))}>
          <svg width={90} height={90} viewBox="-45 -45 90 90" aria-hidden><EyeShape cx={0} cy={0} r={34} look={{ x: -0.4, y: 0 }} /></svg>
        </Station>
        <div style={{ position: "absolute", left: LOOP.x - 90, top: LOOP.y - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(94,230,184,0.14)", border: `8px solid ${colors.mint}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: tick, transform: `scale(${Math.min(1.1, pop(frame, T.done))})`, boxSizing: "border-box" }}>
          <svg width={110} height={110} viewBox="0 0 84 84" aria-hidden><path d="M 12 44 L 34 66 L 74 18" fill="none" stroke={colors.mint} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /></svg>
        </div>
      </AbsoluteFill>

      {/* Phase 6: a chatbot tells you · an agent does it */}
      <AbsoluteFill style={{ opacity: f(P.punch) }}>
        <div style={{ position: "absolute", left: 200, top: 380, width: 640 }}>
          <ChatBubble from="ai" o={pop(frame, T.chatTells)} fontSize={50}>
            Here's a list of shops…
          </ChatBubble>
        </div>
        <div style={{ position: "absolute", left: 1080, top: 230, width: 620, height: 600, transform: `scale(${Math.min(1.05, pop(frame, T.agentDoes)) * (1 + 0.06 * during(frame, T.doesIt, T.doesIt + 0.35, 0.12))})`, transformOrigin: "50% 80%" }}>
          <div style={{ position: "absolute", left: 60, top: 40, width: 500, height: 500, borderRadius: 250, backgroundColor: colors.yellow, opacity: 0.12 }} />
          <div style={{ position: "absolute", left: 130, top: 140 }}><EggCarton w={360} /></div>
          <svg width={620} height={600} style={{ position: "absolute", inset: 0 }} aria-hidden>
            <HandShape cx={190} cy={420} r={78} />
            <HandShape cx={430} cy={420} r={78} flip />
          </svg>
        </div>
      </AbsoluteFill>

      <Dot path={dotPath} squash={dotSquash} track={TRACK} seed="e4s3" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S3 — first stop: what changes when it gets hands? Edit only this file for S3 changes.
export const S3: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S3Content />
    </LineWipeIn>
  </SceneShell>
);
