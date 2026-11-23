import React from "react";
import { Foley, SceneProps, Stage, useBeat } from "../Editorial";
import { Exhibit } from "../Exhibit";
export const S2 = ({ words }: SceneProps) => {
  const { t, cue } = useBeat(words);
  const stamp = cue("everyday"),
    breadth = cue("breadth"),
    folder = cue("messy");
  return (
    <Stage title="The everyday all-rounder" label="BUCKET 01 / CHATGPT">
      <Exhibit
        t={t}
        stampAt={stamp}
        number={1}
        stamp="ALL-ROUNDER"
        beats={[
          {
            at: 0,
            kind: "knife",
            title: "One tool, many jobs",
            detail: "A Swiss Army knife for the things you do every day.",
            tabs: ["CHATGPT"],
          },
          {
            at: breadth,
            kind: "knife",
            title: "Pick the tool you need",
            detail: "Brainstorm a gift, talk hands-free or sketch an idea.",
            tabs: ["VOICE", "IMAGE", "WEB"],
          },
          {
            at: cue("ecosystem"),
            kind: "knife",
            title: "A familiar starting point",
            detail: "Move from an idea to a draft in one workspace.",
            tabs: ["ASSISTANTS", "CANVAS", "APPS"],
          },
          {
            at: folder,
            kind: "folder",
            title: "The trade-off",
            detail: "A quick pass can skim the surface of a sprawling project.",
            tabs: ["MULTI-FILE REVIEW"],
          },
        ]}
      />
      <Foley at={stamp} name="stamp" />
      <Foley at={breadth} name="pop" />
      <Foley at={folder} name="paper" />
    </Stage>
  );
};
