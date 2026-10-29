# Ep 2 — Shorts and thumbnails

**Shipped thumbnail:** `docs/ep02/thumbnail-final.jpg` (Hassan's pick: illustrated strawberry in a forest, Dot with a magnifying glass, "HOW MANY R'S?"). The D/E/A/B/C below were the candidates.

## Thumbnails — Ep 1 style (use these): `Ep02-ThumbD`, `Ep02-ThumbE`
Warm blurred yellow backdrop, shaded Dot with brow/mouth and an arm holding the hero, glowing hero, white outlined words top-right (src/episodes/ep02/ThumbStyle.tsx).
- **D · "HOW MANY R'S?"** — skeptical Dot holds up a strawberry; a "2?" chat bubble.
- **E · "IT'S JUST GUESSING"** — smug Dot holds a chat bubble: "Once upon a ???".
Test & Compare: D vs E.

## Earlier flat thumbnails (1280×720, `out/thumbs/`, compositions `Ep02-ThumbA/B/C`)
Run all three in YouTube **Test & Compare**. Bottom-right kept empty for the duration badge; checked at 168×94.
- **A · "HOW MANY R'S?"** — drawn strawberry, coral "2", surprised Dot. Curiosity + the meme people know.
- **B · "IT'S JUST GUESSING"** — the episode's reveal; "Once upon a time?" chat, smug Dot. Reads best when small.
- **C · "AI SEES THIS"** — st | raw | berry tiles, panicking Dot. Most "explainer"-looking.

## Shorts (1080×1920, burned-in captions, music bed, about −14 LUFS)
Post the first 1–2 days after the main video, then one every 2–3 days; set Ep 2 as the **Related video**.

### Short 1 — strawberry (`Ep02-Short1`, ~58 s, from S4)
- Title: Why can't ChatGPT count the r's in "strawberry"? 🍓
- Description: It doesn't see letters — it sees chunks. Full explanation in "How ChatGPT Actually Works". #Unjargoned #ChatGPT #AI #Shorts
- Music credit (same block as the main video): Fade by Snoozy Beats, CC BY 3.0 — https://soundcloud.com/snoozybeats

### Short 2 — adventure dial (`Ep02-Short2`, ~44 s, from S5)
- Title: Why ChatGPT gives a different answer every time
- Description: Meet the "adventure dial" (engineers call it temperature). Full video: How ChatGPT Actually Works. #Unjargoned #ChatGPT #AI #Shorts
- Music credit: as above.

### Short 3 — the guessing machine (`Ep02-Short3`, ~29 s, S1 test + S2)
- Title: Finish this sentence: "Once upon a…" (that's how ChatGPT works)
- Description: You just did what ChatGPT does — guess the next word. Full video: How ChatGPT Actually Works. #Unjargoned #ChatGPT #AI #Shorts
- Music credit: as above.

Suggested order: Short 1 (strongest hook) → Short 3 → Short 2.

Re-render (clips are in `src/episodes/ep02/shorts.json`): run `python3 tools/mix.py ep02` once, then
`npx remotion render Ep02-Short1 out/short1-video.mp4 --muted` and `python3 tools/shorts.py ep02 Short1`
(the audio is cut from the episode mix, so voice, music and SFX match the long video).
