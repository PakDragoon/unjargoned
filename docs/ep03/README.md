# Ep 3 — Why AI Hallucinates (and Sounds So Sure)

Script: https://claude.ai/artifact/LXuH9FinV8xdqo5NbfBPZW (vo.json is the voice text source of truth).

## Decisions
- **Cold open rebuilt after G2** from Ep 1/Ep 2 retention: both lost most viewers in the first 15–30 s, then held flat;
  Ep 2 got 65% of views from Browse. S1 now opens on the surprise ("ChatGPT once made up court cases"), frame 0 is
  already busy (filing being typed, "written by AI" tag), no fade-in.
- **One analogy:** closed-book exam (blank = 0, bluff might score) → open-book exam as the habit-2 callback.
- **Text cards → objects:** S2's lying/guessing and definition shots became the S1 chat + Ep 2's guess slot and a
  confident made-up answer with a fake FACT seal. New picture every 3–5 s in every scene.
- **Shared props** in `src/episodes/ep03/Props.tsx` (exam book, pencil, marks, stamp, magnifier, voice wave).
- **Fake case names/citations** in S1/S5 are invented on purpose (they are the fake cases); no real airline names.
- **Gag:** S3b, 3 s, silent, Dot answers "Every day!" to "Dot's birthday?" and scores 0; bed muffled in mix.py.
- **Voice:** "OpenAI" written plainly (Kokoro reads it right; "Open A I" broke). Pace ≈154 wpm, total 4:02.
- **Captions:** tools/captions.py now aligns Whisper words to vo.json (fixed "all rung", "liar", "it's/its").
- **Music:** same bed as Ep 2 ("Fade"), 3 extra loops, start auto; no planned silences.

## Build
- Render: `npx remotion render Ep03-Full out/ep03-full-video.mp4 --muted`
- Mix + mux: `python3 tools/mix.py ep03 --mux out/ep03-full-video.mp4 out/Unjargoned_Ep3_v1.mp4`
- Captions: `docs/ep03/ep03.en.srt` (132 cues, no overlaps)
