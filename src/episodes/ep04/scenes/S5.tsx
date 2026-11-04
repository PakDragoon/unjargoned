import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { Coin, Receipt, ToolIcon } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { Figure2, INK, OUT, PAPER, Pt, SHADOW, Stage } from "../Rig";
import { Checkout, Kiosk, ProductView } from "../Screens";
import { scene } from "../timeline";
import {
  BODY_H, BUY_TIP, BeltKit, Bubble, CHAT, CamKey, FIG, FLOOR, GATE, HELPER_SLOT, Key, PersonSays, REST_WIDE_L, REST_WIDE_R, SCREEN,
  ScreenOff, ShopView, World, along, beltWorld, camAt, forearmPt, fw, onPage, toScreen, wristFor,
} from "../World";

const S = scene("S5");

// Times (s) from the S5 word timings in captions.json. Re-voice S5 → re-check these.
const T = {
  youAsk: 4.62, clock: 5.44, so: 5.9, happens: 7.28, email: 8.48, arriving: 8.82,
  works: 10.54, risky: 12.34, paying: 13.34, sending: 14.42, deleting: 15.9, stops: 17.94, first: 19.48,
  remember: 20.66, onlyAsk: 22.06, helper: 23.28, hold: 23.76, yes: 25.36,
  broke: 27.5, eggs: 28.04, openai: 29.06, buying: 33.46, thatTime: 34.46, didnt: 35.98, newer: 37.52, world: 40.66,
};

// One shot on the S1 stage. The agent dozes (lids shut) and wakes three ways: a person asks, the alarm clock on the
// shelf rings, an envelope drops from the mail slot into the tray → it works at the checkout → the "Allow?" gate slides
// up on the helper box; risky requests from the jar (pay · send · delete) stop on it; Dot presses Yes for the payment →
// the brain only asks, so the helper holds the click: the finger waits over Buy → rewind to S1: the gate was missing,
// the finger pressed Buy, the receipt printed → back to now: the gate snaps on and the strip's "Allow?" card fills.

const JAR: Pt = fw({ x: 300, y: 192 });
const SHELF = { x: 70, y: 330, w: 280 };
const CLOCK: Pt = { x: 210, y: 262 };
const MAIL = { x: 1650, y: 420, w: 130 }; // mail slot in the back wall
const TRAY = { x: 1640, y: 610, w: 180 };
const GATE_TOP: Pt = fw({ x: GATE.x, y: GATE.bottom - GATE.h });
const SLOT_W: Pt = fw(HELPER_SLOT);

const CAM: CamKey[] = [
  [-1, 900, 500, 1.0], [5.75, 900, 500, 1.0], [6.5, 1120, 500, 1.15], [9.6, 1120, 500, 1.15], [10.3, 820, 480, 1.25], [12.4, 820, 480, 1.25],
  [13.0, 660, 520, 2.6], [20.2, 660, 520, 2.6], [20.9, 860, 470, 1.6], [26.1, 860, 470, 1.6], [26.4, 860, 490, 1.3], [33.9, 820, 500, 1.5],
  [34.5, 680, 560, 2.4], [35.45, 680, 560, 2.4], [35.9, 860, 520, 1.3], [37.3, 860, 520, 1.3], [37.7, 680, 640, 2.2], [39.3, 680, 640, 2.2],
  [40.1, 850, 520, 1.0], [99, 850, 520, 1.0],
];

// right arm: works at the checkout (taps), then hovers over Buy — held by the helper — and in the flashback presses it
const TILE = wristFor(onPage(0.12, 0.3), "R", FIG.left); // the near edge of the picked tile (within reach)
const NEAR_TILE = { x: TILE.x - 18, y: TILE.y - 26 };
const PRESS = wristFor(BUY_TIP());
const HOVER = wristFor({ x: BUY_TIP().x - 18, y: BUY_TIP().y - 34 });
const RIGHT_KEYS: Key[] = [
  [-1, REST_WIDE_R], [9.9, REST_WIDE_R], [10.5, NEAR_TILE], [10.75, TILE], [10.95, NEAR_TILE], [11.25, TILE], [11.45, NEAR_TILE], [11.75, TILE],
  [12.2, REST_WIDE_R], [21.6, REST_WIDE_R], [22.6, HOVER], [26.2, HOVER],
  [26.3, HOVER], [35.6, HOVER], [35.98, PRESS], [36.6, PRESS], [37.3, HOVER], [99, HOVER],
];

