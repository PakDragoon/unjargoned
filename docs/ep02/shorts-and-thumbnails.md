# Ep 2 — Shorts and thumbnails

## Thumbnails (1280×720, `out/thumbs/`, compositions `Ep02-ThumbA/B/C`)
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

Re-render: `npx remotion render Ep02-Short1 out/short1-raw.mp4`, then
`ffmpeg -i out/short1-raw.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy -c:a aac -b:a 256k out/Unjargoned_Ep2_Short1.mp4`.
