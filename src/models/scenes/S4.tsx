import React from "react";
import { Foley, SceneProps, Stage, useBeat } from "../Editorial";
import { Exhibit } from "../Exhibit";
export const S4 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  return (
    <Stage title="Many inputs, one brain" label="BUCKET 03 / GEMINI">
      <Exhibit
        t={t}
        stampAt={cue("multimodal")}
        number={3}
        stamp="MULTIMODAL"
        beats={[
          {
            at: 0,
            kind: "funnel",
            title: "Different kinds of input",
            detail:
              "A film strip, a recording and a binder feed the same system.",
            tabs: ["VIDEO", "AUDIO", "PDF"],
          },
          {
            at: cue("lecture"),
            kind: "funnel",
            title: "Find the moment",
            detail: "Ask where the lecturer shows a particular slide.",
            tabs: ["LECTURE → FRAME"],
          },
          {
            at: cue("gmail"),
            kind: "funnel",
            title: "Connected workspace",
            detail:
              "Carry context between the tools where the work already lives.",
            tabs: ["GMAIL", "DOCS", "DRIVE"],
          },
        ]}
      />
      <Foley at={0} name="whoosh" />
      <Foley at={cue("multimodal")} name="ding" />
    </Stage>
  );
};
