import React from "react";
import { useCurrentFrame, Easing } from "remotion";
import { C, F, STROKE, SHADOW, Paper, TheDot, Tag, Icon, Arm, Bust, useCues, useSpring, ramp, lerp, popStyle, route } from "../kit";

const K = "long_scene7" as const;

export const S7: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues(K);
  const tCompare = cue("For");
  const tPrompt = cue("prompt");
  const tStart = cue("Starting");
  const tDeleg = cue("delegation");
  const tKill = cue("kill");
  const tEnd = cue("If");
  const tBrain = cue("brain");
  const tSub = cue("subscribe");

  const intro = 1 - ramp(f, tCompare - 16, tCompare + 4);
  const leftIn = useSpring(tCompare);
  const rightIn = useSpring(tStart - 10);
  const shift = ramp(f, tEnd - 10, tEnd + 40, 0, 1, Easing.inOut(Easing.cubic));
  const arrow = ramp(f, tBrain - 20, tBrain + 30);
  const label = useSpring(tBrain - 30);
  const killHi = ramp(f, tKill - 20, tKill);
  const click = f > cue("switch") && f < cue("switch") + 8 ? 4 : 0;

  // frantic typing jitter
  const jit = (k: number) => (f > tCompare ? Math.sin(f * 1.7 + k) * 12 : 0);
  const prompts = ["make it better", "no, shorter!!", "try again", "be more specific??", "ugh. again"];
  const nPrompts = Math.max(0, Math.min(prompts.length, Math.floor((f - tPrompt + 30) / 45)));
  // coffee sip cycle
  const sip = f > tStart ? (Math.sin((f - tStart) / 40) > 0.4 ? 1 : 0) : 0;
  const sipS = ramp(Math.sin((f - tStart) / 40), 0.2, 0.6);
  const cards = ["Morning Brief", "Invoice Ready", "Price Drop Alert"];
  const dot = route(f, [[0, 1010, 1200], [tEnd + 20, 1010, 900], [tSub - 10, 1040, 900]], 24, 120);

  return (
    <Paper>
      {/* intro: biggest shift since the smartphone */}
      {intro > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: intro }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontSize: 92, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            {"The biggest shift".split(" ").map((w, i) => <span key={i} style={{ display: "inline-block", marginRight: 22, ...popStyle(ramp(f, 6 + i * 8, 20 + i * 8, 0, 1, Easing.out(Easing.back(2))), 30) }}>{w}</span>)}
            <br />
            <span style={{ display: "inline-block", ...popStyle(ramp(f, cue("smartphone") - 30, cue("smartphone"), 0, 1, Easing.out(Easing.back(2))), 30) }}>
              since the <span style={{ background: C.ochre, border: STROKE, borderRadius: 12, padding: "0 16px" }}>smartphone</span>
            </span>
          </div>
          <TheDot x={960} y={720 - Math.abs(Math.sin(f / 10)) * 50} r={56} look={0} />
        </div>
      )}

      {/* comparison (shifts left/smaller for the end screen) */}
      <div style={{ position: "absolute", inset: 0, transform: `translate(${-shift * 30}px, ${shift * 120}px) scale(${lerp(1, 0.56, shift)})`, transformOrigin: "60px 300px" }}>
        {/* LEFT: prompting */}
        {f > tCompare && (
          <div style={popStyle(leftIn, 50)}>
            <div style={{ position: "absolute", left: 80, top: 200, width: 820, height: 660, background: C.sand, border: STROKE, borderRadius: 20, boxShadow: SHADOW }} />
            <div style={{ position: "absolute", left: 110, top: 225 }}>
              <Tag bg={C.paper} color={C.ink} size={24}>2023–2025</Tag>
              <span style={{ marginLeft: 16, fontSize: 52, fontWeight: 700, verticalAlign: "middle" }}>PROMPTING</span>
            </div>
            {/* chat screen */}
            <div style={{ position: "absolute", left: 470, top: 330, width: 380, height: 330, background: C.white, border: STROKE, borderRadius: 12, padding: 14, boxSizing: "border-box", overflow: "hidden" }}>
              {prompts.slice(0, nPrompts).map((p, i) => (
                <div key={i} style={{ marginBottom: 10, marginLeft: "auto", width: "fit-content", background: C.ochre, border: STROKE, borderRadius: 12, padding: "6px 14px", fontSize: 24, fontWeight: 700 }}>{p}</div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 440, top: 740, width: 440, height: 30, background: "#BFC3CB", border: STROKE, borderRadius: 6 }} />
            <Bust x={300} y={630} shirt={C.paper} eyes="stress" tilt={Math.sin(f / 5) * 2} />
            {/* sweat drops */}
            {f > tPrompt && [0, 1].map((k) => {
              const ph = ((f + k * 30) % 60) / 60;
              return <div key={k} style={{ position: "absolute", left: 360 + k * 20, top: 560 + ph * 60, width: 16, height: 22, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#7BC0E0", border: `2px solid ${C.ink}`, opacity: 1 - ph }} />;
            })}
            <Arm sx={235} sy={725} wx={470 + jit(0)} wy={748} side={1} len={125} sleeve={C.paper} />
            <Arm sx={370} sy={725} wx={600 + jit(2)} wy={748} side={1} len={125} sleeve={C.paper} />
          </div>
        )}

        {/* RIGHT: delegation */}
        {f > tStart - 10 && (
          <div style={popStyle(rightIn, 50)}>
            <div style={{ position: "absolute", left: 1020, top: 200, width: 820, height: 660, background: C.paper, border: STROKE, borderRadius: 20, boxShadow: SHADOW }} />
            <div style={{ position: "absolute", left: 1050, top: 225 }}>
              <Tag bg={C.ochre} color={C.ink} size={24}>2026+</Tag>
              <span style={{ marginLeft: 16, fontSize: 52, fontWeight: 700, verticalAlign: "middle" }}>DELEGATION</span>
            </div>
            {cards.map((c, i) => {
              const at = tDeleg + i * 40;
              if (f < at) return null;
              const out = ramp(f, at, at + 30, 0, 1, Easing.out(Easing.cubic));
              return (
                <div key={c} style={{ position: "absolute", left: 1490, top: lerp(520, 570 + i * 86, out), width: 270, background: C.white, border: STROKE, borderRadius: 8, padding: "10px 14px", fontSize: 26, fontWeight: 700, boxShadow: `4px 4px 0 ${C.ink}`, clipPath: out < 1 ? `inset(${(1 - out) * 0}px 0 0 0)` : undefined }}>
                  <span style={{ color: C.green }}>✓</span> {c}
                </div>
              );
            })}
            {/* mini cloud pc with a print slot */}
            <div style={{ position: "absolute", left: 1450, top: 320, width: 350, height: 220, background: C.sand, border: STROKE, borderRadius: 14 }}>
              <div style={{ height: 34, borderBottom: STROKE, fontFamily: F.mono, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>CLOUD PC // ALWAYS-ON</div>
              <div style={{ position: "absolute", left: 12, right: 12, top: 46, bottom: 34, background: C.slate, borderRadius: 8, border: STROKE }}>
                <TheDot x={160} y={70} r={26} look={Math.sin(f / 30)} mood="focus" />
              </div>
              <div style={{ position: "absolute", left: 60, right: 60, bottom: 10, height: 10, background: C.ink, borderRadius: 5 }} />
            </div>
            {/* kill switch */}
            <div style={{ position: "absolute", left: 1300, top: 330, width: 120, textAlign: "center", opacity: ramp(f, tKill - 40, tKill - 20) }}>
              <div style={{ width: 110, height: 170, margin: "0 auto", background: C.sand, border: STROKE, borderRadius: 14, position: "relative", boxShadow: killHi > 0 ? `0 0 0 ${6 + 4 * Math.sin(f / 5)}px ${C.ochre}, 6px 6px 0 ${C.ink}` : `6px 6px 0 ${C.ink}` }}>
                <div style={{ position: "absolute", left: 30, top: 22, width: 50, height: 126, background: C.ink, borderRadius: 25 }} />
                <div style={{ position: "absolute", left: 24, top: 18 + click, width: 62, height: 62, background: C.red, border: STROKE, borderRadius: 31 }} />
              </div>
              <div style={{ marginTop: 10, fontFamily: F.mono, fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>KILL SWITCH<br />ON / OFF</div>
            </div>
            <Bust x={1150} y={630} shirt={C.green} eyes="calm" />
            <Arm sx={1065} sy={730} wx={1110} wy={812} side={1} len={70} sleeve={C.green} />
            {(() => {
              const wx = lerp(1280, 1205, sipS), wy = lerp(800, 690, sipS);
              return (
                <>
                  <Arm sx={1235} sy={730} wx={wx} wy={wy} side={1} len={80} sleeve={C.green} />
                  <div style={{ position: "absolute", left: wx - 30, top: wy - 70, transform: `rotate(${-sip * 10}deg)` }}><Icon kind="coffee" size={70} /></div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* end screen: clean slot on the right with an ink arrow */}
      {shift > 0 && (
        <>
          <div style={{ position: "absolute", left: 1180, top: 320, width: 640, height: 400, border: `3px dashed rgba(20,20,20,${0.25 * shift})`, borderRadius: 16 }} />
          <div style={{ position: "absolute", left: 1180, top: 230, ...popStyle(label, 30) }}>
            <Tag bg={C.ochre} color={C.ink} size={30}>HOW CHATGPT ACTUALLY THINKS →</Tag>
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
            <path d="M 820 960 C 900 1010 1080 980 1140 640" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow} />
            {arrow > 0.95 && <path d="M 1112 676 L 1142 630 L 1166 682" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          {f > tSub - 10 && (
            <div style={{ position: "absolute", left: 650, top: 960, ...popStyle(ramp(f, tSub - 10, tSub + 6, 0, 1, Easing.out(Easing.back(2))), 20) }}>
              <Tag bg={C.red} color={C.white} size={26}>SUBSCRIBE</Tag>
            </div>
          )}
          <TheDot x={dot.x} y={dot.y} r={40} squash={dot.squash} look={0.6} />
        </>
      )}
    </Paper>
  );
};
