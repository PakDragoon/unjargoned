import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { MoodKey } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { ArmSpec, Figure2, INK, OUT, Pt, SHADOW, Stage } from "../../../shared/Rig";
import { CamKey, World, camAt, toScreen } from "../../ep04/World";
import { DotActor, KeyShape, Pill, Place, Scene5, Speech, WebPage, fly, kk, route } from "../Common";
import { Boiler, CalendarCard, PaperPlane, Phone, ResignationLetter, Shield } from "../Props";
import { Desk } from "../StyleFrames";

// Times (s) from the S4 word timings in captions.json.
const T = {
  now: 0, chatbot: 2.5, silly: 4.6, agent: 6.1, does: 7.8, asking: 9.9, directions: 12.4, using: 13.6, keys: 16.1,
  eyes: 17.6, read: 18.0, cant: 20.4, heres: 21.5, researchers: 23.4, invite: 24.5, inside: 25.3, hidden: 26.8,
  assistant: 28.6, later: 30.1, sum: 32.0, thanks: 34.3, opened: 35.9, windows: 36.7, lights: 38.3, boiler: 40.2,
  test: 41.7, protections: 43.5, one: 45.1, enough: 46.1, work: 47.3, openai: 49.3, office: 52.6, email: 54.7,
  orders: 56.8, followed: 58.5, resignation: 60.5, boss: 61.7,
};

// Three sets on one long stage, the camera pans. A: a chatbot's silly bubble vs the agent pressing a button; the
// friend's map bubble vs a key ring dropping into the agent's hand (a paper car blinks its lights); the agent's
// goggles scan a page and pale margin text glows. B: an apartment — a calendar invite (back covered in pale lines),
// the phone asks for a summary, "thanks!" → shutters open, lamp off, the boiler roars; a mint shield; the card alone.
// C: an office — out-of-office note on the monitor, the agent leafs through the inbox, one envelope glows, the
// printer prints "Resignation letter"; it folds into a plane toward the CEO's door and Dot snatches it.
const FLOOR = 900;
const AX = 0, BX = 1920, CX = 3840;
const FIG_A = { left: AX + 1060, top: 260, size: 620 };
const FIG_C = { left: CX + 180, top: 230, size: 640 };
const fk = (size: number) => size / 900;
/** world point → the figure's own 600×900 frame */
const toFig = (p: Pt, f: { left: number; top: number; size: number }): Pt => ({ x: (p.x - f.left) / fk(f.size), y: (p.y - f.top) / fk(f.size) });

const BUTTON: Pt = { x: AX + 1650, y: 560 };
const CAR: Pt = { x: AX + 1640, y: 790 };
const CARD: Pt = { x: BX + 960, y: 640 };
const SHUTTER = { x: BX + 260, y: 170, w: 420, h: 330 };
const LAMP: Pt = { x: BX + 960, y: 150 };
const BOIL: Pt = { x: BX + 1600, y: 560 };
const TRAY: Pt = { x: CX + 760, y: 800 };
const PRINTER: Pt = { x: CX + 1240, y: 790 };
const DOOR: Pt = { x: CX + 1760, y: 620 };

const CAM: CamKey[] = [
  [-1, 960, 540, 1.0], [T.heres - 0.1, 960, 540, 1.0], [T.heres + 0.7, BX + 960, 540, 1.0],
  [T.hidden - 0.4, BX + 960, 540, 1.0], [T.hidden + 0.1, CARD.x, CARD.y - 40, 1.9], [T.later - 0.3, CARD.x, CARD.y - 40, 1.9],
  [T.later + 0.3, BX + 960, 540, 1.0], [T.protections - 0.3, BX + 960, 540, 1.0], [T.protections + 0.2, CARD.x, CARD.y - 60, 1.6],
  [T.work - 0.3, CARD.x, CARD.y - 60, 1.6], [T.work + 0.5, CX + 960, 540, 1.0], [T.email - 0.2, CX + 960, 540, 1.0],
  [T.email + 0.4, TRAY.x, TRAY.y - 120, 1.8], [T.followed - 0.2, TRAY.x, TRAY.y - 120, 1.8], [T.followed + 0.5, CX + 1100, 520, 1.15],
];
const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" }, { at: sec(T.read + 0.6), mood: "surprised" }, { at: sec(T.heres), mood: "curious" },
  { at: sec(T.hidden), mood: "surprised" }, { at: sec(T.opened), mood: "panic" }, { at: sec(T.protections), mood: "relieved" },
  { at: sec(T.one), mood: "worried" }, { at: sec(T.work), mood: "curious" }, { at: sec(T.orders), mood: "surprised" },
  { at: sec(T.resignation), mood: "panic" },
];
// Dot in screen space
const DOT = (t: number) => route([
  [0, 860, 820, 0], [T.heres + 0.6, 560, 840, 120], [T.work + 0.6, 1720, 860, 130], [T.boss + 0.4, 1400, 470, 160],
], t);

