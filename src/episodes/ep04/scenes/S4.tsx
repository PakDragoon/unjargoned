import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { colors, fontFamily } from "../../../shared/brand";
import { Dot, MoodKey, glances, hops } from "../../../shared/Dot";
import { LineWipeIn } from "../../../shared/LineWipe";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { SceneShell } from "../../../shared/SceneShell";
import { NoteIcon } from "../Props";
import { QuestionStrip } from "../QuestionStrip";
import { Figure2, INK, Pt, SHOULDER_L, SHOULDER_R, Stage, handFrame } from "../Rig";
import { Checkout, Kiosk } from "../Screens";
import { scene } from "../timeline";
import {
  BODY_H, BeltKit, CHAT, CamKey, FIG, FLOOR, Key, KioskChat, OpenNotebook, Pencil, REST_WIDE_L, REST_WIDE_R, SCREEN, ScreenOff, Tag, World,
  along, camAt, forearmPt, fw, reachFor, toScreen,
} from "../World";

const S = scene("S4");

// Times (s) from the S4 word timings in captions.json. Re-voice S4 → re-check these.
const T = {
  remember: 0.9, surprise: 2.74, doesnt: 4.3, newChat: 5.66, fresh: 6.76, first: 8.64,
  how: 10.22, mushrooms: 12.0, notebook: 13.26, say: 14.68, writes: 16.62, down: 17.02, next: 17.84, answers: 19.2, reads: 20.22, notes: 20.68,
  believes: 22.4, there: 23.32, even: 24.18, old: 25.08, wrong: 25.48, thatsWhy: 26.26, open: 28.06, delete: 28.98, line: 29.68, switch: 30.26, off: 30.64,
  isnt: 31.72, remembering: 32.22, its: 33.44, reading: 33.72,
};

// One shot on the S1 stage (chat kiosk · agent · checkout off): the person tells the chat "I hate mushrooms" → the
// brain holds it only for that chat; it's scribbled out and a new chat starts blank → the agent pulls its notebook from
// its pocket, takes the pencil off the spine clip and writes the note → next chat, its goggles read the page before it
// answers → an old note gets read too (wrong reply) → Dot (standing in for you) tears that line out and flips the
// notebook's switch → record scratch: it isn't remembering, it's reading.

const JAR: Pt = fw({ x: 300, y: 192 });
const CAM: CamKey[] = [
  [-1, 560, 465, 1.15], [2.55, 560, 465, 1.15], [3.3, 660, 330, 2.3], [5.25, 660, 330, 2.3], [5.85, 500, 480, 1.4],
  [12.9, 500, 480, 1.4], [13.6, 650, 520, 1.8], [14.3, 650, 520, 1.8], [14.9, 650, 440, 2.0], [17.6, 650, 440, 2.0],
  [18.2, 500, 480, 1.4], [26.0, 500, 480, 1.4], [26.7, 650, 560, 2.3], [31.4, 650, 560, 2.3], [31.75, 650, 440, 2.0], [99, 650, 440, 2.0],
];

