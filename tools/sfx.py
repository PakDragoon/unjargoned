#!/usr/bin/env python3
"""
House sound-effect kit, synthesised in code (no samples, nothing to license).

  python3 tools/sfx.py            # writes public/sfx/<name>.wav and prints the list

Each effect is short, soft and mid/high-pitched so it sits under the voice.
tools/mix.py places them from src/episodes/<ep>/sfx.json.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sfx"
SR = 48000
rng = np.random.default_rng(7)


def t(sec: float) -> np.ndarray:
    return np.arange(int(sec * SR)) / SR


def env(n: int, attack: float, decay: float) -> np.ndarray:
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(0, x - attack) / decay)


def norm(x: np.ndarray, peak: float = 0.7) -> np.ndarray:
    return (x / (np.abs(x).max() + 1e-9) * peak).astype(np.float32)


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def pop() -> np.ndarray:  # bubbly UI pop: quick downward sine chirp
    x = t(0.12)
    f = 900 * np.exp(-x * 18) + 380
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.002, 0.035))


def tick() -> np.ndarray:  # tiny click
    x = t(0.03)
    return norm(np.sin(2 * np.pi * 2600 * x) * env(len(x), 0.0005, 0.006), 0.5)


def type_() -> np.ndarray:  # keyboard tap: filtered noise click
    n = int(0.04 * SR)
    noise = rng.standard_normal(n)
    return norm((noise - lowpass(noise, 1800)) * env(n, 0.0005, 0.008), 0.45)


def whoosh() -> np.ndarray:  # airy sweep up then down
    n = int(0.45 * SR)
    noise = rng.standard_normal(n)
    x = np.arange(n) / n
    cut = 400 + 3000 * np.sin(np.pi * x)
    y = np.zeros(n)
    acc = 0.0
    for i in range(n):
        a = np.exp(-2 * np.pi * cut[i] / SR)
        acc = (1 - a) * noise[i] + a * acc
        y[i] = acc
    return norm(y * np.sin(np.pi * x) ** 1.5, 0.55)


def ding() -> np.ndarray:  # bright bell: two partials
    x = t(0.9)
    y = np.sin(2 * np.pi * 1320 * x) + 0.5 * np.sin(2 * np.pi * 1980 * x) + 0.25 * np.sin(2 * np.pi * 2640 * x)
    return norm(y * env(len(x), 0.003, 0.25), 0.5)


def buzz() -> np.ndarray:  # soft "wrong" buzz: two low square-ish tones
    x = t(0.32)
    y = np.tanh(3 * np.sin(2 * np.pi * 150 * x)) + 0.6 * np.tanh(3 * np.sin(2 * np.pi * 158 * x))
    return norm(lowpass(y, 1400) * env(len(x), 0.005, 0.12), 0.45)


def chop() -> np.ndarray:  # quick "snick": noise burst + click
    n = int(0.08 * SR)
    noise = rng.standard_normal(n)
    y = (noise - lowpass(noise, 2500)) * env(n, 0.0005, 0.015) + 0.6 * np.sin(2 * np.pi * 1200 * np.arange(n) / SR) * env(n, 0.0005, 0.01)
    return norm(y, 0.55)


def scribble() -> np.ndarray:  # pencil: band-limited noise with wobbling amplitude
    n = int(0.35 * SR)
    noise = rng.standard_normal(n)
    band = lowpass(noise, 4000) - lowpass(noise, 1500)
    x = np.arange(n) / SR
    wob = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 14 * x))
    return norm(band * wob * env(n, 0.01, 0.15), 0.35)


def thunk() -> np.ndarray:  # rubber stamp
    x = t(0.18)
    f = 220 * np.exp(-x * 25) + 90
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 0.05)
    return norm(y, 0.6)


def slide() -> np.ndarray:  # paper slide: soft noise swell
    n = int(0.3 * SR)
    noise = rng.standard_normal(n)
    x = np.arange(n) / n
    return norm(lowpass(noise, 2500) * np.sin(np.pi * x) ** 2, 0.3)


def sting() -> np.ndarray:  # logo sting: rising three-note chime
    parts = []
    for f in (880, 1108.7, 1318.5):
        x = t(0.16)
        parts.append(np.sin(2 * np.pi * f * x) * env(len(x), 0.002, 0.12))
    tail = t(0.6)
    last = (np.sin(2 * np.pi * 1760 * tail) + 0.4 * np.sin(2 * np.pi * 2637 * tail)) * env(len(tail), 0.003, 0.22)
    return norm(np.concatenate(parts + [last]), 0.5)


KIT = {
    "pop": pop, "tick": tick, "type": type_, "whoosh": whoosh, "ding": ding, "buzz": buzz,
    "chop": chop, "scribble": scribble, "thunk": thunk, "slide": slide, "sting": sting,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in KIT.items():
        sf.write(OUT / f"{name}.wav", fn(), SR)
    print("sfx:", ", ".join(KIT))


if __name__ == "__main__":
    main()
