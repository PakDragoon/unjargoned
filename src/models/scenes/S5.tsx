import React from "react";
import {
  Actor,
  box,
  Foley,
  panel,
  SceneProps,
  Stage,
  Stamp,
  useBeat,
} from "../Editorial";
import { Prop } from "../Props";
export const S5 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  const checks = ["testing", "catching", "verifying"].map(cue),
    local = cue("offline");
  const cards = [
    {
      title: "Take time to reason",
      label: t >= cue("answer") ? "ANSWER CHECKED" : "THINKING MODE",
      kind: "scratchpad" as const,
    },
    {
      title: "Keep it on your device",
      label: "OPEN WEIGHTS",
      kind: "cabinet" as const,
    },
  ];
  return (
    <Stage
      title="Two ways to work differently"
      label="BUCKET 04 / UNDER THE HOOD"
    >
      {cards.map((card, i) => (
        <div
          key={card.kind}
          style={{
            ...box(100 + 880 * i, 340, 805),
            ...panel,
            height: 530,
            padding: "30px 42px",
            background: i && t < cue("second") ? "#EAE4D3" : "#fffdf6",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700 }}>{card.title}</div>
          <div style={box(100, 110)}>
            <Prop
              kind={card.kind}
              width={390}
              step={
                i ? (t >= local ? 3 : 0) : checks.filter((a) => t >= a).length
              }
            />
          </div>
          {!i && (
            <svg
              style={box(487, 175)}
              width="102"
              height="112"
              viewBox="0 0 100 112"
              stroke="#141414"
              strokeWidth="5"
              fill="#F7F4EB"
            >
              <path d="M39 9h22m-11 1v12" />
              <circle cx="50" cy="65" r="40" />
              <path
                d="M50 65V35"
                transform={`rotate(${Math.min(t, cue("answer")) * 20} 50 65)`}
              />
              <circle cx="50" cy="65" r="4" fill="#FF4D2D" />
            </svg>
          )}
          {i && t >= local ? (
            <div style={box(480, 155)}>
              <Prop kind="laptop" width={225} />
            </div>
          ) : null}
          <div style={box(55, 420)}>
            <Stamp text={card.label} />
          </div>
        </div>
      ))}
      <Actor x={754} y={750} t={t} />
      <Actor x={1625} y={750} t={t + 0.3} />
      {checks.map((at) => (
        <Foley key={at} at={at} name="tick" />
      ))}
      <Foley at={cue("answer")} name="chime" />
      <Foley at={local} name="vault" />
    </Stage>
  );
};