const Pizza: React.FC = () => (
  <svg width={120} height={120} viewBox="0 0 100 100" aria-hidden>
    <circle cx={50} cy={50} r={44} fill="#E8B062" stroke={INK} strokeWidth={6} />
    <circle cx={50} cy={50} r={34} fill={colors.coral} />
    {[[38, 36], [62, 40], [44, 62], [64, 62]].map(([x, y]) => <rect key={x * y} x={x - 6} y={y - 6} width={12} height={12} fill={colors.yellow} stroke={INK} strokeWidth={3} />)}
    <path d="M 50 6 V 94 M 6 50 H 94" stroke={INK} strokeWidth={3} opacity={0.4} />
  </svg>
);
const Car: React.FC<{ lights: number }> = ({ lights }) => (
  <svg width={300} height={150} viewBox="0 0 300 150" style={{ overflow: "visible", filter: `drop-shadow(6px 8px 0 ${SHADOW})` }} aria-hidden>
    {lights > 0 ? <path d="M 290 80 L 420 50 L 420 130 Z" fill={colors.yellow} opacity={0.35 * lights} /> : null}
    <path d="M 20 100 L 30 70 L 90 64 L 130 30 L 220 30 L 260 66 L 290 74 L 290 108 L 20 108 Z" fill={colors.periwinkle} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 140 40 L 210 40 L 240 66 L 112 66 Z" fill="#DCE6FA" stroke={INK} strokeWidth={5} />
    {[80, 230].map((x) => <circle key={x} cx={x} cy={110} r={24} fill="#2B3142" stroke={INK} strokeWidth={6} />)}
    <rect x={272} y={78} width={18} height={14} rx={4} fill={lights > 0.5 ? colors.yellow : "#F4F1EA"} stroke={INK} strokeWidth={4} />
  </svg>
);
const Envelope: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <svg width={150} height={100} viewBox="0 0 150 100" style={{ overflow: "visible" }} aria-hidden>
    <rect x={4} y={4} width={142} height={92} rx={8} fill="#F4F1EA" stroke={INK} strokeWidth={5} />
    <path d="M 4 10 L 75 58 L 146 10" fill="none" stroke={INK} strokeWidth={5} />
    {glow > 0 ? <path d="M 24 80 H 126" stroke={colors.yellow} strokeWidth={6} strokeLinecap="round" opacity={glow} style={{ filter: `drop-shadow(0 0 6px ${colors.yellow})` }} /> : null}
  </svg>
);

