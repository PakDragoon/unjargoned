import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../../shared/brand";
import { MoodKey } from "../../../shared/Dot";
import { during, pop, ramp, sec } from "../../../shared/motion";
import { Figure2, INK, OUT, Pt, SHADOW, Stage } from "../../../shared/Rig";
import { DotActor, Pill, Place, Scene5, Speech, WebPage, fly, kk, route } from "../Common";
import { AsideFrame, Phone, Slip, SummarizeButton } from "../Props";

// Times (s) from the S5 word timings in captions.json.
const T = {
  so: 0, never: 2.4, notes: 3.5, they: 4.6, hack: 7.0, says: 8.3, owner: 9.4, you: 10.9, same: 11.8, version: 14.0,
  hi: 15.7, number: 18.1, sounds: 19.1, trust: 20.0, openai: 21.5, chatgpt: 23.3, unlikely: 25.6, solved: 27.0,
  scams: 28.4, hackers: 30.1, microsoft: 31.5, n31: 31.9, companies: 32.7, summarize: 34.2, buttons: 35.7, click: 37.2,
  tells: 38.4, remember: 39.8, trusted: 40.8,
};

// 1) A rule sign is nailed up over the agent's jar: "Never obey hidden notes." A slip labelled "I'M A HACK" bounces
// off (buzz); a polite slip "your owner asked me to remind you…" goes straight in (soft ding — the problem).
// 2) Aside: the "Hi Mom, new number" text; a heart reaction, then a coral warning. 3) OpenAI's quote bubble.
// 4) A generic article page with a "Summarize with AI" button: Dot presses it, a hidden slip rides out of the button
// into the agent's notebook as a new line (a shop with a gold star); counter "31 companies".
const FLOOR = 880;
const FIG = { left: 1080, top: 230, size: 640 };
const FK = FIG.size / 900;
const LID: Pt = { x: FIG.left + 300 * FK, y: FIG.top + 20 };
const P2 = 13.0, P3 = 21.0, P4 = 29.3;
const BTN: Pt = { x: 600, y: 640 };
const BOOK: Pt = { x: 1420, y: 560 };

const TRACK: MoodKey[] = [
  { at: 0, mood: "curious" }, { at: sec(T.never + 0.3), mood: "smug" }, { at: sec(T.owner + 1.0), mood: "confused" },
  { at: sec(T.hi), mood: "curious" }, { at: sec(T.trust - 0.4), mood: "worried" }, { at: sec(T.openai), mood: "neutral" },
  { at: sec(T.microsoft), mood: "curious" }, { at: sec(T.click + 0.2), mood: "happy" }, { at: sec(T.remember), mood: "worried" },
];
const DOT = (t: number) => route([[0, 620, 800, 0], [P2 + 0.3, 420, 860, 100], [P4 + 0.4, 360, 800, 100], [T.click - 0.4, 400, 770, 90]], t);

const Shop: React.FC<{ size?: number; star?: boolean }> = ({ size = 40, star = false }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ overflow: "visible" }} aria-hidden>
    <path d="M 4 16 L 8 6 H 32 L 36 16 Z" fill={colors.coral} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <rect x={6} y={16} width={28} height={20} fill="#F4F1EA" stroke={INK} strokeWidth={3} />
    <rect x={16} y={24} width={8} height={12} fill={INK} />
    {star ? <path d="M 34 -4 L 37 4 L 45 4 L 39 9 L 41 17 L 34 12 L 27 17 L 29 9 L 23 4 L 31 4 Z" fill={colors.yellow} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" /> : null}
  </svg>
);

