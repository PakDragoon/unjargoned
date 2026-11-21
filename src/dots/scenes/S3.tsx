import React from "react";
import { useCurrentFrame, Easing } from "remotion";
import { C, F, STROKE, SHADOW, Paper, TheDot, CloudPC, Icon, Tag, Stamp, useCues, useSpring, ramp, lerp, popStyle, route } from "../kit";

const K = "long_scene3" as const;
// Inside the zoomed Cloud PC screen (screen area ≈ 1724 x 834 at page offset 98,152)
const TRACK_Y = [210, 420, 630];
const START_X = 660, END_X = 1330;

const Planner: React.FC<{ f: number; s: number }> = ({ f, s }) => (
  <div style={{ position: "absolute", left: 40, top: 120, ...popStyle(s, 60) }}>
    <svg width={260} height={280} style={{ overflow: "visible" }}>
      <path d="M 130 10 L 240 60 L 240 170 Q 240 240 130 270 Q 20 240 20 170 L 20 60 Z" fill={C.ochre} stroke={C.ink} strokeWidth={4} />
      <path d="M 130 36 L 214 74 L 214 166 Q 214 222 130 246 Q 46 222 46 166 L 46 74 Z" fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="8 6" />
      {/* eyes */}
      {[-1, 1].map((k) => <ellipse key={k} cx={130 + k * 34} cy={128} rx={10} ry={f % 140 > 134 ? 2 : 14} fill={C.ink} />)}
      <path d="M 104 172 Q 130 190 156 172" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    </svg>
    <div style={{ marginTop: 14, marginLeft: -20 }}>
      <Tag bg={C.ochre} color={C.ink} size={22}>GPT-6 ASTRA // PLANNER</Tag>
    </div>
  </div>
);

const Hourglass: React.FC<{ p: number }> = ({ p }) => (
  <svg width={110} height={160} style={{ overflow: "visible" }}>
    <rect x={5} y={0} width={100} height={14} rx={4} fill={C.sand} stroke={C.ink} strokeWidth={3} />
    <rect x={5} y={146} width={100} height={14} rx={4} fill={C.sand} stroke={C.ink} strokeWidth={3} />
    <path d="M 18 14 L 92 14 L 60 80 L 92 146 L 18 146 L 50 80 Z" fill="rgba(255,255,255,0.85)" stroke={C.ink} strokeWidth={3} />
    {/* top sand shrinks, bottom grows */}
    <path d={`M ${55 - 34 * (1 - p)} ${80 - 58 * (1 - p)} L ${55 + 34 * (1 - p)} ${80 - 58 * (1 - p)} L 55 80 Z`} fill={C.ochre} />
    <path d={`M 22 144 L 88 144 L ${55 + 30 * p} ${144 - 50 * p} L ${55 - 30 * p} ${144 - 50 * p} Z`} fill={C.ochre} />
    {p < 1 && <line x1={55} y1={80} x2={55} y2={144} stroke={C.ochre} strokeWidth={3} strokeDasharray="4 4" strokeDashoffset={-p * 200} />}
  </svg>
);

