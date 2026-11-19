import React from "react";
import { colors } from "../../shared/brand";
import { INK, OUT, SHADOW } from "../../shared/Rig";
import { DotActor, Padlock, clamp01, kk, lerp, route } from "../../episodes/ep05/Common";
import {
  AnswerStamp, At, Badge, CLOCK, Clock, ClockAt, FLOOR_Y, HOUR_HAND, MINUTE_HAND, RED, ShortFrame, TopPill,
  anglesFor, makeTimeline, popAt,
} from "./Kit";
import vo from "./b/vo.json";
import durations from "./b/durations.json";
import captions from "./b/captions.json";

// Short B — "A year ago, AI couldn't read a clock. Now?" ClockBench: Sept 2025 best of 11 models 13.3% (≈ 1 in 8; median
// miss ≈ 1 hour) → live leaderboard Nov 19 2026: top model 87.8% (almost 9 in 10) vs average humans 90.7%.
// 8 cards = 8 clocks: 1 ✓ then, 7 ✓ now (7/8 = 87.5%, the nearest eighth to 87.8%). Never more than two numbers on screen.
// Ends on Short A's clock (5:45, "AI said: 9:30") and loops into "Last year…".

export const tlB = makeTimeline(vo, durations as Record<string, number>, captions as never, "shorts/clock/b");
const { L, w } = tlB;

const TIMES: [number, number][] = [[3, 40], [8, 5], [11, 20], [1, 50], [6, 15], [10, 35], [4, 25], [7, 55]];
const RIGHT_THEN = 4; // the one clock the best model got right in Sept 2025
const STILL_WRONG = 6; // the one it still misses now
const ZOOM = 1; // the ✗ card that zooms in for "off by about an hour"
const cardPos = (i: number) => ({ x: 195 + (i % 4) * 230, y: 560 + Math.floor(i / 4) * 240 });
const DOT_HOME = { x: 200, y: FLOOR_Y - 85 };

