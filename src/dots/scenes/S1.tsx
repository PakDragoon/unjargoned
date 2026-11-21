import React from "react";
import { useCurrentFrame, Easing } from "remotion";
import { C, F, STROKE, SHADOW, Paper, TheDot, CloudPC, Icon, Pointer, Stamp, Tag, useCues, useSpring, ramp, lerp, typed, popStyle, route } from "../kit";

const K = "long_scene1" as const;
// chat window
const WX = 510, WY = 190, WW = 900, WH = 600;

const Chat: React.FC<{ f: number; cue: ReturnType<typeof useCues> }> = ({ f, cue }) => {
  const q = typed("Help me plan my week", f, 20, 16);
  const ans = f > 130;
  const lines = [0.82, 0.66, 0.74, 0.5];
  return (
    <div style={{ position: "absolute", left: WX, top: WY, width: WW, height: WH, background: C.white, border: STROKE, borderRadius: 18, boxShadow: SHADOW, overflow: "hidden" }}>
      <div style={{ height: 58, background: C.sand, borderBottom: STROKE, display: "flex", alignItems: "center", padding: "0 22px", justifyContent: "space-between" }}>
        <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 22 }}>chat — new conversation</span>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: C.red, border: STROKE, color: C.white, fontWeight: 700, fontSize: 26, display: "grid", placeItems: "center" }}>×</div>
      </div>
      <div style={{ padding: 34, display: "flex", flexDirection: "column", gap: 22 }}>
        {f > 100 && <div style={{ alignSelf: "flex-end", background: C.ochre, border: STROKE, borderRadius: 16, padding: "14px 22px", fontSize: 30, fontWeight: 500 }}>Help me plan my week</div>}
        {ans && (
          <div style={{ alignSelf: "flex-start", width: 560, background: C.sand, border: STROKE, borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            {lines.map((w, i) => (
              <div key={i} style={{ height: 14, borderRadius: 7, background: C.ink, opacity: 0.75, width: `${w * 100 * ramp(f, 130 + i * 14, 150 + i * 14)}%` }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 26, height: 70, border: STROKE, borderRadius: 14, background: C.paper, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 28 }}>
        {f <= 100 ? <>{q}<span style={{ opacity: f % 30 < 15 ? 1 : 0 }}>|</span></> : <span style={{ opacity: 0.4 }}>Message…</span>}
      </div>
    </div>
  );
};

export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues(K);
  const tClose = cue("closed") + 12;          // click on ×
  const tFreeze = cue("froze");
  const tCrack = cue("That");
  const tShatter = cue("ended");
  const tPC = cue("Dots");

  // pointer travels to the × and clicks
  const px = lerp(1100, WX + WW - 40, ramp(f, tClose - 50, tClose - 6));
  const py = lerp(900, WY + 22, ramp(f, tClose - 50, tClose - 6));
  const press = f > tClose && f < tClose + 8 ? 1 : 0;
  const closed = f > tClose + 6;

  // ice
  const ice = ramp(f, tFreeze - 6, tFreeze + 18, 0, 1, Easing.out(Easing.back(1.4)));
  const shatter = ramp(f, tShatter, tShatter + 40, 0, 1, Easing.out(Easing.cubic));
  const showIce = f >= tFreeze - 6 && shatter < 1;

  // bouncers: email, alarm, calendar — fly in, hit ice, rebound
  const bouncers: { kind: "mail" | "alarm" | "calendar"; t: number; from: [number, number]; hit: [number, number] }[] = [
    { kind: "mail", t: cue("email") - 10, from: [-120, 300], hit: [WX - 110, 360] },
    { kind: "alarm", t: cue("deadline") - 10, from: [2040, 260], hit: [WX + WW + 30, 300] },
    { kind: "calendar", t: cue("finger") - 6, from: [2040, 900], hit: [WX + WW + 30, 640] },
  ];

  // after shatter: dot pops out center then hops left; cloud pc expands
  const dotIn = useSpring(tShatter + 4);
  const pcIn = useSpring(tPC);
  const r = route(f, [[0, 960, 500], [tPC - 30, 360, 640]], 26, 140);
  const dotX = f < tPC - 30 ? 960 : r.x;
  const dotY = f < tPC - 30 ? lerp(520, 500, dotIn) + Math.sin(f / 18) * 4 : r.y;

  // sorting cards inside the PC
  const sortStart = tPC + 40;
  const cols = [{ label: "INBOX", c: C.paper }, { label: "DEADLINES", c: C.ochre }, { label: "CALENDAR", c: C.sand }];
  const cards = Array.from({ length: 9 }, (_, i) => ({ i, col: (i * 2) % 3, t: sortStart + i * 26 }));

  return (
    <Paper>
      {/* top label */}
      <div style={{ position: "absolute", left: 80, top: 60 }}>
        <Tag bg={C.paper} color={C.ink}>{f < tShatter ? "CHATBOT // WAITS FOR YOU" : "AGENT // KEEPS WORKING"}</Tag>
      </div>

      {shatter < 1 && (
        <div style={{ opacity: closed ? 0.55 : 1, filter: closed ? "grayscale(1)" : undefined, transform: `scale(${1 - shatter * 0.1})` }}>
          <Chat f={f} cue={cue} />
        </div>
      )}

      {/* ice cube */}
      {showIce && (
        <div style={{ position: "absolute", left: WX - 50, top: WY - 50, width: WW + 100, height: WH + 100, transform: `scale(${lerp(0.85, 1, ice)})`, opacity: ice * (1 - shatter) }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 30, border: `4px solid ${C.ink}`, background: "rgba(190,222,236,0.55)", boxShadow: SHADOW }} />
          <svg width={WW + 100} height={WH + 100} style={{ position: "absolute", inset: 0 }}>
            <path d={`M 40 80 L 160 40 M 60 140 L 110 100 M ${WW} 60 L ${WW + 60} 140 M ${WW - 40} ${WH + 60} L ${WW + 40} ${WH - 20}`} stroke={C.white} strokeWidth={8} strokeLinecap="round" opacity={0.9} />
            {/* vermilion crack */}
            <path d={`M ${(WW + 100) / 2 - 20} 0 L ${(WW + 100) / 2 + 30} 140 L ${(WW + 100) / 2 - 40} 260 L ${(WW + 100) / 2 + 50} 400 L ${(WW + 100) / 2 - 10} 540 L ${(WW + 100) / 2 + 20} ${WH + 100}`}
              fill="none" stroke={C.red} strokeWidth={10} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(f, tCrack, tShatter - 4)} />
          </svg>
          <div style={{ position: "absolute", left: "50%", top: -26, transform: "translateX(-50%)" }}>
            <Tag bg={C.white} color={C.ink} size={30}>FROZEN</Tag>
          </div>
        </div>
      )}

      {/* shards */}
      {f >= tShatter && shatter < 1 && Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + 0.3;
        const d = shatter * (500 + (i % 4) * 120);
        return (
          <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * d - 40, top: 490 + Math.sin(a) * d + shatter * shatter * 300 - 30,
            width: 80 + (i % 3) * 30, height: 60, background: "rgba(190,222,236,0.8)", border: STROKE, transform: `rotate(${i * 47 + shatter * 300}deg)`,
            clipPath: "polygon(0 0, 100% 20%, 70% 100%, 10% 80%)", opacity: 1 - shatter }} />
        );
      })}

      {/* bouncing icons */}
      {bouncers.map((b, i) => {
        if (f < b.t) return null;
        const tin = ramp(f, b.t, b.t + 20, 0, 1, Easing.in(Easing.quad));
        const tout = ramp(f, b.t + 20, b.t + 70, 0, 1, Easing.out(Easing.quad));
        const away: [number, number] = [b.hit[0] + (b.hit[0] < 960 ? -170 : 170), b.hit[1] + 120];
        const x = tout > 0 ? lerp(b.hit[0], away[0], tout) : lerp(b.from[0], b.hit[0], tin);
        const y = tout > 0 ? lerp(b.hit[1], away[1], tout) - Math.sin(Math.PI * tout) * 120 : lerp(b.from[1], b.hit[1], tin);
        const fade = 1 - ramp(f, tCrack - 20, tCrack);
        const squash = f > b.t + 18 && f < b.t + 28 ? 0.2 : 0;
        return (
          <div key={i} style={{ position: "absolute", left: x - 55, top: y - 55, opacity: fade, transform: `scale(${1 - squash},${1 + squash}) rotate(${tout * (b.hit[0] < 960 ? -30 : 30)}deg)` }}>
            <Icon kind={b.kind} size={110} />
          </div>
        );
      })}

      {/* pointer */}
      {f > tClose - 60 && f < tFreeze && <Pointer x={px} y={py} press={press} />}

      {/* the dot */}
      {f >= tShatter + 4 && (
        <div style={{ ...popStyle(dotIn, 0) }}>
          <TheDot x={dotX} y={dotY} r={lerp(10, 64, dotIn)} squash={r.squash} look={f > tPC ? 1 : 0} />
        </div>
      )}

      {/* cloud PC */}
      {f >= tPC && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${lerp(-560, 0, pcIn)}px, 0) scale(${lerp(0.1, 1, pcIn)})`, transformOrigin: "360px 640px" }}>
          <CloudPC x={620} y={200} w={1100} h={680}>
            <div style={{ position: "absolute", inset: 0, display: "flex", gap: 26, padding: 30 }}>
              {cols.map((c, ci) => (
                <div key={ci} style={{ flex: 1, border: `3px dashed ${C.sand}`, borderRadius: 12, position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, left: 0, right: 0, textAlign: "center" }}>
                    <Tag bg={c.c} color={C.ink} size={20}>{c.label}</Tag>
                  </div>
                </div>
              ))}
            </div>
            {cards.map((k) => {
              if (f < k.t) return null;
              const t = ramp(f, k.t, k.t + 30, 0, 1, Easing.inOut(Easing.cubic));
              const n = cards.filter((o) => o.col === k.col && o.i < k.i).length;
              const tx = 30 + k.col * ((1064 - 60 - 52) / 3 + 26) + 30, ty = 90 + n * 108;
              return (
                <div key={k.i} style={{ position: "absolute", left: lerp(500, tx, t), top: lerp(-120, ty, t), width: 240, height: 88, background: cols[k.col].c, border: STROKE, borderRadius: 10, transform: `rotate(${(1 - t) * 14}deg)`, padding: 12, boxSizing: "border-box" }}>
                  <div style={{ height: 10, width: "70%", background: C.ink, borderRadius: 5, opacity: 0.8 }} />
                  <div style={{ height: 10, width: "45%", background: C.ink, borderRadius: 5, opacity: 0.4, marginTop: 12 }} />
                </div>
              );
            })}
          </CloudPC>
        </div>
      )}

      {f > tShatter && <Stamp at={cue("different") - 20} x={360} y={860} rot={-4} size={44}>NOT A CHATBOT</Stamp>}
    </Paper>
  );
};
