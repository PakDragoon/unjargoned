#!/usr/bin/env python3
"""Synthesised foley kit for the ChatGPT Dots Short -> public/audio/sfx/*.wav (44.1 kHz mono)."""
from pathlib import Path
import numpy as np, soundfile as sf
SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "audio" / "sfx"
rng = np.random.default_rng(7)
t = lambda d: np.arange(int(SR * d)) / SR
def env(d, a=0.003, k=10.0):
    x = t(d); e = np.exp(-k * x); e[: int(SR * a)] *= np.linspace(0, 1, int(SR * a)); return e
def lp(x, a):  # one-pole low-pass, a in (0,1)
    y = np.zeros_like(x); s = 0.0; a = np.broadcast_to(a, x.shape)
    for i, v in enumerate(x): s += a[i] * (v - s); y[i] = s
    return y
def hp(x, a): return x - lp(x, a)
def noise(d): return rng.uniform(-1, 1, int(SR * d))
def norm(x, peak=0.9): return x / (np.abs(x).max() + 1e-9) * peak
def sweep(f0, f1, d): x = t(d); f = np.geomspace(f0, f1, len(x)); return np.sin(2 * np.pi * np.cumsum(f) / SR)

K = {}
d = 0.45; K["slam"] = norm(sweep(140, 45, d) * env(d, k=12) * 1.0 + lp(noise(d), 0.25) * env(d, k=40) * 0.8)
d = 0.3;  K["thud"] = norm(sweep(110, 55, d) * env(d, k=18), 0.7)
d = 1.6;  x = t(d); K["chime"] = norm(sum(np.sin(2*np.pi*f*x) * np.exp(-x*k) * g for f, k, g in
            [(1318.5, 2.2, 1), (1975.5, 3.0, .5), (2637, 4.5, .3), (3951, 6, .15)]) * env(d, 0.002, 0.0), 0.6)
d = 0.35; K["stamp"] = norm(sweep(180, 60, d) * env(d, k=16) + lp(noise(d), 0.4) * env(d, k=60) * 0.9, 0.85)
d = 0.05; K["click"] = norm(hp(noise(d), 0.3) * env(d, 0.0005, 120) + np.sin(2*np.pi*2400*t(d)) * env(d, 0.0005, 160) * .4, 0.5)
d = 0.06; K["tick"] = norm(hp(noise(d), 0.5) * env(d, 0.0003, 160) + np.sin(2*np.pi*3200*t(d)) * env(d, 0.0003, 120) * .6, 0.4)
d = 0.18; K["snap"] = norm(hp(noise(d), 0.2) * env(d, 0.0005, 45) + sweep(900, 200, d) * env(d, k=40) * .5, 0.8)
d = 0.5;  x = t(d); K["paper"] = norm(lp(hp(noise(d), 0.15), 0.5) * np.sin(np.pi * x / d) ** 2, 0.45)
d = 0.22; K["slap"] = norm(hp(noise(d), 0.12) * env(d, 0.0005, 30) + sweep(220, 90, d) * env(d, k=30) * .7, 0.85)
d = 1.6;  x = t(d); K["roll"] = norm(lp(noise(d), 0.05) * (0.6 + 0.4 * np.sin(2*np.pi*11*x)) * np.minimum(1, x*6) * np.minimum(1, (d-x)*4), 0.5)
d = 1.4;  x = t(d); K["vault"] = norm(sweep(90, 32, d) * env(d, 0.001, 4.5) * 1.2 + lp(noise(d), 0.3) * env(d, 0.001, 18)
            + np.sin(2*np.pi*310*x) * np.exp(-x*5) * .25 + np.sin(2*np.pi*487*x) * np.exp(-x*7) * .18, 0.95)
d = 0.9;  x = t(d); K["ding"] = norm((np.sin(2*np.pi*1760*x) * np.exp(-x*5) + np.sin(2*np.pi*2637*x) * np.exp(-x*7) * .5
            + np.sin(2*np.pi*1318.5*np.maximum(0, x-0.11)) * np.exp(-np.maximum(0, x-0.11)*5) * (x > 0.11)) , 0.6)
d = 0.7;  x = t(d); K["whoosh"] = norm(lp(noise(d), 0.12 + 0.3 * np.sin(np.pi*x/d)) * np.sin(np.pi*x/d) ** 3, 0.6)
d = 0.14; K["pop"] = norm(sweep(380, 900, d) * env(d, 0.001, 30), 0.5)
d = 0.4;  K["hop"] = norm(sweep(300, 700, d * .5) * env(d * .5, 0.002, 20), 0.35)
OUT.mkdir(parents=True, exist_ok=True)
for k, v in K.items():
    sf.write(OUT / f"{k}.wav", v.astype(np.float32), SR)
print("wrote", ", ".join(K))
