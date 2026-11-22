// Scene 3 — The Contrast. "[matter-of-fact] Normal ChatGPT sits frozen until you type a question. [pause] A Dot stays awake
// ALL night — watching your connected apps, spotting things you forgot, and preparing the work BEFORE you wake up."
import React from "react";
import { C, HEAD, MONO, STROKE, SHADOW, pop, ramp, lerp } from "../theme";
import { CalendarIcon, Card, CloudWindow, EnvelopeIcon, Overlay, Paper, Pill, TheDot, dotPose } from "../kit";
import { Sfx, Voice, useT } from "../common";

export const T = { frozen: 1.5, question: 2.86, aDot: 4.42, allNight: 5.32, watching: 6.6, apps: 7.36, spotting: 8.38, forgot: 8.84, preparing: 9.7, work: 10.24, before: 10.42, wake: 11.3 };

const TOP = { cx: 540, cy: 610, w: 900, h: 620 }; // OLD CHATGPT panel (y 300–920)
const BOT = { cx: 540, cy: 1255, w: 900, h: 520 }; // 24/7 DOT window (y 995–1515)
const TRAY: [number, number] = [235, 1400];
const CAL: [number, number] = [540, 1320];
const BOARD: [number, number] = [830, 1320];

const Snowflake: React.FC<{ x: number; y: number; r: number; o: number }> = ({ x, y, r, o }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1={-r} y1={0} x2={r} y2={0} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        {[-1, 1].map((s) => (
          <React.Fragment key={s}>
            <line x1={s * r * 0.55} y1={0} x2={s * r * 0.8} y2={-r * 0.22} stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={s * r * 0.55} y1={0} x2={s * r * 0.8} y2={r * 0.22} stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
          </React.Fragment>
        ))}
      </g>
    ))}
  </g>
);

