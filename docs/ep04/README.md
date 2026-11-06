# Ep 4 — "Chatbots Talk. AI Agents Do Things." — build notes

Script (source of truth): https://claude.ai/artifact/9DDZo9GQ86Z5u1pgG5KXpe (Tab 1). Voice: af_heart 0.95, "voice B"
delivery tags in vo.json ({fast}/{slow}/{slower}). Runtime 3:36.

## Gate status
- G0–G4 done on the v1 look (v1 render: Unjargoned_Ep4_v1.mp4, not shipped).
- User asked for a full graphics/animation revamp after G4. New style + rig approved; **S1 revamped and approved**.
- S2–S7 (+ S3b) revamped in the S1 style; **G3 approved** (S3b: Dot has its own white bendy arms + borrowed gloves).
- G4: v2 rendered + mixed. v3: pink detailed brain; S1 `tailSeconds: 0.05` so "Let's un-jargon it." runs into S2 with ~0.25 s; S2 4-frame fade; SRT shifted −0.333 s after S1 (215.6 s, −13.0 LUFS).
- G5: thumbnails A/B + 3 Shorts (see shorts-and-thumbnails.md). Awaiting review.
- Next: re-render Full + remix
  (`tools/mix.py ep04 --mux`), re-check SRT, then G5 (thumbnails A/B + 2 Shorts + description).
- Audio is final unless a scene's timing changes: voice, captions, 171 SFX cues (S1 cues retimed for the revamp;
  logo sting at S1 16.25 s), music plan `ep04` in mix.py (end screen builds under the VO from "Until").

## Decisions
- One analogy: the agent built like a person. S1 shows the finished agent (it placed the order); S2 takes it apart
  and rebuilds it part by part on the same stage; slots fill in order: brain-in-a-jar → hands → eyes → notebook.
- Eyes are goggle-lenses strapped to the jar lid (no human face). Hands are gloves on arms (Rig.tsx).
- No real brands/logos: generic self-checkout and shop page; OpenAI is named in VO/captions only.
- Screen/captions use "$31" / "$31.43"; vo.json keeps words ("thirty-one dollars"); captions.py converts.
- S3 shop picks the cheaper eggs on purpose (normal case); S1 owns "not even the cheapest".

## Revamp files
- `World.tsx` — shared S2–S7 kit: the S1 layout constants, `camAt`/`along` keyframes, `toScreen`, `reachFor` (iterative IK:
  puts a held point — fist, pencil tip, card — exactly on a target), `BeltKit` (belt + tool pouches + helper box + cables
  + "Allow?" gate, figure frame), `PinnedCard`, `ArmGlyph`, `Bubble`, `PersonSays`, `KioskChat`, `OpenNotebook`,
  `Pencil`, `LoopRing`, `Tag`, and the extra checkout views (`ShopView`, `QtyView`, `RecipeView`).
- Rig additions (optional, S1 unchanged): `Figure2` `body` (faint outline), `lids`, `dim`, `front`; `Arm` `ghost` and
  gloves slide along the forearm as they come on/off; `HeadJar` lids.
- Strip (`QuestionStrip`) is paper cards now; it shows at the top of each stop and fades once the question is set
  (and returns in S5 when "Allow?" fills), so close-ups aren't covered.
- `Rig.tsx` — IK arm + glove (poses relaxed/open/point/grip/fist), `bend: "natural"`, `handFrame`, `HeadJar`,
  `Figure2` (paper agent, arms via ArmSpec targets in its 600×900 frame), `Stage`.
- `Screens.tsx` — `Kiosk`, `Checkout` (screen + printer body, receipt feeds from the slot), page views.
- `scenes/S1.tsx` — reference for the new approach: one world, `CAM` keyframes (centre + zoom), arm keyframes,
  `wristFor(tip)` computes press points, `stepK` for the agent stepping to reach.
- `RigSheet.tsx`, `StyleFrames.tsx` — anatomy check sheet and the approved style frames.

## S2–S7 revamp plan (same stage, same agent, camera moves; old scene files are the v1 timing reference)
- S2: the S1 agent comes apart (gloves slide off the wrists → dashed slots; goggles off; notebook out) leaving the jar on
  its body outline; push in on the jar alone (talks, nothing moves; "brain = the AI model"); body re-forms; the three
  promises are paper cards pinned on a board beside it (hand, notebook, empty "Allow?") → shrink to the strip.
- S3: gloves snap back onto the wrists; tool belt worn at the waist (globe, envelope, calendar, basket). "Brain can't
  move the hands": a helper box clipped to the belt with cables up to the arms — the jar's request drops into the
  helper, the helper drives the arm (marionette), so hands stay on arms. Split: chatbot screen lists vs agent at the
  checkout shopping. Goggles click on and look at the cart badge. Loop: eye → brain → hand → eye on a ring round the agent.
- S3b: Dot wears the gloves (on Dot's sides, attached), taps Buy, qty 1→400, cartons rain.
- S4: the agent pulls the notebook from its pocket with its hand; writes "no mushrooms"; before answering it reads the
  page first; old dog note; it bins a line and flips a switch; record scratch → notebook held up to camera, "It's reading".
- S5: wake-ups around the agent (a person asks, an alarm clock on a shelf, an envelope into a tray); risky actions
  (coin, paper plane, bin) stop at the "Allow?" gate mounted on the helper box; the agent's hand waits until a person
  presses Yes; flashback to S1's receipt with the gate missing; gate snaps back; strip card fills.
- S6: recap on the same agent, one part per beat; headline alone; jar's guess slot spins, lands wrong, finger presses Buy.
- S7: a recipe page on the checkout screen; hidden pale words; goggles read them; the agent's hand drifts to the card;
  Dot snatches it; freeze → "Can You Hack an AI?"; end screen builds under the VO from "Until".
