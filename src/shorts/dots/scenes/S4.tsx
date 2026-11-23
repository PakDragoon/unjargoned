// Scene 4 — The Stakes & Security Twist. "It can even fill out a checkout cart with your card — [long pause] [serious] except
// OpenAI built a separate security AI called Sentinel that PHYSICALLY blocks it from spending money or sending messages until you tap approve."
import React from "react";
import { C, HEAD, MONO, SHADOW, STROKE, DROP, easeIn, easeOut, lerp, pop, ramp, wobble } from "../theme";
import { Overlay, Paper, Pill, StopHand, TheDot, dotPose } from "../kit";
import { Sfx, Voice, useT } from "../common";

export const T = { cart: 1.2, card: 1.88, except: 4.16, sentinel: 7.38, physically: 8.3, blocks: 8.8, spending: 9.76, sending: 10.76, until: 11.62, tap: 12.5 };

const FLOOR = 1080;
const SLAM = 3.85; // gate lands right at the end of the [long pause], just before "except"
const GATE = { cx: 670, w: 120 };
const PAY = { cx: 865, cy: FLOOR - 72, w: 210, h: 112 };

const Cart: React.FC<{ cx: number; card: number; t: number }> = ({ cx, card, t }) => {
  const by = FLOOR - 40; // basket bottom
  const spin = cx * 2.2;
  const wheel = (x: number) => (
    <g transform={`translate(${x} ${FLOOR - 20}) rotate(${spin})`}>
      <circle r={18} fill={C.paper} stroke={C.ink} strokeWidth={STROKE} />
      <line x1={-12} y1={0} x2={12} y2={0} stroke={C.ink} strokeWidth={2.5} />
      <line x1={0} y1={-12} x2={0} y2={12} stroke={C.ink} strokeWidth={2.5} />
    </g>
  );
  const cardY = lerp(-420, 0, card);
  return (
    <Overlay>
      <g style={{ filter: DROP }}>
        {/* grocery box */}
        <g transform={`translate(${cx - 38} ${by - 150})`}>
          <rect x={-42} y={0} width={84} height={90} fill={C.sand} stroke={C.ink} strokeWidth={STROKE} />
          <line x1={-42} y1={22} x2={42} y2={22} stroke={C.ink} strokeWidth={2.5} />
          <rect x={-14} y={36} width={28} height={30} fill={C.red} stroke={C.ink} strokeWidth={2.5} />
          <path d="M-30,0 Q-40,-28 -18,-34 M10,0 Q4,-34 26,-30" fill="none" stroke={C.green} strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* credit card */}
        {card > 0.001 && (
          <g transform={`translate(${cx + 46} ${by - 118 + cardY}) rotate(${-14 + (1 - card) * 40})`}>
            <rect x={-46} y={-30} width={92} height={60} rx={8} fill={C.yellow} stroke={C.ink} strokeWidth={STROKE} />
            <rect x={-46} y={-16} width={92} height={10} fill={C.ink} />
            <rect x={-34} y={6} width={22} height={14} rx={3} fill={C.paper} stroke={C.ink} strokeWidth={2} />
          </g>
        )}
        {/* basket */}
        <path d={`M${cx - 110},${by - 120} L${cx + 110},${by - 120} L${cx + 92},${by} L${cx - 92},${by} Z`} fill={C.paper} fillOpacity={0.85} stroke={C.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        {[-55, 0, 55].map((dx) => (
          <line key={dx} x1={cx + dx} y1={by - 118} x2={cx + dx * 0.85} y2={by - 2} stroke={C.ink} strokeWidth={2} />
        ))}
        <line x1={cx - 104} y1={by - 60} x2={cx + 104} y2={by - 60} stroke={C.ink} strokeWidth={2} />
        {/* handle */}
        <polyline points={`${cx - 110},${by - 120} ${cx - 140},${by - 150} ${cx - 168},${by - 150}`} fill="none" stroke={C.ink} strokeWidth={STROKE + 2} strokeLinecap="round" strokeLinejoin="round" />
        <line x1={cx - 92} y1={by} x2={cx - 80} y2={FLOOR - 22} stroke={C.ink} strokeWidth={STROKE} />
        <line x1={cx + 92} y1={by} x2={cx + 80} y2={FLOOR - 22} stroke={C.ink} strokeWidth={STROKE} />
        {wheel(cx - 70)}
        {wheel(cx + 70)}
      </g>
    </Overlay>
  );
};

