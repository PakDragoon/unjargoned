import React from "react";
import { useCurrentFrame, Easing } from "remotion";
import { C, F, STROKE, SHADOW, Paper, TheDot, Tag, Stamp, useCues, useSpring, ramp, lerp, popStyle, route } from "../kit";

const K = "long_scene4" as const;
// corkboard (world coords)
const BX = 760, BY = 150, BW = 1020, BH = 600;
// shredder sits below the board, revealed by a camera tilt
const SX = 1020, SY = 1080;

const NOTES = [
  { txt: "Keep emails under 4 sentences", x: 60, y: 70, r: -4 },
  { txt: "Never schedule before 10 AM", x: 380, y: 60, r: 3 },
  { txt: "“Good” = short + friendly", x: 700, y: 90, r: -2 },
  { txt: "Calls only Tue / Thu", x: 120, y: 330, r: 2 },
];

const Note: React.FC<{ txt: string; bad?: boolean; style?: React.CSSProperties }> = ({ txt, bad, style }) => (
  <div style={{ position: "absolute", width: 250, height: 200, background: C.ochre, border: bad ? `5px solid ${C.red}` : STROKE, boxShadow: `5px 5px 0 ${C.ink}`, padding: "30px 18px 16px", boxSizing: "border-box", fontSize: 30, fontWeight: 700, lineHeight: 1.15, ...style }}>
    <div style={{ position: "absolute", left: "50%", top: 8, width: 22, height: 22, borderRadius: 11, background: bad ? C.ink : C.red, border: STROKE, transform: "translateX(-50%)" }} />
    {bad && <div style={{ fontFamily: F.mono, fontSize: 18, color: C.red, marginBottom: 4 }}>BAD HABIT:</div>}
    {txt}
  </div>
);

