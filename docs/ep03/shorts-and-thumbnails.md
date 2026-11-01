# Ep 3 — Shorts and thumbnails

## Thumbnails (Ep 1 style; Test & Compare both)
- **A · CONFIDENTLY WRONG** (`thumbnail-A-confidently-wrong.png`): smug Dot holds an exam answer "1952!" with a red cross. Recommended.
- **B · IT'S BLUFFING** (`thumbnail-B-its-bluffing.png`): smug Dot holds a yellow speech bubble with "!".
- Both: bottom-right kept clear for the duration badge; checked at 168×94. Source: `src/episodes/ep03/Thumbnails.tsx` (`Ep03-ThumbA/B`).

## Shorts (cut from the episode mix, −14 LUFS, burned-in captions)
| Short | Hook | Cut | Length |
| --- | --- | --- | --- |
| 1 | "ChatGPT made up court cases" | S1 0:00–16.3 + S2 0:00–7.3 + S6 14.8–17.9 ("Sounding sure is not the same as being right.") | 26.7 s |
| 2 | "Why does AI make things up?" | S3 1.3–55.2 (the exam test → scoring → always answer → birthday test) | 53.9 s |

Posting: Short 1 one to two days after the episode, Short 2 two or three days later; set the long video as Related video.
Rebuild: `npx remotion render Ep03-ShortN out/shortN-video.mp4 --muted` then `python3 tools/shorts.py ep03 ShortN`.