export const S3: React.FC = () => {
  const t = useT();
  const f = t * 60;
  const snap = pop(f, 0);
  const frost = ramp(t, T.frozen - 0.1, T.frozen + 0.6);
  const live = pop(f, T.aDot);
  const cursorOn = Math.floor(t * 2) % 2 === 0;
  const topDim = 1 - 0.35 * ramp(t, T.aDot - 0.1, T.aDot + 0.3);

  // Envelope pulled out of the tray.
  const pull = ramp(t, 6.95, 7.45);
  const envY = lerp(TRAY[1] - 30, TRAY[1] - 175, 1 - Math.pow(1 - pull, 3));
  const mark = ramp(t, T.forgot - 0.15, T.forgot + 0.35);
  const note = pop(f, T.work - 0.04);
  const mins = 2 * 60 + 14 + Math.max(0, Math.floor((t - T.aDot) * 7)); // night clock runs fast
  const clock = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")} AM`;

  const start: [number, number] = [540, 1150];
  const pose = dotPose(t, start, [
    { at: T.allNight, dur: 0.3, to: [540, 1150], arc: 70 },
    { at: 6.55, dur: 0.4, to: [TRAY[0], TRAY[1] - 106], arc: 120 },
    { at: 6.95, dur: 0.5, to: [TRAY[0], TRAY[1] - 251], arc: 0 }, // rides up with the envelope
    { at: 8.2, dur: 0.42, to: [CAL[0] - 50, CAL[1] - 118], arc: 120 },
    { at: 9.6, dur: 0.42, to: [BOARD[0] - 150, BOARD[1] + 60], arc: 130 },
    { at: T.work - 0.16, dur: 0.12, to: [BOARD[0] - 125, BOARD[1] + 60], arc: 0 },
    { at: T.wake - 0.1, dur: 0.3, to: [BOARD[0] - 125, BOARD[1] + 60], arc: 80 },
  ]);
  pose.sx *= live;
  pose.sy *= live;

  return (
    <Paper>
      {/* ── top: OLD CHATGPT (muted, frozen) ── */}
      <div style={{ opacity: topDim, transform: `translateY(${(1 - snap) * -60}px)` }}>
        <Card x={TOP.cx} y={TOP.cy} w={TOP.w} h={TOP.h} bg={C.sand} radius={24}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 230, height: 150, background: C.paper, border: `${STROKE}px solid ${C.ink}`, borderRadius: 22, boxShadow: SHADOW, display: "flex", alignItems: "center", padding: "0 34px", boxSizing: "border-box", filter: "grayscale(1)", opacity: 0.85 }}>
            <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: C.ink, opacity: 0.35, letterSpacing: "-0.02em" }}>Ask anything</span>
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 52, color: C.ink, marginLeft: 6, opacity: cursorOn ? 0.8 : 0 }}>|</span>
          </div>
          {frost > 0 && (
            <>
              <div style={{ position: "absolute", inset: 0, borderRadius: 21, background: `rgba(255,255,255,${0.5 * frost})` }} />
              <svg width={TOP.w} height={TOP.h} style={{ position: "absolute", inset: 0 }}>
                <Snowflake x={90} y={95} r={46 * frost} o={frost} />
                <Snowflake x={TOP.w - 100} y={TOP.h - 110} r={56 * frost} o={frost} />
                <Snowflake x={TOP.w - 70} y={120} r={30 * frost} o={frost} />
                <Snowflake x={120} y={TOP.h - 90} r={34 * frost} o={frost} />
              </svg>
              <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 34, color: C.ink, letterSpacing: "0.06em", opacity: frost }}>WAITING FOR PROMPT...</div>
            </>
          )}
        </Card>
        <Pill x={TOP.cx} y={TOP.cy - TOP.h / 2} s={snap} mono size={28} bg={C.paper} text="OLD CHATGPT" />
      </div>

      {/* divider */}
      <Overlay>
        <line x1={540 - 480 * snap} y1={960} x2={540 + 480 * snap} y2={960} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      </Overlay>

      {/* ── bottom: 24/7 DOT (live after the pause) ── */}
      <div style={{ opacity: 0.4 + 0.6 * Math.min(1, live), transform: `translateY(${(1 - snap) * 60}px)` }}>
        <CloudWindow rect={BOT} clock={t > T.aDot ? clock : undefined}>
          {/* inbox tray */}
          <div style={{ position: "absolute", left: TRAY[0] - 93 - 70, top: envY - 1051 - 48, opacity: 1 }}>
            <EnvelopeIcon w={140} unread={pull > 0.02} flap={0} />
          </div>
          <svg width={894} height={460} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <g transform={`translate(${TRAY[0] - 93} ${TRAY[1] - 1051})`}>
              <path d="M-120,-30 L120,-30 L100,40 L-100,40 Z" fill={C.sand} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
              <line x1={-120} y1={-30} x2={120} y2={-30} stroke={C.ink} strokeWidth={STROKE} />
              <text x={0} y={22} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={22} fill={C.ink}>INBOX</text>
            </g>
          </svg>
          {/* calendar */}
          <div style={{ position: "absolute", left: CAL[0] - 93 - 95, top: CAL[1] - 1051 - 90 }}>
            <CalendarIcon w={190} mark={mark} markCell={6} />
          </div>
          {mark > 0.6 && (
            <div style={{ position: "absolute", left: CAL[0] - 93 - 70, top: CAL[1] - 1051 + 100, fontFamily: MONO, fontWeight: 600, fontSize: 20, color: C.red }}>MISSED: FRI</div>
          )}
          {/* corkboard */}
          <div style={{ position: "absolute", left: BOARD[0] - 93 - 105, top: BOARD[1] - 1051 - 130, width: 210, height: 260, background: "#D9C9A3", border: `${STROKE}px solid ${C.ink}`, borderRadius: 12, boxSizing: "border-box" }}>
            {[[30, 30], [170, 40], [40, 210]].map(([x, y], i) => (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: 12, height: 12, borderRadius: 6, background: C.ink }} />
            ))}
          </div>
          {note > 0.01 && (
            <div style={{ position: "absolute", left: BOARD[0] - 93 - 80, top: BOARD[1] - 1051 - 75, width: 160, height: 150, background: C.yellow, border: `${STROKE}px solid ${C.ink}`, boxShadow: "4px 4px 0px #141414", transform: `scale(${1.6 - 0.6 * note}) rotate(-5deg)`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 34, lineHeight: 1, color: C.ink, letterSpacing: "-0.02em" }}>
              DRAFT
              <br />
              READY
            </div>
          )}
        </CloudWindow>
        <Pill x={BOT.cx} y={BOT.cy - BOT.h / 2 - 2} s={snap} mono size={28} bg={C.red} color={C.paper} text="24/7 DOT" />
      </div>
      {live > 0.01 && <TheDot pose={pose} trailOn="slate" />}

      <Voice id="scene3" />
      <Sfx at={0} name="snap" vol={0.6} />
      <Sfx at={T.frozen - 0.1} name="chime" vol={0.15} />
      <Sfx at={T.aDot} name="pop" vol={0.4} />
      <Sfx at={6.55} name="hop" vol={0.3} />
      <Sfx at={6.95} name="paper" vol={0.5} />
      <Sfx at={8.2} name="hop" vol={0.3} />
      <Sfx at={T.forgot - 0.15} name="pop" vol={0.3} />
      <Sfx at={9.6} name="hop" vol={0.3} />
      <Sfx at={9.85} name="paper" vol={0.35} />
      <Sfx at={T.work - 0.04} name="slap" vol={0.65} />
    </Paper>
  );
};
