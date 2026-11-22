#!/usr/bin/env python3
"""Subtitles for the Dots long-form from the ElevenLabs word timestamps (src/dots/timing.json).
Timeline mirrors src/dots/Root.tsx: S1..S4, Subscribe sting (300 frames, voice at frame 176), S5..S7.
  python3 tools/srt_dots.py  ->  docs/dots/Dots_LongForm.srt
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 60
T = json.loads((ROOT / "src/dots/timing.json").read_text())
ORDER = ["long_scene1", "long_scene2", "long_scene3", "long_scene4", "STING", "long_scene5", "long_scene6", "long_scene7"]
STING_FRAMES, STING_VOICE = 300, 176
MAX_CHARS, MAX_DUR, GAP = 42, 4.0, 0.6
EMPHASIS = {"ACTUALLY", "OWN", "CAN'T", "ONE", "ONLY", "WITHOUT"}  # spoken stress, written normally

def clean(w: str) -> str:
    core = re.sub(r"[^A-Za-z']", "", w)
    return w.replace(core, core.lower()) if core in EMPHASIS else w

import importlib.util
_spec = importlib.util.spec_from_file_location("tts_dots", ROOT / "tools/tts_dots.py")
_tts = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_tts)

def with_dashes(n: int, ws: list) -> list:
    """Put back the script's em dashes (the aligner drops them): 'Dots' -> 'Dots' —"""
    toks = re.sub(r"\[[^\]]*\]", " ", _tts.SCRIPTS[n]).split()
    out, k = [list(w) for w in ws], -1
    for tok in toks:
        if tok == "—":
            out[k][0] += " —"
        else:
            k += 1
    assert k + 1 == len(out), f"scene {n}: script/alignment word count mismatch"
    return out

NOBREAK = {"GPT-6", "ChatGPT", "Auto-Review"}  # never end a line on these
words, t0 = [], 0.0
for k in ORDER:
    if k == "STING":
        for w, s, e in T["long_subscribe"]["words"]:
            words.append((w, t0 + STING_VOICE / FPS + s, t0 + STING_VOICE / FPS + e))
        t0 += STING_FRAMES / FPS
        continue
    for w, s, e in with_dashes(int(k[-1]), T[k]["words"]):
        words.append((clean(w), t0 + s, t0 + e))
    t0 += T[k]["frames"] / FPS

# 1) sentences (end on . ? ! : or a long pause), 2) each sentence split into evenly balanced lines <= MAX_CHARS
sentences, cur = [], []
for w, s, e in words:
    if cur and s - cur[-1][2] > GAP:
        sentences.append(cur); cur = []
    cur.append((w, s, e))
    if re.search(r"[.?!:]\"?$", w):
        sentences.append(cur); cur = []
if cur:
    sentences.append(cur)

HARD_MAX = 46
cues = []
for sen in sentences:
    lens = [len(x[0]) + 1 for x in sen]
    i = 0
    while i < len(sen):
        rest = sum(lens[i:])
        n = max(-(-rest // MAX_CHARS), -(-int((sen[-1][2] - sen[i][1]) * 10) // int(MAX_DUR * 10)))
        if n <= 1:
            cues.append(sen[i:]); break
        target = rest / n
        best, best_cost, size = None, 1e9, 0
        for j in range(i, len(sen) - 2):  # leave at least 2 words for the next line
            size += lens[j]
            if size > HARD_MAX:
                break
            cost = abs(size - target) - (14 if sen[j][0].endswith((",", "—")) else 0) + (99 if sen[j][0] in NOBREAK else 0)
            if cost < best_cost:
                best, best_cost = j, cost
        if best is None:
            best = len(sen) - 1
        cues.append(sen[i:best + 1]); i = best + 1

def ts(x: float) -> str:
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

out = []
for i, c in enumerate(cues):
    start = c[0][1]
    end = c[-1][2] + 0.25
    if i + 1 < len(cues):
        end = min(end, cues[i + 1][0][1] - 0.02)  # never overlap the next cue
    end = max(end, start + 0.7) if i + 1 == len(cues) or cues[i + 1][0][1] - 0.02 >= start + 0.7 else end
    out.append(f"{i + 1}\n{ts(start)} --> {ts(end)}\n{' '.join(x[0] for x in c)}\n")
dst = ROOT / "docs/dots/Dots_LongForm.srt"
dst.parent.mkdir(parents=True, exist_ok=True)
dst.write_text("\n".join(out), encoding="utf-8")
print(f"{len(cues)} cues, last ends {ts(end)} -> {dst.relative_to(ROOT)}")
