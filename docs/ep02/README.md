# Ep 2 — How ChatGPT Actually Works (Explained Simply)

- Script (source of truth for VO, on-screen directions, Dot moods, fact-check, packaging):
  https://claude.ai/artifact/DS9njvUGCA6VKfG7ibjfK4
- Voice text per scene: `src/episodes/ep02/vo.json` (copied from the script; "The cat sat on the ___" is read as "blank").
- Tokenizer (checked 2026-10-26 with js-tiktoken, offline ranks): GPT-4o and later (o200k_base) split "strawberry" as
  **st | raw | berry** (302 · 1618 · 19772); GPT-4 (cl100k_base) was str | aw | berry. S4 tiles use the o200k split.
  With a leading space (" strawberry") both tokenizers use ONE token; the split above is the word on its own / in quotes.
- Voice (G0): "Once upon a" read the "a" as the letter A → PRONOUNCE map voices it "uh". "r's" (/ɑːɹz/) and "ChatGPT" read fine.
- Shorts: S4 strawberry (open on "How many r's are in strawberry?"), S5 restaurant/temperature.
- Music (G4): "Fade" by Snoozy Beats, CC BY 3.0 (`public/episodes/ep02/music/fade.mp3`). Mixed by `tools/mix.py`:
  starts 13 s in, the track's 48 s repeating section is spliced in 3 extra times so its own ending lands on the end screen;
  ~−26 LUFS under voice, ~−17 in gaps, −13 on the end screen; out during S1 "Once upon a…" pause and S6 before
  "What sounds right", dip on S7 "it's next". Final −13 LUFS, −1 dBTP. Credit block is in `description.txt`.
- Chapters in `description.txt` are the real scene starts (S1 0:00 … S7 3:47).
