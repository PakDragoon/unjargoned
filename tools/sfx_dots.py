#!/usr/bin/env python3
"""SFX for the Dots long-form via ElevenLabs sound generation -> public/sfx-dots/<name>.mp3 (cached; re-runs are free).
  python3 tools/sfx_dots.py            # all missing
  python3 tools/sfx_dots.py --force bell
"""
import json, os, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sfx-dots"
SFX = {
    "typing": ("fast light laptop keyboard typing, a short phrase, dry close mic", 1.6),
    "click": ("single crisp computer mouse click", 0.5),
    "freeze": ("ice freezing crackle, quick crystalline creak spreading", 1.4),
    "bounce": ("soft cartoon thud bouncing off glass, small boing", 0.6),
    "shatter": ("glass ice block shattering, bright, short", 1.2),
    "chord": ("warm soft synth pad chord swell, hopeful, major", 2.5),
    "inkstrike": ("thick marker pen striking quickly across paper", 0.6),
    "jingle": ("small brass keyring jingling", 1.0),
    "whoosh": ("paper card quick whoosh slide", 0.6),
    "zipper": ("backpack zipper closing in one pull", 1.0),
    "tick": ("quiet clock ticking at night, soft, slow", 3.0),
    "pop": ("soft UI notification pop", 0.4),
    "stamp": ("rubber stamp pressed hard on paper desk, thump", 0.6),
    "scurry": ("tiny fast cartoon footsteps scurrying with little pops", 1.0),
    "trickle": ("sand trickling in an hourglass, gentle", 3.0),
    "error": ("short low muted error buzz", 0.5),
    "bell": ("hotel desk service bell ding, single", 1.5),
    "slap": ("sticky note slapped onto a cork board", 0.4),
    "squeak": ("rubber eraser squeak then rubbery bounce boing", 1.0),
    "shredder": ("mechanical paper shredder whirring and shredding paper", 2.5),
    "alert": ("low pulsing warning alert tone, two pulses, subtle", 1.2),
    "slide": ("paper sheet sliding across a desk", 0.6),
    "slam": ("heavy cardboard folder slammed down on a desk with a stamp thud", 0.8),
    "padlock": ("metal padlock snapping shut click", 0.5),
    "scanner": ("electronic laser scanner hum sweep", 1.8),
    "clank": ("small object dropping down a metal chute, clank", 0.8),
    "chime": ("clean pleasant biometric approval chime, two notes rising", 1.0),
    "printer": ("receipt printer printing and sliding paper out", 1.8),
    "toggle": ("chunky toggle switch click", 0.4),
    "outro": ("warm gentle synth chord outro, slow fade out", 4.0),
}

def gen(name, prompt, dur):
    body = {"text": prompt, "duration_seconds": max(0.5, dur), "prompt_influence": 0.5}
    req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json",
        "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")})
    with urllib.request.urlopen(req, timeout=300) as r:
        (OUT / f"{name}.mp3").write_bytes(r.read())
    print("generated", name)

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    force = "--force" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    for n, (p, d) in SFX.items():
        if only and n not in only: continue
        if (OUT / f"{n}.mp3").exists() and not force: continue
        gen(n, p, d)
