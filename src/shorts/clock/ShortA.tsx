import React from "react";
import { colors } from "../../shared/brand";
import { Pt } from "../../shared/Rig";
import { DotActor, clamp01, kk, lerp, route } from "../../episodes/ep05/Common";
import {
  AnswerStamp, At, Badge, CLOCK, Clock, FLOOR_Y, HOUR_HAND, HandSpec, MINUTE_HAND, RED, ShortFrame, Tag, TimeCard, TopPill,
  anglesFor, handTip, lerpHand, makeTimeline, popAt,
} from "./Kit";
import vo from "./a/vo.json";
import durations from "./a/durations.json";
import captions from "./a/captions.json";

// Short A — "AI looked at this clock and said 9:30". Source: Galatzer-Levy et al. 2024 (arXiv 2410.11756), clock at 5:45:
// GPT-4o "9:30" (swapped hands), Gemini Pro 1.5 + GPT-4 Turbo "9:00", Claude Opus 3 "4:50", Claude Sonnet 3.5 correct.
// Frame 1 = the last frame (loop): the 5:45 clock with "AI said: 9:30" stamped across it, Dot doubtful at lower left.

export const tlA = makeTimeline(vo, durations as Record<string, number>, captions as never, "shorts/clock/a");
const { L, w } = tlA;

const A = anglesFor(5, 45);
const TRUE_HOUR: HandSpec = { angle: A.hour, ...HOUR_HAND };
const TRUE_MIN: HandSpec = { angle: A.minute, ...MINUTE_HAND };
// What the AI "saw": the hand on the 9 read as the hour (short), the hand near the 6 as the minutes (long).
const SWAP_HOUR: HandSpec = { angle: A.hour, ...MINUTE_HAND };
const SWAP_MIN: HandSpec = { angle: A.minute, ...HOUR_HAND };
// The phone call: two plain sticks, same length — "which is which?"
const SAME = { len: 0.66, width: 0.065 };

const DOT_HOME: Pt = { x: 200, y: FLOOR_Y - 85 };
const DOT_RIGHT: Pt = { x: 880, y: FLOOR_Y - 85 };