// ── arms (figure frame) ──
const POCKET = reachFor("R", { x: 344, y: 446 }, 60);
const HOLD = reachFor("R", { x: 404, y: 556 }, 62);
const NB_W = 270;
// the open notebook: its right edge in the right fist while it comes out and opens, then the left hand takes its left edge
const nbFrom = (at: Pt) => ({ x: at.x - NB_W + 14, y: at.y - NB_W * 0.31 });
const NB_HOLD = nbFrom(handFrame(SHOULDER_R, HOLD, "natural", 62, 140, 130, 300).at);
const H = NB_W * 0.62;
const CLIP: Pt = { x: NB_HOLD.x + NB_W / 2, y: NB_HOLD.y - 4 }; // the pencil clipped on the spine (top end)
const lineY = (i: number) => NB_HOLD.y + 14 + i * (H * 0.42) + H * 0.15;
const LINE_X0 = NB_HOLD.x + NB_W / 2 + 18 + H * 0.32;
const LINE_X1 = NB_HOLD.x + NB_W - 20;
const L_HOLD = reachFor("L", { x: NB_HOLD.x + 12, y: NB_HOLD.y + H * 0.55 }, 58);
const PEN_DIST = 56; // wrist → pencil grip
const PEN_TIP = 92; // grip → tip, along the pencil
const PEN_TILT = -55; // the pencil leans down from the (right) fist toward the page, degrees from the forearm
const rightFor = (tip: Pt) => reachFor("R", tip, PEN_DIST, PEN_TILT, PEN_TIP);
const R_CLIP = reachFor("R", CLIP, PEN_DIST);
const R_AFTER: Pt = { x: 430, y: 575 };
const RIGHT_KEYS: Key[] = [
  [-1, REST_WIDE_R], [12.9, REST_WIDE_R], [13.25, POCKET], [13.35, POCKET], [14.1, HOLD], [14.95, HOLD], [15.35, R_CLIP], [15.5, R_CLIP],
  [16.1, rightFor({ x: LINE_X0, y: lineY(1) })], [16.5, rightFor({ x: LINE_X0, y: lineY(1) })], [17.15, rightFor({ x: LINE_X1, y: lineY(1) })],
  [17.8, R_AFTER], [99, R_AFTER],
];
const LEFT_KEYS: Key[] = [[-1, REST_WIDE_L], [14.35, REST_WIDE_L], [14.85, L_HOLD], [99, L_HOLD]];

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" },
  { at: sec(T.doesnt), mood: "surprised" },
  { at: sec(T.newChat + 0.2), mood: "confused" },
  { at: sec(T.notebook), mood: "aha" },
  { at: sec(T.writes), mood: "happy" },
  { at: sec(T.believes), mood: "curious" },
  { at: sec(T.old), mood: "deadpan" },
  { at: sec(T.thatsWhy), mood: "neutral" },
  { at: sec(T.delete - 0.2), mood: "smug" },
  { at: sec(T.isnt), mood: "surprised" },
  { at: sec(T.its), mood: "smug" },
];

