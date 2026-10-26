# Ep 2 — How ChatGPT Actually Works (Explained Simply)

- Script (source of truth for VO, on-screen directions, Dot moods, fact-check, packaging):
  https://claude.ai/artifact/DS9njvUGCA6VKfG7ibjfK4
- Voice text per scene: `src/episodes/ep02/vo.json` (copied from the script; "The cat sat on the ___" is read as "blank").
- Tokenizer (checked 2026-10-26 with js-tiktoken, offline ranks): GPT-4o and later (o200k_base) split "strawberry" as
  **st | raw | berry** (302 · 1618 · 19772); GPT-4 (cl100k_base) was str | aw | berry. S4 tiles use the o200k split.
  With a leading space (" strawberry") both tokenizers use ONE token; the split above is the word on its own / in quotes.
- Voice (G0): "Once upon a" read the "a" as the letter A → PRONOUNCE map voices it "uh". "r's" (/ɑːɹz/) and "ChatGPT" read fine.
- Shorts: S4 strawberry (open on "How many r's are in strawberry?"), S5 restaurant/temperature.