export const S4: React.FC = () => {
  const t = useT();
  const f = t * 60;
  const shake = 8 * wobble(t, SLAM, 5, 40) + 3 * wobble(t, T.physically, 9, 50);
  const g = easeIn(ramp(t, SLAM - 0.2, SLAM));
  const gateOff = (1 - g) * -(FLOOR + 60) + -14 * Math.max(0, wobble(t, SLAM, 9, 30));
  const rattle = 5 * wobble(t, T.physically, 7, 60);

  const cx = t < SLAM ? lerp(260, 497, Math.pow(ramp(t, 0.1, SLAM), 1.15)) : lerp(497, 470, easeOut(ramp(t, SLAM, SLAM + 0.25)));
  const card = pop(f, T.card - 0.25);
  const badge = pop(f, SLAM + 0.05) + 0.12 * pop(f, T.sentinel) * (1 - ramp(t, T.sentinel + 0.25, T.sentinel + 0.6));

  const pose = dotPose(
    t,
    [cx - 196, FLOOR - 28],
    [
      { at: T.until + 0.1, dur: 0.3, to: [470 - 196, FLOOR - 28], arc: 55 },
      { at: T.tap + 0.05, dur: 0.26, to: [470 - 196, FLOOR - 28], arc: 40 },
    ],
    t < SLAM ? 0.08 : 0.3 * Math.max(0, wobble(t, SLAM, 7, 26)),
  );

  const phone = pop(f, T.until - 0.2);
  const phoneP = Math.min(1, phone);
  const pulse = t > T.tap - 0.1 ? 1 + 0.06 * (0.5 + 0.5 * Math.sin((t - T.tap) * Math.PI * 2 * 1.6)) : 1;

  return (
    <Paper>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${shake - 300 * phoneP}px)` }}>
        {/* track */}
        <Overlay>
          <line x1={100} y1={FLOOR} x2={980} y2={FLOOR} stroke={C.ink} strokeWidth={STROKE + 1} strokeLinecap="round" />
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1={110 + i * 50} y1={FLOOR + 8} x2={130 + i * 50} y2={FLOOR + 22} stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
          ))}
        </Overlay>
        {/* PAY NOW */}
        <div style={{ position: "absolute", left: PAY.cx - PAY.w / 2, top: PAY.cy - PAY.h / 2, width: PAY.w, height: PAY.h, background: C.red, border: `${STROKE}px solid ${C.ink}`, borderRadius: 22, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 44, color: C.paper, letterSpacing: "-0.02em", boxSizing: "border-box" }}>
          PAY NOW
        </div>
        <Cart cx={cx} card={card} t={t} />
        <TheDot pose={pose} />

        {/* SentinelGate */}
        <div style={{ position: "absolute", left: GATE.cx - GATE.w / 2 + rattle, top: gateOff, width: GATE.w, height: FLOOR + 4 }}>
          <div style={{ position: "absolute", inset: 0, border: `${STROKE}px solid ${C.ink}`, boxShadow: SHADOW, background: `repeating-linear-gradient(45deg, ${C.red} 0 34px, ${C.ink} 34px 68px)`, boxSizing: "border-box" }} />
          <div style={{ position: "absolute", left: -26, right: -26, bottom: -6, height: 26, background: C.ink, borderRadius: 6 }} />
          <div style={{ position: "absolute", left: GATE.w / 2 - 245, top: FLOOR - 560, width: 490, height: 150, transform: `scale(${badge})`, background: C.paper, border: `${STROKE}px solid ${C.ink}`, boxShadow: SHADOW, borderRadius: 20, display: "flex", alignItems: "center", gap: 20, padding: "0 26px", boxSizing: "border-box" }}>
            <StopHand size={96} />
            <div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 56, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>SENTINEL</div>
              <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 28, color: C.red, marginTop: 6 }}>// AUTO-REVIEW</div>
            </div>
          </div>
        </div>

        <Pill x={250} y={FLOOR - 300} s={pop(f, T.spending - 0.05)} mono size={26} bg={C.ink} color={C.paper} rot={-2} text={<><span style={{ color: C.red }}>■</span> BLOCKED: SPEND $</>} />
        <Pill x={250} y={FLOOR - 220} s={pop(f, T.sending - 0.05)} mono size={26} bg={C.ink} color={C.paper} rot={1.5} text={<><span style={{ color: C.red }}>■</span> BLOCKED: SEND MSG</>} />
      </div>

      {/* phone */}
      {phone > 0.01 && (
        <div style={{ position: "absolute", left: 540 - 200 + (1 - phone) * 720, top: 960, width: 400, height: 555, transform: `rotate(${(1 - phone) * 12 + 2}deg)`, background: C.ink, borderRadius: 54, border: `${STROKE}px solid ${C.ink}`, boxShadow: SHADOW, padding: 16, boxSizing: "border-box" }}>
          <div style={{ width: "100%", height: "100%", background: C.paper, borderRadius: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 140, top: 14, width: 80, height: 22, borderRadius: 11, background: C.ink }} />
            <div style={{ position: "absolute", left: 20, right: 20, top: 66, background: C.sand, border: `${STROKE}px solid ${C.ink}`, borderRadius: 22, boxShadow: "4px 4px 0px #141414", padding: "22px 20px", boxSizing: "border-box", transform: `scale(${pop(f, T.tap - 0.12) * 0.15 + 0.85})` }}>
              <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, color: C.red, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: C.red, border: `${STROKE}px solid ${C.ink}` }} />
                DOT REQUEST:
              </div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 54, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.02, marginTop: 14 }}>
                APPROVE
                <br />
                $31.00?
              </div>
              <div style={{ marginTop: 24, background: C.red, color: C.paper, border: `${STROKE}px solid ${C.ink}`, borderRadius: 16, padding: "16px 0", textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 25, transform: `scale(${pulse})`, boxShadow: "4px 4px 0px #141414" }}>
                [ TAP TO APPROVE ]
              </div>
            </div>
          </div>
        </div>
      )}

      <Voice id="scene4" />
      <Sfx at={0.1} name="roll" vol={0.45} />
      <Sfx at={1.7} name="roll" vol={0.5} />
      <Sfx at={T.card - 0.25} name="pop" vol={0.3} />
      <Sfx at={T.card + 0.05} name="thud" vol={0.3} />
      <Sfx at={SLAM - 0.04} name="vault" vol={0.9} />
      <Sfx at={T.physically} name="thud" vol={0.45} />
      <Sfx at={T.spending - 0.05} name="pop" vol={0.3} />
      <Sfx at={T.sending - 0.05} name="pop" vol={0.3} />
      <Sfx at={T.until - 0.2} name="whoosh" vol={0.3} />
      <Sfx at={T.tap - 0.12} name="ding" vol={0.55} />
    </Paper>
  );
};
