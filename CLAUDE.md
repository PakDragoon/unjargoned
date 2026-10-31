# Unjargoned — working rules for Claude

Faceless YouTube explainer channel: tech explained in plain words for non-tech viewers (kids, older people).
Full context: Master Handoff https://claude.ai/artifact/4PwzEhzvSMM3Wqa5244neX (brand, pipeline, decisions, Ep 2 lessons,
the "Starting Episode 3" checklist). Read it once at the start of a session; don't re-read it every turn.
Status: Ep 1 and Ep 2 shipped. Ep 2 (`src/episodes/ep02`) is the reference build for every new episode.

## Layout (one folder per episode)
- `src/shared/` — reused by every episode: `brand.ts` (colours, font), `SceneShell`, `Dot.tsx` (mascot rig),
  `motion.ts` (sec/ramp/during/pop/pushIn), `LineWipe.tsx` + `FadeIn.tsx` (transitions), `ChatWindow.tsx` (generic chat,
  bubbles, word-by-word text), `Logo.tsx`, `EndScreen.tsx`, `DotSheet.tsx` (model sheet).
- `src/episodes/epNN/` — that episode's code: `vo.json` (voice per scene; `"silent": true` + `estSeconds` = a no-voice gag
  scene), `timeline.ts`, `scenes/S1.tsx…` (each has a `T` table of word times from captions.json), `EpNN.tsx` (compositions),
  `QuestionStrip.tsx`, `Thumbnails.tsx` + `ThumbStyle.tsx`, `Shorts.tsx` + `shorts.json`, `sfx.json` (sound cues),
  `durations.json` + `captions.json` (generated).
- `public/episodes/epNN/` — `audio/S*.wav` (voice), `music/` (the bed). `public/sfx/` — the SFX kit (generated).
- `docs/epNN/` — README (decisions), final SRT, `description.txt`, `shorts-and-thumbnails.md`, shipped thumbnail.
- `tools/` — `tts.py` (Kokoro, per scene, PRONOUNCE fixes) · `captions.py` (faster-whisper → captions.json + SRT) ·
  `sfx.py` (synthesised SFX kit) · `mix.py` (voice + looped music bed with ducking + SFX → −13 LUFS, `--mux` onto the render)
  · `shorts.py` (cuts each Short's audio from the episode mix, −14 LUFS, muxes onto the muted Short render).

## New episode recipe (copy Ep 2, don't start from scratch)
1. Copy `src/episodes/ep02` → `epNN`; rename `Ep02-` ids; add a `<Folder>` in `src/Root.tsx`. Rewrite `vo.json` from the script.
2. Voice: `python3 tools/tts.py epNN`, then `python3 tools/captions.py epNN` (word timings for the scenes' `T` tables).
3. Build scenes; Dot gets a route per scene (`hops([...])` + `glances([...])`), not a fixed spot.
4. Write `sfx.json` cues from the scenes' `T` tables; add an `epNN` entry to `MUSIC` in `tools/mix.py`
   (file, `loop_from`/`period` of the track's repeating section, `extra_loops`, silences, dips; `start: "auto"`).
5. Render `EpNN-Full --muted`, then `python3 tools/mix.py epNN --mux out/epNN-full-video.mp4 out/Unjargoned_EpN_v1.mp4`.
6. Shorts: clips in `shorts.json`; `npx remotion render EpNN-Short1 out/short1-video.mp4 --muted` then `python3 tools/shorts.py epNN Short1`.

## Usage-saving rules (the user has a weekly limit — follow strictly)
1. Every scene is its own composition (`Ep02-S4`). A change to one scene touches one scene file only.
2. Review with stills, not videos: `npx remotion still Ep02-S4 out/s4-f120.png --frame=120`. 2–3 frames per check.
   Render a scene MP4 only when asked. Render the Full video once per review round.
3. Re-voice only the scenes whose lines changed: `python3 tools/tts.py ep02 S4` (then re-run captions.py and update that
   scene's `T` table).
4. Audio-only changes (music, SFX, levels) are a remix: `tools/mix.py … --mux` on the existing render, no re-render.
5. Batch: present everything for a gate in one message, then wait for the user's batched feedback.
6. Don't read back files you just wrote, don't paste whole files into chat, keep messages short.
7. The user previews in Remotion Studio (`npm run studio`) themselves — that's free; rely on it.
8. Commit after every approved gate, with a clear message, and push to `origin main` (cloud containers are wiped; unpushed
   work is lost). Rendered videos live in `out/` (not committed): send them with SendUserFile right away.

## Running in a Claude Code cloud session
- First command of every session: `source tools/setup_cloud.sh` (npm install, Python deps, Kokoro models, and
  `REMOTION_BROWSER` → preinstalled Chromium). Takes ~1–2 min; re-run it (or export REMOTION_BROWSER) in any new shell.
- Whisper downloads its model from huggingface.co: the environment's network policy must allow it (set to Full access).
- The user can't open Remotion Studio from the cloud, so previews are: stills you send with SendUserFile, and,
  when asked, a half-size scene MP4 (`npx remotion render Ep02-S4 out/s4-preview.mp4 --scale=0.5`).
- Full episode render ≈ 15 min (2 CPU cores); run it in the background and keep working.
- Known fixes already in tools: Whisper "chat GPT" → "ChatGPT", "un -jargon" → "un-jargon", "Once upon I." → "Once upon a…"
  (captions.py MERGE/FIX); Kokoro reads a lone "a" as the letter A ("Once upon uh" in tts.py PRONOUNCE); audio is fed to
  Whisper as a numpy array because current PyAV breaks faster-whisper's file decoder.
- Check a pronunciation before voicing: `Kokoro(...).tokenizer.phonemize("text", "en-us")` (see tts.py comment).

## Gates (stop for the user's OK at each)
G0 pre-checks (pronunciation test clip, facts flagged in the script doc) → G1 shared kit (Dot moods + style frame, 1 still sheet)
→ G2 proof scene (fully built) → G3 remaining scenes (2 stills each) → G4 full render + mix + SRT → G5 thumbnail + Shorts.

## Brand / content rules
- Colours in `src/shared/brand.ts`. Yellow always = "the thing to watch". Font: Bricolage Grotesque (thumbnails: Inter Black).
- Dot mascot = the Ep 1 rig ("Dot2"): white dot, radius ~80 px, thin straight yellow tail with a gap, trailing away from what it
  looks at; eyes change shape by mood (13 moods). It must ACT: hop between beats, look at the subject, use props.
  Reference: https://claude.ai/artifact/FnNidEQ4Fhxx2TUmEVd1Mj
- Every episode: hook → "Let's un-jargon it." with the "?" → logo sting → stops (line wipe) → recap → next-episode tease + 8 s end screen.
- No jargon left unexplained (name it, then say it in everyday words); a surprising result always gets its "why".
- No real logos/brand marks on screen (generic chat window, drawn icons, not platform emoji). No real memes/clips (copyright);
  gags are built in code with Dot.
- One everyday analogy per concept. Length follows content (4–7 min), never pad.
- Sound: music bed under the voice, no long silences (one planned pause at most); SFX on every pop/cross/wipe.
- Render: 1920×1080, 30 fps, H.264, about −13 LUFS (Shorts −14). Captions: no overlapping cues.
- Act as a senior motion designer / script editor: push back when something won't read on screen.