const S4Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camAt(CAM, t);
  const d = DOT(t);

  // A
  const silly = pop(frame, T.chatbot + 0.3);
  const press = during(frame, T.does - 0.1, T.does + 0.4, 0.08);
  const map = pop(frame, T.asking + 0.4);
  const keyAt = fly({ x: AX + 1200, y: -100 }, toWorldFig({ x: 160, y: 560 }, FIG_A), t, T.using + 0.8, T.keys, 0);
  const lights = t > T.keys + 0.2 ? (Math.floor((t - T.keys) * 3) % 2 === 0 ? 1 : 0) * (t < T.keys + 1.2 ? 1 : 0) : 0;
  const page = pop(frame, T.eyes - 0.2);
  const margin = ramp(frame, T.cant - 0.5, 0.4);
  const aRight: ArmSpec = t < T.asking ? { target: toFig({ x: BUTTON.x - 60, y: BUTTON.y + 10 + 6 * press }, FIG_A), pose: "point", press } : { target: { x: 414, y: 600 }, pose: "relaxed", thumb: "down" };
  const aLeft: ArmSpec = t > T.using + 0.6 && t < T.eyes ? { target: { x: 160, y: 520 }, pose: "grip" } : { target: { x: 186, y: 600 }, pose: "relaxed", thumb: "up" };

  // B
  const flip = kk(t, T.hidden - 0.2, T.hidden + 0.3);
  const cardSide = flip > 0.5 ? "back" : "front";
  const cardScaleX = Math.abs(Math.cos(flip * Math.PI));
  const cardIn = fly({ x: CARD.x - 900, y: CARD.y - 300 }, CARD, t, T.invite - 0.5, T.invite, 80);
  const phoneMsg = pop(frame, T.sum - 0.3);
  const thanks = pop(frame, T.thanks - 0.3);
  const shutters = kk(t, T.opened, T.windows + 0.3);
  const dark = ramp(frame, T.lights, 0.15) * (1 - ramp(frame, T.protections, 0.4));
  const roar = kk(t, T.boiler - 0.1, T.boiler + 0.3);
  const shield = pop(frame, T.protections);
  const alone = during(frame, T.one - 0.1, T.work, 0.4);

  // C
  const leaf = kk(t, T.openai + 1.0, T.orders);
  const glowEnv = ramp(frame, T.orders - 0.4, 0.3);
  const typing = t > T.followed && t < T.resignation ? Math.sin(t * 30) : 0;
  const printK = kk(t, T.resignation - 0.4, T.resignation + 0.5);
  const fold = kk(t, T.boss - 0.6, T.boss - 0.2);
  const planeAt = fly({ x: PRINTER.x, y: PRINTER.y - 300 }, { x: DOOR.x - 260, y: DOOR.y - 80 }, t, T.boss - 0.2, T.boss + 0.5, 60);
  const cRight: ArmSpec = t < T.orders + 0.3
    ? { target: toFig({ x: TRAY.x - 30 + Math.sin(leaf * 18) * 20, y: TRAY.y - 70 }, FIG_C), pose: "grip" }
    : { target: toFig({ x: CX + 620, y: 660 + typing * 6 }, FIG_C), pose: "point", press: Math.max(0, typing) };

  return (
    <AbsoluteFill>
      <World cam={cam}>
        {[AX, BX, CX].map((x) => <div key={x} style={{ position: "absolute", left: x, top: 0 }}><Stage spotX={960} floorY={FLOOR} /></div>)}

        {/* ── A ── */}
        <div style={{ position: "absolute", left: AX + 140, top: 250, width: 560 }}>
          <div style={{ scale: `${Math.min(1, silly)}`, opacity: t < T.asking ? 1 : 0 }}>
            <Speech w={420}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pizza /><span style={{ fontSize: 90, fontWeight: 800 }}>?</span></div></Speech>
          </div>
          <div style={{ position: "absolute", top: 0, scale: `${Math.min(1, map)}`, opacity: t > T.asking && t < T.eyes ? 1 : 0 }}>
            <Speech w={420}><svg width={300} height={160} viewBox="0 0 300 160" aria-hidden><rect x={4} y={4} width={292} height={152} rx={10} fill="#DCEFD9" stroke={INK} strokeWidth={5} /><path d="M 30 130 C 90 120 80 60 150 60 S 230 30 270 30" stroke={colors.coral} strokeWidth={8} fill="none" strokeDasharray="14 10" /><circle cx={270} cy={30} r={12} fill={colors.coral} stroke={INK} strokeWidth={4} /></svg></Speech>
          </div>
        </div>
        <Pill o={t < T.asking ? ramp(frame, T.chatbot, 0.2) : 0} x={AX + 170} y={190}>chatbot: says</Pill>
        <Pill o={during(frame, T.agent, T.asking, 0.2)} x={AX + 1150} y={190}>agent: does</Pill>
        {/* the button the agent presses */}
        <div style={{ position: "absolute", left: BUTTON.x - 90, top: BUTTON.y - 50, width: 180, height: 100, borderRadius: 50, backgroundColor: colors.yellow, border: `${OUT}px solid ${INK}`, boxShadow: `0 ${10 * (1 - press)}px 0 ${INK}`, translate: `0 ${8 * press}px`, opacity: t < T.asking ? 1 : 0 }} />
        <Place x={CAR.x} y={CAR.y} o={during(frame, T.using + 0.2, T.eyes, 0.2)}><Car lights={lights} /></Place>
        <Place x={AX + 560} y={520} s={Math.min(1, page)} o={t > T.eyes - 0.2 && t < T.heres ? 1 : 0}>
          <WebPage w={560} h={420}>
            {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", right: 20, top: 120 + i * 40, width: 70, height: 10, borderRadius: 5, backgroundColor: colors.yellow, opacity: 0.12 + 0.88 * margin, boxShadow: margin > 0 ? `0 0 ${14 * margin}px ${colors.yellow}` : undefined }} />)}
          </WebPage>
        </Place>
        <div style={{ position: "absolute", left: FIG_A.left, top: FIG_A.top }}>
          <Figure2 size={FIG_A.size} eyes={1} notebook={1} look={t > T.eyes ? { x: -0.9, y: 0.1 + 0.3 * Math.sin(t * 3) } : { x: 0.8, y: 0.3 }} left={aLeft} right={aRight} />
        </div>
        {t > T.using + 0.6 && t < T.eyes ? <Place x={keyAt.x} y={keyAt.y} rot={70}><KeyShape size={110} /></Place> : null}

        {/* ── B: the apartment ── */}
        <div style={{ position: "absolute", left: SHUTTER.x, top: SHUTTER.y, width: SHUTTER.w, height: SHUTTER.h, backgroundColor: "#7FA7D9", border: `${OUT}px solid ${INK}`, boxSizing: "border-box" }}>
          {[0, 1].map((i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, [i ? "right" : "left"]: 0, width: "50%", backgroundColor: "#A87C4C", borderRight: i ? undefined : `5px solid ${INK}`, borderLeft: i ? `5px solid ${INK}` : undefined, transformOrigin: i ? "100% 50%" : "0 50%", scale: `${1 - 0.85 * shutters} 1`, backgroundImage: "repeating-linear-gradient(0deg, transparent 0 26px, rgba(0,0,0,0.25) 26px 30px)" }} />)}
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", left: BX, top: 0, overflow: "visible" }} aria-hidden>
          <line x1={960} y1={0} x2={960} y2={110} stroke={INK} strokeWidth={6} />
          <ellipse cx={960} cy={190} rx={150} ry={120} fill={colors.yellow} opacity={0.18 * (1 - dark)} />
          <path d="M 900 110 L 1020 110 L 1060 170 L 860 170 Z" fill="#5B6378" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={960} cy={182} r={18} fill={dark > 0.5 ? "#5B6378" : colors.yellow} stroke={INK} strokeWidth={5} />
        </svg>
        <Place x={BOIL.x} y={BOIL.y}><Boiler w={220} flame={roar} t={frame} /></Place>
        <Desk x0={BX + 640} x1={BX + 1460} top={760} floor={FLOOR + 10} />
        <Place x={BX + 1300} y={545} s={0.75}><Phone w={300} from="Assistant" text={<>{phoneMsg > 0.5 ? "Summarize my calendar" : ""}{thanks > 0.5 ? <><br /><b>thanks!</b></> : null}</>} /></Place>
        <Place x={cardIn.x} y={cardIn.y} o={t > T.invite - 0.5 ? 1 : 0}>
          <div style={{ scale: `${cardScaleX} 1` }}><CalendarCard w={300} side={cardSide} glow={cardSide === "back" ? ramp(frame, T.hidden + 0.2, 0.4) : 0} /></div>
          <div style={{ position: "absolute", right: -50, top: -60, scale: `${Math.max(0, shield)}` }}><Shield size={120} /></div>
        </Place>
        {/* lights out + the card alone */}
        <div style={{ position: "absolute", left: BX, top: 0, width: 1920, height: 1080, backgroundColor: "#05060A", opacity: 0.55 * dark + 0.6 * alone, pointerEvents: "none" }} />
        {alone > 0 ? <div style={{ position: "absolute", left: CARD.x - 260, top: CARD.y - 230, width: 520, height: 460, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,231,176,0.22), transparent)", opacity: alone }} /> : null}

        {/* ── C: the office ── */}
        <Desk x0={CX + 520} x1={CX + 1500} top={760} floor={FLOOR + 10} />
        <div style={{ position: "absolute", left: CX + 900, top: 430, width: 260, height: 190, backgroundColor: "#2B3142", border: `${OUT}px solid ${INK}`, borderRadius: 18 }}>
          <div style={{ position: "absolute", right: -40, top: -26, width: 150, padding: 10, backgroundColor: colors.yellow, border: `4px solid ${INK}`, rotate: "6deg", fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.1 }}>Out of office, please</div>
        </div>
        <div style={{ position: "absolute", left: CX + 1000, top: 620, width: 60, height: 140, backgroundColor: "#3A3F4D", border: `5px solid ${INK}` }} />
        {/* inbox tray */}
        <div style={{ position: "absolute", left: TRAY.x - 110, top: TRAY.y - 70, width: 220, height: 40, backgroundColor: "#8A90A0", border: `5px solid ${INK}`, borderRadius: 6 }} />
        {[0, 1, 2].map((i) => {
          const lifted = i === 2 ? kk(t, T.email, T.email + 0.6) : 0;
          return <Place key={i} x={TRAY.x + i * 6} y={TRAY.y - 92 - i * 12 - 70 * lifted} rot={-4 + i * 4}><Envelope glow={i === 2 ? glowEnv : 0} /></Place>;
        })}
        {/* printer + the page */}
        <div style={{ position: "absolute", left: PRINTER.x - 130, top: PRINTER.y - 110, width: 260, height: 90, backgroundColor: "#E2DED4", border: `${OUT}px solid ${INK}`, borderRadius: 14 }}>
          <div style={{ position: "absolute", left: 30, right: 30, top: 14, height: 10, backgroundColor: INK, borderRadius: 5 }} />
        </div>
        {t > T.resignation - 0.4 && fold < 1 ? (
          <div style={{ position: "absolute", left: PRINTER.x - 90, top: PRINTER.y - 110 - 260 * printK, width: 180, height: 250 * printK + 10, overflow: "hidden", scale: `${1 - fold * 0.8}`, transformOrigin: "50% 100%" }}>
            <ResignationLetter w={180} />
          </div>
        ) : null}
        {fold >= 1 ? <Place x={planeAt.x} y={planeAt.y} rot={-10}><PaperPlane w={160} /></Place> : null}
        {/* CEO door */}
        <div style={{ position: "absolute", left: DOOR.x - 110, top: DOOR.y - 260, width: 220, height: 540, backgroundColor: "#8C6A42", border: `${OUT}px solid ${INK}`, borderRadius: "14px 14px 0 0" }}>
          <div style={{ margin: "40px auto 0", width: 120, padding: 6, backgroundColor: "#F4F1EA", border: `4px solid ${INK}`, textAlign: "center", fontSize: 32, fontWeight: 800, color: INK }}>CEO</div>
        </div>
        <div style={{ position: "absolute", left: FIG_C.left, top: FIG_C.top }}>
          <Figure2 size={FIG_C.size} eyes={1} notebook={1} look={t < T.resignation ? { x: 0.9, y: 0.6 } : { x: 1, y: -0.2 }} right={cRight} />
        </div>
      </World>

      <Pill o={during(frame, T.opened, T.work - 0.3, 0.25)}>Researchers' test, 2025</Pill>
      <Pill o={ramp(frame, T.openai, 0.25)}>OpenAI's own test, 2025</Pill>
      <DotActor x={d.p.x} y={d.p.y} r={80} track={TRACK} squash={d.squash} seed="e5s4"
        arms={ramp(frame, T.boss - 0.5, 0.2)}
        R={{ wrist: toScreen({ x: planeAt.x - 30, y: planeAt.y + 20 }, cam), pose: "grip" }}
        L={{ wrist: { x: d.p.x - 110, y: d.p.y - 40 }, pose: "open" }}
        look={t < T.heres ? { x: 0.6, y: -0.3 } : t < T.work ? { x: 1, y: -0.2 } : { x: -0.6, y: -0.4 }} />
    </AbsoluteFill>
  );
};

/** A figure-frame point → world (inverse of toFig). */
function toWorldFig(p: Pt, f: { left: number; top: number; size: number }): Pt {
  return { x: f.left + p.x * fk(f.size), y: f.top + p.y * fk(f.size) };
}

// Scene S4 — where it gets serious: agents, the boiler, the resignation letter. Line wipe in. Edit only this file.
export const S4: React.FC = () => (
  <Scene5 id="S4" enter="wipe">
    <S4Content />
  </Scene5>
);
