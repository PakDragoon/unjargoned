import React from "react";
import {
  Actor,
  box,
  Foley,
  IndexCard,
  progress,
  SceneProps,
  Stage,
  useBeat,
} from "../Editorial";
export const S6 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  const local = words.findIndex(([w]) => w.toLowerCase() === "local");
  const rounds = [
    {
      question: "Messy voice note into an email?",
      ask: cue("messy"),
      answer: cue("chatgpt"),
      card: 0,
    },
    {
      question: "Find one diagram in a lecture?",
      ask: cue("find"),
      answer: cue("gemini"),
      card: 2,
    },
    {
      question: "Summarize a file that has to stay on this laptop?",
      ask: cue("summarize"),
      answer: words[Math.max(0, local - 1)][1],
      card: 3,
    },
  ];
  const round = rounds.filter((r) => r.ask <= t).pop();
  const revealed = round && t >= round.answer;
  return (
    <Stage title="Pick before Dot stamps it." label="FIELD GUIDE / QUICK TEST">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            ...box(108 + i * 435, 340 + (i % 2) * 22, 401),
            height: 247,
            transform: `rotate(${(i - 1.5) * 2}deg)`,
            outline:
              revealed && round.card === i ? "8px solid #FF4D2D" : undefined,
          }}
        >
          <IndexCard
            n={i}
            answer={
              revealed && round.card === i
                ? i === 3
                  ? "LOCAL OPEN-WEIGHT"
                  : "DOT’S PICK"
                : undefined
            }
          />
        </div>
      ))}
      <div
        style={{
          ...box(106, 754, 890),
          fontSize: 45,
          lineHeight: 1.12,
          fontWeight: 700,
        }}
      >
        {t >= cue("now")
          ? "Up next: AI that works while you sleep →"
          : (round?.question ?? "Three jobs. Which tool would you choose?")}
      </div>
      <Actor
        x={revealed ? 305 + round.card * 435 : 500}
        y={
          663 -
          (revealed
            ? 35 * Math.sin(Math.PI * progress(t, round.answer, 0.55))
            : 0)
        }
        r={43}
        t={t}
      />
      {rounds.map((r) => (
        <Foley key={r.card} at={r.answer} name="stamp" />
      ))}
    </Stage>
  );
};
