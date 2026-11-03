import React from "react";
import { colors, fontFamily } from "../../shared/brand";

// Ep 4's recurring props. One analogy for the whole episode: the agent built like a person.
// The paper-doll <Figure> is built once in S2 and reused in every scene; its dashed slots fill in order:
// brain-in-a-jar → hands → eyes → notebook in the pocket. Scene-only drawings stay in the scene file.
// No real logos or shop names anywhere.

export const PAPER = "#F3EBDD";
export const GLASS = "rgba(142,167,255,0.22)";
export const BRAIN = colors.yellow;
export const BRAIN_DARK = "#D9A21F";
export const HAND = colors.periwinkle;
export const HAND_DARK = "#6F86E0";
export const EGG = "#FBF3E4";
export const CARTON = "#C9B79A";
export const KRAFT = "#C99A62";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Pop scale for a part: 0 → hidden, 1 → in place (spring values over 1 overshoot a little). */
const popStyle = (p: number, origin = "50% 50%"): React.CSSProperties => ({
  transform: `scale(${Math.max(0, p)})`, transformOrigin: origin, transformBox: "fill-box", opacity: clamp01(p * 3),
});

/* ───────────── Brain in a jar ───────────── */

/** Soft yellow brain (cloud of lobes + grooves). Drawn in a 200×150 box at (x, y). */
export const BrainShape: React.FC<{ x: number; y: number; w?: number; wrong?: number }> = ({ x, y, w = 200, wrong = 0 }) => {
  const s = w / 200;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[[60, 70, 52], [105, 52, 56], [150, 72, 48], [80, 105, 44], [130, 108, 44]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={BRAIN} />
      ))}
      <path d="M 100 20 C 92 50, 112 70, 100 100 C 92 118, 104 130, 100 140" fill="none" stroke={BRAIN_DARK} strokeWidth={7} strokeLinecap="round" />
      <path d="M 40 60 C 58 52, 66 74, 80 66 M 128 46 C 140 60, 160 52, 168 66 M 54 104 C 66 96, 72 112, 84 104 M 122 100 C 132 112, 146 102, 156 110" fill="none" stroke={BRAIN_DARK} strokeWidth={6} strokeLinecap="round" />
      {/* the guess slot: a little window that spins through guesses (coral when it lands wrong) */}
      <rect x={56} y={112} width={88} height={40} rx={11} fill={colors.ink} stroke={wrong > 0.5 ? colors.coral : BRAIN_DARK} strokeWidth={5} />
    </g>
  );
};

/**
 * The hero jar: glass body, lid, the yellow brain inside with its guess slot.
 * `guess` = text in the slot (e.g. a spinning word); `wrong` turns the slot coral.
 * `say` > 0 pops a small speech bubble from the lid (chatbot = talks, nothing else moves).
 */
export const Jar: React.FC<{ size?: number; guess?: string; wrong?: number; glow?: number }> = ({ size = 260, guess = "", wrong = 0, glow = 0 }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 260 300" aria-hidden style={{ overflow: "visible" }}>
    {glow > 0 ? <ellipse cx={130} cy={175} rx={150} ry={150} fill={colors.yellow} opacity={0.12 * glow} /> : null}
    <rect x={20} y={56} width={220} height={236} rx={56} fill={GLASS} stroke={colors.subtext} strokeWidth={7} />
    <rect x={40} y={78} width={18} height={150} rx={9} fill={colors.white} opacity={0.18} />
    <BrainShape x={30} y={110} wrong={wrong} />
    <text x={130} y={254} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={26} fill={wrong > 0.5 ? colors.coral : colors.yellow}>
      {guess}
    </text>
    <rect x={30} y={22} width={200} height={42} rx={14} fill={colors.lineStrong} stroke={colors.subtext} strokeWidth={6} />
    {[60, 95, 130, 165, 200].map((lx) => (
      <line key={lx} x1={lx} y1={28} x2={lx} y2={58} stroke={colors.subtext} strokeWidth={4} opacity={0.5} />
    ))}
  </svg>
);

/* ───────────── Body parts ───────────── */