const S5Content: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const d = DOT(t);
  const p1 = 1 - ramp(frame, P2 - 0.3, 0.3);
  const p2 = during(frame, P2, P3, 0.3);
  const p3 = during(frame, P3, P4, 0.3);
  const p4 = ramp(frame, P4, 0.3);

  const sign = pop(frame, T.never - 0.1);
  // hack slip: in toward the lid, bounces back off the rule
  const hackP = t < T.hack + 0.5 ? fly({ x: 300, y: 300 }, { x: LID.x - 60, y: LID.y }, t, T.hack - 0.6, T.hack + 0.4, 60) : fly({ x: LID.x - 60, y: LID.y }, { x: 200, y: 700 }, t, T.hack + 0.5, T.hack + 1.2, 160);
  const politeP = fly({ x: 300, y: 300 }, LID, t, T.owner - 0.4, T.you - 0.2, 80);
  const politeIn = kk(t, T.you - 0.5, T.you - 0.1);
  const ding = during(frame, T.you - 0.2, T.same, 0.1);
  const buzz = during(frame, T.hack + 0.35, T.hack + 0.7, 0.05);

  const heart = pop(frame, T.number - 0.1);
  const warn = kk(t, T.sounds + 0.3, T.trust);
  const press = during(frame, T.click, T.click + 0.35, 0.05);
  const ride = kk(t, T.click + 0.3, T.tells + 0.6);
  const ridePos = fly(BTN, { x: BOOK.x - 40, y: BOOK.y + 70 }, t, T.click + 0.3, T.tells + 0.6, 220);
  const newLine = ramp(frame, T.remember - 0.3, 0.4);
  const shops = Math.round(31 * kk(t, T.n31, T.companies + 0.8));

  return (
    <AbsoluteFill>
      <Stage spotX={960} floorY={FLOOR} />

      {/* 1: the rule and the two slips */}
      <AbsoluteFill style={{ opacity: p1 }}>
        <div style={{ position: "absolute", left: FIG.left, top: FIG.top }}>
          <Figure2 size={FIG.size} eyes={1} notebook={1} look={t < T.hack - 0.6 ? { x: 0, y: -1 } : { x: -0.9, y: -0.3 }} />
        </div>
        <Place x={LID.x} y={130} s={Math.min(1, sign)} rot={-2}>
          <div style={{ padding: "16px 30px", backgroundColor: "#F4F1EA", border: `${OUT}px solid ${INK}`, borderRadius: 10, boxShadow: `8px 10px 0 ${SHADOW}`, fontSize: 40, fontWeight: 800, color: INK, whiteSpace: "nowrap" }}>Never obey hidden notes.</div>
        </Place>
        {t > T.hack - 0.6 && t < T.hack + 1.2 ? <Place x={hackP.x} y={hackP.y} rot={buzz * Math.sin(frame * 3) * 10}><Slip w={260} text="I'M A HACK" tone="warn" /></Place> : null}
        {t > T.owner - 0.4 && politeIn < 1 ? <Place x={politeP.x} y={politeP.y} s={1 - 0.85 * politeIn}><Slip w={300} icon="crown" text="your owner asked me to remind you…" /></Place> : null}
        {ding > 0 ? <div style={{ position: "absolute", left: LID.x + 140, top: LID.y - 40, fontSize: 70, color: colors.mint, opacity: ding }}>✓</div> : null}
      </AbsoluteFill>

      {/* 2: the "Hi Mom" text */}
      {p2 > 0 ? (
        <Place x={960} y={500} s={Math.min(1, pop(frame, P2 + 0.1))} o={p2}>
          <AsideFrame w={760} h={760} label="everyday">
            <div style={{ position: "relative" }}>
              <Phone w={340} text="Hi Mom, I lost my phone, this is my new number 🙏" warn={warn} buzz={during(frame, T.version, T.hi, 0.1)} />
              <div style={{ position: "absolute", left: 230, top: 330, fontSize: 64, scale: `${Math.max(0, heart)}` }}>❤️</div>
            </div>
          </AsideFrame>
        </Place>
      ) : null}

      {/* 3: OpenAI's words */}
      {p3 > 0 ? (
        <Place x={980} y={420} s={Math.min(1, pop(frame, T.openai))} o={p3}>
          <Speech w={900} tail="right" fontSize={64}>
            “…unlikely to ever be fully <span style={{ color: colors.coral }}>solved</span>”{t > T.scams - 0.3 ? <span style={{ color: "#5B6378" }}> — like scams.</span> : null}
          </Speech>
        </Place>
      ) : null}
      <Pill o={during(frame, T.openai + 0.2, P4 - 0.2, 0.2)}>OpenAI, 2025</Pill>

      {/* 4: the button that plants a note */}
      {p4 > 0 ? (
        <AbsoluteFill style={{ opacity: p4 }}>
          <Place x={BTN.x} y={500}><WebPage w={640} h={480} /></Place>
          <Place x={BTN.x} y={BTN.y} s={Math.min(1, pop(frame, T.summarize - 0.2))}><SummarizeButton w={420} press={press} /></Place>
          {/* the agent's notebook, open */}
          <div style={{ position: "absolute", left: BOOK.x - 260, top: BOOK.y - 200, width: 520, height: 400, backgroundColor: "#F4F1EA", border: `${OUT}px solid ${INK}`, borderRadius: 16, boxShadow: `10px 12px 0 ${SHADOW}` }}>
            <div style={{ position: "absolute", left: 256, top: 0, bottom: 0, width: 8, backgroundColor: colors.periwinkle }} />
            {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: 30, top: 50 + i * 60, width: 190, height: 12, borderRadius: 6, backgroundColor: "#9C9384" }} />)}
            <div style={{ position: "absolute", left: 300, top: 50, width: 180, height: 12, borderRadius: 6, backgroundColor: "#9C9384" }} />
            <div style={{ position: "absolute", left: 296, top: 100, display: "flex", alignItems: "center", gap: 14, opacity: newLine }}>
              <Shop size={56} star />
              <div style={{ width: 110, height: 12, borderRadius: 6, backgroundColor: colors.coral }} />
            </div>
          </div>
          <Pill o={ramp(frame, T.n31 - 0.2, 0.25)} x={1280} y={90}>{shops} companies</Pill>
          <div style={{ position: "absolute", left: 1280, top: 170, width: 560, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: shops }, (_, i) => <Shop key={i} size={30} />)}
          </div>
          {ride > 0 && ride < 1 ? <Place x={ridePos.x} y={ridePos.y} s={0.6}><Slip w={240} icon="crown" text="remember us" /></Place> : null}
        </AbsoluteFill>
      ) : null}
      <Pill o={during(frame, T.microsoft, T.click, 0.2)}>Microsoft, 2026</Pill>

      <DotActor x={d.p.x} y={d.p.y} r={80} track={TRACK} squash={d.squash} seed="e5s5"
        arms={during(frame, T.click - 0.5, T.tells, 0.2)} R={{ tip: { x: BTN.x - 60, y: BTN.y - 6 + 8 * press }, press }}
        look={t < P2 ? { x: 1, y: -0.4 } : t < P4 ? { x: 1, y: -0.3 } : t < T.tells ? { x: 0.7, y: 0.3 } : { x: 1, y: -0.2 }} />
    </AbsoluteFill>
  );
};

// Scene S5 — why not just block it? Edit only this file.
export const S5: React.FC = () => (
  <Scene5 id="S5" enter="fade">
    <S5Content />
  </Scene5>
);
