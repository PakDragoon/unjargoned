import React from "react";
import {
  Actor,
  Foley,
  progress,
  SceneProps,
  Stage,
  Stamp,
  useBeat,
} from "../Editorial";
import { Label, Slip, Wave, Window } from "../Demo";
import { Prop } from "../Props";
export const S2 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words),
    note = cue("hey"),
    email = cue("cleans");
  const transcript = words.filter(([,start]) => start >= note && start <= cue("slides") && start <= t).map(([word]) => word).join(" ");
  return (
    <Stage title="A voice note becomes an email" label="BUCKET 01 / CHATGPT">
      <Window title="ChatGPT" t={t}>
        <Label>{t < note ? "POCKET TOOLKIT" : "DOT’S VOICE NOTE"}</Label>
        {t < note ? (
          <>
            <Prop kind="knife" width={390} />
            <div
              style={{
                opacity: t >= cue("all-rounder") ? 1 : 0,
                transformOrigin: "left",
                transform: `scale(${1 + 0.35 * (1 - progress(t, cue("all-rounder"), 0.22))})`,
              }}
            >
              <Stamp text="ALL-ROUNDER" />
            </div>
          </>
        ) : (
          <>
            <Wave t={t} />
            <Slip>{transcript}</Slip>
          </>
        )}
      </Window>
      <Window right title="Email draft" t={t}>
        {t < email ? (
          <>
            <Label>OUTBOX / NEW MESSAGE</Label>
            <Slip>To: Sarah</Slip>
            <div style={{ color: "#706b60" }}>
              Waiting for Dot’s voice note…
            </div>
          </>
        ) : (
          <div
            style={{
              transform: `translateX(${60 * (1 - progress(t, email))}px)`,
            }}
          >
            <Label>TO / SARAH</Label>
            <b>Subject: Moving Thursday’s Sync to Friday at 2 PM</b>
            <hr />
            <p>Hi Sarah,</p>Could we move Thursday’s sync to Friday at 2:00 PM
            so I can wrap up the slides first? Let me know if that works.
          </div>
        )}
      </Window>
      <Actor x={470 + progress(t, email, 1) * 690} y={920} t={t} />
      <Foley at={0} name="whoosh" />
      <Foley at={cue("all-rounder")} name="stamp" />
      <Foley at={email} name="ding" />
    </Stage>
  );
};
