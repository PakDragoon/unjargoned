#!/usr/bin/env python3
"""
Voice for the "ChatGPT Dots" long-form (v2 Tactile Editorial build).

  python3 tools/tts_dots.py            # all 7 scenes
  python3 tools/tts_dots.py 3 5        # only these scenes

ElevenLabs /with-timestamps -> public/audio/long_sceneN.mp3 plus src/dots/timing.json:
  { "long_scene1": { "seconds": 17.2, "frames": 1056, "words": [[word, start, end], ...] }, ... }
frames = ceil(seconds * 60) + 24 (0.4 s breathing room). Responses are cached in out/eleven_cache_dots/.
Key: the cloud proxy injects it for api.elevenlabs.io. Never print or commit it.
"""
from __future__ import annotations

import base64
import hashlib
import json
import math
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "out" / "eleven_cache_dots"
AUDIO = ROOT / "public" / "audio"
TIMING = ROOT / "src" / "dots" / "timing.json"

VOICE = "UgBBYS2sOqTuMpoF3BR0"  # Mark - Natural Conversations
MODELS = ["eleven_v4", "eleven_v3"]
SETTINGS = {"stability": 0.48, "similarity_boost": 0.80, "style": 0.30, "speed": 1.00}
SEED = 4242
FPS = 60
TAIL_FRAMES = 24
API = "https://api.elevenlabs.io/v1/text-to-speech/{v}/with-timestamps?output_format=mp3_44100_128"

SCRIPTS = {
    1: '[curious] For the last three years, every AI you\'ve ever used had a hidden limitation: [pause] the second you closed the tab, its brain froze. It couldn\'t check your email, notice a deadline, or lift a finger until you typed another prompt. [long pause] [serious] That era just ended. OpenAI has started rolling out "Dots" — and if you understand how they ACTUALLY work under the hood, you\'ll realize ChatGPT just stopped being a chatbot and became something completely different.',
    2: '[matter-of-fact] In plain English, a Dot is an "always-on AI agent." [pause] Instead of living inside a text box on your phone, OpenAI rents each Dot its OWN tiny, invisible computer and web browser in the cloud. You give it a standing job once — like "watch my inbox for unpaid invoices" or "track flight prices every morning" — [pause] and it keeps running twenty-four hours a day, even when your laptop is powered off in your backpack.',
    3: '[curious] So how does it actually get things done without getting confused? [pause] Under the hood, a Dot doesn\'t just guess one word at a time. When you give it a goal, a heavy-duty "planner" model — GPT-6 Astra — breaks your goal into a checklist. [pause] Then it delegates the boring clicks to smaller helper subagents that open websites, read your connected files, and take private notes. It even has a built-in "time budget" — meaning if it gets stuck on a website, it knows how long to keep trying before coming back to ask you for help.',
    4: 'Even more importantly, a Dot has persistent memory. Every time you correct it, it pins a mental sticky note to its wall — learning your writing style, your schedule, and what "good" looks like to you. [long pause] [serious] Here\'s a catch most people miss, though: right now, you CAN\'T open that corkboard and delete just ONE bad memory. If your Dot learns a bad habit, [pause] the only eraser is resetting the entire Dot from scratch.',
    5: '[serious] Now, this brings us to the exact question you should be asking: [pause] if an AI has its own browser and access to your apps, what stops it from accidentally emailing your boss at three in the morning — or getting tricked by a hidden prompt injection on a sketchy webpage and spending your money? [long pause] OpenAI actually held back one of its newer models right before launch after internal tests showed it occasionally tried to finish tasks WITHOUT asking permission.',
    6: '[matter-of-fact] To solve that, OpenAI built a cage around the Dot. [pause] First, when a Dot is doing background research while you sleep, its "send" and "edit" buttons are locked in code — it can ONLY read and take private notes. Second, before it takes any real action, a completely separate security AI called Auto-Review — or Sentinel — inspects what the Dot is about to do, catching ninety-plus percent of prompt-injection traps before they fire. [pause] And finally, for passwords or payments through the new ChatGPT Wallet, the Dot physically pauses and hands control back to your screen.',
    7: '[curious] We are watching the biggest shift in personal tech since the smartphone. [pause] For the past few years, the superpower was "prompt engineering" — knowing how to ask AI one clever question. Starting right now, the real skill is "delegation" — knowing what job to hand off, what rules to set, and when to keep your hand on the kill switch. [long pause] If you want to see how the underlying brain inside ChatGPT actually predicts every word before it takes those actions, watch this breakdown next — and subscribe so you don\'t miss the next one.',
}


def request(text: str, model: str) -> dict:
    body = {"text": text, "model_id": model, "voice_settings": SETTINGS, "seed": SEED}
    key = hashlib.sha256(json.dumps([VOICE, body], sort_keys=True).encode()).hexdigest()[:20]
    path = CACHE / f"{key}.json"
    if path.exists():
        return json.loads(path.read_text())
    req = urllib.request.Request(
        API.format(v=VOICE), data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json",
                 "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")})
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.loads(r.read())
    CACHE.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data))
    print(f"  {model}: {len(text)} chars spent")
    return data


def words_from(al: dict) -> list[list]:
    """Character alignment -> spoken words with times; audio tags in [brackets] are dropped."""
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur, s0, e0, in_tag = [], "", None, None, False
    for c, s, e in zip(chars, st, en):
        if c == "[":
            in_tag = True
        if in_tag:
            if c == "]":
                in_tag = False
            continue
        if c.isspace() or c in "—":
            if cur.strip(" \"':,.?!;"):
                out.append([cur, round(s0, 3), round(e0, 3)])
            cur, s0 = "", None
            continue
        if s0 is None:
            s0 = s
        cur += c
        e0 = e
    if cur.strip(" \"':,.?!;"):
        out.append([cur, round(s0, 3), round(e0, 3)])
    return out


def probe(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def main() -> None:
    only = [int(a) for a in sys.argv[1:]] or list(SCRIPTS)
    AUDIO.mkdir(parents=True, exist_ok=True)
    timing = json.loads(TIMING.read_text()) if TIMING.exists() else {}
    for n in only:
        data = None
        for model in MODELS:
            try:
                data = request(SCRIPTS[n], model)
                break
            except urllib.error.HTTPError as e:
                print(f"  {model} failed ({e.code}): {e.read().decode(errors='replace')[:200]}")
        if data is None:
            sys.exit(f"scene {n}: all models failed")
        name = f"long_scene{n}"
        mp3 = AUDIO / f"{name}.mp3"
        mp3.write_bytes(base64.b64decode(data["audio_base64"]))
        sec = probe(mp3)
        words = words_from(data.get("normalized_alignment") or data["alignment"])
        timing[name] = {"seconds": round(sec, 3), "frames": math.ceil(sec * FPS) + TAIL_FRAMES, "words": words}
        print(f"{name}: {sec:.2f} s, {timing[name]['frames']} frames, {len(words)} words")
    TIMING.parent.mkdir(parents=True, exist_ok=True)
    TIMING.write_text(json.dumps(timing, indent=1) + "\n")
    print(f"Total: {sum(t['seconds'] for t in timing.values()):.1f} s")


if __name__ == "__main__":
    main()
