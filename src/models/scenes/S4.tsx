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
import { Label, Slip, Window } from "../Demo";
export const S4 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words),
    drop = cue("drops"),
    jump = cue("jumps"),
    handoff = cue("next"),
    draft = cue("draft");
  const transfer = progress(t, handoff, 1);
  return (
    <Stage title="One recording. Two jobs." label="BUCKET 03 / GEMINI → CLAUDE">
      <Window title="Gemini / meeting recording" t={t}>
        <Label>CLIENT DELIVERY / RECORDING</Label>
        <div
          style={{
            transform: `translateY(${-12 * (1 - progress(t, drop))}px)`,
          }}
        >
          <Stamp text="▶ MP4   42:18" />
        </div>
        <div style={{ height: 12, background: "#d5cfc1", margin: "28px 0" }}>
          <div
            style={{
              width: `${67 * progress(t, jump)}%`,
              height: "100%",
              background: "#FF4D2D",
            }}
          />
        </div>
        {t >= drop && <Slip>Where did we move the deadline?</Slip>}
        {t >= jump && (
          <Slip hot>
            <Label>28:14 / TRANSCRIPT</Label>“Let's push the client delivery
            from October 12 to October 19.”
          </Slip>
        )}
      </Window>
      <Window right title="Claude / client update" t={t} at={handoff}>
        <Label>EMAIL DRAFT · CLIENT DELIVERY</Label>
        {t >= draft && (
          <>
            <b>Updated delivery date</b>
            <p>Hi Alex,</p>We’ve moved delivery from <del>Oct 12</del> to{" "}
            <mark style={{ background: "#FF4D2D" }}>Oct 19</mark>. We’ll send
            the final assets on the new date.
          </>
        )}
      </Window>
      {t >= handoff && (
        <div style={box(385 + transfer * 885, 895)}>
          <Stamp size={25} text="28:14 · EXCERPT" />
        </div>
      )}
      <Actor
        x={360 + transfer * 850}
        y={975 - 40 * Math.sin(transfer * Math.PI)}
        t={t}
        r={47}
      />
      <Foley name="whoosh" at={0} />
      <Foley name="ding" at={jump} />
      <Foley name="whoosh" at={handoff} />
      <Foley name="chime" at={draft} />
    </Stage>
  );
};
