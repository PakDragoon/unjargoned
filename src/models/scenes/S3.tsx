import React from "react";
import { Foley, SceneProps, Stage, useBeat } from "../Editorial";
import { Exhibit } from "../Exhibit";
export const S3 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  return (
    <Stage title="The deep writer & builder" label="BUCKET 02 / CLAUDE">
      <Exhibit
        t={t}
        stampAt={cue("deep")}
        number={2}
        stamp="BUILDER & WRITER"
        glasses
        beats={[
          {
            at: 0,
            kind: "pages",
            title: "An editor’s eye",
            detail: "Keep the voice consistent across an entire manuscript.",
            tabs: ["TONE", "DETAIL"],
          },
          {
            at: cue("contracts"),
            kind: "folder",
            title: "Read across the document",
            detail: "Track a definition from the first page to the fine print.",
            tabs: ["LONG DOCUMENTS"],
          },
          {
            at: cue("second"),
            kind: "pages",
            title: "Follow the connections",
            detail: "Trace a change across files before rewriting the code.",
            tabs: ["TRACE", "REFACTOR", "REVIEW"],
          },
          {
            at: cue("restraint"),
            kind: "pages",
            title: "The trade-off",
            detail: "Text and code are the focus of this toolkit.",
            tabs: ["WRITING", "CODE"],
          },
        ]}
      />
      <Foley at={0} name="whoosh" />
      <Foley at={cue("deep")} name="stamp" />
      <Foley at={cue("folder")} name="click" />
      <Foley at={cue("refactor")} name="snap" />
    </Stage>
  );
};
