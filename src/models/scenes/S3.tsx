import React from "react";
import {
  Actor,
  box,
  Foley,
  progress,
  SceneProps,
  Stage,
  Stamp,
  useBeat,
} from "../Editorial";
import { Window, Label, Slip } from "../Demo";
export const S3 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words),
    edited = cue("hey"),
    code = cue("second"),
    trace = cue("config");
  return (
    <Stage title="Keep the voice. Trace the bug." label="BUCKET 02 / CLAUDE">
      <Window title="Claude / manuscript" t={t}>
        <Label>{t < edited ? "ORIGINAL DRAFT" : "REVISED LINE"}</Label>
        <Slip hot={t >= edited}>
          {t < edited
            ? "Per our previous correspondence, failure to submit assets by Friday will delay launch."
            : "Hey Alex — quick heads-up that we still need the final assets by Friday so we don’t push back launch."}
        </Slip>
        {t >= cue("tell") && (
          <>
            <Label>INSTRUCTION</Label>“Make this sound like me, but keep the
            deadline firm.”
          </>
        )}
      </Window>
      <Window right title="Claude / checkout" t={t}>
        <Label>CHECKOUT PREVIEW</Label>
        <Stamp text="BUY · $49" />
        <span style={{ marginLeft: 28 }}>Expected $29</span>
        {t >= code && <Slip>CheckoutButton.tsx</Slip>}
        {t >= cue("project") && (
          <div
            style={{
              borderLeft: "5px dotted #FF4D2D",
              marginLeft: 30,
              height: 45 * progress(t, cue("project")),
            }}
          />
        )}
        {t >= trace && (
          <Slip hot>
            <Label>config.js</Label>
            <code>OLD_PROMO_PRICE = 49</code>
          </Slip>
        )}
      </Window>
      <Actor
        x={540 + progress(t, code, 1) * 640}
        y={951}
        t={t}
        glasses={t >= cue("claude")}
      />
      <div style={{ ...box(100, 926), opacity: t >= cue("claude") ? 1 : 0 }}>
        <Stamp size={24} text="WRITING & CODE" />
      </div>
      <Foley at={0} name="whoosh" />
      <Foley at={cue("claude")} name="stamp" />
      <Foley at={edited} name="click" />
      <Foley at={trace} name="snap" />
    </Stage>
  );
};
