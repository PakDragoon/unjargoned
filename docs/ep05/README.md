# Ep 5 — Can You Hack an AI? (Prompt Injection Explained)

- Script (locked Draft 2, Nov 13 2026): https://claude.ai/artifact/PT5G8aaBetrt6JKqECTjud — the VO, on-screen and Dot direction, fact-check, packaging and Shorts all live there.
- Master Handoff (has the Nov 13 analytics review + Ep 5 section): https://claude.ai/artifact/4PwzEhzvSMM3Wqa5244neX

## Status

| Gate | State |
| --- | --- |
| G0 voice + captions | Done with Kokoro (af_heart 0.95), 317 s of voice, 191 cues, no overlaps. User: words fine, but **the voice sounds flat**. |
| Next | A/B test ElevenLabs v3 (audio tags) against Kokoro on S1 and S4, then re-voice the episode if it wins. |
| G1–G5 | Not started. |

## Next session: ElevenLabs A/B test

1. `source tools/setup_cloud.sh`
2. The key is set in the cloud environment (API credentials for `api.elevenlabs.io`, header `xi-api-key`, or the env var `ELEVENLABS_API_KEY`). Never print or commit it.
3. Build `tools/tts_eleven.py`: same CLI and output as `tools/tts.py` (`python3 tools/tts_eleven.py ep05 S1 S4`) → `public/episodes/ep05/audio/S*.wav` (24 kHz mono, same tail/pause handling) + `durations.json`. Map our markup to v3: `[beat]` → a short pause, `{slow}` / `{slower}` / `{fast}` → pacing via audio tags or punctuation, and add emotion tags where the script calls for them (e.g. `[whispers]` on the hidden notes in S1, `[gasps]` / `[excited]` on the boiler in S4, `[mischievously]` on "Prompt injection is sneakier" in S3c). Keep the words identical to vo.json.
4. Write the Kokoro takes to `out/` first so the user can compare (`S1_kokoro.wav` vs `S1_eleven.wav`); generate 2–3 v3 takes per scene and send the best.
5. Re-check pronunciation in the new voice: "résumé", "bank PIN", "prompt injection", "un-jargon", "OpenAI", "Summarize".
6. Change "Hi Mum" → "Hi Mom" in S5 (US is the biggest audience) in vo.json and the script doc.
7. If v3 wins: voice all scenes, re-run `tools/captions.py ep05`, re-check with a raw-Whisper diff against vo.json.
8. Plan: ElevenLabs Free for the test only (no commercial license); Starter ($6/mo, 30k credits) before the real voice-over. Ep 5 is ~4,700 characters per full take.

## Lessons from G0 (already fixed in tools)

- A `{slow}` / `{fast}` tag only works at the start of a sentence; mid-sentence, Kokoro reads it aloud.
- tts.py PRONOUNCE: "resume" → "résumé" (was the verb re-ZOOM), "bank PIN" → "bank pin" (was spelled out).
- captions.py: drops words Whisper invents after the last scripted word ("Thanks for watching…"), joins split numbers ("200" + ",000"), and shows 31 / 200,000 / $31 as figures.
