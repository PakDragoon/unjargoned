# Ep 4 — Shorts and thumbnails

## Thumbnails (Ep 1 style; Test & Compare both)
- **A · IT BOUGHT EGGS?!** (`thumbnail-A-it-bought-eggs.png`): shocked Dot holds the egg carton; the receipt hangs off it with a huge coral $31.43. The story hook.
- **B · IT GOT HANDS** (`thumbnail-B-it-got-hands.png`): the agent (pink brain in the jar, goggles) throws up its blue gloves; shocked Dot beside it. The character.
- Both: bottom-right kept clear for the duration badge; checked at 168×94. Source: `src/episodes/ep04/Thumbnails.tsx` (`Ep04-ThumbA/B`).

## Shorts (1080×1920, 30 fps; cut from the episode mix, −14 LUFS, burned-in captions)
| Short | Hook | Cut | Length |
| --- | --- | --- | --- |
| 1 | "This AI spent $31 without asking" | S1 0–18.62 (hook → "Let's un-jargon it.") + S2 0–13.45 ("It got hands!" → brain in a jar → body) + S6 14.6–17.95 (headline, no captions) | 35.5 s |
| 2 | "Chatbot vs AI agent" | S3 22.25–45.2 (list vs shopping → eyes → loop → tells/does) + S5 13.1–19.95 (risky clicks stop at "Allow?") + S5 26.3–37.0 (the egg flashback: "That time… it didn't.") | 40.5 s |
| 3 | "Does AI really remember you?" | S4 2.1–34.3 (fresh every chat → the notebook → reads it first → old/wrong notes → "It isn't remembering. It's reading.") | 32.2 s |

Layout (new for Ep 4): the scene sits in a window that follows the action — per-clip `cam` keys in `shorts.json`
(`[sceneSec, centreX, zoom]`; 0.85 = 1271 px of the frame, 918 px tall). Captions sit at y≈1405, clear of the Shorts
bottom overlay and the right-hand buttons. Clips can set `"captions": false` when the scene shows its own words.

Posting: Short 1 one to two days after the episode, then Short 2 and Short 3 two or three days apart; set the long
video as Related video.
Rebuild: `npx remotion render Ep04-ShortN out/shortN-video.mp4 --muted --jpeg-quality=95 --crf=16`
then `python3 tools/shorts.py ep04 ShortN`.
