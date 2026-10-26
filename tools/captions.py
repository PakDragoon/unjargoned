#!/usr/bin/env python3
"""
Captions for a whole episode from the per-scene voice files (faster-whisper).

  python3 tools/captions.py ep02

Reads   src/episodes/<ep>/vo.json + durations.json, public/episodes/<ep>/audio/*.wav
Writes  docs/<ep>/<ep>.en.srt                     (YouTube upload; no overlapping cues)
        src/episodes/<ep>/captions.json           (word timings per scene, for burned-in captions)

Scene offsets are computed exactly like src/episodes/<ep>/timeline.ts, so the SRT
lines up with the rendered Full composition. Keep FPS / TAIL_SECONDS in sync with it.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
TAIL_SECONDS = 0.4
MODEL_SIZE = "small.en"  # good enough for clean TTS audio; "medium.en" if words come out wrong

MAX_CHARS = 32       # per cue (one short line reads best on phones)
MAX_SECONDS = 2.6    # per cue
MIN_GAP = 0.001      # seconds between consecutive cues


def load_16k(path: Path) -> np.ndarray:
    """Read a WAV and resample to 16 kHz mono float32 for Whisper.
    Done here (not via PyAV) because recent PyAV releases break faster-whisper's decoder."""
    audio, sr = sf.read(str(path), dtype="float32", always_2d=True)
    mono = audio.mean(axis=1)
    if sr == 16000:
        return mono
    n_out = int(round(len(mono) * 16000 / sr))
    x_old = np.linspace(0.0, 1.0, num=len(mono), endpoint=False)
    x_new = np.linspace(0.0, 1.0, num=n_out, endpoint=False)
    return np.interp(x_new, x_old, mono).astype(np.float32)


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


# Whisper hears some names as two words or misspells them. Fix them before building cues.
# MERGE: (first word, second word starts with) -> the joined word keeps the second word's punctuation.
MERGE = [("chat", "GPT")]
FIX = {"Chat GPT": "ChatGPT", "chatGPT": "ChatGPT", "Chatgpt": "ChatGPT"}


def clean_words(words: list[dict]) -> list[dict]:
    out: list[dict] = []
    for w in words:
        if out:
            prev = out[-1]
            for first, second in MERGE:
                if prev["word"].lower() == first and w["word"].startswith(second):
                    prev["word"] = "ChatGPT" + w["word"][len(second):] if second == "GPT" else prev["word"] + w["word"]
                    prev["end"] = w["end"]
                    break
            else:
                out.append(dict(w))
            continue
        out.append(dict(w))
    for w in out:
        w["word"] = FIX.get(w["word"], w["word"])
    return out


def group_words(words: list[dict]) -> list[dict]:
    cues: list[dict] = []
    cur: list[dict] = []
    for w in words:
        text = " ".join(x["word"] for x in cur + [w])
        too_long = cur and (len(text) > MAX_CHARS or w["end"] - cur[0]["start"] > MAX_SECONDS)
        if too_long:
            cues.append(cur)
            cur = []
        cur.append(w)
        if w["word"].endswith((".", "?", "!", "…")):
            cues.append(cur)
            cur = []
    if cur:
        cues.append(cur)
    return [
        {"start": c[0]["start"], "end": c[-1]["end"], "text": " ".join(x["word"] for x in c)}
        for c in cues
    ]


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: python3 tools/captions.py ep02")
    ep = sys.argv[1]
    ep_dir = ROOT / "src" / "episodes" / ep
    vo = json.loads((ep_dir / "vo.json").read_text(encoding="utf-8"))
    durations = json.loads((ep_dir / "durations.json").read_text(encoding="utf-8"))
    audio_dir = ROOT / "public" / "episodes" / ep / "audio"

    model = WhisperModel(MODEL_SIZE, device="auto", compute_type="auto")

    offset = 0.0
    all_cues: list[dict] = []
    per_scene: dict[str, list[dict]] = {}
    for scene in vo["scenes"]:
        sid = scene["id"]
        if sid not in durations:
            sys.exit(f"{sid} has no voice yet: run tools/tts.py {ep} first")
        segments, _ = model.transcribe(load_16k(audio_dir / f"{sid}.wav"), word_timestamps=True, language="en")
        words = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            for seg in segments for w in (seg.words or []) if w.word.strip()
        ]
        words = clean_words(words)
        per_scene[sid] = words
        for cue in group_words(words):
            all_cues.append({"start": cue["start"] + offset, "end": cue["end"] + offset, "text": cue["text"]})
        end_screen = scene.get("endScreenSeconds", 0)
        frames = math.ceil((durations[sid] + TAIL_SECONDS + end_screen) * FPS)
        offset += frames / FPS

    # No overlaps: trim each cue to end just before the next one starts.
    for a, b in zip(all_cues, all_cues[1:]):
        if a["end"] > b["start"] - MIN_GAP:
            a["end"] = round(b["start"] - MIN_GAP, 3)

    out_srt = ROOT / "docs" / ep / f"{ep}.en.srt"
    out_srt.parent.mkdir(parents=True, exist_ok=True)
    out_srt.write_text(
        "\n".join(
            f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n"
            for i, c in enumerate(all_cues, 1)
        ),
        encoding="utf-8",
    )
    (ep_dir / "captions.json").write_text(json.dumps(per_scene, indent=1) + "\n", encoding="utf-8")
    print(f"{len(all_cues)} cues -> {out_srt.relative_to(ROOT)}; word timings -> {(ep_dir / 'captions.json').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