export const ShortA: React.FC = () => (
  <ShortFrame lines={tlA.lines}>
    {(t) => {
      const l4 = L("L4").start;
      const l5 = L("L5").start;
      const l6 = L("L6").start;
      const tSwap = w("L4", "swapped");
      const tNine = w("L4", "nine");
      const tMinutes = w("L4", "minutes");
      const tWhich = w("L5", "Which");
      const tGuess = w("L5", "Guess");
      const tSure = w("L6", "sure");

      /* ── hands ── */
      const glowOn = kk(t, l4, l4 + 0.3) * (1 - kk(t, l5, l5 + 0.3));
      const swapK = kk(t, tSwap, tSwap + 0.6);
      const sameK = kk(t, l5 + 0.2, l5 + 0.8) * (1 - kk(t, tGuess, tGuess + 0.5));
      const guessK = kk(t, tGuess, tGuess + 0.5) * (1 - kk(t, l6, l6 + 0.5));
      const backK = kk(t, l6, l6 + 0.5);
      let hour = lerpHand(TRUE_HOUR, SWAP_HOUR, swapK * (1 - kk(t, l5, l5 + 0.4)));
      let minute = lerpHand(TRUE_MIN, SWAP_MIN, swapK * (1 - kk(t, l5, l5 + 0.4)));
      hour = lerpHand(hour, { ...hour, ...SAME }, sameK);
      minute = lerpHand(minute, { ...minute, ...SAME }, sameK);
      hour = lerpHand(hour, { ...SWAP_HOUR }, guessK);
      minute = lerpHand(minute, { ...SWAP_MIN }, guessK);
      if (backK > 0) {
        hour = lerpHand(hour, TRUE_HOUR, backK);
        minute = lerpHand(minute, TRUE_MIN, backK);
      }
      const glow = Math.max(glowOn, kk(t, tGuess, tGuess + 0.3) * (1 - kk(t, l6, l6 + 0.3)));
      hour = { ...hour, glow };
      minute = { ...minute, glow };

      /* ── the stamp: on from frame 1, lifted at L2, slammed back on "sure" (the loop) ── */
      const stampOff = kk(t, L("L2").start, L("L2").start + 0.35);
      const stampOn = t < tSure ? 1 - stampOff : 1;
      const stampT = t < tSure ? 0.6 + t : t - tSure; // frame 1: already landed, still wobbling a touch

      /* ── L2: the real time ── */
      const realO = kk(t, L("L2").start + 0.15, L("L2").start + 0.4) * (1 - kk(t, L("L3").start, L("L3").start + 0.3));

      /* ── L3: five answers ── */
      const cards: { text: string; ok: boolean; at: number }[] = [
        { text: "9:30", ok: false, at: L("L3").start + 0.05 },
        { text: "9:00", ok: false, at: w("L3", "nine") },
        { text: "9:00", ok: false, at: w("L3", "nine") + 0.15 },
        { text: "4:50", ok: false, at: w("L3", "ten") },
        { text: "5:45", ok: true, at: w("L3", "only") },
      ];
      const cardsOut = 1 - kk(t, l4, l4 + 0.3);

      /* ── L4: role tags ── */
      const tagsO = kk(t, l4 + 0.1, l4 + 0.4) * (1 - kk(t, l5, l5 + 0.3));
      const C = { x: CLOCK.x, y: CLOCK.y };
      const tipH = handTip(CLOCK.r, hour, 0.18);
      const tipM = handTip(CLOCK.r, minute, 0.1);
      const posHour = { x: C.x + tipH.x + 150, y: C.y + tipH.y - 20 };
      const posMin = { x: C.x + tipM.x * 0.55, y: C.y + 52 }; // under the 9 o'clock hand, clear of the 8 and the 10
      const tagMove = kk(t, tSwap, tSwap + 0.6);
      // before the swap: long hand = MINUTES, short = HOUR (yellow, true); after: long hand = HOUR (red), short = MINUTES (red)
      const hourTagPos = { x: lerp(posHour.x, posMin.x, tagMove), y: lerp(posHour.y, posMin.y, tagMove) - Math.sin(tagMove * Math.PI) * 80 };
      const minTagPos = { x: lerp(posMin.x, posHour.x, tagMove), y: lerp(posMin.y, posHour.y, tagMove) + Math.sin(tagMove * Math.PI) * 80 };
      const tagTone = tagMove > 0.5 ? "red" : "yellow";

      /* ── readouts under the clock ── */
      const read9 = popAt(t, tNine) * (1 - kk(t, l5, l5 + 0.3));
      const read30 = popAt(t, tMinutes) * (1 - kk(t, l5, l5 + 0.3));
      const bubbleO = kk(t, l5 + 0.1, l5 + 0.4) * (1 - kk(t, tGuess, tGuess + 0.3));
      const qO = kk(t, tWhich, tWhich + 0.25) * (1 - kk(t, tGuess, tGuess + 0.3));
      const flip = kk(t, w("L5", "becomes"), w("L5", "becomes") + 0.35);
      const guessO = kk(t, tGuess, tGuess + 0.3) * (1 - kk(t, l6, l6 + 0.3));

      /* ── Dot ── */
      const d = route([
        [0, DOT_HOME.x, DOT_HOME.y],
        [L("L2").start + 0.3, 330, DOT_HOME.y, 70],
        [L("L3").start + 0.3, DOT_HOME.x, DOT_HOME.y, 60],
        [l4 + 0.35, DOT_RIGHT.x, DOT_RIGHT.y, 110],
        [l5 + 0.35, DOT_HOME.x - 10, DOT_HOME.y, 110],
        [l6 + 0.4, DOT_HOME.x, DOT_HOME.y, 40],
      ], t, 0.45);
      const mood = t < L("L2").start ? "confused" : t < L("L3").start ? "happy" : t < w("L3", "only") ? "intrigued"
        : t < l4 ? "surprised" : t < l5 ? "curious" : t < tGuess ? "confused" : t < l6 ? "worried" : "confused";
      const lookAt = t < L("L3").start ? { x: 0.6, y: -0.6 } : t < l4 ? { x: lerp(-0.4, 0.8, clamp01((t - L("L3").start) / 3)), y: -0.4 }
        : t < l5 ? { x: -0.7, y: -0.6 } : t < l6 ? { x: 0.7, y: -0.3 } : { x: 0.6, y: -0.6 };
      const phone = kk(t, l5 + 0.2, l5 + 0.5) * (1 - kk(t, tGuess, tGuess + 0.3));

      return (
        <>
          <TopPill>A <span style={{ color: colors.yellow }}>2024</span> test</TopPill>
          <At x={C.x} y={C.y}>
            <Clock r={CLOCK.r} hour={hour} minute={minute} />
          </At>
          {/* "which is which?" marks on the two sticks */}
          {qO > 0 ? (
            <>
              <At x={C.x + handTip(CLOCK.r, hour, 0.2).x} y={C.y + handTip(CLOCK.r, hour, 0.2).y} s={qO}><Q /></At>
              <At x={C.x + handTip(CLOCK.r, minute, 0.12).x} y={C.y + handTip(CLOCK.r, minute, 0.12).y - 10} s={qO}><Q /></At>
            </>
          ) : null}
          {tagsO > 0 ? (
            <>
              <At x={hourTagPos.x} y={hourTagPos.y} o={tagsO} z={3}><Tag text="HOUR" tone={tagTone} /></At>
              <At x={minTagPos.x} y={minTagPos.y} o={tagsO} z={3}><Tag text="MINUTES" tone={tagTone} /></At>
            </>
          ) : null}
          {stampOn > 0 ? (
            <At x={C.x + 10} y={C.y - 175 - 120 * (1 - stampOn)} o={stampOn} z={4}>
              <AnswerStamp time="9:30" t={stampT} />
            </At>
          ) : null}
          {realO > 0 ? (
            <At x={540} y={1060} o={realO} s={0.9 + 0.1 * realO}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: colors.subtext }}>It's</span>
                <TimeCard text="5:45" tone="right" w={200} />
                <Badge ok size={72} />
              </div>
            </At>
          ) : null}
          {cardsOut > 0
            ? cards.map((c, i) => {
                const p = popAt(t, c.at);
                return p > 0 ? (
                  <At key={i} x={240 + i * 150} y={1050} s={p} o={cardsOut}>
                    <div style={{ position: "relative" }}>
                      <TimeCard text={c.text} tone={c.ok ? "right" : "wrong"} w={140} glow={i === 0 ? 1 : 0} />
                      <div style={{ position: "absolute", right: -22, top: -26 }}><Badge ok={c.ok} size={54} /></div>
                    </div>
                  </At>
                ) : null;
              })
            : null}
          {read9 > 0 ? (
            <At x={480} y={1120} o={clamp01(read9)}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontWeight: 800, color: RED, fontSize: 140, letterSpacing: -3, textShadow: `0 6px 0 ${colors.ink}` }}>
                <span style={{ fontSize: 48, color: colors.subtext, fontWeight: 700, marginRight: 16 }}>it read</span>
                <span style={{ scale: `${read9}` }}>9</span>
                <span style={{ opacity: clamp01(read30), scale: `${Math.max(0.01, read30)}` }}>:30</span>
              </div>
            </At>
          ) : null}
          {bubbleO > 0 ? (
            <At x={640} y={1080} o={bubbleO}>
              <PhoneBubble />
            </At>
          ) : null}
          {guessO > 0 ? (
            <At x={540} y={1065} o={guessO}>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <TimeCard text="5:45" tone="plain" w={190} />
                <span style={{ fontSize: 80, color: colors.subtext, fontWeight: 800, opacity: flip }}>→</span>
                <div style={{ scale: `${Math.max(0.01, popAt(t, w("L5", "becomes") + 0.15))}` }}><TimeCard text="9:30" tone="wrong" w={190} glow={1} /></div>
              </div>
            </At>
          ) : null}
          <DotActor
            x={d.p.x} y={d.p.y} r={85} mood={mood} look={lookAt} squash={d.squash} seed="clockA"
            tailAngle={d.p.x > 540 ? 20 : 200}
            arms={phone}
            L={{ wrist: { x: d.p.x - 95, y: d.p.y + 70 }, pose: "relaxed" }}
            R={{ wrist: { x: d.p.x + 95, y: d.p.y - 70 }, pose: "grip", holding: <PhoneProp /> }}
          />
        </>
      );
    }}
  </ShortFrame>
);

