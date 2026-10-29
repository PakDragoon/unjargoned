#!/usr/bin/env python3
"""
Episode audio mix: voice + looped music bed with ducking and planned silences, normalised to the
house loudness. Runs after (or alongside) the video render; muxing swaps the render's audio for this mix,
so a mix change never needs a new video render.

  python3 tools/mix.py ep02                          # -> out/ep02-mix.wav
  python3 tools/mix.py ep02 --mux out/ep02-full-video.mp4 out/ep02-full.mp4

Reads   src/episodes/<ep>/vo.json, durations.json, captions.json (word timings → when the voice speaks), sfx.json
        public/episodes/<ep>/audio/S*.wav, public/episodes/<ep>/music/<MUSIC>
Music levels (Master Handoff): bed at about −26 LUFS under the voice, −17 in gaps, −13 on the end screen.
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
TAIL_SECONDS = 0.4  # must match timeline.ts

# Per-episode music plan. LOOP: the track repeats a section exactly every `period` seconds from `from` on,
# so extra copies of it can be spliced in seamlessly. `start` trims the intro so the song's own ending
# lands on the end screen.
MUSIC = {
    "ep02": {
        "file": "fade.mp3",
        "start": "auto",  # chosen so the song's own ending lands exactly on the video's end
        "loop_from": 23.0,
        "period": 48.0,
        "extra_loops": 4,
        # Planned silences: (scene, after word index text, before word text) → music out between them.
        "silences": [("S1", "a…", "You")],  # S6 pause before "What sounds right" removed after G4 review
        # Short dips (scene, word, seconds after that word's end, length).
        "dips": [],  # (scene, word, seconds after that word ends, length); S7 "it's next" dip removed after G4 review
    }
}

MUSIC_LUFS = -13.0  # bed is normalised to this before gain changes (so 0 dB = end-screen level)
UNDER_VOICE_DB = -13.0  # → about −26 LUFS
GAP_DB = -4.0  # → about −17 LUFS
MUTE_DB = -70.0
TARGET_LUFS = -13.0
TRUE_PEAK = -1.0


def ffmpeg(*args: str) -> str:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-y", *args], capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-2000:])
    return r.stderr


def decode(path: Path, channels: int) -> np.ndarray:
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        ffmpeg("-i", str(path), "-ac", str(channels), "-ar", str(SR), "-c:a", "pcm_f32le", tmp.name)
        data, _ = sf.read(tmp.name, dtype="float32", always_2d=True)
    return data


def lufs(x: np.ndarray) -> float:
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        sf.write(tmp.name, x, SR, subtype="FLOAT")
        err = ffmpeg("-nostats", "-i", tmp.name, "-af", "ebur128", "-f", "null", "-")
    line = [l for l in err.splitlines() if l.strip().startswith("I:")][-1]
    return float(line.split()[1])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--mux", nargs=2, metavar=("VIDEO_IN", "VIDEO_OUT"))
    args = ap.parse_args()
    ep = args.episode
    plan = MUSIC[ep]
    ep_dir = ROOT / "src" / "episodes" / ep
    vo = json.loads((ep_dir / "vo.json").read_text())
    durations = json.loads((ep_dir / "durations.json").read_text())
    words = json.loads((ep_dir / "captions.json").read_text())

    # Scene offsets exactly as Remotion's <Series> places them.
    offsets: dict[str, float] = {}
    t = 0.0
    for s in vo["scenes"]:
        offsets[s["id"]] = t
        seconds = durations[s["id"]] if not s.get("silent") else s["estSeconds"]
        t += math.ceil((seconds + TAIL_SECONDS + s.get("endScreenSeconds", 0)) * FPS) / FPS
    total = t
    n = int(round(total * SR))

    # Voice: every scene WAV at its offset.
    voice = np.zeros(n, dtype=np.float32)
    silent = {s["id"] for s in vo["scenes"] if s.get("silent")}
    for sid, off in offsets.items():
        if sid in silent:
            continue
        v = decode(ROOT / "public" / "episodes" / ep / "audio" / f"{sid}.wav", 1)[:, 0]
        i = int(round(off * SR))
        voice[i : i + len(v)] += v[: n - i]

    # Music bed: start, then splice extra copies of the repeating section, then the track to its end.
    m = decode(ROOT / "public" / "episodes" / ep / "music" / plan["file"], 2)
    lf = int(plan["loop_from"] * SR)
    per = int(round(plan["period"] * SR))
    if plan["start"] == "auto":
        s0 = (lf + per) - (n - plan["extra_loops"] * per - (len(m) - (lf + per)))
        if not 0 <= s0 < lf + per:
            sys.exit(f"music plan doesn't fit {total:.1f} s: change extra_loops")
    else:
        s0 = int(plan["start"] * SR)
    print(f"music starts {s0 / SR:.2f} s into the track")
    parts = [m[s0 : lf + per]] + [m[lf : lf + per]] * plan["extra_loops"] + [m[lf + per :]]
    bed = np.concatenate(parts)
    if len(bed) < n:
        bed = np.concatenate([bed, np.zeros((n - len(bed), 2), dtype=np.float32)])
    bed = bed[:n]
    # Gentle speech-band dip so the voice sits on top.
    with tempfile.TemporaryDirectory() as d:
        sf.write(f"{d}/a.wav", bed, SR, subtype="FLOAT")
        ffmpeg("-i", f"{d}/a.wav", "-af", "equalizer=f=2500:t=o:w=1.5:g=-3", "-c:a", "pcm_f32le", f"{d}/b.wav")
        bed, _ = sf.read(f"{d}/b.wav", dtype="float32", always_2d=True)
    bed *= 10 ** ((MUSIC_LUFS - lufs(bed)) / 20)

    # Gain curve (dB) at 100 Hz: gaps, under the voice, end screen, silences, dips.
    hz = 100
    g = np.full(int(total * hz) + 1, GAP_DB)
    for sid, ws in words.items():
        off = offsets[sid]
        for w in ws:
            a, b = int((off + w["start"] - 0.15) * hz), int((off + w["end"] + 0.35) * hz)
            g[max(0, a) : b] = UNDER_VOICE_DB
    last = vo["scenes"][-1]
    end_screen = offsets[last["id"]] + durations[last["id"]] + TAIL_SECONDS
    g[int(end_screen * hz) :] = 0.0

    def word_end(sid: str, text: str) -> float:
        return offsets[sid] + next(w["end"] for w in words[sid] if w["word"] == text)

    def word_start_after(sid: str, text: str, after: float) -> float:
        return offsets[sid] + next(w["start"] for w in words[sid] if w["word"] == text and offsets[sid] + w["start"] > after)

    for sid, after, before in plan["silences"]:
        a = word_end(sid, after)
        b = word_start_after(sid, before, a)
        g[int((a + 0.05) * hz) : int((b - 0.05) * hz)] = MUTE_DB
    # Gag scenes: the music keeps going but muffled ("music from the next room"), at gap level.
    scene_ids = [s["id"] for s in vo["scenes"]]
    gags: list[tuple[float, float]] = []
    for sid in silent:
        a = offsets[sid]
        nxt = scene_ids.index(sid) + 1
        b = offsets[scene_ids[nxt]] if nxt < len(scene_ids) else total
        g[int(a * hz) : int(b * hz)] = GAP_DB
        gags.append((a, b))
    for sid, w, delay, length in plan["dips"]:
        a = word_end(sid, w) + delay
        g[int(a * hz) : int((a + length) * hz)] = -24.0

    # Smooth: fast down (0.12 s), slower up (0.45 s).
    out = np.empty_like(g)
    cur = g[0]
    down, up = 1 - math.exp(-1 / (0.12 * hz)), 1 - math.exp(-1 / (0.45 * hz))
    for i, x in enumerate(g):
        cur += (x - cur) * (down if x < cur else up)
        out[i] = cur
    if gags:
        with tempfile.TemporaryDirectory() as d:
            sf.write(f"{d}/a.wav", bed, SR, subtype="FLOAT")
            ffmpeg("-i", f"{d}/a.wav", "-af", "lowpass=f=450,lowpass=f=450,volume=2dB", "-c:a", "pcm_f32le", f"{d}/m.wav")
            muffled, _ = sf.read(f"{d}/m.wav", dtype="float32", always_2d=True)
        w = np.zeros(n, dtype=np.float32)
        fade = int(0.04 * SR)
        for a, b in gags:
            i, j = int(a * SR), int(b * SR)
            w[i:j] = 1
            w[i : i + fade] = np.linspace(0, 1, fade)
            w[j - fade : j] = np.linspace(1, 0, fade)
        bed = bed * (1 - w[:, None]) + muffled[:n] * w[:, None]
    gain = 10 ** (np.interp(np.arange(n) / SR, np.arange(len(out)) / hz, out) / 20)
    bed *= gain[:, None]

    # Fade the very start and end.
    f = int(1.0 * SR)
    bed[:f] *= np.linspace(0, 1, f)[:, None]
    bed[-f:] *= np.linspace(1, 0, f)[:, None]

    # Voice to about −16 LUFS before mixing, then the whole mix to the house loudness.
    voice *= 10 ** ((-16.0 - lufs(voice[:, None])) / 20)
    # Sound effects (tools/sfx.py kit) at their cue times.
    sfx = np.zeros(n, dtype=np.float32)
    sfx_path = ep_dir / "sfx.json"
    if sfx_path.exists():
        plan_sfx = json.loads(sfx_path.read_text())
        kit: dict[str, np.ndarray] = {}
        for sid, cues in plan_sfx["cues"].items():
            for at, name in cues:
                if name not in kit:
                    kit[name] = decode(ROOT / "public" / "sfx" / f"{name}.wav", 1)[:, 0]
                clip = kit[name]
                i = int(round((offsets[sid] + at) * SR))
                j = min(n, i + len(clip))
                sfx[i:j] += clip[: j - i]
        sfx *= 10 ** (plan_sfx.get("gain_db", -8) / 20)
    mix = bed + voice[:, None] + sfx[:, None]
    out_dir = ROOT / "out"
    out_dir.mkdir(exist_ok=True)
    raw = out_dir / f"{ep}-mix-raw.wav"
    final = out_dir / f"{ep}-mix.wav"
    sf.write(raw, mix, SR, subtype="FLOAT")
    # Two-pass loudnorm (linear) to −13 LUFS, −1 dBTP.
    err = ffmpeg("-i", str(raw), "-af", f"loudnorm=I={TARGET_LUFS}:TP={TRUE_PEAK}:LRA=11:print_format=json", "-f", "null", "-")
    js = json.loads(err[err.rindex("{") : err.rindex("}") + 1])
    ffmpeg(
        "-i", str(raw), "-af",
        f"loudnorm=I={TARGET_LUFS}:TP={TRUE_PEAK}:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}"
        f":measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true",
        "-ar", str(SR), "-c:a", "pcm_s16le", str(final),
    )
    raw.unlink()
    print(f"mix {total:.2f} s -> {final.relative_to(ROOT)} ({lufs(sf.read(final, dtype='float32', always_2d=True)[0]):.1f} LUFS)")

    if args.mux:
        vin, vout = args.mux
        ffmpeg("-i", vin, "-i", str(final), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", vout)
        print(f"muxed -> {vout}")


if __name__ == "__main__":
    main()