const S4Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = camAt(CAM, t);

  // ── arms + held things ──
  const writing = t > 16.5 && t < 17.15 ? Math.sin(t * 40) * 5 : 0;
  const right0 = along(RIGHT_KEYS, t);
  const right = { x: right0.x, y: right0.y + writing };
  const left = along(LEFT_KEYS, t);
  const rh = handFrame(SHOULDER_R, right, "natural", 62, 140, 130, 300);
  const rp = handFrame(SHOULDER_R, right, "natural", PEN_DIST, 140, 130, 300);
  const nbIn = t >= 13.28;
  const nb = nbIn && t < 14.95 ? nbFrom(rh.at) : NB_HOLD;
  const nbOpen = ramp(frame, 14.2, 0.4);
  const penInHand = t >= 15.4;
  const pa = ((rp.angle + PEN_TILT) * Math.PI) / 180;
  const penTip = { x: rp.at.x + Math.cos(pa) * PEN_TIP, y: rp.at.y + Math.sin(pa) * PEN_TIP };

  // ── notebook state ──
  const mushWrite = ramp(frame, 16.5, 0.6);
  const readGlow = Math.max(during(frame, 19.1, 20.6, 0.15), t >= T.its ? Math.min(1, (t - T.its) / 0.4) : 0);
  const oldGlow = during(frame, 22.1, 26.2, 0.2);
  const dogWrong = ramp(frame, T.wrong, 0.2) * (1 - ramp(frame, 29.18, 0.1));
  const torn = ramp(frame, 29.18, 0.6);
  const off = t < 31.5 ? ramp(frame, 30.3, 0.15) : 1 - ramp(frame, 31.55, 0.2);
  const switchShown = ramp(frame, 26.3, 0.3);
  const lines = [
    { icon: "dog" as const, o: 1, old: oldGlow, wrong: dogWrong, torn, glow: during(frame, 24.4, 25.2, 0.12) },
    { icon: "mushroom" as const, o: t < 16.45 ? 0 : 1, glow: readGlow },
  ];

  // a line lifting off the page into the jar (the brain reads it)
  const fly = (from: number, to: number, i: number) => {
    const k = Math.max(0, Math.min(1, (t - from) / (to - from)));
    const e = Easing.inOut(Easing.cubic)(k);
    const a = fw({ x: LINE_X0 - 30, y: lineY(i) });
    return { k, x: a.x + (JAR.x - a.x) * e, y: a.y + (JAR.y + 30 - a.y) * e - Math.sin(e * Math.PI) * 50 };
  };
  const flyMush = fly(19.15, 20.15, 1);
  const flyDog = fly(24.55, 25.05, 0);
  const jarGlow = Math.max(during(frame, 20.0, 20.9, 0.15), during(frame, 24.95, 25.7, 0.15));

  // ── the brain's in-the-moment memory: the mushroom sits in its slot, then gets scribbled out ──
  const slotMush = during(frame, 1.25, 4.5, 0.2);
  const scribble = ramp(frame, 3.95, 0.45);

  // ── kiosk chat ──
  const chat1 = t < 5.52;
  const slideK = ramp(frame, 5.52, 0.35);
  const chat3 = t >= 17.84;
  const look = t >= 13.0 && t < 18.0 ? { x: 0.4, y: 1 } : t >= 19.1 && t < 20.7 ? { x: 0.3, y: 1 } : t >= 24.4 && t < 25.1 ? { x: 0.3, y: 1 } : t >= 26.3 ? { x: 0.3, y: 1 } : { x: -1, y: 0.25 };

  // ── Dot: route in screen space, worked out from where things are on screen ──
  const nbScreen = (cam: { x: number; y: number; z: number }) => toScreen(fw({ x: NB_HOLD.x + NB_W + 10, y: lineY(0) }), cam);
  const tearAt = nbScreen(camAt(CAM, 28.6));
  const swAt = toScreen(fw({ x: NB_HOLD.x + NB_W / 2, y: NB_HOLD.y + H + 20 }), camAt(CAM, 30.2));
  const ROUTE = hops([
    { at: 0, x: 1700, y: 940 },
    { at: sec(3.4), x: 1560, y: 860 },
    { at: sec(6.0), x: 1700, y: 930 },
    { at: sec(13.7), x: 1640, y: 900 },
    { at: sec(18.3), x: 1700, y: 930 },
    { at: sec(26.8), x: 1650, y: 880 },
    { at: sec(28.75), x: tearAt.x + 120, y: tearAt.y + 10 },
    { at: sec(30.15), x: swAt.x + 150, y: swAt.y + 20 },
    { at: sec(31.85), x: 1660, y: 900 },
  ]);
  const tug = during(frame, 29.0, 29.35, 0.06);
  const bonk = during(frame, 30.2, 30.4, 0.05);
  const LOOK = glances([
    { at: 0, x: -1, y: -0.3 },
    { at: sec(3.4), x: -1, y: -0.4 },
    { at: sec(6.0), x: -1, y: -0.3 },
    { at: sec(13.7), x: -1, y: -0.1 },
    { at: sec(18.3), x: -1, y: -0.3 },
    { at: sec(26.8), x: -1, y: 0.1 },
    { at: sec(28.75), x: -1, y: 0 },
    { at: sec(30.15), x: -0.8, y: -0.3 },
    { at: sec(31.85), x: -1, y: -0.3 },
  ]);

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: colors.ink }}>
      <World cam={c}>
        <Stage spotX={700} floorY={FLOOR} />

        {/* the chat: this AI app's chat window on the kiosk */}
        <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
          <Kiosk w={CHAT.w}>
            {chat1 || slideK < 1 ? (
              <div style={{ position: "absolute", inset: 0, translate: `${-CHAT.w * slideK}px 0` }}>
                <KioskChat w={CHAT.w} msgs={[{ from: "me", o: pop(frame, 0.5), text: "I hate mushrooms." }]} />
              </div>
            ) : null}
            {t >= 5.52 && !chat3 ? (
              <div style={{ position: "absolute", inset: 0, translate: `${CHAT.w * (1 - slideK)}px 0`, backgroundColor: "#F7F2E6" }}>
                <KioskChat w={CHAT.w} header="New chat" msgs={[]} />
              </div>
            ) : null}
            {chat3 ? (
              <div style={{ position: "absolute", inset: 0, translate: `${CHAT.w * (1 - ramp(frame, 17.84, 0.3))}px 0`, backgroundColor: "#F7F2E6" }}>
                <KioskChat
                  w={CHAT.w}
                  msgs={[
                    { from: "me", o: pop(frame, 17.95), text: "Pizza for tonight?" },
                    { from: "ai", o: pop(frame, 20.78), text: "Mushroom-free pizza?", tone: "ok" },
                    ...(t >= 25.0 ? [{ from: "ai" as const, o: pop(frame, 25.08), text: "You hate dogs, right?", tone: "wrong" as const }] : []),
                  ]}
                />
              </div>
            ) : null}
          </Kiosk>
        </div>

        {/* the checkout, switched off */}
        <div style={{ position: "absolute", left: SCREEN.left, top: SCREEN.top }}>
          <Checkout w={SCREEN.w} bodyH={BODY_H} feed={0} receipt={null}>
            <ScreenOff />
          </Checkout>
        </div>

        {/* the agent */}
        <div style={{ position: "absolute", left: FIG.left, top: FIG.top }}>
          <Figure2
            size={FIG.size}
            eyes={1}
            notebook={nbIn ? 0 : 1}
            look={look}
            glow={jarGlow}
            left={{ target: left, pose: t > 14.7 ? "grip" : "relaxed", thumb: "up" }}
            right={{ target: right, pose: t > 13.2 ? "grip" : "relaxed", thumb: t > 13.2 ? "up" : "down" }}
            front={
              <g>
                {/* the mushroom the brain holds for this chat only */}
                {slotMush > 0 ? (
                  <g opacity={slotMush}>
                    <g transform="translate(286 244)"><NoteIcon kind="mushroom" size={34} crossed /></g>
                    {scribble > 0 ? (
                      <path d="M 262 252 L 344 262 L 266 270 L 346 278 L 268 284" fill="none" stroke={colors.coral} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - scribble} />
                    ) : null}
                  </g>
                ) : null}
              </g>
            }
          >
            <BeltKit helper={1} light={1} cables={{ l: forearmPt("L", left), r: forearmPt("R", right), o: 1 }} />
            {/* the notebook, held by its right edge in the right hand */}
            {nbIn ? (
              <g>
                <OpenNotebook x={nb.x} y={nb.y} w={NB_W} open={nbOpen} lines={lines} off={off} write={mushWrite} switchShown={switchShown} />
                {!penInHand ? <Pencil x={nb.x + NB_W / 2 + 4} y={nb.y + 80} rot={-4} len={76} /> : null}
              </g>
            ) : null}
            {/* the pencil, held in the left hand (placed from the rig; under the fingers) */}
            {penInHand ? <Pencil x={penTip.x} y={penTip.y} rot={rp.angle + PEN_TILT - 90} len={PEN_TIP - 10} /> : null}
          </Figure2>
        </div>

        {/* "how does it know?" */}
        <div style={{ position: "absolute", left: JAR.x + 150, top: JAR.y - 40, translate: "0 -50%", opacity: during(frame, T.how, 13.2, 0.2) }}>
          <Tag fontSize={30} o={Math.min(1, pop(frame, T.how))}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><NoteIcon kind="mushroom" size={40} crossed /> ?</span>
          </Tag>
        </div>

        {/* lines lifting off the page into the jar */}
        {[[flyMush, "mushroom"], [flyDog, "dog"]].map(([f, icon], i) => {
          const p = f as { k: number; x: number; y: number };
          if (p.k <= 0 || p.k >= 1) return null;
          return (
            <div key={i} style={{ position: "absolute", left: p.x, top: p.y, translate: "-50% -50%", scale: `${1 - 0.5 * p.k}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, backgroundColor: "#F3EBDD", border: `3px solid ${INK}`, boxShadow: `0 0 14px ${colors.yellow}` }}>
                <NoteIcon kind={icon as "mushroom" | "dog"} size={22} crossed />
                <div style={{ width: 26, height: 4, borderRadius: 2, backgroundColor: "rgba(20,22,28,0.4)" }} />
              </div>
            </div>
          );
        })}
      </World>

      <QuestionStrip active={1} answered={1} o={1 - ramp(frame, 3.0, 0.4)} />
      <Dot path={(fr) => { const p = ROUTE.path(fr); return { x: p.x + 26 * tug, y: p.y - 18 * bonk }; }} squash={(fr) => Math.max(ROUTE.squash(fr), 0.15 * bonk)} track={TRACK} seed="e4s4" look={LOOK} />
    </AbsoluteFill>
  );
};

// Scene S4 — second stop: does it remember you? Edit only this file for S4 changes.
export const S4: React.FC = () => (
  <SceneShell sceneId={S.id} title={S.title} audioSrc={S.audioSrc}>
    <LineWipeIn>
      <S4Content />
    </LineWipeIn>
  </SceneShell>
);
