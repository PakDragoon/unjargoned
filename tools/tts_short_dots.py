#!/usr/bin/env python3
"""ChatGPT Dots Short — Phase 1 voiceover (ElevenLabs). One mp3 per scene -> public/audio/short_sceneN.mp3,
durations -> src/shorts/dots/durations.json (frames at 60 fps = ceil(sec*60)).
Key is injected by the cloud proxy for api.elevenlabs.io. Responses cached in out/eleven_cache_dots/."""
import hashlib, json, math, os, subprocess, sys, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "out" / "eleven_cache_dots"
VOICE, FALLBACK_VOICE = "UgBBYS2sOqTuMpoF3BR0", "VCgLBmBjldJmfphyB8sZ"
SETTINGS = {"stability": 0.40, "similarity_boost": 0.78, "style": 0.35, "speed": 1.05}
SCRIPT = {
    1: "[curious] If you close your laptop tonight, [pause] ChatGPT doesn't actually turn off anymore.",
    2: "OpenAI just started rolling out something called \"Dots\" to regular twenty-dollar ChatGPT users — [pause] and it gives your AI its OWN private computer in the cloud.",
    3: "[matter-of-fact] Normal ChatGPT sits frozen until you type a question. [pause] A Dot stays awake ALL night — watching your connected apps, spotting things you forgot, and preparing the work BEFORE you wake up.",
    4: "It can even fill out a checkout cart with your card — [long pause] [serious] except OpenAI built a separate security AI called Sentinel that PHYSICALLY blocks it from spending money or sending messages until you tap approve.",
    5: "[curious] Which means for the first time, AI isn't a tool you open — [pause] it's an employee that NEVER logs off, so...",
}

def call(voice, model, settings, text):
    body = {"text": text, "model_id": model, "voice_settings": settings}
    key = hashlib.sha256(json.dumps([voice, body], sort_keys=True).encode()).hexdigest()[:20]
    path = CACHE / f"{key}.mp3"
    if path.exists():
        return path
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")})
    with urllib.request.urlopen(req, timeout=180) as r:
        data = r.read()
    CACHE.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return path

def synth(text):
    """Spec order: eleven_v4 with the spec settings, then eleven_v3 (stability snapped to 0.5 if 0.40 is refused)."""
    tries = [("eleven_v4", SETTINGS), ("eleven_v3", SETTINGS), ("eleven_v3", {**SETTINGS, "stability": 0.5})]
    for voice in (VOICE, FALLBACK_VOICE):
        for model, st in tries:
            try:
                return call(voice, model, st, text), model, voice, st
            except urllib.error.HTTPError as e:
                print(f"  {model}/{voice} stab={st['stability']}: HTTP {e.code} {e.read()[:160]!r}")
    sys.exit("all ElevenLabs attempts failed")

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))

out = {"fps": 60, "scenes": {}}
for n, text in SCRIPT.items():
    raw, model, voice, st = synth(text)
    dst = ROOT / "public" / "audio" / f"short_scene{n}.mp3"
    # Trim edge silence (zero dead air); scene 5 ends exactly on "so..." for the loop.
    tail = "0.0" if n == 5 else "0.08"
    af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
          f"areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence={tail},areverse")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", af, "-ar", "44100", "-b:a", "192k", str(dst)], check=True)
    d = dur(dst)
    out["scenes"][f"scene{n}"] = {"file": f"audio/short_scene{n}.mp3", "seconds": round(d, 3),
                                  "durationInFrames": math.ceil(d * 60), "model": model, "voice": voice,
                                  "stability": st["stability"]}
    print(f"scene{n}: {d:.3f}s -> {math.ceil(d*60)} frames ({model}, stab {st['stability']})")
dj = ROOT / "src" / "shorts" / "dots" / "durations.json"
dj.parent.mkdir(parents=True, exist_ok=True)
dj.write_text(json.dumps(out, indent=2) + "\n")
