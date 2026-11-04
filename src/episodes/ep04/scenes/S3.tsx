import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { EggCarton } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { Figure2, INK, Pt, Stage } from "../Rig";
import { Checkout, Kiosk } from "../Screens";
import { scene } from "../timeline";
import {
  BODY_H, BeltKit, Bubble, CHAT, CamKey, FIG, FLOOR, HELPER_SLOT, Key, KioskChat, LoopRing, PersonSays, REST_WIDE_L, REST_WIDE_R, SCREEN, SHOP_TILE,
  ScreenOff, ShopView, Tag, World, along, armJoints, camAt, forearmPt, fw, onPage, pageCart, wristFor,
} from "../World";

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

// One continuous shot on the S1 stage (chatbot kiosk left · agent · self-checkout right):
// gloves pop back on → tool belt wraps the waist, four tools in pouches → a helper box clips to the buckle: the brain
// can't move the hands, it only asks; its request drops into the helper, which drives the arm by cables (search) and
// sends the result back up → a chatbot only lists vs the agent shops at the checkout → it's blind until the goggles
// click on and check the cart → the loop rings the agent (look · think · do) → "tells you" vs "does it".

const JAR: Pt = fw({ x: 300, y: 192 });
const SLOT_W: Pt = fw(HELPER_SLOT);
const KIOSK_C: Pt = { x: CHAT.left + CHAT.w / 2, y: CHAT.top + CHAT.w * 0.33 };
const RING = { cx: 660, cy: 520, rx: 300, ry: 350 };
const onRing = (deg: number, out = 0): Pt => ({ x: RING.cx + (RING.rx + out) * Math.cos((deg * Math.PI) / 180), y: RING.cy + (RING.ry + out) * Math.sin((deg * Math.PI) / 180) });
const ST = { look: -120, think: -60, doo: 20 }; // stations on the ring
const LAP = 1.0;
const RUN_FROM = 38.3;
const runnerDeg = (t: number) => ST.look + (360 * Math.max(0, Math.min(t, T.done) - RUN_FROM)) / LAP;

const CAM: CamKey[] = [
  [-1, 660, 470, 1.2], [1.6, 660, 470, 1.2], [2.6, 660, 660, 1.9], [5.0, 660, 660, 1.9], [5.6, 660, 668, 3.1], [10.9, 660, 668, 3.1],
  [11.6, 680, 470, 1.55], [17.4, 700, 470, 1.5], [18.1, 900, 450, 1.25], [21.6, 900, 450, 1.25],
  [22.5, 360, 540, 1.7], [25.6, 360, 540, 1.7], [26.4, 975, 470, 1.25], [30.4, 975, 470, 1.25], [31.0, 900, 420, 1.35],
  [33.3, 900, 420, 1.35], [34.4, 1070, 340, 1.6], [36.8, 1070, 340, 1.6], [37.3, 700, 500, 1.05], [41.6, 700, 500, 1.05],
  [42.3, 770, 520, 0.95], [99, 770, 520, 0.95],
];

// ── right arm: helper-driven presses (fingertips computed from the page) ──
const BAR = wristFor(onPage(0.09, 0.065));
const STEP = 70;
const stepK = (t: number) => {
  const e = Easing.inOut(Easing.cubic);
  return e(Math.max(0, Math.min(1, (t - 28.35) / 0.45))) - e(Math.max(0, Math.min(1, (t - 29.85) / 0.45)));
};
const TILE = wristFor(SHOP_TILE(), "R", FIG.left + STEP);
const GROPE = [wristFor(onPage(-0.06, 0.42)), wristFor(onPage(0.01, 0.62)), wristFor(onPage(-0.1, 0.58)), wristFor(onPage(-0.03, 0.36))];
const NEAR = wristFor(onPage(0.02, 0.55));
const RIGHT_KEYS: Key[] = [
  [-1, REST_WIDE_R], [17.7, REST_WIDE_R], [18.5, BAR], [19.0, BAR], [19.6, REST_WIDE_R],
  [27.0, REST_WIDE_R], [27.55, BAR], [28.25, BAR], [28.95, TILE], [29.35, TILE], [29.9, REST_WIDE_R],
  [30.7, REST_WIDE_R], [31.2, GROPE[0]], [31.7, GROPE[1]], [32.2, GROPE[2]], [32.7, GROPE[3]], [33.4, NEAR],
  [37.6, NEAR], [37.76, BAR], [37.95, BAR], [38.3, NEAR], [99, NEAR],
];

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.handsIn), mood: "happy" },
  { at: sec(T.odd), mood: "neutral" },
  { at: sec(T.cant), mood: "surprised" },
  { at: sec(T.ask), mood: "curious" },
  { at: sec(T.askChat), mood: "deadpan" },
  { at: sec(T.askAgent), mood: "curious" },
  { at: sec(T.cart), mood: "happy" },
  { at: sec(T.but), mood: "worried" },
  { at: sec(T.eyes), mood: "aha" },
  { at: sec(T.look1), mood: "happy" },
  { at: sec(T.done), mood: "relieved" },
  { at: sec(T.agentDoes), mood: "smug" },
];
const ROUTE = hops([
  { at: 0, x: 1640, y: 900 },
  { at: sec(5.3), x: 1560, y: 900 },
  { at: sec(12.0), x: 1580, y: 890 },
  { at: sec(18.2), x: 1820, y: 940 },
  { at: sec(22.6), x: 1060, y: 975 },
  { at: sec(26.4), x: 1790, y: 950 },
  { at: sec(34.5), x: 1720, y: 900 },
  { at: sec(37.4), x: 1740, y: 940 },
  { at: sec(42.4), x: 1230, y: 990 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.5 },
  { at: sec(5.3), x: -1, y: -0.2 },
  { at: sec(12.0), x: -0.9, y: -0.5 },
  { at: sec(15.4), x: -0.9, y: -0.7 },
  { at: sec(17.3), x: -0.9, y: 0.1 },
  { at: sec(18.2), x: -0.8, y: -0.6 },
  { at: sec(22.6), x: -0.9, y: -0.6 },
  { at: sec(26.4), x: -0.9, y: -0.6 },
  { at: sec(34.5), x: -0.8, y: -0.8 },
  { at: sec(37.4), x: -1, y: -0.4 },
  { at: sec(42.4), x: -0.9, y: -0.6 },
  { at: sec(T.agentDoes), x: 0.6, y: -0.8 },
]);

