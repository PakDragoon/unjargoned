import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { StreamText } from "../../../shared/ChatWindow";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { FadeIn } from "../../../shared/FadeIn";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { AllowCard, Receipt } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { Figure2, INK, OUT, Pt, SHADOW, Stage } from "../Rig";
import { Checkout } from "../Screens";
import { scene } from "../timeline";
import {
  ArmGlyph, BODY_H, Bubble, CamKey, FIG, FK, FLOOR, Key, NotebookGlyph, PinnedCard, REST_WIDE_L, REST_WIDE_R, SCREEN, ScreenOff, Tag, World,
  along, armJoints, camAt, fw, toScreen,
} from "../World";

const S = scene("S2");

// Times (s) from the S2 word timings in captions.json. Re-voice S2 → re-check these.
const T = {
  hands: 0.28, chatbot: 2.06, brain: 4.44, jar: 5.0, talk: 6.58, touch: 7.74, agent: 9.52, given: 11.74, body: 12.12, with: 13.0,
  build: 14.5, part: 15.02, canDo: 17.96, remembers: 19.14, step: 21.02, cost: 22.22, d31: 22.7,
};

// One shot on the S1 stage: the agent raises its gloved hands → comes apart (gloves slide off the wrists, goggles
// off, notebook out, the body fades to an outline) → push in on the jar alone: it talks, nothing moves → pull back,
// the body re-forms with empty slots → a board slides in and three promise cards are pinned → they fly up into the strip.

const JAR: Pt = fw({ x: 300, y: 192 }); // the jar's centre (world)
const BOARD = { left: 40, top: 190, w: 360, h: 610 };
const CARD = { w: 270, h: 150 };
const cardAt = (i: number): Pt => ({ x: BOARD.left + BOARD.w / 2, y: BOARD.top + 115 + i * 190 }); // card centres (world)
const STRIP = [764, 960, 1156].map((x) => ({ x, y: 96 })); // the strip's tile centres (screen)

const CAM: CamKey[] = [
  [-1, 660, 375, 2.15], [1.45, 660, 380, 2.15], [2.25, 660, 470, 1.25], [3.5, 660, 470, 1.25],
  [4.3, JAR.x, JAR.y + 40, 2.55], [9.1, JAR.x, JAR.y + 40, 2.6], [9.75, 660, 470, 1.2], [14.1, 660, 470, 1.2],
  [14.85, 520, 480, 1.5], [23.2, 520, 480, 1.5], [23.9, 520, 420, 1.45],
];

// arms: raised and open ("It got hands!") → down to rest
const UP_L: Pt = { x: 112, y: 236 };
const UP_R: Pt = { x: 488, y: 236 };
const LEFT_KEYS: Key[] = [[-1, UP_L], [0.0, UP_L], [0.1, { x: 104, y: 226 }], [0.3, UP_L], [1.55, UP_L], [2.15, REST_WIDE_L], [99, REST_WIDE_L]];
const RIGHT_KEYS: Key[] = [[-1, UP_R], [0.13, UP_R], [0.23, { x: 496, y: 226 }], [0.43, UP_R], [1.6, UP_R], [2.2, REST_WIDE_R], [99, REST_WIDE_R]];

const TRACK: MoodKey[] = [
  { at: 0, mood: "aha" },
  { at: sec(2.1), mood: "curious" },
  { at: sec(T.touch - 0.1), mood: "neutral" },
  { at: sec(T.agent), mood: "happy" },
  { at: sec(T.canDo - 0.3), mood: "curious" },
  { at: sec(T.step), mood: "worried" },
  { at: sec(23.4), mood: "happy" },
];
const ROUTE = hops([
  { at: 0, x: 1560, y: 900 },
  { at: sec(2.4), x: 1600, y: 890 },
  { at: sec(7.35), x: 1300, y: 560 }, // beside the jar's glass: knocks on it
  { at: sec(9.6), x: 1640, y: 900 },
  { at: sec(14.95), x: 1740, y: 900 },
]);
const LOOK = glances([
  { at: 0, x: -0.8, y: -0.5 },
  { at: sec(2.4), x: -0.9, y: -0.4 },
  { at: sec(7.35), x: -1, y: 0 },
  { at: sec(9.6), x: -0.9, y: -0.5 },
  { at: sec(14.95), x: -1, y: -0.35 },
  { at: sec(T.step), x: -1, y: 0.15 },
  { at: sec(23.4), x: -0.6, y: -0.8 },
]);

