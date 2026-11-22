// The Dot's cloud desktop (inside CloudWindow at its zoomed size WIN1): three app cards + 24/7 flip clock.
import React from "react";
import { C, MONO, HEAD } from "../theme";
import { BagIcon, CalendarIcon, Card, Check, EnvelopeIcon, FlipClock, inWin } from "../kit";
import { WIN1 } from "../common";

export const CARD_W = 230;
export const CARD_H = 270;
export const CARD_U = [0.18, 0.5, 0.82];
export const CARD_V = 0.5;
const IW = WIN1.w - 6;
const IH = WIN1.h - 56 - 6;
/** Screen point where TheDot sits on top of card i. */
export const onCard = (i: number): [number, number] => {
  const [x, y] = inWin(WIN1, CARD_U[i], CARD_V);
  return [x, y - CARD_H / 2 - 28];
};

export const Desktop: React.FC<{ t: number; cards: number[]; checks: number[]; clock: number; opacity?: number }> = ({ t, cards, checks, clock, opacity = 1 }) => {
  const labels = ["MAIL", "CALENDAR", "SHOP"];
  const icons = [<EnvelopeIcon key="m" w={130} unread />, <CalendarIcon key="c" w={120} mark={checks[1] > 0 ? 1 : 0} markCell={6} />, <BagIcon key="b" w={112} />];
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* faint desktop dot-grid on the slate */}
      <svg width={IW} height={IH} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
        {Array.from({ length: 12 * 14 }).map((_, i) => (
          <circle key={i} cx={40 + (i % 12) * 70} cy={40 + Math.floor(i / 12) * 70} r={2.2} fill={C.paper} />
        ))}
      </svg>
      <div style={{ position: "absolute", right: 26, top: 26 }}>
        {clock > 0.01 && <FlipClock t={t} s={clock} />}
      </div>
      <div style={{ position: "absolute", left: 30, top: 34, fontFamily: MONO, fontWeight: 600, fontSize: 22, color: C.paper, opacity: Math.min(1, clock), letterSpacing: "0.04em" }}>
        <span style={{ color: C.red }}>●</span> DOT-SESSION / AWAKE
      </div>
      {cards.map((s, i) => {
        const x = CARD_U[i] * IW;
        const y = CARD_V * IH;
        return (
          <React.Fragment key={i}>
            <Card x={x} y={y} w={CARD_W} h={CARD_H} s={s} rot={[-2, 1.5, -1][i]}>
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
                {icons[i]}
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.ink, letterSpacing: "-0.02em" }}>{labels[i]}</div>
              </div>
            </Card>
            <Check x={x + CARD_W / 2 - 14} y={y - CARD_H / 2 + 14} s={checks[i]} />
          </React.Fragment>
        );
      })}
    </div>
  );
};