export const S3: React.FC = () => {
  const f = useCurrentFrame();
  const cue = useCues(K);
  const tZoom = cue("Under");
  const tGoal = cue("goal");
  const tPlanner = cue("planner");
  const tCheck = cue("checklist");
  const tDelegate = cue("delegates");
  const tRun = [cue("websites"), cue("files"), cue("notes")];
  const tBudget = cue("time", 2);
  const tStuck = cue("stuck");
  const tAsk = cue("ask");

  const zoom = ramp(f, tZoom - 20, tZoom + 30, 0, 1, Easing.inOut(Easing.cubic));
  const plannerIn = useSpring(tZoom + 20);
  const goalIn = useSpring(tGoal - 6);
  const steps = ["1. Search Airlines", "2. Check Calendar", "3. Write Brief"];
  const timeBudgetP = ramp(f, tBudget, tAsk - 30, 0, 1, Easing.linear);
  const errorIn = useSpring(tStuck - 20);
  const bell = useSpring(tAsk - 10);
  const ding = f > tAsk + 8 ? Math.sin((f - tAsk) / 2.5) * 10 * Math.exp(-(f - tAsk) / 30) : 0;

  return (
    <Paper>
      {/* question card before zoom */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: 1 - zoom }}>
        <div style={{ display: "inline-block", fontSize: 76, fontWeight: 700, background: C.paper, border: STROKE, boxShadow: SHADOW, borderRadius: 18, padding: "20px 44px", transform: "rotate(-1.5deg)" }}>
          How does it get things <span style={{ background: C.ochre, padding: "0 10px" }}>done</span>?
        </div>
      </div>
      {f < tZoom + 20 && (
        <div style={{ opacity: 1 - zoom }}>
          <TheDot x={960 + Math.sin(f / 9) * 30} y={560 + Math.abs(Math.sin(f / 9)) * -40} r={64} look={Math.sin(f / 9)} mood="worried" />
          {/* confusion squiggles */}
          <svg width={300} height={140} style={{ position: "absolute", left: 960 - 150, top: 380 }}>
            {[0, 1, 2].map((i) => <text key={i} x={60 + i * 80} y={80 + Math.sin(f / 8 + i) * 12} fontSize={64} fontWeight={700} fill={C.red} fontFamily={F.head}>?</text>)}
          </svg>
        </div>
      )}

      {/* zoomed cloud pc */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${lerp(0.35, 1, zoom)})`, transformOrigin: "960px 640px", opacity: Math.min(1, zoom * 3) }}>
        <CloudPC x={80} y={60} w={1760} h={940}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Planner f={f} s={plannerIn} />

            {/* goal card dropping into the planner */}
            {f > tGoal - 6 && (
              <div style={{ position: "absolute", left: 330, top: lerp(-140, 40, goalIn), width: 520, background: C.paper, border: STROKE, borderRadius: 10, boxShadow: `6px 6px 0 ${C.ink}`, padding: "14px 18px", transform: `rotate(${lerp(-8, -2, goalIn)}deg)` }}>
                <div style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 600, opacity: 0.7 }}>GOAL</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>“Find cheapest nonstop flights & draft summary”</div>
              </div>
            )}

            {/* clipboard with 3 steps */}
            <div style={{ position: "absolute", left: 330, top: 170, width: 300, height: 560, background: C.sand, border: STROKE, borderRadius: 14, boxShadow: `6px 6px 0 ${C.ink}`, ...popStyle(plannerIn, 40) }}>
              <div style={{ width: 130, height: 34, margin: "-18px auto 0", background: "#B9B2A0", border: STROKE, borderRadius: 8 }} />
              <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 18, textAlign: "center", marginTop: 10 }}>CHECKLIST</div>
            </div>
            {steps.map((st, i) => {
              const at = tCheck + i * 12;
              if (f < at) return null;
              const s = ramp(f, at, at + 14, 0, 1, Easing.out(Easing.back(2)));
              // card rides with its worker once delegated
              const go = ramp(f, tRun[i] - 10, tRun[i] + 40, 0, 1, Easing.inOut(Easing.cubic));
              const home = { x: 350, y: 240 + i * 160 };
              const tgt = { x: lerp(START_X, END_X, go) - 104 - 90 * go, y: TRACK_Y[i] - 90 };
              const grabbed = f > tDelegate + 20 + i * 10;
              const g = ramp(f, tDelegate + 10 + i * 10, tDelegate + 30 + i * 10);
              const x = grabbed ? lerp(lerp(home.x, START_X - 104, g), tgt.x, go) : home.x;
              const y = grabbed ? lerp(lerp(home.y, TRACK_Y[i] - 90, g), tgt.y, go) : home.y;
              const backHome = i === 0 && f > tAsk - 40;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: 260, padding: "16px 14px", background: C.ochre, border: STROKE, borderRadius: 8, fontSize: 26, fontWeight: 700, transform: `scale(${s * (grabbed ? 0.8 : 1)})`, transformOrigin: "0 0", opacity: backHome ? 0 : 1 }}>
                  {st}
                </div>
              );
            })}

            {/* tracks */}
            {TRACK_Y.map((y, i) => (
              <div key={i} style={{ position: "absolute", left: START_X - 20, top: y + 30, width: END_X - START_X + 60, height: 10, borderRadius: 5, background: "#3A3D46", opacity: ramp(f, tDelegate - 20, tDelegate) }} />
            ))}

            {/* destinations */}
            {[
              { i: 0, el: (
                <div style={{ width: 330, height: 180, background: C.white, border: STROKE, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: 30, background: C.sand, borderBottom: STROKE, fontFamily: F.mono, fontSize: 14, padding: "4px 10px" }}>airline-search.example</div>
                  {f < tStuck - 20
                    ? [0, 1, 2].map((k) => <div key={k} style={{ margin: "10px 12px", height: 26, border: STROKE, borderRadius: 6, background: k === 0 ? C.ochre : C.paper }} />)
                    : <div style={{ display: "grid", placeItems: "center", height: 148, background: `repeating-linear-gradient(45deg, ${C.paper} 0 14px, ${C.sand} 14px 28px)`, ...popStyle(errorIn, 0) }}>
                        <Tag bg={C.red} color={C.white} size={20}>WEBSITE LOADING ERROR</Tag>
                      </div>}
                </div>) },
              { i: 1, el: (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <Icon kind="folder" size={130} />
                  <div style={{ transform: `translateY(${Math.sin(f / 6) * 4}px)` }}><Icon kind="file" size={110} /></div>
                </div>) },
              { i: 2, el: (
                <div style={{ width: 300, height: 170, background: C.ochre, border: STROKE, borderRadius: 8, padding: 14, boxSizing: "border-box", fontFamily: F.mono, fontSize: 18, lineHeight: 1.5 }}>
                  {"PRIVATE NOTES\n- nonstop: 2 options\n- Tue 9:40 fits cal".slice(0, Math.max(0, Math.floor((f - tRun[2] - 50) / 2)))}
                </div>) },
            ].map(({ i, el }) => (
              <div key={i} style={{ position: "absolute", left: END_X + 40, top: TRACK_Y[i] - 120, opacity: ramp(f, tRun[i] - 20, tRun[i]), whiteSpace: "pre-wrap" }}>{el}</div>
            ))}

            {/* worker subagents */}
            {[0, 1, 2].map((i) => {
              const at = tDelegate + i * 10;
              if (f < at - 10) return null;
              const pop = ramp(f, at - 10, at + 4, 0, 1, Easing.out(Easing.back(2)));
              let stops: [number, number, number][] = [[0, START_X, TRACK_Y[i] + 10]];
              const zipT = tRun[i] - 10;
              const go = ramp(f, zipT, zipT + 50, 0, 1, Easing.inOut(Easing.cubic));
              let x = lerp(START_X, END_X, go), y = TRACK_Y[i] + 10 - Math.abs(Math.sin(go * Math.PI * 6)) * 14;
              if (i === 0 && f > tAsk - 40) {
                // hop back to the help bell
                const r = route(f, [[0, END_X, TRACK_Y[0] + 10], [tAsk - 40, 910, 800]], 26, 160);
                x = r.x; y = r.y;
              }
              return (
                <div key={i} style={{ transform: `scale(${pop})`, transformOrigin: `${x}px ${y}px` }}>
                  {/* speed lines */}
                  {go > 0 && go < 1 && [0, 1, 2].map((k) => (
                    <div key={k} style={{ position: "absolute", left: x - 70 - k * 10, top: y - 10 + k * 10, width: 40, height: 4, background: C.paper, borderRadius: 2, opacity: 0.8 }} />
                  ))}
                  <TheDot x={x} y={y} r={16} look={1} mood={i === 0 && f > tStuck - 10 && f < tAsk ? "worried" : "focus"} />
                </div>
              );
            })}

            {/* time budget hourglass */}
            {f > tBudget - 20 && (
              <div style={{ position: "absolute", left: 1000, top: 20, ...popStyle(ramp(f, tBudget - 20, tBudget), 30) }}>
                <Hourglass p={timeBudgetP} />
                <div style={{ marginTop: 8, marginLeft: -40 }}><Tag bg={C.paper} color={C.ink} size={18}>TIME BUDGET: {Math.max(0, Math.ceil(60 * (1 - timeBudgetP)))}s</Tag></div>
              </div>
            )}

            {/* ask user bell */}
            {f > tAsk - 50 && (
              <div style={{ position: "absolute", left: 960, top: 700, ...popStyle(bell, 30) }}>
                <div style={{ transform: `rotate(${ding}deg)`, transformOrigin: "50% 90%" }}><Icon kind="bell" size={120} /></div>
                {f > tAsk + 6 && <svg width={200} height={80} style={{ position: "absolute", left: -40, top: -50 }}>
                  {[0, 1].map((k) => <path key={k} d={`M ${30 - k * 14} ${60 - k * 10} Q ${20 - k * 14} 30 ${40 - k * 10} ${10 - k * 6}`} stroke={C.ochre} strokeWidth={5} fill="none" strokeLinecap="round" opacity={ramp(f, tAsk + 6, tAsk + 20)} />)}
                </svg>}
                <div style={{ position: "absolute", left: 140, top: 36 }}><Tag bg={C.ochre} color={C.ink} size={22}>ASK USER FOR HELP</Tag></div>
              </div>
            )}
          </div>
        </CloudPC>
        {f > tCheck && <Stamp at={tCheck} x={580} y={830} rot={-6} size={34} color={C.red}>PLANNED</Stamp>}
      </div>
    </Paper>
  );
};
