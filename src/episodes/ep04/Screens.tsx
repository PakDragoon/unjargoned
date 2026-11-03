import React from "react";
import { colors, fontFamily } from "../../shared/brand";
import { EggCarton } from "./Props";
import { INK, OUT, SHADOW } from "./Rig";

// Ep 4 revamp: screens on the stage are paper cut-out devices (dark bezel, light page) on a stand.
// The page inside is passed as children; the content views below are the shop states used in S1.

export const Kiosk: React.FC<{ w: number; stand?: boolean; children?: React.ReactNode }> = ({ w, stand = true, children }) => {
  const h = w * 0.66;
  return (
    <div style={{ position: "relative", width: w, height: h, fontFamily }}>
      {stand ? (
        <>
          <div style={{ position: "absolute", left: w / 2 - w * 0.03, top: h - 10, width: w * 0.06, height: w * 0.33, backgroundColor: "#3A3F4D", border: `${OUT}px solid ${INK}`, boxSizing: "border-box" }} />
          <div style={{ position: "absolute", left: w / 2 - w * 0.17, top: h + w * 0.31, width: w * 0.34, height: w * 0.05, borderRadius: 999, backgroundColor: "#3A3F4D", border: `${OUT}px solid ${INK}`, boxSizing: "border-box" }} />
        </>
      ) : null}
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.045, backgroundColor: "#2B3142", border: `${OUT}px solid ${INK}`, boxSizing: "border-box", padding: w * 0.03, filter: `drop-shadow(10px 12px 0 ${SHADOW})` }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.025, backgroundColor: "#F7F2E6", overflow: "hidden", color: colors.ink }}>{children}</div>
      </div>
    </div>
  );
};

