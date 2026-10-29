#!/usr/bin/env python3
"""
Per-scene voice generation with Kokoro (ONNX).

  python3 tools/tts.py ep02              # all scenes of ep02
  python3 tools/tts.py ep02 S4 S5        # only these scenes (the cheap re-voice path)
  python3 tools/tts.py --test "Finish this sentence: Once upon a…" out/test.wav

Reads   src/episodes/<ep>/vo.json
Writes  public/episodes/<ep>/audio/<scene>.wav
        src/episodes/<ep>/durations.json   (seconds per scene; Remotion sizes each scene from it)

Script markup inside "vo":
  [beat]          short pause
  [silence N]     N-second pause (music dips here in the edit)
Sentences are voiced one at a time and joined with SENTENCE_GAP of silence.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / "models" / "kokoro-v1.0.onnx"
VOICES = ROOT / "models" / "voices-v1.0.bin"

# House voice (Master Handoff → pipeline). Tune after the G0 listening test.
VOICE = "af_heart"
SPEED = 0.92
LANG = "en-us"
PAUSE_SCALE = 1.3      # every scripted pause is stretched by this
SENTENCE_GAP = 0.35    # seconds between sentences
BEAT = 0.6             # seconds for [beat], before PAUSE_SCALE (→ ~0.78 s)

# Spelling fixes applied ONLY to what the voice reads (captions keep the real text).
# Check a fix with: python3 -c "from kokoro_onnx import Kokoro; print(Kokoro('models/kokoro-v1.0.onnx','models/voices-v1.0.bin').tokenizer.phonemize('TEXT','en-us'))"
# G0: "a" alone was read as the letter A (/eɪ/). Leave "r's" alone — it reads /ɑːɹz/; "Rs" breaks it.
PRONOUNCE: dict[str, str] = {
    "Once upon a": "Once upon uh",
    "un-jargon": "un jargon",  # Ep 1 says it as two stressed words
}

MARKER = re.compile(r"\[(beat|silence\s+[\d.]+)\]", re.IGNORECASE)
SENTENCE_END = re.compile(r"(?<=[.!?…])[\"”']?\s+")


def silence(seconds: float, sr: int) -> np.ndarray:
    return np.zeros(int(round(seconds * sr)), dtype=np.float32)


def apply_pronunciation(text: str) -> str:
    for src, dst in PRONOUNCE.items():
        text = text.replace(src, dst)
    return text


def split_sentences(chunk: str) -> list[str]:
    parts = [p.strip() for p in SENTENCE_END.split(chunk.strip())]
    return [p for p in parts if p]


def voice_text(kokoro: Kokoro, vo: str) -> tuple[np.ndarray, int]:
    """Turn one scene's VO (with markup) into a single waveform."""
    pieces: list[np.ndarray] = []
    sr = 24000
    tokens = MARKER.split(vo)
    # MARKER.split keeps the captured marker names at odd indexes.
    for i, tok in enumerate(tokens):
        if i % 2 == 1:
            name = tok.lower()
            if name == "beat":
                pieces.append(silence(BEAT * PAUSE_SCALE, sr))
            else:
                seconds = float(name.split()[1])
                pieces.append(silence(seconds * PAUSE_SCALE, sr))
            continue
        for n, sentence in enumerate(split_sentences(tok)):
            if n > 0:
                pieces.append(silence(SENTENCE_GAP, sr))
            samples, sr = kokoro.create(apply_pronunciation(sentence), voice=VOICE, speed=SPEED, lang=LANG)
            pieces.append(np.asarray(samples, dtype=np.float32))
    audio = np.concatenate(pieces) if pieces else silence(0.5, sr)
    return audio, sr


def load_kokoro() -> Kokoro:
    if not MODEL.exists() or not VOICES.exists():
        sys.exit(f"Missing model files. Put kokoro-v1.0.onnx and voices-v1.0.bin in {MODEL.parent} (see tools/README.md).")
    return Kokoro(str(MODEL), str(VOICES))


def run_episode(ep: str, only: list[str]) -> None:
    ep_dir = ROOT / "src" / "episodes" / ep
    vo = json.loads((ep_dir / "vo.json").read_text(encoding="utf-8"))
    out_dir = ROOT / "public" / "episodes" / ep / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    durations_path = ep_dir / "durations.json"
    durations = json.loads(durations_path.read_text(encoding="utf-8")) if durations_path.exists() else {}

    wanted = {s.upper() for s in only}
    unknown = wanted - {s["id"] for s in vo["scenes"]}
    if unknown:
        sys.exit(f"Unknown scene id(s): {', '.join(sorted(unknown))}")

    kokoro = load_kokoro()
    for scene in vo["scenes"]:
        if wanted and scene["id"] not in wanted:
            continue
        if scene.get("silent"):
            continue  # gag scenes have no voice; timeline.ts uses estSeconds
        audio, sr = voice_text(kokoro, scene["vo"])
        path = out_dir / f"{scene['id']}.wav"
        sf.write(path, audio, sr)
        durations[scene["id"]] = round(len(audio) / sr, 3)
        print(f"{scene['id']}: {durations[scene['id']]:.2f} s -> {path.relative_to(ROOT)}")

    durations_path.write_text(json.dumps(durations, indent=2) + "\n", encoding="utf-8")
    print(f"Total voice: {sum(durations.values()):.1f} s")


def main() -> None:
    parser = argparse.ArgumentParser(description="Per-scene Kokoro voice generation")
    parser.add_argument("episode", nargs="?", help="episode folder, e.g. ep02")
    parser.add_argument("scenes", nargs="*", help="optional scene ids, e.g. S4 S5")
    parser.add_argument("--test", nargs=2, metavar=("TEXT", "OUT_WAV"), help="voice one line to a file")
    args = parser.parse_args()

    if args.test:
        text, out = args.test
        audio, sr = voice_text(load_kokoro(), text)
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        sf.write(out, audio, sr)
        print(f"{len(audio) / sr:.2f} s -> {out}")
        return
    if not args.episode:
        parser.error("give an episode (e.g. ep02) or --test")
    run_episode(args.episode, args.scenes)


if __name__ == "__main__":
    main()
