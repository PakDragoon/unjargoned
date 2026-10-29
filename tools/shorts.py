#!/usr/bin/env python3
"""
Shorts audio: cut each Short's clips (src/episodes/<ep>/shorts.json) out of the episode mix
(out/<ep>-mix.wav from tools/mix.py), so voice, music and SFX match the long video. Then normalise to
−14 LUFS and mux onto the muted Short render.

  npx remotion render Ep02-Short1 out/short1-video.mp4 --muted
  python3 tools/shorts.py ep02 Short1           # -> out/Unjargoned_Ep2_Short1.mp4
"""
from __future__ import annotations

import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
TAIL_SECONDS = 0.4  # must match timeline.ts
FADE = 0.03  # seconds of crossfade at each cut


def offsets(ep: str) -> dict[str, float]:
    ep_dir = ROOT / "src" / "episodes" / ep
    vo = json.loads((ep_dir / "vo.json").read_text())
    durations = json.loads((ep_dir / "durations.json").read_text())
    out, t = {}, 0.0
    for s in vo["scenes"]:
        out[s["id"]] = t
        seconds = s["estSeconds"] if s.get("silent") else durations[s["id"]]
        t += math.ceil((seconds + TAIL_SECONDS + s.get("endScreenSeconds", 0)) * FPS) / FPS
    return out


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit("usage: python3 tools/shorts.py ep02 Short1")
    ep, sid = sys.argv[1:]
    spec = json.loads((ROOT / "src" / "episodes" / ep / "shorts.json").read_text())[sid]
    mix, sr = sf.read(ROOT / "out" / f"{ep}-mix.wav", dtype="float32", always_2d=True)
    off = offsets(ep)
    parts = []
    for c in spec["clips"]:
        n = math.ceil((c["to"] - c["from"]) * FPS) / FPS  # same length as the video clip
        a = int(round((off[c["scene"]] + c["from"]) * sr))
        seg = mix[a : a + int(round(n * sr))].copy()
        f = int(FADE * sr)
        seg[:f] *= np.linspace(0, 1, f)[:, None]
        seg[-f:] *= np.linspace(1, 0, f)[:, None]
        parts.append(seg)
    audio = np.concatenate(parts)
    num = sid.replace("Short", "")
    video = ROOT / "out" / f"short{num}-video.mp4"
    final = ROOT / "out" / f"Unjargoned_{ep.replace('ep0', 'Ep')}_{sid}.mp4"
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        sf.write(tmp.name, audio, sr, subtype="FLOAT")
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", tmp.name, "-map", "0:v", "-map", "1:a",
             "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
             "-shortest", str(final)],
            check=True,
        )
    print(f"{sid}: {len(audio) / sr:.1f} s -> {final.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
