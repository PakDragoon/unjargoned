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
import { Label, Slip, Window } from "../Demo";
import { Prop } from "../Props";
export const S5 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words),
    think = cue("assigned"),
    clash = cue("maya"),
    local = cue("deepseek"),
    off = cue("off"),
    done = cue("sensitive");
  return (
    <Stage title="Two different switches" label="BUCKET 04 / THINKING & LOCAL">
      <Window title="Thinking mode / schedule" t={t}>
        <Label>CAN EVERYONE WORK THEIR ASSIGNED SHIFT?</Label>
        {t >= think && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr 1fr",
                rowGap: 18,
                padding: 18,
                background: "#EAE4D3",
              }}
            >
              {[
                "Person",
                "Shift",
                "Starts",
                "Maya",
                "Front Desk",
                "3:00 PM",
                "Maya",
                "Inventory",
                "3:00 PM",
              ].map((v, i) => (
                <span
                  key={i}
                  style={{
                    fontWeight: i < 3 ? 700 : 500,
                    borderRadius: 28,
                    outline:
                      v === "3:00 PM" && t >= clash
                        ? "4px solid #FF4D2D"
                        : undefined,
                    textAlign: "center",
                    fontSize: 29,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <Prop
                kind="scratchpad"
                width={190}
                step={t >= clash ? 3 : t >= cue("checks") ? 2 : 0}
              />
              {t >= clash && <Stamp size={23} text="DOUBLE BOOKED" />}
            </div>
          </>
        )}
      </Window>
      <Window right title="Local model / laptop" t={t}>
        <Label>CAN I SUMMARIZE THIS PRIVATE FILE OFFLINE?</Label>
        {t < local ? (
          <Prop kind="laptop" width={455} />
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 25,
            }}
          >
            <b>DeepSeek / Llama · downloaded</b>
            <Stamp size={22} text={t >= off ? "WI-FI OFF" : "WI-FI ON"} />
          </div>
        )}
        {t >= off && <Slip>Private_Contract.pdf</Slip>}
        {t >= done && (
          <Slip hot>
            <Label>LOCAL SUMMARY</Label>• Delivery due October 19
            <br />• Final assets due Friday
            <div style={{ color: "#20724d", marginTop: 14, fontSize: 23 }}>
              <svg
                width="25"
                height="29"
                viewBox="0 0 25 29"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M6 14V8a6.5 6.5 0 0113 0v6" />
                <rect x="3" y="13" width="19" height="14" rx="3" />
              </svg>{" "}
              Processed on this laptop
            </div>
          </Slip>
        )}
      </Window>
      <Actor x={505 + progress(t, local, 1.2) * 860} y={944} t={t} />
      <Foley at={0} name="whoosh" />
      <Foley at={cue("checks")} name="tick" />
      <Foley at={clash} name="ding" />
      <Foley at={off} name="vault" />
      <Foley at={done} name="chime" />
    </Stage>
  );
};
