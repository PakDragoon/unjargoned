import React from "react";
import { Actor, box, mono, panel, progress, Stamp } from "./Editorial";
import { Prop, PropKind } from "./Props";

type Beat = {
  at: number;
  title: string;
  detail: string;
  tabs: string[];
  kind: PropKind;
};
// An index card slides onto the desk. Its illustration and notes change at spoken beats.
export const Exhibit = ({
  t,
  beats,
  stamp,
  number,
  stampAt,
  glasses = false,
}: {
  t: number;
  beats: Beat[];
  stamp: string;
  number: number;
  stampAt: number;
  glasses?: boolean;
}) => {
  const beat = beats.filter((b) => b.at <= t).at(-1) ?? beats[0];
  const slide = progress(t, beat.at);
  const impact = progress(t, stampAt, 0.25);
  return (
    <>
      <div
        style={{
          ...box(115, 334, 1665),
          ...panel,
          height: 495,
          transform: `translateY(${(1 - progress(t, 0)) * 130}px)`,
          borderLeft: "20px solid #141414",
        }}
      >
        <div style={{ ...box(45, 32), ...mono, fontSize: 26 }}>
          SPECIMEN / 0{number}
        </div>
        <div
          style={{
            ...box(35, 104, 520),
            textAlign: "center",
            transform: `rotate(${(1 - slide) * -10}deg)`,
          }}
        >
          <Prop
            kind={beat.kind}
            width={455}
            motion={progress(t, beat.at, 1.3)}
          />
        </div>
        <div
          style={{
            ...box(600, 52, 980),
            height: 375,
            borderLeft: "3px solid",
            paddingLeft: 65,
            boxSizing: "border-box",
            opacity: 0.35 + 0.65 * slide,
          }}
        >
          <div style={{ fontSize: 45, fontWeight: 700, letterSpacing: -1.4 }}>
            {beat.title}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.2,
              maxWidth: 810,
              marginTop: 25,
            }}
          >
            {beat.detail}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
            {beat.tabs.map((tab) => (
              <span
                key={tab}
                style={{
                  ...mono,
                  fontSize: 22,
                  padding: "8px 14px",
                  border: "2px solid",
                  background: "#EAE4D3",
                }}
              >
                {["VOICE", "IMAGE", "WEB"].includes(tab) && (
                  <svg
                    width="35"
                    height="24"
                    viewBox="0 0 35 24"
                    style={{ verticalAlign: "middle", marginRight: 8 }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    {tab === "VOICE" ? (
                      <path d="M3 10v4m5-8v12m6-16v20m6-17v14m6-12v10m5-7v4" />
                    ) : (
                      <>
                        <rect x="2" y="2" width="30" height="20" rx="2" />
                        <path
                          d={
                            tab === "IMAGE"
                              ? "m4 19 9-10 5 7 4-4 8 7"
                              : "M3 8h28"
                          }
                        />
                      </>
                    )}
                  </svg>
                )}
                {tab}
              </span>
            ))}
          </div>
          {impact > 0 && (
            <div
              style={{
                marginTop: 35,
                transformOrigin: "left center",
                transform: `scale(${1 + 0.3 * (1 - impact)})`,
              }}
            >
              <Stamp text={stamp} />
            </div>
          )}
        </div>
      </div>
      <Actor
        x={200 + progress(t, 0, 1.2) * 390 + slide * 80}
        y={900 - 65 * Math.sin(Math.PI * slide)}
        t={t}
        glasses={glasses && t >= stampAt}
      />
      {t >= stampAt - 0.6 && t < stampAt + 0.7 && (
        <div
          style={{
            ...box(
              759,
              565 + 115 * Math.sin(Math.PI * progress(t, stampAt - 0.6, 1.3)),
            ),
            transform: "rotate(-14deg)",
          }}
        >
          <Prop kind="rubber" width={175} />
        </div>
      )}
    </>
  );
};