export const S4: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues(K);
  const tMem = cue("persistent");
  const tNotes = [cue("correct"), cue("schedule"), cue("good"), cue("you", 2)];
  const tBad = cue("Here's");
  const tDelete = cue("delete");
  const tLocked = cue("memory", 2);
  const tTilt = cue("eraser") - 20;
  const tShred = cue("resetting");

  // camera: pan right into the board at start, tilt down to reveal the shredder later
  const pan = ramp(f, 0, 70, 0, 1, Easing.inOut(Easing.cubic));
  const tilt = ramp(f, tTilt, tTilt + 45, 0, 1, Easing.inOut(Easing.cubic));
  const camX = lerp(700, 0, pan), camY = lerp(0, -400, tilt);

  const memTag = useSpring(tMem);
  const bad = useSpring(tBad + 20);
  // eraser: rises at "delete", scrubs, bounces off
  const er = ramp(f, tDelete - 30, tDelete, 0, 1, Easing.out(Easing.cubic));
  const scrub = f > tDelete && f < tLocked ? Math.sin((f - tDelete) / 3) * 26 : 0;
  const bounce = ramp(f, tLocked - 4, tLocked + 26, 0, 1, Easing.out(Easing.quad));
  const eraserGone = ramp(f, tLocked + 40, tLocked + 60);
  const badX = BX + 640, badY = BY + 330;
  const eX = lerp(badX + 500, badX + 40, er) + scrub + bounce * 260;
  const eY = lerp(badY + 200, badY + 40, er) - Math.sin(Math.PI * bounce) * 160 + bounce * 60;

  const shred = (i: number) => ramp(f, tShred + i * 6, tShred + 40 + i * 6, 0, 1, Easing.in(Easing.quad));
  const shredderOn = f > tShred && f < tShred + 140;
  const dot = route(f, [[0, 520, 820], [tNotes[0] - 10, 560, 820], [tTilt + 30, 840, 1250]], 24, 120);

  return (
    <Paper>
      <div style={{ position: "absolute", left: 80, top: 56, zIndex: 5, ...popStyle(memTag, 20) }}>
        <Tag bg={C.ochre} color={C.ink} size={30}>PERSISTENT MEMORY</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 2000, transform: `translate(${camX}px, ${camY}px)` }}>
        {/* slate wall of the cloud PC behind the board */}
        <div style={{ position: "absolute", left: 660, top: 40, width: 1240, height: 1600, background: C.slate, border: STROKE, borderRadius: 24 }}>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, textAlign: "center", fontFamily: F.mono, fontWeight: 600, fontSize: 20, color: C.sand, letterSpacing: 2 }}>CLOUD PC // ALWAYS-ON SESSION · MEMORY</div>
        </div>

        {/* corkboard */}
        <div style={{ position: "absolute", left: BX, top: BY, width: BW, height: BH, background: "#C9A27A", border: `14px solid ${C.sand}`, outline: STROKE, boxShadow: SHADOW, borderRadius: 6,
          backgroundImage: "radial-gradient(rgba(20,20,20,0.18) 1.5px, transparent 1.6px)", backgroundSize: "14px 14px" }} />

        {/* good notes: user bubble -> note -> slaps onto the board */}
        {NOTES.map((n, i) => {
          const t = tNotes[i];
          if (f < t - 40) return null;
          const bub = ramp(f, t - 40, t - 26, 0, 1, Easing.out(Easing.back(2)));
          const fly = ramp(f, t - 4, t + 16, 0, 1, Easing.in(Easing.quad));
          const slap = f > t + 16 && f < t + 26 ? 0.06 : 0;
          const fromX = 110, fromY = 300 + (i % 2) * 40;
          const x = lerp(fromX, BX + n.x, fly), y = lerp(fromY, BY + n.y, fly);
          const s = shred(i);
          const drop = { x: lerp(x, SX + 100, s), y: lerp(y, SY + 20, s) };
          if (s >= 1) return null;
          return fly <= 0 ? (
            <div key={i} style={{ position: "absolute", left: fromX, top: fromY, transform: `scale(${bub})`, transformOrigin: "0 100%" }}>
              <div style={{ background: C.white, border: STROKE, borderRadius: 22, padding: "16px 24px", fontSize: 30, fontWeight: 700, boxShadow: SHADOW, maxWidth: 520 }}>{n.txt}</div>
              <div style={{ fontFamily: F.mono, fontSize: 18, marginTop: 8 }}>YOU ▸ correction</div>
            </div>
          ) : (
            <Note key={i} txt={n.txt} style={{ left: drop.x, top: drop.y, transform: `rotate(${n.r + s * 20}deg) scale(${lerp(0.7, 1, fly) + slap - s * 0.3})` }} />
          );
        })}

        {/* bad habit note */}
        {f > tBad + 20 && shred(4) < 1 && (
          <Note bad txt="CC's everyone" style={{ left: lerp(badX, SX + 100, shred(4)), top: lerp(lerp(badY - 400, badY, bad), SY + 20, shred(4)), transform: `rotate(${4 + Math.sin(f / 4) * (f > tDelete && f < tLocked ? 1.5 : 0)}deg)` }} />
        )}
        {f > tLocked && f < tShred && <Stamp at={tLocked} x={badX + 125} y={badY + 230} rot={-8} size={40} color={C.red}>LOCKED</Stamp>}

        {/* eraser */}
        {f > tDelete - 30 && eraserGone < 1 && (
          <div style={{ position: "absolute", left: eX, top: eY, transform: `rotate(${-20 + bounce * 120}deg)`, opacity: 1 - eraserGone }}>
            <div style={{ width: 200, height: 90, display: "flex", border: STROKE, borderRadius: 14, overflow: "hidden", boxShadow: `6px 6px 0 ${C.ink}` }}>
              <div style={{ flex: 2, background: "#F4A6B4" }} />
              <div style={{ flex: 1, background: "#7BA7D9", borderLeft: STROKE }} />
            </div>
          </div>
        )}

        {/* shredder */}
        <div style={{ position: "absolute", left: SX, top: SY, width: 460, height: 300 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 460, height: 90, background: C.red, border: STROKE, borderRadius: "16px 16px 4px 4px", boxShadow: SHADOW, transform: `translateY(${shredderOn ? Math.sin(f) * 2 : 0}px)` }}>
            <div style={{ position: "absolute", left: 60, right: 60, top: 26, height: 14, background: C.ink, borderRadius: 7 }} />
            <div style={{ position: "absolute", right: 18, top: 54, width: 16, height: 16, borderRadius: 8, background: shredderOn ? C.green : "#7a2a1c", border: STROKE }} />
          </div>
          <div style={{ position: "absolute", left: 20, top: 88, width: 420, height: 210, background: "#E04428", border: STROKE, borderTop: "none", borderRadius: "0 0 14px 14px", display: "grid", placeItems: "center" }}>
            <Tag bg={C.paper} color={C.ink} size={28}>FULL RESET ONLY</Tag>
          </div>
          {/* strips falling out */}
          {shredderOn && Array.from({ length: 8 }, (_, k) => {
            const ph = ((f - tShred + k * 9) % 50) / 50;
            return <div key={k} style={{ position: "absolute", left: 90 + k * 36, top: 300 + ph * 120, width: 12, height: 50, background: k % 3 === 2 ? C.red : C.ochre, border: `2px solid ${C.ink}`, opacity: 1 - ph, transform: `rotate(${(k % 2 ? 1 : -1) * ph * 20}deg)` }} />;
          })}
        </div>

        {/* dot keeps watch (on the slate wall) */}
        <TheDot x={dot.x} y={dot.y} r={48} squash={dot.squash} look={f > tTilt ? 1 : 1} mood={f > tBad && f < tShred ? "worried" : "happy"} />
      </div>

      {f > tShred + 90 && <Stamp at={tShred + 90} x={540} y={420} rot={-5} size={46} color={C.ink}>BOARD WIPED</Stamp>}
    </Paper>
  );
};
