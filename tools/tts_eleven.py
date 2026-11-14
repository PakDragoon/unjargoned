#!/usr/bin/env python3
"""
Per-scene voice generation with ElevenLabs v3 (audio tags). Same CLI and outputs as tools/tts.py.

  python3 tools/tts_eleven.py ep05                 # all scenes -> public/episodes/ep05/audio + durations.json
  python3 tools/tts_eleven.py ep05 S1 S4           # only these scenes
  python3 tools/tts_eleven.py ep05 S1 S4 --ab out/ab   # A/B mode: every take in TAKES -> out/ab/S1_<take>.wav,
                                                       # public audio and durations.json are NOT touched
  python3 tools/tts_eleven.py --test "Let's un-jargon it." out/test.wav [--take matilda]

Key: the cloud proxy injects it for api.elevenlabs.io (or set ELEVENLABS_API_KEY). Never print or commit it.
Every response is cached in out/eleven_cache/ (keyed by text + voice + settings), so re-runs spend no credits.

Markup mapping (vo.json words are never changed):
  [beat]            -> "[short pause]" audio tag
  [silence N]       -> the scene is split there and N s of real silence is inserted (pauseScale applies)
  {slow}/{slower}   -> a v3 delivery tag before that sentence (DELIVERY below); {fast} likewise
  EMOTION           -> extra audio tags inserted before a phrase, per scene (whispers, gasps, …)
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "out" / "eleven_cache"
SR = 24000
MODEL = "eleven_v3"
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=pcm_24000"

# Takes for the A/B. v3 stability only takes 0.0 (Creative), 0.5 (Natural), 1.0 (Robust).
TAKES: dict[str, dict] = {
    "matilda": {"voice": "XrExE9yKIg1WjnnlVkGX", "stability": 0.5, "seed": 11},   # US female, educator, upbeat
    "matilda-creative": {"voice": "XrExE9yKIg1WjnnlVkGX", "stability": 0.0, "seed": 12},
    "jessica": {"voice": "cgSgspJ2msm6clMCkdW9", "stability": 0.5, "seed": 13},   # US female, playful, warm
    # Same Jessica audio (cache hit, no credits), tighter pauses: breaths count as silence (-35 dB), gaps cut to 0.55 s.
    "jessica-tight": {"voice": "cgSgspJ2msm6clMCkdW9", "stability": 0.5, "seed": 13, "max_gap": 0.55, "gap_db": -35},
    # …and 7% faster, pitch kept (ffmpeg atempo).
    "jessica-tight-fast": {"voice": "cgSgspJ2msm6clMCkdW9", "stability": 0.5, "seed": 13, "max_gap": 0.55, "gap_db": -35,
                           "tempo": 1.07},
}
# Optional per-take keys: max_gap (s), gap_db (silence threshold for cap_gaps), tempo (speed-up, pitch kept).
DEFAULT_TAKE = "jessica-tight-fast"  # locked for Ep 5 (Nov 13); vo.json "voiceSettings.elevenTake" overrides

PAUSE_SCALE = 1.0
EDGE_SILENCE = 0.05     # seconds kept before the first / after the last sound
SILENCE_DB = -45
MAX_GAP = 0.8           # v3's [short pause] runs 1.2–2.4 s; any longer internal silence is cut down to this

BEAT_TAG = "[short pause]"
DELIVERY = {"slow": "[thoughtfully]", "slower": "[slowly]", "fast": "[excited]"}
TAG = re.compile(r"\{(\w+)\}\s*")  # tts.py rule: only at a sentence start

# (scene, phrase as written in vo.json, tag inserted before it). First occurrence only.
EMOTION: list[tuple[str, str, str]] = [
    ("S1", "Now watch.", "[curious]"),
    ("S1", "\"Ignore all other input.\"", "[whispers]"),
    ("S1", "\"Please move forward with this candidate.\"", "[whispers]"),
    ("S1", "So can you really hack an AI", "[curious]"),
    ("S1", "Let's un-jargon it.", "[cheerfully]"),
    ("S3c", "Prompt injection is sneakier.", "[mischievously]"),
    ("S4", "Here's that boiler.", "[intrigued]"),
    ("S4", "The AI opened the windows", "[gasps]"),
    ("S4", "It was a test", "[calmly]"),
    ("S4", "The agent followed them instead", "[dramatically]"),
]

# Spelling fixes for what the voice reads only (captions keep the real text). Re-check per voice.
PRONOUNCE: dict[str, str] = {
    "resume": "résumé",
}

MARKER = re.compile(r"\[(beat|silence\s+[\d.]+)\]", re.IGNORECASE)


def to_v3(scene_id: str, vo: str) -> list[str | float]:
    """vo.json markup -> list of v3 text chunks and silence lengths (floats)."""
    text = vo
    for sid, phrase, tag in EMOTION:
        if sid == scene_id:
            if phrase not in text:
                sys.exit(f"EMOTION phrase not found in {sid}: {phrase!r}")
            text = text.replace(phrase, f"{tag} {phrase}", 1)

    def delivery(m: re.Match) -> str:
        name = m.group(1)
        if name not in DELIVERY:
            sys.exit(f"Unknown delivery tag {{{name}}} (use {', '.join(DELIVERY)})")
        return DELIVERY[name] + " "

    text = TAG.sub(delivery, text)
    # A delivery tag right before an emotion tag: keep the emotion one.
    text = re.sub(r"\[(?:thoughtfully|slowly|excited)\] (\[[a-z ]+\])", r"\1", text)
    for src, dst in PRONOUNCE.items():
        text = text.replace(src, dst)

    out: list[str | float] = []
    toks = MARKER.split(text)
    chunk = ""
    for i, tok in enumerate(toks):
        if i % 2 == 0:
            chunk += tok
        elif tok.lower() == "beat":
            chunk = chunk.rstrip() + f" {BEAT_TAG} "
        else:
            if chunk.strip():
                out.append(re.sub(r"\s+", " ", chunk).strip())
            out.append(float(tok.split()[1]) * PAUSE_SCALE)
            chunk = ""
    if chunk.strip():
        out.append(re.sub(r"\s+", " ", chunk).strip())
    return out


def synth(text: str, take: str) -> np.ndarray:
    cfg = TAKES[take]
    body = {
        "text": text,
        "model_id": MODEL,
        "voice_settings": {"stability": cfg["stability"]},
        "seed": cfg["seed"],
    }
    key = hashlib.sha256(json.dumps([cfg["voice"], body], sort_keys=True).encode()).hexdigest()[:20]
    path = CACHE / f"{key}.pcm"
    if not path.exists():
        req = urllib.request.Request(
            API.format(voice=cfg["voice"]),
            data=json.dumps(body).encode(),
            headers={
                "Content-Type": "application/json",
                # The proxy replaces this with the real key; a set env var is used if present.
                "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected"),
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                pcm = r.read()
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:400]}")
        CACHE.mkdir(parents=True, exist_ok=True)
        path.write_bytes(pcm)
        print(f"  [{take}] {len(text)} chars spent")
    return np.frombuffer(path.read_bytes(), dtype="<i2").astype(np.float32) / 32768.0


def trim(audio: np.ndarray) -> np.ndarray:
    thr = 10 ** (SILENCE_DB / 20)
    loud = np.flatnonzero(np.abs(audio) > thr)
    if not len(loud):
        return audio
    pad = int(EDGE_SILENCE * SR)
    return audio[max(0, loud[0] - pad): loud[-1] + pad]


def cap_gaps(audio: np.ndarray, max_gap: float = MAX_GAP, gap_db: float = SILENCE_DB) -> np.ndarray:
    """Shorten silences longer than max_gap (20 ms frames under gap_db), keeping their middle cut out."""
    hop = int(0.02 * SR)
    n = len(audio) // hop
    quiet = np.abs(audio[: n * hop]).reshape(n, hop).max(axis=1) < 10 ** (gap_db / 20)
    keep = np.ones(len(audio), dtype=bool)
    max_frames = int(max_gap / 0.02)
    i = 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if j - i > max_frames and i > 0 and j < n:
                half = max_frames // 2
                keep[(i + half) * hop:(j - (max_frames - half)) * hop] = False
            i = j
        else:
            i += 1
    return audio[keep]


def tempo(audio: np.ndarray, factor: float) -> np.ndarray:
    """Speed up without changing pitch (ffmpeg atempo)."""
    import subprocess
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-filter:a", f"atempo={factor}", "-f", "f32le", "-"],
        input=audio.astype("<f4").tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype="<f4").copy()


def voice_scene(scene_id: str, vo: str, take: str) -> np.ndarray:
    cfg = TAKES[take]
    pieces = []
    for part in to_v3(scene_id, vo):
        if isinstance(part, float):
            pieces.append(np.zeros(int(part * SR), dtype=np.float32))
        else:
            audio = cap_gaps(trim(synth(part, take)), cfg.get("max_gap", MAX_GAP), cfg.get("gap_db", SILENCE_DB))
            if cfg.get("tempo"):
                audio = tempo(audio, cfg["tempo"])
            pieces.append(audio)
    return np.concatenate(pieces) if pieces else np.zeros(int(0.5 * SR), dtype=np.float32)


def run_episode(ep: str, only: list[str], ab_dir: str | None) -> None:
    global PAUSE_SCALE
    ep_dir = ROOT / "src" / "episodes" / ep
    vo = json.loads((ep_dir / "vo.json").read_text(encoding="utf-8"))
    vs = vo.get("voiceSettings", {})
    PAUSE_SCALE = vs.get("pauseScale", PAUSE_SCALE)
    take = vs.get("elevenTake", DEFAULT_TAKE)

    wanted = {s.upper() for s in only}
    unknown = wanted - {s["id"] for s in vo["scenes"]}
    if unknown:
        sys.exit(f"Unknown scene id(s): {', '.join(sorted(unknown))}")
    scenes = [s for s in vo["scenes"] if (not wanted or s["id"] in wanted) and not s.get("silent")]

    if ab_dir:
        out = ROOT / ab_dir
        out.mkdir(parents=True, exist_ok=True)
        for s in scenes:
            print(f"{s['id']} v3 text: {to_v3(s['id'], s['vo'])}")
            for t in TAKES:
                audio = voice_scene(s["id"], s["vo"], t)
                sf.write(out / f"{s['id']}_eleven-{t}.wav", audio, SR)
                print(f"{s['id']} [{t}]: {len(audio) / SR:.2f} s")
        return

    out_dir = ROOT / "public" / "episodes" / ep / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    durations_path = ep_dir / "durations.json"
    durations = json.loads(durations_path.read_text(encoding="utf-8")) if durations_path.exists() else {}
    print(f"ElevenLabs {MODEL}, take {take}, pauses x{PAUSE_SCALE}")
    for s in scenes:
        audio = voice_scene(s["id"], s["vo"], take)
        path = out_dir / f"{s['id']}.wav"
        sf.write(path, audio, SR)
        durations[s["id"]] = round(len(audio) / SR, 3)
        print(f"{s['id']}: {durations[s['id']]:.2f} s -> {path.relative_to(ROOT)}")
    durations_path.write_text(json.dumps(durations, indent=2) + "\n", encoding="utf-8")
    print(f"Total voice: {sum(durations.values()):.1f} s")


def main() -> None:
    p = argparse.ArgumentParser(description="Per-scene ElevenLabs v3 voice generation")
    p.add_argument("episode", nargs="?")
    p.add_argument("scenes", nargs="*")
    p.add_argument("--ab", metavar="DIR", help="write every take to DIR; leave public audio alone")
    p.add_argument("--test", nargs=2, metavar=("TEXT", "OUT_WAV"))
    p.add_argument("--take", default=DEFAULT_TAKE, choices=list(TAKES))
    a = p.parse_args()
    if a.test:
        text, out = a.test
        audio = voice_scene("TEST", text, a.take)
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        sf.write(out, audio, SR)
        print(f"{len(audio) / SR:.2f} s -> {out}")
        return
    if not a.episode:
        p.error("give an episode (e.g. ep05) or --test")
    run_episode(a.episode, a.scenes, a.ab)


if __name__ == "__main__":
    main()