export const ShortB: React.FC = () => (
  <ShortFrame lines={tlB.lines}>
    {(t) => {
      const l2 = L("L2").start;
      const l3 = L("L3").start;
      const l4 = L("L4").start;
      const l5 = L("L5").start;
      const l6 = L("L6").start;
      const tAlmost = w("L3", "almost");
      const tSecret = w("L4", "secret");
      const tPeople = l5;
      const tOver = w("L5", "over");
          const tFooled = w("L6", "fooled");

      const gridO = 1 - kk(t, l5, l5 + 0.35);
      const zoomK = kk(t, l2 + 0.05, l2 + 0.5) * (1 - kk(t, l3, l3 + 0.45));
      const ghost = kk(t, w("L2", "off"), w("L2", "off") + 0.35) * (1 - kk(t, l3, l3 + 0.3));

      // L3: the ✗ cards flip to ✓ one by one from "Today" to "almost", the last one lands just after "almost".
      const toFlip = [0, 1, 2, 3, 5, 7];
      const flipStart = l3 + 0.2;
      const flipEnd = tAlmost + 0.2;
      const flipAt = (i: number) => lerp(flipStart, flipEnd, toFlip.indexOf(i) / (toFlip.length - 1));
      const backAt = (i: number) => tSecret - 0.1 + i * 0.05;

      const thenO = 1 - kk(t, l3, l3 + 0.3);
      const nowO = kk(t, tAlmost - 0.05, tAlmost + 0.25) * (1 - kk(t, l5, l5 + 0.3));
      const barsO = kk(t, tPeople, tPeople + 0.3) * (1 - kk(t, l6, l6 + 0.3));
      const aiBar = kk(t, tPeople + 0.1, tPeople + 0.7);
      const humanBar = kk(t, tOver - 0.2, tOver + 0.4);
      const clockIn = popAt(t, l6 + 0.1);
      const pill = t < l3 ? "Sept 2025" : t < l5 ? "Nov 2026" : null;

      const d = route([
        [0, DOT_HOME.x, DOT_HOME.y],
        [l2 + 0.3, 300, DOT_HOME.y, 60],
        [l3 + 0.5, 800, DOT_HOME.y, 120],
        [l5 + 0.3, 540, DOT_HOME.y, 90],
        [w("L5", "nearly") + 0.2, 560, DOT_HOME.y, 70],
        [l6 + 0.4, DOT_HOME.x, DOT_HOME.y, 110],
      ], t, 0.45);
      const mood = t < l2 ? "confused" : t < l3 ? "surprised" : t < l4 ? "happy" : t < l5 ? "intrigued"
        : t < w("L5", "nearly") ? "curious" : t < l6 ? "aha" : t < tFooled ? "neutral" : "confused";
      const look = t < l3 ? { x: 0.5, y: -0.7 } : t < l5 ? { x: -0.5, y: -0.7 } : t < l6 ? { x: 0, y: -0.8 } : { x: 0.6, y: -0.6 };

      return (
        <>
          {pill ? (
            <TopPill>Best AI · <span style={{ color: colors.yellow }}>{pill}</span></TopPill>
          ) : clockIn > 0 ? (
            <TopPill o={clamp01(clockIn)}>A <span style={{ color: colors.yellow }}>2024</span> test</TopPill>
          ) : null}
          {thenO > 0 ? <BigLabel o={thenO} color={RED}>about 1 in 8</BigLabel> : null}
          {nowO > 0 ? <BigLabel o={nowO} s={0.85 + 0.15 * popAt(t, tAlmost)} color={colors.mint}>almost 9 in 10</BigLabel> : null}

          {gridO > 0
            ? TIMES.map(([h, m], i) => {
                const p = cardPos(i);
                const ok = i === RIGHT_THEN || (i !== STILL_WRONG && t >= flipAt(i) + 0.12);
                const flipK = i === RIGHT_THEN || i === STILL_WRONG ? 0 : kk(t, flipAt(i), flipAt(i) + 0.25);
                const toBack = kk(t, backAt(i), backAt(i) + 0.3);
                const sx = Math.abs(Math.cos(Math.PI * (flipK + toBack)));
                const showBack = toBack > 0.5;
                const isZoom = i === ZOOM;
                const zx = isZoom ? lerp(p.x, 540, zoomK) : p.x;
                const zy = isZoom ? lerp(p.y, 700, zoomK) : p.y;
                const zs = isZoom ? lerp(1, 2.3, zoomK) : 1;
                const dim = isZoom ? 1 : 1 - 0.75 * zoomK;
                return (
                  <At key={i} x={zx} y={zy} s={zs} o={gridO * dim} z={isZoom ? 5 : 1}>
                    <div style={{ scale: `${Math.max(0.02, sx)} 1` }}>
                      {showBack ? <CardBack /> : <ClockCard h={h} m={m} ok={ok} ghost={isZoom ? ghost : 0} />}
                    </div>
                  </At>
                );
              })
            : null}
          {ghost > 0 ? (
            <At x={540} y={1010} o={ghost} z={6}>
              <div style={{ padding: "10px 30px", borderRadius: 999, backgroundColor: RED, color: colors.white, fontWeight: 800, fontSize: 52, border: `5px solid ${INK}`, boxShadow: `4px 6px 0 ${SHADOW}` }}>
                about 1 hour off
              </div>
            </At>
          ) : null}

          {barsO > 0 ? (
            <>
              <Bar y={540} o={barsO} k={aiBar * 0.878} color={colors.yellow} who="Best AI" value="almost 9 in 10" />
              <Bar y={800} o={barsO * clamp01(humanBar * 3)} k={humanBar * 0.907} color={colors.periwinkle} who="People" value="just over 9 in 10" />
            </>
          ) : null}

          {clockIn > 0 ? (
            <>
              <At x={CLOCK.x} y={CLOCK.y} s={0.6 + 0.4 * clockIn} o={clamp01(clockIn * 2)}>
                <Clock r={CLOCK.r} hour={{ angle: anglesFor(5, 45).hour, ...HOUR_HAND }} minute={{ angle: anglesFor(5, 45).minute, ...MINUTE_HAND }} />
              </At>
              {t >= tFooled ? (
                <At x={CLOCK.x + 10} y={CLOCK.y - 175} z={4}>
                  <AnswerStamp time="9:30" t={t - tFooled} />
                </At>
              ) : null}
            </>
          ) : null}

          <DotActor x={d.p.x} y={d.p.y} r={85} mood={mood} look={look} squash={d.squash} seed="clockB" tailAngle={d.p.x > 540 ? 20 : 200} />
        </>
      );
    }}
  </ShortFrame>
);

