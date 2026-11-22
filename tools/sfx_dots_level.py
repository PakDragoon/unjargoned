#!/usr/bin/env python3
"""Level-match the Dots SFX kit: every file in out/sfx-dots-original -> public/sfx-dots at the voice's loudness
(-25.5 LUFS), with the gain capped so the peak stays at or below -3 dBFS. Scene volumes then sit them under the voice."""
import re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC, DST = ROOT / "out" / "sfx-dots-original", ROOT / "public" / "sfx-dots"
TARGET, PEAK = -25.5, -3.0
for f in sorted(SRC.glob("*.mp3")):
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(f), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", log)[-1])
    pk = float(re.findall(r"Peak:\s+(-?[\d.inf]+) dBFS", log)[-1])
    gain = min(TARGET - I, PEAK - pk)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(f), "-af", f"volume={gain:.2f}dB", "-b:a", "128k", str(DST / f.name)], check=True)
    print(f"{f.name:14s} I={I:6.1f} peak={pk:6.1f} gain={gain:+6.1f} dB")
