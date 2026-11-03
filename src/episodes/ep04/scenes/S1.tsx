import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { ChatBubble, ChatWindow, StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LogoMark, Wordmark } from "../../../shared/Logo";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { BuyButton, Cursor, DeliveryBag, EggCarton, HandShape, Magnifier, PriceTag, ProductTile, Receipt, ShopPage } from "../Props";
import { scene } from "../timeline";

const S = scene("S1");

// Times (s) from the S1 word timings in captions.json. Re-voice S1 → re-check these.
const T = {
  order: 1.46, card: 2.64, d31: 4.22, eggs: 5.38, never: 6.52, buy: 7.58, find: 9.48, findEnd: 9.9,
  most: 10.84, talks: 11.68, thisOne: 12.7, buyBtn: 13.38, so: 14.44, changed: 15.96, lets: 17.36,
};

// Phases: the order lands (frame 0 already moving) → rewind: what he asked vs what it did → a chatbot talks,
// this one clicked Buy → "?" → logo sting on the "?".
const P = { order: [0, 6.3], rewind: [6.3, 10.75], talk: [10.75, 14.35], q: [14.35, 99] } as const;

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.d31), mood: "panic" },
  { at: sec(T.never), mood: "neutral" },
  { at: sec(T.find), mood: "surprised" },
  { at: sec(T.most), mood: "curious" },
  { at: sec(T.buyBtn), mood: "surprised" },
  { at: sec(T.so), mood: "intrigued" },
  { at: sec(T.lets), mood: "happy" },
];

// Route: already mid-hop at frame 0 → lands on the doormat by the bag → watches the rewind → by the chat → beside the logo.
const ROUTE = hops([
  { at: -4, x: 1880, y: 420 },
  { at: sec(0.4), x: 1600, y: 640 },
  { at: sec(1.7), x: 1690, y: 850 }, // onto the doormat
  { at: sec(6.9), x: 1700, y: 900 },
  { at: sec(T.find - 0.4), x: 1720, y: 700 }, // up beside the magnifier
  { at: sec(10.6), x: 1680, y: 900 },
  { at: sec(11.4), x: 1610, y: 880 },
  { at: sec(T.so + 0.2), x: 1480, y: 830 },
  { at: sec(T.lets + 0.2), x: 1560, y: 860 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: 0.2 },
  { at: sec(1.7), x: -0.9, y: 0.1 }, // the bag
  { at: sec(3.9), x: -0.7, y: -0.9 }, // the receipt flying up
  { at: sec(6.9), x: -0.9, y: -0.6 },
  { at: sec(T.find - 0.4), x: -0.6, y: -0.6 },
  { at: sec(10.6), x: -0.9, y: -0.6 },
  { at: sec(T.so + 0.2), x: -0.9, y: -0.4 },
]);

/** A plain bank card (no brand): chip and dots only. */
const BankCard: React.FC<{ w?: number }> = ({ w = 300 }) => (
  <div style={{ width: w, height: w * 0.63, borderRadius: w * 0.07, background: "linear-gradient(135deg, #8EA7FF, #6F86E0)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", position: "relative" }}>
    <div style={{ position: "absolute", left: w * 0.1, top: w * 0.2, width: w * 0.17, height: w * 0.13, borderRadius: w * 0.025, backgroundColor: colors.yellow }} />
    <div style={{ position: "absolute", left: w * 0.1, bottom: w * 0.12, display: "flex", gap: w * 0.04 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: w * 0.012 }}>
          {[0, 1, 2, 3].map((j) => <div key={j} style={{ width: w * 0.022, height: w * 0.022, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.85)" }} />)}
        </div>
      ))}
    </div>
  </div>
);