const AlarmClock: React.FC<{ size?: number; ring?: number; t: number }> = ({ size = 130, ring = 0, t }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ rotate: `${Math.sin(t * 60) * 9 * ring}deg`, overflow: "visible" }}>
    <circle cx={24} cy={16} r={11} fill={colors.coral} stroke={INK} strokeWidth={5} /><circle cx={76} cy={16} r={11} fill={colors.coral} stroke={INK} strokeWidth={5} />
    <path d="M 22 92 L 30 80 M 78 92 L 70 80" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <circle cx={50} cy={54} r={38} fill={PAPER} stroke={INK} strokeWidth={6} />
    <line x1={50} y1={54} x2={50} y2={28} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <line x1={50} y1={54} x2={50} y2={78} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.0} />
    <line x1={50} y1={54} x2={68} y2={54} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <circle cx={50} cy={54} r={4} fill={INK} />
    {ring > 0 ? <g stroke={colors.yellow} strokeWidth={5} strokeLinecap="round" opacity={ring}><path d="M 2 30 L -10 24 M 0 50 L -14 50 M 98 30 L 110 24 M 100 50 L 114 50" /></g> : null}
  </svg>
);
const PaperPlane: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
    <path d="M 6 48 L 94 10 L 66 90 L 48 60 Z" fill={colors.white} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 48 60 L 94 10 L 40 72 Z" fill="#C9D3EA" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);
const BinIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 110" aria-hidden>
    <rect x={14} y={26} width={72} height={80} rx={12} fill="#9AA0AE" stroke={INK} strokeWidth={6} />
    <rect x={6} y={12} width={88} height={16} rx={8} fill={colors.white} stroke={INK} strokeWidth={5} />
    {[34, 50, 66].map((x) => <rect key={x} x={x - 3} y={40} width={6} height={54} rx={3} fill={INK} opacity={0.5} />)}
  </svg>
);

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.youAsk), mood: "happy" },
  { at: sec(T.works), mood: "neutral" },
  { at: sec(T.paying), mood: "curious" },
  { at: sec(18.9), mood: "smug" },
  { at: sec(T.remember), mood: "curious" },
  { at: sec(26.4), mood: "worried" },
  { at: sec(T.didnt), mood: "panic" },
  { at: sec(T.newer + 0.1), mood: "relieved" },
];

