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

import difflib
import json
import math
import re
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
MERGE = [("chat", "GPT"), ("un", "-jargon")]
FIX = {"Chat GPT": "ChatGPT", "chatGPT": "ChatGPT", "Chatgpt": "ChatGPT",
       "wanna": "want to"}  # Ep 5: v3 says "want to" casually; captions keep the script
# "Once upon a…" is voiced as "uh" (tts.py PRONOUNCE), which Whisper hears as "I." / "A.": restore the script's text.
ONCE_UPON_TAIL = {"I.": "a…", "A.": "a…", "uh.": "a…", "Uh.": "a…", "I": "a…", "A": "a…"}


def clean_words(words: list[dict]) -> list[dict]:
    out: list[dict] = []
    for w in words:
        if out:
            prev = out[-1]
            # Ep 5: Whisper splits "200,000" into "200" + ",000"; join them back into one word.
            if re.match(r"^,\d", w["word"]) and re.search(r"\d$", prev["word"]):
                prev["word"] += w["word"]
                prev["end"] = w["end"]
                continue
            for first, second in MERGE:
                if prev["word"].lower() == first and w["word"].startswith(second):
                    prev["word"] = "ChatGPT" + w["word"][len(second):] if second == "GPT" else prev["word"] + w["word"]
                    prev["end"] = w["end"]
                    break
            else:
                out.append(dict(w))
            continue
        out.append(dict(w))
    for i, w in enumerate(out):
        w["word"] = FIX.get(w["word"], w["word"])
        if i + 1 < len(out) and w["word"].lower() == "once" and out[i + 1]["word"].lower() == "upon":
            w["word"] = "Once"
        if i > 0 and out[i - 1]["word"].lower() == "upon":
            w["word"] = ONCE_UPON_TAIL.get(w["word"], w["word"])
    return out


SCRIPT_MARKUP = re.compile(r"\[[^\]]*\]|\{\w+\}")


def _norm(word: str) -> str:
    return re.sub(r"[^a-z0-9']", "", word.lower().replace("’", "'"))


def match_script(words: list[dict], vo_text: str) -> list[dict]:
    """Whisper mishears words in context ("all rung", "the liar", "it's" for "its"). The script is the truth:
    where Whisper and vo.json differ one word for one word, take the script's word (Whisper's timing and
    end punctuation stay). Longer differences (e.g. "2023" for "twenty twenty-three") keep Whisper's text."""
    # Quote marks stay on the script's words (so '"Buy".' shows as written); _norm ignores them when matching.
    script = SCRIPT_MARKUP.sub(" ", vo_text).split()
    a, b = [_norm(w["word"]) for w in words], [_norm(w) for w in script]
    ops = difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes()
    # Ep 5: Whisper sometimes invents an outro after the last word ("Thanks for watching. See you next time.",
    # zero-length words in the final 0.2 s). Words heard after the script's last word are dropped.
    if ops and ops[-1][0] == "delete" and ops[-1][2] == len(a):
        del words[ops[-1][1]:]
        ops = ops[:-1]
    for op, i1, i2, j1, j2 in ops:
        if op in ("replace", "equal") and i2 - i1 == j2 - j1:  # equal: same words, take the script's punctuation
            for i, j in zip(range(i1, i2), range(j1, j2)):
                if op == "equal":
                    words[i]["word"] = script[j]
                    continue
                tail = re.search(r"[.,!?…:;]*$", words[i]["word"]).group(0)
                words[i]["word"] = re.sub(r"[.,!?…:;]+$", "", script[j]) + tail
    return words


# Numbers are voiced as words (vo.json) but shown as figures on screen and in captions.
# Each entry: the spoken words (normalised) -> the caption text; the joined word keeps the last word's punctuation.
SCREEN_TEXT = [
    (["thirtyone", "dollars"], "$31"),
    (["thirtyone"], "31"),  # Ep 5: "thirty-one real companies"
    (["two", "hundred", "thousand"], "200,000"),  # Ep 5
]


def screen_text(words: list[dict]) -> list[dict]:
    out: list[dict] = []
    i = 0
    while i < len(words):
        for spoken, shown in SCREEN_TEXT:
            n = len(spoken)
            if [_norm(w["word"]) for w in words[i:i + n]] == spoken:
                tail = re.search(r"[.,!?…:;]*$", words[i + n - 1]["word"]).group(0)
                out.append({"word": shown + tail, "start": words[i]["start"], "end": words[i + n - 1]["end"]})
                i += n
                break
        else:
            out.append(words[i])
            i += 1
    return out


def group_words(words: list[dict]) -> list[dict]:
    cues: list[dict] = []
    cur: list[dict] = []
    for w in words:
        text = " ".join(x["word"] for x in cur + [w])
        too_long = cur and (len(text) > MAX_CHARS or w["end"] - cur[0]["start"] > MAX_SECONDS)
        if too_long and len(cur) > 1 and cur[-1]["word"] == "Once":  # keep "Once upon a" on one cue
            cues.append(cur[:-1])
            cur = cur[-1:]
        elif too_long:
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
        if scene.get("silent"):
            offset += math.ceil((scene["estSeconds"] + scene.get("tailSeconds", TAIL_SECONDS)) * FPS) / FPS
            continue
        if sid not in durations:
            sys.exit(f"{sid} has no voice yet: run tools/tts.py {ep} first")
        segments, _ = model.transcribe(load_16k(audio_dir / f"{sid}.wav"), word_timestamps=True, language="en")
        words = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            for seg in segments for w in (seg.words or []) if w.word.strip()
        ]
        words = screen_text(match_script(clean_words(words), scene["vo"]))
        per_scene[sid] = words
        for cue in group_words(words):
            all_cues.append({"start": cue["start"] + offset, "end": cue["end"] + offset, "text": cue["text"]})
        end_screen = scene.get("endScreenSeconds", 0)
        frames = math.ceil((durations[sid] + scene.get("tailSeconds", TAIL_SECONDS) + end_screen) * FPS)
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