/** A drawn mitten hand (no fingers detail beyond a thumb); periwinkle = the agent's hands. */
export const HandShape: React.FC<{ cx: number; cy: number; r?: number; flip?: boolean; press?: number }> = ({ cx, cy, r = 44, flip = false, press = 0 }) => (
  <g transform={`translate(${cx} ${cy}) scale(${(flip ? -1 : 1) * (r / 44)} ${(r / 44) * (1 - 0.12 * press)})`}>
    <path d="M -30 -6 C -34 -40, 26 -46, 30 -10 L 32 26 C 32 44, -28 46, -30 26 Z" fill={HAND} stroke={HAND_DARK} strokeWidth={6} />
    <path d="M 30 -2 C 50 -6, 54 14, 34 20" fill={HAND} stroke={HAND_DARK} strokeWidth={6} strokeLinecap="round" />
    <path d="M -12 -32 V -14 M 4 -34 V -14 M 18 -28 V -12" stroke={HAND_DARK} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** One goggle-eye (a lens on a strap, not a human eye); `look` −1…1 moves the pupil. */
export const EyeShape: React.FC<{ cx: number; cy: number; r?: number; look?: { x: number; y: number } }> = ({ cx, cy, r = 30, look = { x: 0, y: 0 } }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={colors.white} stroke={colors.lineStrong} strokeWidth={7} />
    <circle cx={cx + look.x * r * 0.38} cy={cy + look.y * r * 0.38} r={r * 0.42} fill={colors.ink} />
    <circle cx={cx + look.x * r * 0.38 - r * 0.14} cy={cy + look.y * r * 0.38 - r * 0.14} r={r * 0.12} fill={colors.white} />
  </g>
);

/** The notebook (pocket-sized when closed; `open` 0→1 swings the cover). */
export type NoteLine = { icon: "mushroom" | "dog" | "line"; crossed?: boolean; glow?: number; gone?: number; o?: number };
export const Notebook: React.FC<{ w?: number; open?: number; lines?: NoteLine[] }> = ({ w = 300, open = 0, lines = [] }) => {
  const h = w * 1.3;
  const pageO = clamp01((open - 0.4) * 3);
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {/* page */}
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.06, backgroundColor: PAPER, boxShadow: "0 20px 44px rgba(0,0,0,0.35)", padding: `${w * 0.16}px ${w * 0.12}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: w * 0.07, opacity: pageO }}>
        {lines.map((l, i) => (
          <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: w * 0.05, height: w * 0.17, opacity: (l.o ?? 1) * (1 - (l.gone ?? 0)), transform: `translateX(${(l.gone ?? 0) * 60}px)` }}>
            {(l.glow ?? 0) > 0 ? <div style={{ position: "absolute", inset: -8, borderRadius: 14, backgroundColor: colors.yellow, opacity: 0.35 * (l.glow ?? 0) }} /> : null}
            {l.icon !== "line" ? <NoteIcon kind={l.icon} size={w * 0.17} crossed={l.crossed} /> : null}
            <div style={{ position: "relative", flex: 1, height: w * 0.035, borderRadius: 8, backgroundColor: "rgba(20,22,28,0.28)" }} />
          </div>
        ))}
        {lines.length === 0 ? [80, 64, 74].map((pw, i) => <div key={i} style={{ height: w * 0.035, width: `${pw}%`, borderRadius: 8, backgroundColor: "rgba(20,22,28,0.2)" }} />) : null}
      </div>
      {/* cover: swings open around the left edge */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: "left center", transform: `perspective(1200px) rotateY(${-160 * open}deg)`, opacity: open > 0.55 ? 0 : 1 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.06, backgroundColor: colors.periwinkle }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: w * 0.1, borderRadius: `${w * 0.06}px 0 0 ${w * 0.06}px`, backgroundColor: HAND_DARK }} />
        <div style={{ position: "absolute", right: w * 0.12, top: 0, bottom: 0, width: w * 0.07, backgroundColor: colors.yellow, opacity: 0.9 }} />
        <div style={{ position: "absolute", left: w * 0.24, right: w * 0.3, top: w * 0.22, height: w * 0.05, borderRadius: 9, backgroundColor: "rgba(20,22,28,0.25)" }} />
      </div>
    </div>
  );
};

/** Tiny drawn icons used in notebook lines (with an optional coral cross). */
export const NoteIcon: React.FC<{ kind: "mushroom" | "dog"; size?: number; crossed?: boolean }> = ({ kind, size = 50, crossed = false }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden style={{ flex: "none", overflow: "visible" }}>
    {kind === "mushroom" ? (
      <>
        <path d="M 6 32 C 6 8, 54 8, 54 32 Z" fill="#E0533B" />
        <circle cx={20} cy={22} r={4} fill={PAPER} /><circle cx={36} cy={17} r={4} fill={PAPER} /><circle cx={44} cy={27} r={3} fill={PAPER} />
        <rect x={22} y={32} width={16} height={20} rx={6} fill="#E9DFCC" stroke="#B9AE98" strokeWidth={3} />
      </>
    ) : (
      <>
        <ellipse cx={30} cy={36} rx={20} ry={13} fill="#A67C52" />
        <circle cx={46} cy={22} r={11} fill="#A67C52" />
        <ellipse cx={50} cy={13} rx={4} ry={8} fill="#7A5638" transform="rotate(20 50 13)" />
        <circle cx={49} cy={21} r={2} fill={colors.ink} />
        <rect x={14} y={44} width={6} height={12} rx={3} fill="#A67C52" /><rect x={36} y={44} width={6} height={12} rx={3} fill="#A67C52" />
        <path d="M 10 32 C 2 26, 4 18, 8 16" stroke="#A67C52" strokeWidth={5} fill="none" strokeLinecap="round" />
      </>
    )}
    {crossed ? <path d="M 4 4 L 56 56 M 56 4 L 4 56" stroke={colors.coral} strokeWidth={8} strokeLinecap="round" /> : null}
  </svg>
);

/* ───────────── The paper-doll figure ───────────── */

export type FigureState = {
  /** 0→1 draws the soft outline on (pathLength). */
  draw?: number;
  /** Slot fill pops (0 = empty dashed slot, 1 = part in place); fill order: brain, hands, eyes, notebook. */
  brain?: number;
  hands?: number;
  eyes?: number;
  notebook?: number;
  /** Dashed slots fade in with the outline; 0 hides them. */
  slots?: number;
  look?: { x: number; y: number };
  /** Hands lifted off the arms (S3: they plug into the helper box instead). */
  handsAway?: boolean;
  guess?: string;
  wrong?: number;
  glow?: number;
};

const OUTLINE =
  // soft paper-doll body: shoulders, arms down to the hand slots, torso, two legs (no face, no neck detail)
  "M 230 318 C 180 318, 150 330, 136 372 L 104 520 M 370 318 C 420 318, 450 330, 464 372 L 496 520 " +
  "M 230 318 L 370 318 C 404 320, 420 350, 418 392 L 410 630 C 408 650, 392 660, 372 660 L 228 660 C 208 660, 192 650, 190 630 L 182 392 C 180 350, 196 320, 230 318 Z " +
  "M 236 660 L 236 840 C 236 862, 278 862, 278 840 L 280 680 M 320 680 L 322 840 C 322 862, 364 862, 364 840 L 364 660";

/** The agent, built like a person. 600×900 design box; `size` = rendered height in px. */
export const Figure: React.FC<{ size?: number } & FigureState> = ({
  size = 640, draw = 1, brain = 1, hands = 0, eyes = 0, notebook = 0, slots = 1, look = { x: 0, y: 0 }, handsAway = false, guess = "", wrong = 0, glow = 0,
}) => {
  const slot = (o: number): React.SVGProps<SVGElement> => ({
    fill: "none", stroke: colors.subtext, strokeWidth: 5, strokeDasharray: "14 12", opacity: slots * (1 - clamp01(o)) * 0.9,
  } as React.SVGProps<SVGElement>);
  return (
    <svg width={(size * 600) / 900} height={size} viewBox="0 0 600 900" aria-hidden style={{ overflow: "visible" }}>
      {/* soft outline + panel fill */}
      <path d={OUTLINE} fill={colors.panel} fillOpacity={0.55 * draw} stroke={colors.subtext} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {/* slots (dashed) */}
      <rect x={168} y={36} width={264} height={290} rx={60} {...(slot(brain) as object)} />
      <circle cx={100} cy={566} r={52} {...(slot(handsAway ? 0 : hands) as object)} />
      <circle cx={500} cy={566} r={52} {...(slot(handsAway ? 0 : hands) as object)} />
      <circle cx={252} cy={88} r={34} {...(slot(eyes) as object)} />
      <circle cx={348} cy={88} r={34} {...(slot(eyes) as object)} />
      <rect x={316} y={410} width={78} height={86} rx={12} {...(slot(notebook) as object)} />
      {/* pocket (always drawn once the body is) */}
      <path d="M 312 430 L 398 430 L 394 500 C 393 510, 386 516, 376 516 L 334 516 C 324 516, 317 510, 316 500 Z" fill={colors.lineStrong} opacity={draw} />
      {/* brain-in-a-jar = the head */}
      <g style={popStyle(brain, "50% 100%")}>
        <foreignObject x={170} y={30} width={260} height={300} style={{ overflow: "visible" }}>
          <Jar size={260} guess={guess} wrong={wrong} glow={glow} />
        </foreignObject>
      </g>
      {/* notebook pokes out of the pocket */}
      <g style={popStyle(notebook, "50% 100%")}>
        <rect x={326} y={396} width={58} height={74} rx={8} fill={colors.periwinkle} />
        <rect x={326} y={396} width={10} height={74} rx={4} fill={HAND_DARK} />
        <rect x={366} y={396} width={8} height={74} fill={colors.yellow} />
      </g>
      <path d="M 312 430 L 398 430 L 396 452 L 314 452 Z" fill={colors.lineStrong} opacity={draw * clamp01(notebook)} />
      {/* goggle-eyes strapped on the jar lid band */}
      <g style={popStyle(eyes)}>
        <rect x={210} y={82} width={180} height={12} rx={6} fill={colors.lineStrong} />
        <EyeShape cx={252} cy={88} look={look} />
        <EyeShape cx={348} cy={88} look={look} />
      </g>
      {/* hands */}
      {!handsAway ? (
        <>
          <g style={popStyle(hands)}><HandShape cx={100} cy={566} /></g>
          <g style={popStyle(hands)}><HandShape cx={500} cy={566} flip /></g>
        </>
      ) : null}
    </svg>
  );
};

/* ───────────── Tools, helper, gate ───────────── */

export type ToolKind = "globe" | "envelope" | "calendar" | "basket";
/** Drawn tool icons (no app logos). 100×100 box. */
export const ToolIcon: React.FC<{ kind: ToolKind; size?: number; color?: string }> = ({ kind, size = 100, color = colors.white }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
    {kind === "globe" ? (
      <g fill="none" stroke={color} strokeWidth={7}>
        <circle cx={50} cy={50} r={38} /><ellipse cx={50} cy={50} rx={16} ry={38} /><path d="M 14 38 H 86 M 14 62 H 86" />
      </g>
    ) : kind === "envelope" ? (
      <g strokeLinejoin="round">
        <rect x={12} y={24} width={76} height={54} rx={8} fill={color} />
        <path d="M 14 28 L 50 56 L 86 28" fill="none" stroke={colors.ink} strokeWidth={6} />
      </g>
    ) : kind === "calendar" ? (
      <g>
        <rect x={16} y={20} width={68} height={64} rx={10} fill={color} />
        <rect x={16} y={20} width={68} height={18} rx={8} fill={colors.coral} />
        <rect x={30} y={12} width={8} height={16} rx={4} fill={colors.lineStrong} /><rect x={62} y={12} width={8} height={16} rx={4} fill={colors.lineStrong} />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={26 + c * 18} y={46 + r * 12} width={10} height={7} rx={2} fill={r === 1 && c === 1 ? colors.yellow : colors.lineStrong} />))}
      </g>
    ) : (
      <g fill="none" stroke={color} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
        <path d="M 14 40 H 86 L 78 82 H 22 Z" fill={color} fillOpacity={0.15} />
        <path d="M 30 40 L 44 16 M 70 40 L 56 16" />
        <path d="M 38 52 V 70 M 50 52 V 70 M 62 52 V 70" />
      </g>
    )}
  </svg>
);

/** The tool belt: a strap with four tools; `shown` = per-tool pop values (globe, envelope, calendar, basket). */
export const ToolBelt: React.FC<{ w?: number; shown?: number[]; strap?: number }> = ({ w = 640, shown = [1, 1, 1, 1], strap = 1 }) => {
  const kinds: ToolKind[] = ["globe", "envelope", "calendar", "basket"];
  return (
    <div style={{ position: "relative", width: w, height: w * 0.3 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: w * 0.11, height: w * 0.08, borderRadius: 999, backgroundColor: "#8A6A3E", transformOrigin: "left center", transform: `scaleX(${strap})` }} />
      <div style={{ position: "absolute", left: w * 0.46, top: w * 0.095, width: w * 0.08, height: w * 0.11, borderRadius: 10, border: `6px solid ${colors.yellow}`, boxSizing: "border-box", opacity: strap }} />
      {kinds.map((k, i) => {
        const p = shown[i] ?? 0;
        const left = w * (0.04 + i * 0.25) + (i >= 2 ? w * 0.04 : 0);
        return (
          <div key={k} style={{ position: "absolute", left, top: 0, width: w * 0.2, height: w * 0.27, borderRadius: 24, backgroundColor: colors.panel, border: `4px solid ${colors.line}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.max(0, p)})`, opacity: clamp01(p * 3) }}>
            <ToolIcon kind={k} size={w * 0.14} />
          </div>
        );
      })}
    </div>
  );
};

/** The helper app: a friendly box with a letter slot on top and a little status light (no face). */
export const HelperBox: React.FC<{ w?: number; slotGlow?: number; light?: number; children?: React.ReactNode }> = ({ w = 300, slotGlow = 0, light = 0, children }) => (
  <div style={{ position: "relative", width: w, height: w * 0.78 }}>
    <div style={{ position: "absolute", inset: 0, top: w * 0.08, borderRadius: w * 0.12, backgroundColor: "#2E3444", border: `6px solid ${colors.lineStrong}`, boxSizing: "border-box", boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }} />
    {/* letter slot */}
    <div style={{ position: "absolute", left: w * 0.24, right: w * 0.24, top: w * 0.02, height: w * 0.1, borderRadius: 999, backgroundColor: colors.ink, border: `5px solid ${slotGlow > 0 ? colors.yellow : colors.subtext}`, boxShadow: slotGlow > 0 ? `0 0 ${30 * slotGlow}px ${colors.yellow}` : "none" }} />
    {/* status light + two ports where the hands plug in */}
    <div style={{ position: "absolute", left: w * 0.12, top: w * 0.24, width: w * 0.08, height: w * 0.08, borderRadius: "50%", backgroundColor: light > 0.5 ? colors.mint : colors.lineStrong, boxShadow: light > 0.5 ? `0 0 18px ${colors.mint}` : "none" }} />
    {[0.3, 0.62].map((px) => (
      <div key={px} style={{ position: "absolute", left: w * px, bottom: w * 0.1, width: w * 0.16, height: w * 0.1, borderRadius: 10, backgroundColor: colors.ink, border: `4px solid ${colors.lineStrong}` }} />
    ))}
    <div style={{ position: "absolute", left: w * 0.3, right: w * 0.12, top: w * 0.25, height: w * 0.05, borderRadius: 9, backgroundColor: colors.lineStrong }} />
    {children}
  </div>
);

/** The yellow "Allow?" card with Yes / No. `empty` = dashed outline only (the step that was skipped). `yes` presses Yes (mint). */
export const AllowCard: React.FC<{ w?: number; empty?: number; yes?: number; showButtons?: boolean }> = ({ w = 340, empty = 0, yes = 0, showButtons = true }) => {
  const solid = 1 - clamp01(empty);
  return (
    <div style={{ position: "relative", width: w, height: w * 0.62, fontFamily }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.08, border: `${Math.max(4, w * 0.014)}px dashed ${colors.yellow}`, opacity: 1 - solid }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.08, backgroundColor: colors.yellow, opacity: solid, boxShadow: "0 18px 40px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: w * 0.05 }}>
        <div style={{ fontSize: w * 0.2, fontWeight: 800, color: colors.ink, lineHeight: 1 }}>Allow?</div>
        {showButtons ? (
          <div style={{ display: "flex", gap: w * 0.06 }}>
            <div style={{ padding: `${w * 0.025}px ${w * 0.07}px`, borderRadius: 999, fontSize: w * 0.09, fontWeight: 800, backgroundColor: yes > 0.5 ? colors.mint : colors.ink, color: yes > 0.5 ? colors.ink : colors.white, transform: `scale(${1 - 0.1 * Math.sin(clamp01(yes) * Math.PI)})` }}>Yes</div>
            <div style={{ padding: `${w * 0.025}px ${w * 0.07}px`, borderRadius: 999, fontSize: w * 0.09, fontWeight: 800, backgroundColor: "rgba(20,22,28,0.18)", color: colors.ink }}>No</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ───────────── Eggs, receipt, bag, shop ───────────── */

/** Half-dozen egg carton, lid open behind. */
export const EggCarton: React.FC<{ w?: number; eggs?: number }> = ({ w = 300, eggs = 6 }) => (
  <svg width={w} height={w * 0.66} viewBox="0 0 300 200" aria-hidden style={{ overflow: "visible" }}>
    <path d="M 18 40 L 282 40 L 266 0 L 34 0 Z" fill="#B5A283" />
    {Array.from({ length: 6 }, (_, i) => {
      const cx = 52 + (i % 3) * 98;
      const cy = i < 3 ? 70 : 108;
      return i < eggs ? <ellipse key={i} cx={cx} cy={cy} rx={34} ry={40} fill={EGG} stroke="#E2D6BF" strokeWidth={4} /> : null;
    })}
    <path d="M 10 104 L 290 104 L 272 190 C 270 196, 266 198, 260 198 L 40 198 C 34 198, 30 196, 28 190 Z" fill={CARTON} />
    {[100, 200].map((x) => <path key={x} d={`M ${x} 110 V 196`} stroke="#AE9C7E" strokeWidth={5} />)}
    {[56, 150, 244].map((x) => <path key={x} d={`M ${x - 30} 112 C ${x - 20} 132, ${x + 20} 132, ${x + 30} 112`} stroke="#AE9C7E" strokeWidth={5} fill="none" />)}
  </svg>
);

/** The receipt; the total line is yellow. `total` is shown as given (screen uses "$31.43"). */
export const Receipt: React.FC<{ w?: number; total?: string; rows?: number }> = ({ w = 320, total = "$31.43", rows = 4 }) => (
  <div style={{ position: "relative", width: w, padding: `${w * 0.1}px ${w * 0.1}px ${w * 0.14}px`, boxSizing: "border-box", backgroundColor: PAPER, color: colors.ink, fontFamily, boxShadow: "0 22px 44px rgba(0,0,0,0.35)", clipPath: "polygon(0 0, 100% 0, 100% 96%, 92% 100%, 84% 96%, 76% 100%, 68% 96%, 60% 100%, 52% 96%, 44% 100%, 36% 96%, 28% 100%, 20% 96%, 12% 100%, 4% 96%, 0 100%)" }}>
    <div style={{ height: w * 0.05, width: "46%", margin: "0 auto", borderRadius: 8, backgroundColor: "rgba(20,22,28,0.35)" }} />
    <div style={{ display: "flex", flexDirection: "column", gap: w * 0.045, marginTop: w * 0.09 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ height: w * 0.035, width: `${[58, 44, 50, 36][i % 4]}%`, borderRadius: 6, backgroundColor: "rgba(20,22,28,0.22)" }} />
          <div style={{ height: w * 0.035, width: "18%", borderRadius: 6, backgroundColor: "rgba(20,22,28,0.22)" }} />
        </div>
      ))}
    </div>
    <div style={{ borderTop: `${Math.max(3, w * 0.012)}px dashed rgba(20,22,28,0.4)`, marginTop: w * 0.07, paddingTop: w * 0.05, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={{ fontSize: w * 0.085, fontWeight: 800, letterSpacing: 2 }}>TOTAL</div>
      <div style={{ fontSize: w * 0.15, fontWeight: 800, padding: `0 ${w * 0.03}px`, borderRadius: 10, backgroundColor: colors.yellow }}>{total}</div>
    </div>
  </div>
);

/** A plain kraft delivery bag (no logo), groceries peeking out. */
export const DeliveryBag: React.FC<{ w?: number }> = ({ w = 260 }) => (
  <svg width={w} height={w * 1.15} viewBox="0 0 260 300" aria-hidden style={{ overflow: "visible" }}>
    <ellipse cx={92} cy={70} rx={36} ry={42} fill={EGG} />
    <rect x={128} y={20} width={44} height={90} rx={12} fill={colors.mint} opacity={0.85} />
    <path d="M 20 80 L 240 80 L 228 290 C 227 296, 222 300, 216 300 L 44 300 C 38 300, 33 296, 32 290 Z" fill={KRAFT} />
    <path d="M 20 80 L 240 80 L 238 104 L 22 104 Z" fill="#B7864F" />
    <path d="M 84 80 C 84 30, 176 30, 176 80" fill="none" stroke="#B7864F" strokeWidth={12} strokeLinecap="round" />
    <path d="M 60 140 L 200 140" stroke="#B7864F" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
  </svg>
);

/** A price tag (drawn); `crossed` adds a coral strike for "not even the cheapest". */
export const PriceTag: React.FC<{ price: string; w?: number; yellow?: boolean; crossed?: number }> = ({ price, w = 170, yellow = false, crossed = 0 }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: w * 0.08, padding: `${w * 0.07}px ${w * 0.12}px ${w * 0.07}px ${w * 0.08}px`, borderRadius: `${w * 0.06}px ${w * 0.14}px ${w * 0.14}px ${w * 0.06}px`, backgroundColor: yellow ? colors.yellow : colors.white, color: colors.ink, fontFamily, fontWeight: 800, fontSize: w * 0.24 }}>
    <div style={{ width: w * 0.09, height: w * 0.09, borderRadius: "50%", backgroundColor: colors.ink, opacity: 0.6 }} />
    {price}
    {crossed > 0 ? <div style={{ position: "absolute", left: -6, top: "48%", height: w * 0.06, width: `calc(${crossed * 100}% + 12px)`, borderRadius: 8, backgroundColor: colors.coral, transform: "rotate(-8deg)" }} /> : null}
  </div>
);

/**
 * A generic drawn shop page in a browser frame (no real shop or logo).
 * `query` types into the search bar; `cart` = badge count; `tiles` = product cards (children placed by the scene).
 */
export const ShopPage: React.FC<{ w?: number; query?: string; cart?: number; cartPop?: number; children?: React.ReactNode }> = ({ w = 900, query = "", cart = 0, cartPop = 0, children }) => (
  <div style={{ position: "relative", width: w, height: w * 0.62, borderRadius: w * 0.025, backgroundColor: "#F7F4EE", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", fontFamily, color: colors.ink }}>
    {/* browser bar */}
    <div style={{ height: w * 0.055, backgroundColor: colors.lineStrong, display: "flex", alignItems: "center", gap: w * 0.01, padding: `0 ${w * 0.02}px` }}>
      {[colors.coral, colors.yellow, colors.mint].map((c) => <div key={c} style={{ width: w * 0.014, height: w * 0.014, borderRadius: "50%", backgroundColor: c }} />)}
      <div style={{ flex: 1, height: w * 0.026, marginLeft: w * 0.02, borderRadius: 999, backgroundColor: colors.panel }} />
    </div>
    {/* shop header: drawn basket mark (generic), search bar, cart */}
    <div style={{ display: "flex", alignItems: "center", gap: w * 0.025, padding: `${w * 0.022}px ${w * 0.03}px` }}>
      <div style={{ width: w * 0.06, height: w * 0.06, borderRadius: w * 0.015, backgroundColor: colors.mint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ToolIcon kind="basket" size={w * 0.045} color={colors.ink} />
      </div>
      <div style={{ flex: 1, height: w * 0.06, borderRadius: 999, border: `${Math.max(3, w * 0.004)}px solid #D8D2C6`, backgroundColor: colors.white, display: "flex", alignItems: "center", gap: w * 0.012, padding: `0 ${w * 0.02}px`, fontSize: w * 0.03, fontWeight: 600 }}>
        <svg width={w * 0.028} height={w * 0.028} viewBox="0 0 40 40" aria-hidden><circle cx={17} cy={17} r={11} fill="none" stroke="#9A9385" strokeWidth={5} /><line x1={25} y1={25} x2={35} y2={35} stroke="#9A9385" strokeWidth={5} strokeLinecap="round" /></svg>
        {query}
      </div>
      <div style={{ position: "relative", width: w * 0.06, height: w * 0.06, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={w * 0.05} height={w * 0.05} viewBox="0 0 50 50" aria-hidden><path d="M 4 8 H 12 L 18 34 H 40 L 46 16 H 15" fill="none" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" /><circle cx={20} cy={42} r={4} fill={colors.ink} /><circle cx={38} cy={42} r={4} fill={colors.ink} /></svg>
        {cart > 0 ? (
          <div style={{ position: "absolute", right: -w * 0.01, top: -w * 0.006, minWidth: w * 0.03, height: w * 0.03, borderRadius: 999, backgroundColor: colors.yellow, fontSize: w * 0.022, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: `0 ${w * 0.006}px`, transform: `scale(${0.8 + 0.4 * Math.sin(clamp01(cartPop) * Math.PI) + 0.2 * clamp01(cartPop)})` }}>{cart}</div>
        ) : null}
      </div>
    </div>
    <div style={{ position: "absolute", left: w * 0.03, right: w * 0.03, top: w * 0.16, bottom: w * 0.03 }}>{children}</div>
  </div>
);

/** A product card for the shop page. */
export const ProductTile: React.FC<{ w?: number; children?: React.ReactNode; picked?: number }> = ({ w = 240, children, picked = 0 }) => (
  <div style={{ width: w, height: w * 1.12, borderRadius: w * 0.07, backgroundColor: colors.white, border: `${Math.max(3, w * 0.015)}px solid ${picked > 0.5 ? colors.yellow : "#E4DED2"}`, boxShadow: picked > 0.5 ? `0 0 0 ${w * 0.02}px rgba(255,201,60,0.35)` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", padding: w * 0.06, boxSizing: "border-box" }}>
    {children}
  </div>
);

/* ───────────── Small shared objects (S1, S3b, S5, S6, S7) ───────────── */

/** Magnifying glass = "find". Yellow rim; `children` shows through the lens (pre-scaled by the caller). */
export const Magnifier: React.FC<{ size?: number; children?: React.ReactNode }> = ({ size = 220, children }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <div style={{ position: "absolute", left: size * 0.08, top: size * 0.08, width: size * 0.56, height: size * 0.56, borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(255,201,60,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </div>
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }} aria-hidden>
      <circle cx={72} cy={72} r={58} fill="none" stroke={colors.yellow} strokeWidth={14} />
      <line x1={116} y1={116} x2={182} y2={182} stroke={colors.yellow} strokeWidth={24} strokeLinecap="round" />
    </svg>
  </div>
);

/** A mouse-pointer arrow (drawn), white with dark outline; `press` squashes it a touch. */
export const Cursor: React.FC<{ size?: number; press?: number }> = ({ size = 70, press = 0 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 40 52" aria-hidden style={{ transform: `scale(${1 - 0.15 * press})`, transformOrigin: "0 0", overflow: "visible" }}>
    <path d="M 2 2 L 2 42 L 12 32 L 20 50 L 28 46 L 20 29 L 34 29 Z" fill={colors.white} stroke={colors.ink} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

/** A gold coin (money). */
export const Coin: React.FC<{ size?: number }> = ({ size = 110 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
    <circle cx={50} cy={50} r={44} fill="#F2B632" stroke="#C98A00" strokeWidth={8} />
    <circle cx={50} cy={50} r={30} fill="none" stroke="#C98A00" strokeWidth={5} opacity={0.6} />
    <text x={50} y={66} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={44} fill="#9A6A00">$</text>
  </svg>
);

/** A big rounded "Buy" button; `press` 0→1 pushes it in. */
export const BuyButton: React.FC<{ w?: number; press?: number; label?: string }> = ({ w = 300, press = 0, label = "Buy" }) => (
  <div style={{ width: w, height: w * 0.36, borderRadius: w * 0.18, backgroundColor: colors.mint, boxShadow: `0 ${w * 0.04 * (1 - press)}px 0 #2FA37E`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 800, fontSize: w * 0.17, color: colors.ink, marginTop: w * 0.035 * press }}>
    {label}
  </div>
);