const BigLabel: React.FC<{ o: number; s?: number; color: string; children: React.ReactNode }> = ({ o, s = 1, color, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 255, textAlign: "center", fontSize: 118, fontWeight: 800, letterSpacing: -3, color, opacity: o, scale: `${s}`, textShadow: `0 7px 0 ${INK}` }}>
    {children}
  </div>
);

const CARD = 206;
const ClockCard: React.FC<{ h: number; m: number; ok: boolean; ghost?: number }> = ({ h, m, ok, ghost = 0 }) => {
  const a = anglesFor(h, m);
  return (
    <div style={{ position: "relative", width: CARD, height: CARD, borderRadius: 30, backgroundColor: colors.panel, border: `4px solid ${colors.lineStrong}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Clock r={80} hour={{ angle: a.hour, ...HOUR_HAND }} minute={{ angle: a.minute, ...MINUTE_HAND }} numerals={false}>
        {ghost > 0 ? (
          // the model's guess: the hour hand one hour off (dashed red), with the gap between them shaded
          <g opacity={ghost}>
            <path d={`M 0 0 L ${Math.sin((a.hour * Math.PI) / 180) * 62} ${-Math.cos((a.hour * Math.PI) / 180) * 62} A 62 62 0 0 1 ${Math.sin(((a.hour + 30) * Math.PI) / 180) * 62} ${-Math.cos(((a.hour + 30) * Math.PI) / 180) * 62} Z`} fill={RED} fillOpacity={0.22} />
            <line x1={0} y1={0} x2={Math.sin(((a.hour + 30) * Math.PI) / 180) * 44} y2={-Math.cos(((a.hour + 30) * Math.PI) / 180) * 44} stroke={RED} strokeWidth={7} strokeLinecap="round" strokeDasharray="8 7" />
          </g>
        ) : null}
      </Clock>
      <div style={{ position: "absolute", right: -14, top: -14 }}><Badge ok={ok} size={62} /></div>
    </div>
  );
};

const CardBack: React.FC = () => (
  <div style={{ width: CARD, height: CARD, borderRadius: 30, backgroundColor: "#2B3350", border: `${OUT}px solid ${INK}`, boxShadow: `5px 7px 0 ${SHADOW}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Padlock size={92} />
  </div>
);

const Bar: React.FC<{ y: number; o: number; k: number; color: string; who: string; value: string }> = ({ y, o, k, color, who, value }) => (
  <div style={{ position: "absolute", left: 90, top: y - 90, width: 820, opacity: o }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 800, marginBottom: 14 }}>
      <span style={{ fontSize: 56, color: colors.white }}>{who}</span>
      <span style={{ fontSize: 50, color }}>{value}</span>
    </div>
    <div style={{ height: 96, borderRadius: 24, backgroundColor: colors.panel, border: `4px solid ${colors.lineStrong}`, overflow: "hidden" }}>
      <div style={{ width: `${k * 100}%`, height: "100%", backgroundColor: color, borderRight: k > 0 ? `6px solid ${INK}` : "none" }} />
    </div>
  </div>
);