/** "?" mark for the "which is which?" beat. */
const Q: React.FC = () => (
  <div style={{ width: 74, height: 74, borderRadius: 74, background: colors.yellow, border: "5px solid #14161C", color: "#14161C", fontWeight: 800, fontSize: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
);

/** A plain drawn handset (no brand), held in Dot's grip. Dark body so it reads against the white glove. */
const PhoneProp: React.FC = () => (
  <svg width={70} height={120} viewBox="-35 -60 70 120" style={{ overflow: "visible", translate: "-35px -60px", display: "block" }} aria-hidden>
    <rect x={-31} y={-56} width={62} height={112} rx={14} fill="#2B3142" stroke="#14161C" strokeWidth={6} />
    <rect x={-23} y={-44} width={46} height={76} rx={6} fill="#8EA7FF" />
    <circle cx={0} cy={43} r={5} fill="#5A6275" />
  </svg>
);

/** The caller's line, as a speech bubble whose tail points back at Dot's phone. */
const PhoneBubble: React.FC = () => (
  <div style={{ position: "relative", width: 560, padding: "22px 30px", borderRadius: 34, backgroundColor: "#FBF8F1", border: "6px solid #14161C", boxShadow: "6px 8px 0 rgba(0,0,0,0.38)", color: "#14161C", fontWeight: 800, fontSize: 44, lineHeight: 1.15 }}>
    “One hand near the <span style={{ color: "#B98500" }}>9</span>, one near the <span style={{ color: "#B98500" }}>6</span>.”
    <svg width={70} height={60} style={{ position: "absolute", left: -58, bottom: 18 }} viewBox="0 0 70 60" aria-hidden>
      <path d="M 66 8 L 4 40 L 66 48 Z" fill="#FBF8F1" stroke="#14161C" strokeWidth={6} strokeLinejoin="round" />
      <path d="M 70 12 L 70 44" stroke="#FBF8F1" strokeWidth={10} />
    </svg>
  </div>
);