const S3Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = camAt(CAM, t);
  const arc = (a: Pt, b: Pt, k: number, lift: number): Pt => {
    const e = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, k)));
    return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e - Math.sin(e * Math.PI) * lift };
  };

  // ── agent ──
  const figLeft = FIG.left + STEP * stepK(t);
  const right = along(RIGHT_KEYS, t);
  const left = REST_WIDE_L;
  const gloveL = t < T.handsIn - 0.02 ? 0 : Math.min(1.08, pop(frame, T.handsIn));
  const gloveR = t < 3.13 ? 0 : Math.min(1.08, pop(frame, 3.15));
  const eyes = t < T.eyes - 0.02 ? 0 : Math.min(1.1, pop(frame, T.eyes));
  const typingTap = [27.62, 27.78, 27.94, 28.1].reduce((m, at) => Math.max(m, during(frame, at - 0.03, at + 0.07, 0.03)), 0);
  const press = Math.max(during(frame, 18.58, 18.85, 0.05), typingTap, during(frame, 29.0, 29.3, 0.05), during(frame, 37.74, 37.92, 0.04));
  const look = t >= T.eyes && t < 36.9 ? { x: 1, y: 0.25 } : t >= 36.9 ? { x: 0.9, y: 0.4 } : { x: 0.6, y: 0.2 };

  // belt, helper, cables
  const strap = ramp(frame, 5.66, 0.45);
  const tools = [T.internet, T.email, T.calendar, T.shop].map((at) => (t < at - 0.03 ? 0 : Math.min(1.1, pop(frame, at))));
  const toolGlow = [T.internet, T.email, T.calendar, T.shop].map((at) => during(frame, at, at + 0.9, 0.15));
  const helper = t < 11.78 ? 0 : Math.min(1.1, pop(frame, 11.8));
  const cablesO = ramp(frame, 13.78, 0.12);
  const tug = Math.max(during(frame, 17.62, 19.6, 0.2), during(frame, 27.0, 29.9, 0.2), during(frame, 37.6, 38.3, 0.1));
  const slotGlow = during(frame, 17.25, 18.0, 0.12);
  const light = t >= 17.62 ? 1 : 0;

  // the brain strains (can't reach the hands itself)
  const strain = during(frame, 12.85, 13.75, 0.12);
  // its request: a bubble from the jar that drops into the helper's slot
  const reqIn = pop(frame, T.ask);
  const reqGo = ramp(frame, 17.08, 0.4);
  const REQ0: Pt = { x: JAR.x + 112, y: JAR.y + 6 };
  const req = arc(REQ0, SLOT_W, reqGo, 60);
  // the result note climbs back up from the slot into the jar
  const resK = ramp(frame, 20.2, 0.75);
  const res = arc({ x: SLOT_W.x, y: SLOT_W.y - 10 }, JAR, resK, 40);
  const jarGlow = Math.max(during(frame, 20.9, 21.8, 0.15), during(frame, T.think - 0.02, T.think + 0.3, 0.05));

  // ── screens ──
  const shop1 = t >= 17.62 && t < 21.6;
  const shop2 = t >= T.opens;
  const typed1 = "eggs".slice(0, Math.floor(interpolate(t, [17.75, 18.35], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const typed2 = "eggs".slice(0, [27.62, 27.78, 27.94, 28.1].filter((at) => t >= at).length);
  const kioskOn = t >= 22.4;
  const cartN = t >= T.cart ? 1 : 0;
  const cartRing = during(frame, T.looks, 36.3, 0.2);
  const cartCheck = t >= T.done ? 1 : 0;
  const inCart = t < T.doesIt - 0.03 ? 0 : Math.min(1.08, pop(frame, T.doesIt));

  // ── loop ──
  const ringDraw = ramp(frame, 36.95, 0.4);
  const ringO = during(frame, 36.9, 41.75, 0.3);
  const stationOn = (at: number, deg: number) => {
    const first = t >= at ? Math.min(1, (t - at) / 0.25) * (t < at + 0.5 ? 1 : 0) : 0;
    const a = (((runnerDeg(t) - deg) % 360) + 360) % 360;
    const lap = t > RUN_FROM && t < T.done && a < 28 ? 1 : 0;
    return Math.max(first, lap);
  };
  const onLook = Math.max(stationOn(T.look1, ST.look), stationOn(T.again, ST.look));
  const onThink = stationOn(T.think, ST.think);
  const onDo = stationOn(T.doo, ST.doo);

  // hand slot ring (for the "do" highlight)
  const { elbow, wrist } = armJoints("R", right);
  const ha = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
  const handC = { x: wrist.x + Math.cos(ha) * 60, y: wrist.y + Math.sin(ha) * 60 };

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
      <World cam={c}>
        <Stage spotX={760} floorY={FLOOR} />

        {/* the chatbot kiosk: off until it's asked; then it only lists */}
        <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
          <Kiosk w={CHAT.w}>
            <ScreenOff o={kioskOn ? 0 : 1} />
            {kioskOn ? (
              <KioskChat
                w={CHAT.w}
                msgs={[
                  { from: "me", o: pop(frame, 22.46), text: "Cheap eggs?" },
                  {
                    from: "ai", o: pop(frame, 24.02), text: (
                      <>
                        Here's a list:
                        {["A local store", "A supermarket", "A delivery app"].map((s, i) => (
                          <div key={s} style={{ fontWeight: 600, fontSize: CHAT.w * 0.048, opacity: ramp(frame, 24.25 + i * 0.22, 0.15), color: "#C9CED8" }}>• {s}</div>
                        ))}
                      </>
                    ),
                  },
                ]}
              />
            ) : null}
          </Kiosk>
        </div>

        {/* the self-checkout */}
        <div style={{ position: "absolute", left: SCREEN.left, top: SCREEN.top }}>
          <Checkout w={SCREEN.w} bodyH={BODY_H} feed={0} receipt={null}>
            {shop1 ? (
              <ShopView w={SCREEN.w} query={typed1} tiles={pop(frame, 18.68)} picked={0} cart={0} />
            ) : shop2 ? (
              <>
                <ShopView w={SCREEN.w} query={typed2} tiles={pop(frame, T.compares)} picked={t >= 29.05 ? 1 : 0} cart={cartN} cartPop={ramp(frame, T.cart, 0.35)} cartRing={cartRing} cartCheck={cartCheck} />
                {inCart > 0 ? (
                  <div style={{ position: "absolute", left: "50%", top: "62%", translate: "-50% -50%", scale: `${inCart}`, rotate: "-6deg", padding: "10px 30px", borderRadius: 18, backgroundColor: colors.mint, border: `6px solid ${INK}`, fontSize: 52, fontWeight: 800, color: INK, whiteSpace: "nowrap" }}>
                    In your cart ✓
                  </div>
                ) : null}
              </>
            ) : (
              <ScreenOff />
            )}
          </Checkout>
        </div>

        {/* the loop ring round the agent (behind it) */}
        {ringO > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: ringO }}>
            <LoopRing cx={RING.cx} cy={RING.cy} rx={RING.rx} ry={RING.ry} draw={ringDraw} runner={runnerDeg(t)} runnerO={t > RUN_FROM - 0.05 && t < T.done + 0.05 ? 1 : 0} />
          </div>
        ) : null}

        {/* the agent */}
        <div style={{ position: "absolute", left: figLeft, top: FIG.top - 12 * Math.abs(Math.sin(Math.PI * stepK(t))) }}>
          <Figure2
            size={FIG.size}
            eyes={eyes}
            notebook={0}
            look={look}
            glow={jarGlow}
            left={{ target: left, pose: "relaxed", thumb: "up", hand: gloveL }}
            right={{ target: right, pose: t > 17.6 && t < 30.2 ? "point" : t > 30.6 ? "point" : "relaxed", thumb: t > 17.6 ? "up" : "down", hand: gloveR, press }}
            front={
              <g>
                {strain > 0 ? (
                  <g opacity={strain} stroke={colors.coral} strokeWidth={6} strokeDasharray="12 10" fill="none" strokeLinecap="round">
                    <path d={`M 270 300 L ${REST_WIDE_L.x + 20} ${REST_WIDE_L.y - 30}`} />
                    <path d={`M 330 300 L ${REST_WIDE_R.x - 20} ${REST_WIDE_R.y - 30}`} />
                    {[[(270 + REST_WIDE_L.x + 20) / 2, (300 + REST_WIDE_L.y - 30) / 2], [(330 + REST_WIDE_R.x - 20) / 2, (300 + REST_WIDE_R.y - 30) / 2]].map(([x, y], i) => (
                      <path key={i} d={`M ${x - 16} ${y - 16} L ${x + 16} ${y + 16} M ${x + 16} ${y - 16} L ${x - 16} ${y + 16}`} strokeDasharray="none" strokeWidth={9} />
                    ))}
                  </g>
                ) : null}
                {onLook > 0 ? <g opacity={onLook}>{[256, 344].map((x) => <circle key={x} cx={x} cy={66} r={44} fill="none" stroke={colors.yellow} strokeWidth={8} />)}</g> : null}
                {onDo > 0 ? <circle cx={handC.x} cy={handC.y} r={66} fill="none" stroke={colors.yellow} strokeWidth={8} opacity={onDo} /> : null}
              </g>
            }
          >
            <BeltKit
              strap={strap}
              tools={tools}
              toolGlow={toolGlow}
              helper={helper}
              slotGlow={slotGlow}
              light={light}
              cables={{ l: forearmPt("L", left), r: forearmPt("R", right), o: cablesO, tug }}
            />
          </Figure2>
        </div>

        {/* the brain's request → into the helper's slot */}
        {t > T.ask - 0.05 && reqGo < 1 ? (
          <div style={{ position: "absolute", left: req.x, top: req.y, translate: "0 -100%", scale: `${Math.min(1, reqIn) * (1 - 0.9 * reqGo)}`, transformOrigin: "0 100%" }}>
            <Bubble fontSize={22} tail="bottom-left">search for eggs, please</Bubble>
          </div>
        ) : null}
        {/* the result climbs back up into the jar */}
        {resK > 0 && resK < 1 ? (
          <div style={{ position: "absolute", left: res.x, top: res.y, translate: "-50% -50%", scale: `${0.45 + 0.55 * Math.sin(resK * Math.PI)}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 12, backgroundColor: "#F3EBDD", border: `4px solid ${INK}` }}>
              <EggCarton w={46} />
              <svg width={24} height={24} viewBox="0 0 84 84" aria-hidden><path d="M 12 44 L 34 66 L 74 18" fill="none" stroke="#2FA37E" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        ) : null}

        {/* loop station tags */}
        {ringO > 0 ? (
          <div style={{ opacity: ringO }}>
            {([["look", ST.look, onLook, T.look1], ["think", ST.think, onThink, T.think], ["do", ST.doo, onDo, T.doo]] as [string, number, number, number][]).map(([w, deg, on, at]) => {
              const p = onRing(deg, 58);
              return (
                <div key={w} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%" }}>
                  <Tag fontSize={30} o={t < at - 0.05 ? 0 : Math.min(1, pop(frame, at))} on={on}>{w}</Tag>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* tells vs does */}
        <div style={{ position: "absolute", left: KIOSK_C.x, top: 870, translate: "-50% 0" }}>
          <Tag fontSize={40} o={t < T.chatTells - 0.05 ? 0 : Math.min(1, pop(frame, T.chatTells))}>tells you</Tag>
        </div>
        <div style={{ position: "absolute", left: 660, top: 870, translate: "-50% 0" }}>
          <Tag fontSize={40} o={t < T.agentDoes - 0.05 ? 0 : Math.min(1, pop(frame, T.agentDoes))} on={t >= T.agentDoes ? 1 : 0}>does it</Tag>
        </div>
      </World>

      {/* the person asking the agent (screen space, as in S1) */}
      <div style={{ position: "absolute", left: 60, top: 880, opacity: during(frame, 26.85, 30.4, 0.2), scale: `${Math.min(1, pop(frame, 26.85))}`, transformOrigin: "0 100%" }}>
        <PersonSays fontSize={46}>Cheap eggs, please</PersonSays>
      </div>

      <QuestionStrip active={0} o={1 - ramp(frame, 3.0, 0.4)} />
      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s3" look={LOOK} />
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
