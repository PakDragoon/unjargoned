import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fontFamily } from "../../shared/brand";
import { ChatBubble } from "../../shared/ChatWindow";
import { Dot, Mood } from "../../shared/Dot";
import { AllowCard, DeliveryBag, EggCarton, Figure, HelperBox, Jar, Notebook, PriceTag, ProductTile, Receipt, ShopPage, ToolBelt } from "./Props";

// G1 kit sheet: the figure as it fills (S2 → S4), every new Ep 4 prop, and the Dot moods the script's cues map to.
export const KIT = { width: 1920, height: 1800 };

const Label: React.FC<{ x: number; y: number; w?: number; children: React.ReactNode }> = ({ x, y, w = 300, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", fontSize: 26, fontWeight: 600, color: colors.subtext }}>{children}</div>
);
const At: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y }}>{children}</div>
);

// Every Dot cue in Tab 1 → one of the 13 existing moods (no new moods needed).
const CUES: [Mood, string][] = [
  ["panic", "S1 $31 · S3b pile-up"],
  ["surprised", "S1 find · S3 helper · S7 hidden words"],
  ["intrigued", "S1 the \"?\""],
  ["aha", "S2 hands · S4 notebook · S6"],
  ["curious", "S2 receipt · S3 belt · S7 page"],
  ["confused", "S4 blank chat"],
  ["deadpan", "S4 dog reply"],
  ["smug", "S3b tap · S4 It's reading"],
  ["worried", "S5 flashback · S6 cursor"],
  ["relieved", "S3 tick · S5 card back · S6"],
];

export const Kit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ink, fontFamily, color: colors.white }}>
    <div style={{ position: "absolute", left: 60, top: 36, fontSize: 48, fontWeight: 800 }}>
      Ep 4 kit · <span style={{ color: colors.yellow }}>the agent, built like a person</span>
    </div>

    {/* Figure: four fill stages */}
    {[
      { t: "S2 · brain in a jar", s: { brain: 1 } },
      { t: "S3 · + hands", s: { brain: 1, hands: 1 } },
      { t: "S3 · + eyes", s: { brain: 1, hands: 1, eyes: 1, look: { x: 0.6, y: 0.2 } } },
      { t: "S4 · + notebook", s: { brain: 1, hands: 1, eyes: 1, notebook: 1 } },
    ].map((st, i) => (
      <React.Fragment key={st.t}>
        <At x={70 + i * 330} y={130}><Figure size={460} {...st.s} /></At>
        <Label x={50 + i * 330} y={600} w={340}>{st.t}</Label>
      </React.Fragment>
    ))}

    {/* Jar hero (S2) + guess slot wrong (S6) */}
    <At x={1430} y={110}><Jar size={200} guess="eggs?" /></At>
    <At x={1660} y={110}><Jar size={200} guess="Buy" wrong={1} /></At>
    <Label x={1410} y={360} w={460}>jar + guess slot · wrong guess (S6)</Label>
    <At x={1450} y={400}><ChatBubble from="ai" fontSize={30}>Here are some egg shops…</ChatBubble></At>
    <Label x={1410} y={560} w={460}>speech from the lid (talks only)</Label>

    {/* Row 2: tool belt, helper box, allow card states */}
    <At x={60} y={680}><ToolBelt w={560} /></At>
    <Label x={60} y={860} w={560}>tool belt: internet · email · calendar · shop</Label>
    <At x={680} y={660}><HelperBox w={260} slotGlow={1} light={1} /></At>
    <Label x={650} y={880} w={320}>helper app (letter slot)</Label>
    <At x={1010} y={680}><AllowCard w={300} /></At>
    <At x={1340} y={680}><AllowCard w={300} yes={1} /></At>
    <At x={1670} y={690}><AllowCard w={200} empty={1} showButtons={false} /></At>
    <Label x={1010} y={880} w={860}>"Allow?" card · Yes pressed · empty (the skipped step)</Label>

    {/* Row 3: shop page, carton, receipt, bag, notebook */}
    <At x={60} y={950}>
      <ShopPage w={720} query="eggs" cart={1}>
        <div style={{ display: "flex", gap: 30, justifyContent: "center", paddingTop: 10 }}>
          <ProductTile w={190}><EggCarton w={150} /><PriceTag price="$13.19" w={120} /></ProductTile>
          <ProductTile w={190} picked={1}><EggCarton w={150} /><PriceTag price="$13.19" w={120} yellow /></ProductTile>
          <ProductTile w={190}><EggCarton w={150} /><PriceTag price="$5.99" w={120} crossed={1} /></ProductTile>
        </div>
      </ShopPage>
    </At>
    <Label x={60} y={1410} w={720}>generic shop page (no names, no logos)</Label>
    <At x={840} y={1000}><EggCarton w={260} /></At>
    <Label x={820} y={1200} w={300}>egg carton</Label>
    <At x={1150} y={960}><Receipt w={240} /></At>
    <Label x={1120} y={1300} w={300}>$31.43 receipt</Label>
    <At x={1430} y={980}><DeliveryBag w={190} /></At>
    <Label x={1380} y={1210} w={300}>delivery bag</Label>
    <At x={1630} y={960}><Notebook w={110} /></At>
    <At x={1760} y={960}>
      <Notebook w={130} open={1} lines={[{ icon: "mushroom", crossed: true, glow: 1 }, { icon: "dog", crossed: true }]} />
    </At>
    <Label x={1600} y={1260} w={300}>notebook · open</Label>
    <Label x={1560} y={1300} w={340}>(mushroom note glows; old dog note)</Label>

    {/* Row 4: Dot moods used in Ep 4 */}
    <div style={{ position: "absolute", left: 60, top: 1480, fontSize: 32, fontWeight: 800 }}>
      Dot · <span style={{ color: colors.yellow }}>10 of the 13 moods</span>
      <span style={{ color: colors.subtext, fontWeight: 600 }}> — every cue in the script maps to one; no new mood needed</span>
    </div>
    {CUES.map(([m, cue], i) => {
      const cx = 140 + i * 182;
      return (
        <React.Fragment key={m}>
          <Dot x={cx - 30} y={1610} size={56} mood={m} blinks={false} seed={m} tailLength={0.5} />
          <div style={{ position: "absolute", left: cx - 91, top: 1680, width: 182, textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{m}</div>
            <div style={{ fontSize: 18, color: colors.subtext, lineHeight: 1.25, padding: "0 6px" }}>{cue}</div>
          </div>
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);