/** Search bar + cart along the top of a page. */
export const TopBar: React.FC<{ w: number; query?: string; cart?: number }> = ({ w, query = "eggs", cart = 0 }) => (
  <div style={{ position: "absolute", left: w * 0.04, right: w * 0.04, top: w * 0.035, height: w * 0.06, display: "flex", alignItems: "center", gap: w * 0.02 }}>
    <div style={{ flex: 1, height: "100%", borderRadius: 999, border: `${w * 0.005}px solid #D8D0BE`, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", paddingLeft: w * 0.025, fontSize: w * 0.03, fontWeight: 600 }}>{query}</div>
    <div style={{ position: "relative" }}>
      <svg width={w * 0.06} height={w * 0.06} viewBox="0 0 50 50" aria-hidden><path d="M 4 8 H 12 L 18 34 H 40 L 46 16 H 15" fill="none" stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" /><circle cx={20} cy={42} r={4} fill={colors.ink} /><circle cx={38} cy={42} r={4} fill={colors.ink} /></svg>
      {cart > 0 ? <div style={{ position: "absolute", right: -w * 0.012, top: -w * 0.012, width: w * 0.032, height: w * 0.032, borderRadius: "50%", backgroundColor: colors.yellow, border: `3px solid ${INK}`, fontSize: w * 0.02, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cart}</div> : null}
    </div>
  </div>
);

/** The product page: carton + price on the right, the yellow Buy button on the left (within the agent's reach). */
export const ProductView: React.FC<{ w: number; press?: number; ripple?: number; cart?: number }> = ({ w, press = 0, ripple = 0, cart = 0 }) => (
  <>
    <TopBar w={w} cart={cart} />
    <div style={{ position: "absolute", right: w * 0.06, top: w * 0.15, width: w * 0.42, display: "flex", flexDirection: "column", alignItems: "center", gap: w * 0.02 }}>
      <EggCarton w={w * 0.36} />
      <div style={{ fontSize: w * 0.05, fontWeight: 800 }}>$13.19</div>
    </div>
    <div style={{ position: "absolute", left: w * 0.07, top: w * 0.36, width: w * 0.36, height: w * 0.13, borderRadius: w * 0.065, backgroundColor: colors.yellow, border: `${OUT}px solid ${INK}`, boxSizing: "border-box", boxShadow: `0 ${w * 0.014 * (1 - press)}px 0 ${INK}`, translate: `0 ${w * 0.012 * press}px`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: w * 0.065, fontWeight: 800 }}>
      Buy
    </div>
    <div style={{ position: "absolute", left: w * 0.2 - w * 0.06 - w * 0.08 * ripple, top: w * 0.425 - w * 0.06 - w * 0.08 * ripple, width: w * (0.12 + 0.16 * ripple), height: w * (0.12 + 0.16 * ripple), borderRadius: "50%", border: `${w * 0.008}px solid ${colors.white}`, opacity: ripple > 0 && ripple < 1 ? 0.9 * (1 - ripple) : 0 }} />
  </>
);

/** "Order placed" confirmation. `p` pops it in. */
export const PlacedView: React.FC<{ w: number; p: number }> = ({ w, p }) => (
  <>
    <TopBar w={w} cart={1} />
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: w * 0.03, paddingTop: w * 0.05 }}>
      <div style={{ width: w * 0.2, height: w * 0.2, borderRadius: "50%", backgroundColor: colors.mint, border: `${OUT}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", scale: `${Math.min(1.08, p)}` }}>
        <svg width={w * 0.12} height={w * 0.12} viewBox="0 0 84 84" aria-hidden><path d="M 12 44 L 34 66 L 74 18" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, p)} /></svg>
      </div>
      <div style={{ fontSize: w * 0.065, fontWeight: 800, opacity: Math.min(1, p * 1.5) }}>Order placed</div>
    </div>
  </>
);

/** Search results: the $13.19 eggs on the left (tapped), cheaper eggs on the right (skipped, crossed). */
export const ResultsView: React.FC<{ w: number; typed: string; tap: number; skip: number; tiles: number }> = ({ w, typed, tap, skip, tiles }) => {
  const tile = (picked: boolean, children: React.ReactNode): React.ReactNode => (
    <div style={{ width: w * 0.36, height: w * 0.38, borderRadius: w * 0.03, backgroundColor: "#FFFFFF", border: `${w * 0.006}px solid ${picked ? colors.yellow : "#E4DED2"}`, boxShadow: picked ? `0 0 0 ${w * 0.008}px rgba(255,201,60,0.4)` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: w * 0.015, scale: `${Math.min(1, tiles)}` }}>{children}</div>
  );
  return (
    <>
      <TopBar w={w} query={typed} />
      <div style={{ position: "absolute", left: w * 0.06, right: w * 0.06, top: w * 0.14, display: "flex", justifyContent: "space-between" }}>
        {tile(tap > 0.5, <><EggCarton w={w * 0.24} /><div style={{ fontSize: w * 0.045, fontWeight: 800 }}>$13.19</div></>)}
        {tile(false, (
          <>
            <EggCarton w={w * 0.24} />
            <div style={{ position: "relative", padding: `0 ${w * 0.02}px`, borderRadius: 999, backgroundColor: "rgba(94,230,184,0.3)", fontSize: w * 0.04, fontWeight: 800 }}>
              cheaper
              <div style={{ position: "absolute", left: -6, top: "46%", height: w * 0.01, width: `calc(${skip * 100}% + 12px)`, borderRadius: 8, backgroundColor: colors.coral, rotate: "-8deg" }} />
            </div>
          </>
        ))}
      </div>
    </>
  );
};

/** A chatbot's screen: it only talks (a reply streaming in; no hands, no buttons). */
export const ChatView: React.FC<{ w: number; shown: number; text: string }> = ({ w, shown, text }) => {
  const words = text.split(" ");
  const n = Math.ceil(shown * words.length);
  return (
    <div style={{ position: "absolute", inset: 0, padding: w * 0.07, display: "flex", flexDirection: "column", gap: w * 0.04 }}>
      <div style={{ alignSelf: "flex-end", padding: `${w * 0.025}px ${w * 0.05}px`, borderRadius: w * 0.05, backgroundColor: "#E3DCCB", fontSize: w * 0.06, fontWeight: 700 }}>Cheap eggs?</div>
      <div style={{ alignSelf: "flex-start", maxWidth: "88%", padding: `${w * 0.025}px ${w * 0.05}px`, borderRadius: w * 0.05, backgroundColor: "#2B3142", color: colors.white, fontSize: w * 0.06, fontWeight: 600, lineHeight: 1.25, opacity: shown > 0 ? 1 : 0 }}>
        {words.map((wd, i) => <span key={i} style={{ opacity: i < n ? 1 : 0 }}>{wd} </span>)}
      </div>
    </div>
  );
};