const S5Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = camAt(CAM, t);
  const flash = t >= 26.25 && t < 37.47;

  // ── sleep / wake ──
  const lidKeys: [number, number][] = [[-1, 1], [4.62, 1], [4.75, 0], [5.15, 0], [5.3, 1], [5.45, 0], [6.3, 0], [6.6, 1], [8.98, 1], [9.03, 0], [9.08, 0.8], [9.16, 0], [99, 0]];
  const lids = (() => {
    let i = 0;
    while (i < lidKeys.length - 2 && t > lidKeys[i + 1][0]) i++;
    const [t0, a] = lidKeys[i];
    const [t1, b] = lidKeys[i + 1];
    return a + (b - a) * Math.max(0, Math.min(1, (t - t0) / Math.max(0.01, t1 - t0)));
  })();
  const dim = lids * 0.7;

  // ── arm ──
  const right = along(RIGHT_KEYS, t);
  const taps = [10.75, 11.25, 11.75].reduce((m, at) => Math.max(m, during(frame, at - 0.04, at + 0.12, 0.04)), 0);
  const press = Math.max(taps, during(frame, 35.96, 36.6, 0.05));

  // ── gate on the helper ──
  const gateUp = flash ? 0 : t < 12.84 ? 0 : t < 37.47 ? Math.min(1.06, pop(frame, 12.84)) : 1;
  const gateBack = t >= 37.47 ? Math.min(1.1, pop(frame, 37.47)) : 0;
  const gate = t >= 37.47 ? gateBack : gateUp;
  const gateGlow = Math.max(during(frame, 17.9, 18.9, 0.2), during(frame, 23.7, 26.1, 0.2), during(frame, 37.5, 38.6, 0.2));
  const gateYes = (t >= 19.02 && t < 20.4) || during(frame, 25.3, 25.9, 0.05) > 0.5 ? 1 : 0;
  const missing = flash ? Math.max(ramp(frame, 33.2, 0.3) * 0.6, ramp(frame, T.thatTime, 0.2)) * (0.8 + 0.2 * Math.abs(Math.sin(t * 6))) : 0;

  // ── risky requests: bubbles from the jar stop on the gate; Yes lets the payment through ──
  const REQ0: Pt = { x: JAR.x + 70, y: JAR.y + 40 };
  const STOP: Pt = { x: GATE_TOP.x, y: GATE_TOP.y - 32 };
  const QUEUE: Pt[] = [{ x: GATE_TOP.x - 76, y: GATE_TOP.y - 34 }, { x: GATE_TOP.x + 76, y: GATE_TOP.y - 34 }, STOP];
  const reqs = [
    { at: 12.95, park: 13.95, kind: "coin" },
    { at: 14.05, park: 15.42, kind: "plane" },
    { at: 15.5, park: 99, kind: "bin" },
  ];
  const ease = Easing.inOut(Easing.cubic);
  const reqPos = (i: number) => {
    const r = reqs[i];
    const fall = ease(Math.max(0, Math.min(1, (t - r.at) / 0.45)));
    let p = { x: REQ0.x + (STOP.x - REQ0.x) * fall, y: REQ0.y + (STOP.y - REQ0.y) * fall };
    const bounce = Math.max(0, Math.sin(Math.max(0, Math.min(1, (t - r.at - 0.45) / 0.25)) * Math.PI)) * -10;
    p = { x: p.x, y: p.y + bounce };
    const park = ease(Math.max(0, Math.min(1, (t - r.park) / 0.35)));
    p = { x: p.x + (QUEUE[i].x - STOP.x) * park, y: p.y + (QUEUE[i].y - STOP.y) * park };
    if (i === 0) {
      // Yes: the payment request goes into the helper's slot
      const go = ease(Math.max(0, Math.min(1, (t - 19.1) / 0.4)));
      p = { x: p.x + (SLOT_W.x - p.x) * go, y: p.y + (SLOT_W.y - p.y) * go };
    }
    return p;
  };
  const reqO = (i: number) => (t < reqs[i].at ? 0 : 1) * (i === 0 ? 1 - ramp(frame, 19.4, 0.15) : 1) * (1 - ramp(frame, 20.4, 0.25));
  const buyReq = (() => {
    const at = 21.78;
    const fall = ease(Math.max(0, Math.min(1, (t - at - 0.2) / 0.5)));
    return { x: REQ0.x + 30 + (STOP.x - REQ0.x - 30) * fall, y: REQ0.y - 30 + (STOP.y - REQ0.y + 30) * fall };
  })();

  // ── flashback receipt + present-day checkout page ──
  const feed = flash ? 300 * ramp(frame, 36.05, 0.6) : 0;
  const shopOn = t >= 9.9;

  // ── wake-ups ──
  const ring = during(frame, 5.34, 6.2, 0.1);
  const envK = Math.max(0, Math.min(1, (t - 8.28) / 0.48));
  const env = { x: MAIL.x + MAIL.w / 2 - 50, y: MAIL.y - 30 + (TRAY.y - 70 - (MAIL.y - 30)) * envK * envK };

  // ── Dot (screen space): positions worked out from the camera at that moment ──
  const yesAt = toScreen(beltWorld.gateYes(), camAt(CAM, 18.9));
  const ROUTE = hops([
    { at: 0, x: 1820, y: 930 },
    { at: sec(4.4), x: 1700, y: 940 },
    { at: sec(6.6), x: 1100, y: 930 },
    { at: sec(10.4), x: 1790, y: 940 },
    { at: sec(13.0), x: 1640, y: 900 },
    { at: sec(18.95), x: yesAt.x - 70, y: yesAt.y + 95 },
    { at: sec(20.9), x: 1780, y: 930 },
    { at: sec(26.6), x: 1800, y: 950 },
    { at: sec(37.9), x: 1720, y: 930 },
  ]);
  const LOOK = glances([
    { at: 0, x: -1, y: -0.4 },
    { at: sec(5.4), x: -1, y: -0.6 },
    { at: sec(6.6), x: 1, y: -0.6 },
    { at: sec(10.4), x: -1, y: -0.4 },
    { at: sec(13.0), x: -1, y: -0.5 },
    { at: sec(18.95), x: -0.7, y: -0.7 },
    { at: sec(20.9), x: -1, y: -0.4 },
    { at: sec(26.6), x: -1, y: -0.4 },
    { at: sec(37.9), x: -1, y: -0.5 },
  ]);

  const look = lids > 0.5 ? { x: 0, y: 0 } : t < 4.95 ? { x: -0.8, y: 0.5 } : t < 6.4 ? { x: -1, y: -0.4 } : t < 9.9 ? { x: 1, y: 0 } : t < 12.4 ? { x: 1, y: 0.3 } : t < 20.4 ? { x: 0, y: 1 } : { x: 1, y: 0.4 };

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
      <World cam={c} filter={flash ? "sepia(0.55) saturate(0.7) brightness(0.92)" : undefined}>
        <Stage spotX={800} floorY={FLOOR} />

        {/* shelf + alarm clock (left), mail slot + tray (right) */}
        <div style={{ position: "absolute", left: SHELF.x, top: SHELF.y, width: SHELF.w, height: 22, borderRadius: 6, backgroundColor: "#8A6A3E", border: `${OUT}px solid ${INK}`, boxSizing: "border-box", filter: `drop-shadow(6px 8px 0 ${SHADOW})` }} />
        <div style={{ position: "absolute", left: CLOCK.x - 65, top: CLOCK.y - 65 }}>
          <AlarmClock t={t} ring={ring} />
        </div>
        <div style={{ position: "absolute", left: CLOCK.x - 52, top: CLOCK.y + 78, padding: "2px 12px", borderRadius: 10, backgroundColor: colors.panel, border: `4px solid ${INK}`, fontSize: 30, fontWeight: 800, color: ring > 0 ? colors.yellow : colors.subtext }}>7:00</div>
        <div style={{ position: "absolute", left: MAIL.x, top: MAIL.y, width: MAIL.w, height: 34, borderRadius: 10, backgroundColor: "#3A3F4D", border: `${OUT}px solid ${INK}`, boxSizing: "border-box" }}>
          <div style={{ position: "absolute", left: 14, right: 14, top: 8, height: 8, borderRadius: 4, backgroundColor: INK }} />
        </div>
        <svg width={TRAY.w + 40} height={FLOOR - TRAY.y + 10} style={{ position: "absolute", left: TRAY.x - 20, top: TRAY.y, overflow: "visible" }} aria-hidden>
          <path d={`M ${TRAY.w / 2 + 20} 40 L ${TRAY.w / 2 + 20} ${FLOOR - TRAY.y}`} stroke={INK} strokeWidth={20} />
          <path d={`M ${TRAY.w / 2 + 20} 40 L ${TRAY.w / 2 + 20} ${FLOOR - TRAY.y}`} stroke="#3A3F4D" strokeWidth={10} />
          <path d={`M 20 0 L ${TRAY.w + 20} 0 L ${TRAY.w} 44 L 40 44 Z`} fill="#5B6378" stroke={INK} strokeWidth={OUT} strokeLinejoin="round" />
        </svg>
        {t >= 8.28 ? (
          <div style={{ position: "absolute", left: env.x, top: env.y, rotate: `${(1 - envK) * -12}deg`, clipPath: envK < 0.2 ? `inset(${(0.2 - envK) * 400}px 0 0 0)` : undefined }}>
            <ToolIcon kind="envelope" size={100} />
          </div>
        ) : null}

        {/* the kiosk (off) and the checkout */}
        <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
          <Kiosk w={CHAT.w}><ScreenOff /></Kiosk>
        </div>
        <div style={{ position: "absolute", left: SCREEN.left, top: SCREEN.top }}>
          <Checkout w={SCREEN.w} bodyH={BODY_H} feed={feed} receipt={<Receipt w={SCREEN.w * 0.3} />}>
            {!shopOn ? <ScreenOff /> : t < 20.6 ? (
              <ShopView w={SCREEN.w} query="eggs" tiles={1} picked={t > 10.75 ? 1 : 0} cart={0} />
            ) : (
              <ProductView w={SCREEN.w} press={flash ? during(frame, 35.96, 36.6, 0.05) : 0} ripple={flash ? ramp(frame, 35.98, 0.5) : 0} />
            )}
          </Checkout>
        </div>

        {/* the agent */}
        <div style={{ position: "absolute", left: FIG.left, top: FIG.top + 8 * dim }}>
          <Figure2
            size={FIG.size}
            eyes={1}
            notebook={1}
            lids={lids}
            dim={dim}
            look={look}
            left={{ target: REST_WIDE_L, pose: "relaxed", thumb: "up" }}
            right={{ target: right, pose: t > 9.9 && t < 12.3 ? "point" : t > 21.6 ? "point" : "relaxed", thumb: t > 9.9 && t < 12.3 ? "up" : t > 21.6 ? "up" : "down", press }}
          >
            <BeltKit helper={1} light={1} slotGlow={during(frame, 19.3, 19.7, 0.1)} gate={gate} gateYes={gateYes} gateGlow={gateGlow}
              cables={{ l: forearmPt("L", REST_WIDE_L), r: forearmPt("R", right), o: 1, tug: during(frame, 35.6, 36.6, 0.2) }} />
          </Figure2>
        </div>

        {/* risky requests, stopped on the gate */}
        {reqs.map((r, i) => {
          const o = reqO(i);
          if (o <= 0) return null;
          const p = reqPos(i);
          return (
            <div key={r.kind} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", opacity: o, scale: `${Math.min(1, pop(frame, r.at))}` }}>
              <div style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: colors.white, border: `4px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", filter: `drop-shadow(3px 4px 0 ${SHADOW})` }}>
                {r.kind === "coin" ? <Coin size={44} /> : r.kind === "plane" ? <PaperPlane size={40} /> : <BinIcon size={38} />}
              </div>
            </div>
          );
        })}
        {/* "Buy, please" waits on the gate */}
        {t > 21.7 && t < 26.2 ? (
          <div style={{ position: "absolute", left: buyReq.x, top: buyReq.y, translate: "-50% -100%", scale: `${Math.min(1, pop(frame, 21.78)) * 0.9}`, transformOrigin: "50% 100%" }}>
            <Bubble fontSize={26} tail="bottom">Buy, please</Bubble>
          </div>
        ) : null}
      </World>

      {/* the person asking (screen space) */}
      <div style={{ position: "absolute", left: 60, top: 920, opacity: during(frame, 4.5, 6.4, 0.2), scale: `${Math.min(1, pop(frame, 4.52))}`, transformOrigin: "0 100%" }}>
        <PersonSays fontSize={42}>Check my emails?</PersonSays>
      </div>

      {/* the missing gate (drawn outside the sepia so its coral reads): where "Allow?" should have been */}
      {missing > 0 ? (() => {
        const g = toScreen(beltWorld.gate(), c);
        const w = GATE.w * 0.8 * c.z;
        const h = GATE.h * 0.8 * c.z;
        return (
          <div style={{ position: "absolute", left: g.x - w / 2, top: g.y - h / 2, width: w, height: h, borderRadius: 12 * c.z / 2, border: `${3 * c.z}px dashed ${colors.coral}`, backgroundColor: "rgba(255,138,92,0.16)", boxSizing: "border-box", opacity: missing, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 * c.z, fontWeight: 800, color: colors.coral }}>
            Allow?
          </div>
        );
      })() : null}

      {/* in the flashback: what the reporter asked (as in S1) */}
      <div style={{ position: "absolute", left: 60, top: 900, opacity: during(frame, 27.9, 33.7, 0.25), scale: `${Math.min(1, pop(frame, 27.9))}`, transformOrigin: "0 100%", filter: "sepia(0.4)" }}>
        <PersonSays fontSize={42}>Find me cheap eggs</PersonSays>
      </div>

      {/* rewind streaks + "earlier" frame */}
      <AbsoluteFill style={{ opacity: during(frame, 26.2, 26.9, 0.08) }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 2100 - ((frame * 160 + i * 377) % 2400), top: 80 + i * 110, width: 340, height: 10, borderRadius: 5, backgroundColor: colors.white, opacity: 0.3 }} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: flash ? 1 : 0 }}>
        <div style={{ position: "absolute", inset: 24, borderRadius: 30, border: `6px solid rgba(255,255,255,0.35)` }} />
        <div style={{ position: "absolute", left: 60, top: 50, padding: "8px 24px", borderRadius: 999, backgroundColor: colors.panel, border: `3px solid ${colors.line}`, fontSize: 34, fontWeight: 700, color: colors.subtext }}>The egg order</div>
      </AbsoluteFill>

      <QuestionStrip active={t >= 38.6 ? -1 : 2} answered={t >= 38.6 ? 3 : 2} allowFill={ramp(frame, 38.1, 0.5)} o={Math.max(1 - ramp(frame, 3.0, 0.4), ramp(frame, 37.75, 0.3))} />
      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s5" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S5 — third stop: who switches it on, and when does it stop to ask? Edit only this file for S5 changes.
export const S5: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S5Content />
    </LineWipeIn>
  </SceneShell>
);