const S1Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const f = (r: readonly [number, number], d = 0.3) => during(frame, r[0], r[1], d);

  // ── Order lands ──
  const banner = pop(frame, -0.18); // already mid-pop on frame 0
  const bagDrop = interpolate(t, [0.85, 1.3], [-520, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x });
  const bagSquash = during(frame, 1.3, 1.45, 0.06);
  const fly = interpolate(t, [3.85, T.d31 + 0.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const receipt = { x: interpolate(fly, [0, 1], [-200, 1110]), y: interpolate(fly, [0, 1], [1150, 150]), s: interpolate(fly, [0, 1], [2.6, 1]), r: interpolate(fly, [0, 1], [-30, 4]) };
  const card = pop(frame, T.card - 0.1);

  // ── Rewind ──
  const rw = during(frame, P.rewind[0] - 0.05, P.rewind[0] + 0.45, 0.08);
  const typed = "eggs".slice(0, Math.floor(interpolate(t, [6.9, 7.6], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const toCart = ramp(frame, 8.0, 0.45);
  const cheaper = ramp(frame, 8.45, 0.3);
  const mag = pop(frame, T.find - 0.9);
  const knock = ramp(frame, T.findEnd + 0.05, 0.45);
  const bagSwing = ramp(frame, T.findEnd - 0.25, 0.3);
  const cursor = (() => {
    const keys: [number, number, number][] = [[6.5, 900, 700], [6.85, 520, 330], [7.7, 520, 330], [7.95, 500, 520], [8.4, 870, 290]];
    let p = { x: keys[0][1], y: keys[0][2] };
    for (let i = 1; i < keys.length; i++) {
      const k = Math.max(0, Math.min(1, (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
      if (t >= keys[i - 1][0]) p = { x: p.x + (keys[i][1] - p.x) * k, y: p.y + (keys[i][2] - p.y) * k };
    }
    return p;
  })();

  // ── Talk → hands → Buy ──
  const sprout = [0, 1, 2].map((i) => pop(frame, T.thisOne + i * 0.1));
  const pressT = during(frame, T.buyBtn - 0.05, T.buyBtn + 0.3, 0.08);
  const reachB = ramp(frame, T.buyBtn - 0.35, 0.3);

  // ── "?" → logo ──
  const qIn = pop(frame, T.so);
  const toLogo = ramp(frame, T.changed - 0.1, 0.25);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* 1 · Order placed (no fade-in: already moving on frame 0) */}
      <AbsoluteFill style={{ opacity: 1 - ramp(frame, P.order[1] - 0.2, 0.2) }}>
        <div style={{ position: "absolute", left: 110, top: 170 }}>
          <ShopPage w={860} cart={1}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "26px 48px", borderRadius: 28, backgroundColor: colors.mint, transform: `scale(${Math.min(1.08, banner)})` }}>
                <svg width={70} height={70} viewBox="0 0 84 84" aria-hidden><path d="M 12 44 L 34 66 L 74 18" fill="none" stroke={colors.ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div style={{ fontSize: 62, fontWeight: 800, color: colors.ink }}>Order placed</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: ramp(frame, 0.3, 0.3) }}>
                <EggCarton w={190} />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[220, 160].map((w) => <div key={w} style={{ width: w, height: 22, borderRadius: 11, backgroundColor: "rgba(20,22,28,0.18)" }} />)}
                </div>
              </div>
            </div>
          </ShopPage>
        </div>
        <div style={{ position: "absolute", left: 600, top: 660, transform: `rotate(-8deg) scale(${Math.min(1, card)})`, opacity: Math.min(1, card) }}>
          <BankCard w={300} />
        </div>
        {/* doormat + bag */}
        <div style={{ position: "absolute", left: 1180, top: 880, width: 600, height: 90, borderRadius: 30, backgroundColor: "#6B5136", border: "6px dashed #8A6A47", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 1250, top: 600 + bagDrop, transform: `scale(${1 + 0.12 * bagSquash}, ${1 - 0.14 * bagSquash})`, transformOrigin: "50% 100%" }}>
          <DeliveryBag w={260} />
        </div>
        <div style={{ position: "absolute", left: receipt.x, top: receipt.y, transform: `scale(${receipt.s}) rotate(${receipt.r}deg)`, transformOrigin: "0 0", opacity: t > 3.85 ? 1 : 0 }}>
          <Receipt w={330} />
          <div style={{ marginTop: 22, display: "inline-block", padding: "8px 22px", borderRadius: 999, backgroundColor: colors.panel, border: `3px solid ${colors.line}`, fontSize: 34, fontWeight: 700, color: colors.subtext, opacity: ramp(frame, T.d31 + 0.4, 0.3) }}>
            USA, 2025
          </div>
        </div>
      </AbsoluteFill>

      {/* 2 · Rewind: it was asked to FIND (magnifier) — a shopping bag knocks the magnifier aside */}
      <AbsoluteFill style={{ opacity: f(P.rewind, 0.25) }}>
        <div style={{ position: "absolute", left: 110, top: 170 }}>
          <ShopPage w={860} query={typed} cart={toCart > 0.9 ? 1 : 0} cartPop={ramp(frame, 8.45, 0.3)}>
            <div style={{ display: "flex", gap: 34, justifyContent: "center", alignItems: "flex-start", paddingTop: 16, opacity: ramp(frame, 7.7, 0.25) }}>
              <ProductTile w={230}>
                <div style={{ transform: `translate(${toCart * 330}px, ${-toCart * 240}px) scale(${1 - 0.8 * toCart})`, opacity: 1 - ramp(frame, 8.35, 0.1) }}><EggCarton w={170} /></div>
                <PriceTag price="$13.19" w={140} />
              </ProductTile>
              <div style={{ marginTop: 120, opacity: cheaper, transform: `scale(${0.8 + 0.2 * cheaper})` }}>
                <PriceTag price="cheaper" w={170} crossed={ramp(frame, 8.7, 0.3)} />
              </div>
            </div>
          </ShopPage>
        </div>
        <div style={{ position: "absolute", left: cursor.x, top: cursor.y, opacity: ramp(frame, 6.5, 0.2) }}>
          <Cursor size={64} press={during(frame, 7.95, 8.15, 0.05)} />
        </div>
        <div style={{ position: "absolute", left: 1230, top: 170, transform: `translate(${-knock * 520}px, ${-knock * 260}px) rotate(${-knock * 200}deg) scale(${Math.min(1, mag)})`, opacity: 1 - ramp(frame, T.findEnd + 0.35, 0.15) }}>
          <Magnifier size={320} />
        </div>
        <div style={{ position: "absolute", left: 1560 - 380 * bagSwing, top: 170 + 60 * bagSwing, transform: `rotate(${24 - 40 * bagSwing}deg)`, opacity: Math.min(1, bagSwing * 3) }}>
          <DeliveryBag w={240} />
        </div>
        {/* tape-rewind streaks */}
        <AbsoluteFill style={{ opacity: rw }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: -200 + ((frame * 140 + i * 377) % 2300), top: 80 + i * 110, width: 320, height: 10, borderRadius: 5, backgroundColor: colors.white, opacity: 0.25 }} />
          ))}
          <svg style={{ position: "absolute", left: 80, top: 60 }} width={120} height={70} viewBox="0 0 120 70" aria-hidden>
            <path d="M 58 5 L 8 35 L 58 65 Z M 112 5 L 62 35 L 112 65 Z" fill={colors.yellow} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* 3 · Most AI just talks — this one sprouts hands and clicks Buy */}
      <AbsoluteFill style={{ opacity: f(P.talk, 0.3) }}>
        <div style={{ position: "absolute", left: 510, top: 210 }}>
          <ChatWindow width={900} height={600}>
            <ChatBubble from="ai" o={pop(frame, T.most + 0.1)} fontSize={50}>
              <StreamText text="Here are some cheap egg options…" frame={frame} from={sec(T.most + 0.2)} to={sec(T.talks + 0.6)} />
            </ChatBubble>
            <div style={{ flex: 1 }} />
            <div style={{ alignSelf: "center", transform: `scale(${Math.min(1, pop(frame, T.thisOne + 0.2))})` }}>
              <BuyButton w={330} press={pressT} />
            </div>
          </ChatWindow>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <g style={{ transform: `scale(${Math.max(0, sprout[0])})`, transformOrigin: "490px 420px" }}><HandShape cx={470} cy={420} r={48} /></g>
          <g style={{ transform: `scale(${Math.max(0, sprout[1])})`, transformOrigin: "1430px 420px" }}><HandShape cx={1450} cy={420} r={48} flip /></g>
          <g style={{ transform: `scale(${Math.max(0, sprout[2])})`, transformOrigin: "1180px 900px" }}>
            <HandShape cx={1180 - 210 * reachB} cy={900 - 95 * reachB} r={52} press={pressT} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* 4 · "?" — the logo sting lands on it */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: f([P.q[0], 99]) * (1 - toLogo) }}>
        <div style={{ fontSize: 420, fontWeight: 800, color: colors.yellow, lineHeight: 1, transform: `scale(${Math.min(1.05, qIn) * (1 - 0.6 * toLogo)}) rotate(${(1 - Math.min(1, qIn)) * -20}deg)` }}>?</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: ramp(frame, T.changed, 0.2) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ transform: `scale(${Math.min(1.1, pop(frame, T.changed))})` }}>
            <LogoMark size={260} />
          </div>
          <div style={{ opacity: ramp(frame, T.changed + 0.3, 0.3), transform: `translateX(${interpolate(ramp(frame, T.changed + 0.3, 0.4), [0, 1], [-40, 0])}px)` }}>
            <Wordmark fontSize={150} />
          </div>
        </div>
      </AbsoluteFill>

      <Dot path={ROUTE.path} squash={ROUTE.squash} track={TRACK} seed="e4s1" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S1 — hook: an AI placing a $31 egg order. Frame 0 is already moving (no fade-in). Edit only this file for S1 changes.
export const S1: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <S1Content />
  </SceneShell>
);
