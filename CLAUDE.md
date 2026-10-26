# Unjargoned — working rules for Claude

Faceless YouTube explainer channel: tech explained in plain words for non-tech viewers (kids, older people).
Full context: Master Handoff https://claude.ai/artifact/4PwzEhzvSMM3Wqa5244neX (brand, pipeline, decisions).
Read it once at the start of a session; don't re-read it every turn.

## Layout (one folder per episode)
- `src/shared/` — reused by every episode: brand tokens + font (`brand.ts`), `SceneShell`, and (from G1) Dot, captions, transitions, end screen.
- `src/episodes/epNN/` — that episode's code: `vo.json` (voice script per scene), `timeline.ts`, `scenes/S1.tsx…`, `EpNN.tsx` (compositions), `durations.json` + `captions.json` (generated).
- `public/episodes/epNN/` — that episode's audio and assets (`audio/S1.wav…`).
- `docs/epNN/` — scripts, launch notes, the final SRT.
- `tools/` — `tts.py` (Kokoro, per scene), `captions.py` (faster-whisper → SRT).
- New episode: copy `src/episodes/ep02` → `epNN`, rewrite `vo.json`, rename the `Ep02-` ids, add a `<Folder>` in `src/Root.tsx`.

## Usage-saving rules (the user has a weekly limit — follow strictly)
1. Every scene is its own composition (`Ep02-S4`). A change to one scene touches one scene file only.
2. Review with stills, not videos: `npx remotion still Ep02-S4 out/s4-f120.png --frame=120`. 2–3 frames per check.
   Render a scene MP4 only when asked. Render `Ep02-Full` once, at the end.
3. Re-voice only the scenes whose lines changed: `python3 tools/tts.py ep02 S4`.
4. Batch: present everything for a gate in one message, then wait for the user's batched feedback.
5. Don't read back files you just wrote, don't paste whole files into chat, keep messages short.
6. The user previews in Remotion Studio (`npm run studio`) themselves — that's free; rely on it.
7. Commit after every approved gate, with a clear message. Push to `origin main` only when the user asks.

## Gates (stop for the user's OK at each)
G0 pre-checks (pronunciation test clip, facts flagged in the script doc) → G1 shared kit (Dot moods + style frame, 1 still sheet)
→ G2 proof scene (fully built) → G3 remaining scenes (2 stills each) → G4 full render + SRT → G5 thumbnail + Shorts.

## Brand / content rules
- Colours in `src/shared/brand.ts`. Yellow always = "the thing to watch". Font: Bricolage Grotesque.
- Dot mascot: logo-faithful pill eyes, straight tail. Reference: https://claude.ai/artifact/FnNidEQ4Fhxx2TUmEVd1Mj
- No real logos/brand marks on screen (generic chat window, drawn icons, not platform emoji).
- One everyday analogy per concept. Length follows content (4–7 min), never pad.
- Render: 1920×1080, 30 fps, H.264, about −13 LUFS. Captions: no overlapping cues.
- Act as a senior motion designer / script editor: push back when something won't read on screen.