/** A card's face (used on the board and while it flies up into the strip). */
const CardFace: React.FC<{ i: number; on?: number; scale?: number }> = ({ i, on = 0, scale = 1 }) => (
  <div style={{ position: "relative", width: CARD.w * scale, height: CARD.h * scale, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 18 * scale }}>
    {i === 0 ? (
      <div style={{ position: "absolute", left: 70 * scale, bottom: 0 }}><ArmGlyph size={140 * scale} /></div>
    ) : i === 1 ? (
      <NotebookGlyph size={110 * scale} />
    ) : (
      <div style={{ position: "relative", scale: `${on > 0.5 ? 1.06 : 1}` }}>
        <AllowCard w={190 * scale} empty={1} showButtons={false} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 * scale, fontWeight: 800, color: "#9A8F78" }}>Allow?</div>
      </div>
    )}
  </div>
);

const S2Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = camAt(CAM, t);

  // ── the agent's parts ──
  const open = [t >= 0.05 ? 1 : 0, t >= 0.18 ? 1 : 0];
  const gloveL = 1 - ramp(frame, 2.3, 0.45);
  const gloveR = 1 - ramp(frame, 2.42, 0.45);
  const eyes = 1 - ramp(frame, 2.75, 0.35);
  const notebook = 1 - ramp(frame, 2.95, 0.35);
  const body = t < 9 ? 1 - ramp(frame, 3.35, 0.6) : ramp(frame, 9.85, 1.2);
  const bounce = during(frame, T.body - 0.05, T.body + 0.25, 0.1);
  const glow = Math.max(during(frame, T.brain - 0.1, T.brain + 1.1, 0.2), during(frame, T.body, T.body + 0.6, 0.2) * 0.7);
  const left = along(LEFT_KEYS, t);
  const right = along(RIGHT_KEYS, t);
  const lookJar = t < 2.2 ? { x: 0, y: -0.6 } : { x: 0.6, y: 0.2 };

  // empty slots pulse yellow on "part by part"
  const pulse = during(frame, T.part - 0.05, T.part + 0.9, 0.2) * (0.6 + 0.4 * Math.sin((t - T.part) * 14));
  const slotRing = (side: "L" | "R", tgt: Pt) => {
    const { elbow, wrist } = armJoints(side, tgt);
    const a = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
    return { x: wrist.x + Math.cos(a) * 60, y: wrist.y + Math.sin(a) * 60 };
  };
  const rings: [Pt, number][] = [
    [slotRing("L", left), 62], [slotRing("R", right), 62], [{ x: 256, y: 66 }, 40], [{ x: 344, y: 66 }, 40], [{ x: 338, y: 456 }, 48],
  ];

  // ── board + cards ──
  const boardIn = ramp(frame, 14.2, 0.55);
  const cardP = [pop(frame, T.canDo), pop(frame, T.remembers), pop(frame, 20.77)];
  const receiptP = pop(frame, T.d31 - 0.1);
  const fly = ramp(frame, 23.3, 0.5);
  const stripO = ramp(frame, 23.62, 0.2);

  // knock on the jar: Dot taps, nothing moves
  const knock = during(frame, 7.7, 7.84, 0.04) + during(frame, 8.0, 8.14, 0.04);

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
      <World cam={c}>
        <Stage spotX={760} floorY={FLOOR} />

        {/* the self-checkout from S1, switched off */}
        <div style={{ position: "absolute", left: SCREEN.left, top: SCREEN.top }}>
          <Checkout w={SCREEN.w} bodyH={BODY_H} feed={0} receipt={null}>
            <ScreenOff />
          </Checkout>
        </div>

        {/* the board on its easel slides in from the left */}
        <div style={{ position: "absolute", left: BOARD.left - 1000 * (1 - boardIn), top: BOARD.top }}>
          <svg width={BOARD.w} height={FLOOR - BOARD.top + 10} viewBox={`0 0 ${BOARD.w} ${FLOOR - BOARD.top + 10}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
            <path d={`M 70 ${BOARD.h - 20} L 40 ${FLOOR - BOARD.top} M ${BOARD.w - 70} ${BOARD.h - 20} L ${BOARD.w - 40} ${FLOOR - BOARD.top}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
            <path d={`M 70 ${BOARD.h - 20} L 40 ${FLOOR - BOARD.top} M ${BOARD.w - 70} ${BOARD.h - 20} L ${BOARD.w - 40} ${FLOOR - BOARD.top}`} stroke="#8A6A3E" strokeWidth={10} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", left: 0, top: 0, width: BOARD.w, height: BOARD.h, borderRadius: 22, backgroundColor: "#B88B5A", border: `${OUT}px solid ${INK}`, boxSizing: "border-box", filter: `drop-shadow(10px 12px 0 ${SHADOW})` }}>
            <div style={{ position: "absolute", inset: 16, borderRadius: 12, backgroundColor: "#C99A62", backgroundImage: "radial-gradient(rgba(110,82,48,0.35) 2px, transparent 2.5px)", backgroundSize: "22px 22px" }} />
          </div>
        </div>

        {/* the agent */}
        <div style={{ position: "absolute", left: FIG.left, top: FIG.top + 10 * bounce, scale: `${1 + 0.02 * bounce} ${1 - 0.02 * bounce}`, transformOrigin: "50% 100%" }}>
          <Figure2
            size={FIG.size}
            eyes={eyes}
            notebook={notebook}
            body={body}
            glow={glow}
            look={lookJar}
            left={{ target: left, pose: open[0] && t < 1.6 ? "open" : "relaxed", thumb: "up", hand: gloveL }}
            right={{ target: right, pose: open[1] && t < 1.65 ? "open" : "relaxed", thumb: "down", hand: gloveR }}
            front={
              pulse > 0 ? (
                <g opacity={pulse}>
                  {rings.map(([p, r], i) => <circle key={i} cx={p.x} cy={p.y} r={r} fill="none" stroke={colors.yellow} strokeWidth={8} />)}
                </g>
              ) : null
            }
          />
        </div>

        {/* "brain = the AI model" under the jar */}
        <div style={{ position: "absolute", left: JAR.x, top: JAR.y + 132, translate: "-50% 0", opacity: during(frame, T.brain - 0.05, 9.05, 0.25) }}>
          <Tag fontSize={17} o={Math.min(1, pop(frame, T.brain - 0.05))}>brain = <span style={{ color: "#B07D00" }}>the AI model</span></Tag>
        </div>
        {/* it talks (that's all it can do) */}
        <div style={{ position: "absolute", left: JAR.x + 92, top: JAR.y - 150, opacity: during(frame, 5.95, 9.0, 0.2), scale: `${Math.min(1, pop(frame, 5.95))}`, transformOrigin: "0 100%" }}>
          <Bubble fontSize={19} tail="bottom-left">
            <StreamText text="Hi! I can think and talk." frame={frame} from={sec(6.05)} to={sec(T.talk + 0.5)} />
          </Bubble>
        </div>
        {/* knock rings on the glass */}
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: JAR.x + 92 - 14 - 8 * i, top: JAR.y + 6 - 14 - 8 * i, width: 28 + 16 * i, height: 28 + 16 * i, borderRadius: "50%", border: `3px solid ${colors.subtext}`, opacity: during(frame, 7.72 + i * 0.3, 7.72 + i * 0.3 + 0.28, 0.06) }} />
        ))}
      </World>

      {/* ── the promise cards: pinned on the board (world), then flying up into the strip (screen) ── */}
      {[0, 1, 2].map((i) => {
        const w0 = toScreen(cardAt(i), c);
        const sc0 = c.z;
        const k = fly;
        const pos = { x: interpolate(k, [0, 1], [w0.x, STRIP[i].x]), y: interpolate(k, [0, 1], [w0.y, STRIP[i].y]) - Math.sin(k * Math.PI) * 60 };
        const sc = interpolate(k, [0, 1], [sc0, 112 / CARD.h]);
        const on = i === 2 && t >= T.step && t < 23.3 ? 1 : 0;
        if (cardP[i] <= 0.001 || stripO >= 1) return null;
        return (
          <div key={i} style={{ position: "absolute", left: pos.x, top: pos.y, translate: "-50% -50%", opacity: 1 - stripO }}>
            <PinnedCard w={CARD.w * sc} h={CARD.h * sc} p={cardP[i]} on={on} rot={[-2, 1.5, -1][i] * (1 - k)}>
              <CardFace i={i} on={on} scale={sc} />
            </PinnedCard>
            {i === 2 ? (
              <div style={{ position: "absolute", left: CARD.w * sc * 0.8, top: CARD.h * sc * 0.05, rotate: "9deg", zIndex: 2, scale: `${Math.min(1, receiptP)}`, opacity: Math.min(1, receiptP * 3) * (1 - k), transformOrigin: "0 0" }}>
                <Receipt w={140 * sc} rows={2} />
                <div style={{ position: "absolute", left: 70 * sc - 10, top: -8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.coral, border: `3px solid ${INK}` }} />
              </div>
            ) : null}
          </div>
        );
      })}
      <QuestionStrip active={-1} o={stripO} />

      <Dot path={(fr) => { const p = ROUTE.path(fr); return { x: p.x - 16 * knock, y: p.y }; }} squash={ROUTE.squash} track={TRACK} seed="e4s2" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S2 — first payoff: it got hands; chatbot = brain in a jar; the body; the three promises. Edit only this file for S2 changes.
export const S2: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <FadeIn>
      <S2Content />
    </FadeIn>
  </SceneShell>
);
