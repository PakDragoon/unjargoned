"""Build Models voice, word cues and subtitles. Run without a key for estimated previews.
Usage: python3 tools/tts_models.py [long|short] [--scene N]
"""
import argparse
import base64
import hashlib
import json
import math
import os
import re
import subprocess
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOICE = "UgBBYS2sOqTuMpoF3BR0"
MODEL = "eleven_v4"
SETTINGS = {"stability": .40, "similarity_boost": .78, "style": .35, "speed": 1.05}


def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def synthesize(text, key, destination):
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS}
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": key})
    with urllib.request.urlopen(request, timeout=180) as response:
        data = json.load(response)
    alignment = data["alignment"]
    chars = "".join(alignment["characters"])
    words = [[m.group(), alignment["character_start_times_seconds"][m.start()],
              alignment["character_end_times_seconds"][m.end()-1]] for m in re.finditer(r"\S+", chars)]
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix=".mp3", delete=False) as tmp:
        tmp.write(base64.b64decode(data["audio_base64"]))
    tmp = Path(tmp.name)
    try:
        duration = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                         "format=duration", "-of", "csv=p=0", tmp]))
        tmp.replace(destination)
    finally:
        tmp.unlink(missing_ok=True)
    return words, duration


def stamp(seconds):
    seconds, ms = divmod(round(seconds * 1000), 1000)
    minutes, s = divmod(seconds, 60)
    h, m = divmod(minutes, 60)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def build(short, only, key):
    folder = ROOT / ("src/shorts/models" if short else "src/models")
    fps = 60 if short else 30
    script = json.loads((folder / "script.json").read_text())
    if only and not 1 <= only <= len(script):
        raise ValueError("scene outside selected format")
    def existing(name):
        path = folder / name
        return json.loads(path.read_text()) if path.exists() else []
    scenes, timings = existing("durations.json"), existing("words.json")
    cues, offset = [], 0
    for i, line in enumerate(script):
        text = line["text"]
        file = f"audio/{'short_models' if short else 'models'}/s{i+1}.mp3"
        digest = hashlib.sha256((text + MODEL + VOICE + str(SETTINGS)).encode()).hexdigest()
        prior = scenes[i] if i < len(scenes) else None
        valid = prior and prior['hash'] == digest and (ROOT / "public" / file).exists() and prior["file"]
        if valid and only != i+1:
            words, scene = timings[i], prior
        else:
            if key and only in (None, i+1):
                words, seconds = synthesize(text, key, ROOT / "public" / file)
            elif valid:
                words, seconds = timings[i], prior["seconds"]
            else:
                file, seconds = None, line["seconds"]
                tokens = text.split()
                words = [[w, round(j*seconds/len(tokens), 4), round((j+1)*seconds/len(tokens), 4)]
                         for j, w in enumerate(tokens)]
            scene = dict(file=file, seconds=seconds, frames=math.ceil(seconds*fps), hash=digest)
        if i == len(scenes):
            scenes.append(scene)
            timings.append(words)
        else:
            scenes[i], timings[i] = scene, words
        for j in range(0, len(words), 6):
            group = words[j:j+6]
            cues.append((offset+group[0][1], offset+group[-1][2], " ".join(w[0] for w in group)))
        offset += scene["frames"]/fps
        if not short and i == 3:
            sting = json.loads((ROOT / "src/dots/timing.json").read_text())["long_subscribe"]["words"][0]
            cues.append((offset+(176/60)+sting[1], offset+(176/60)+sting[2], sting[0]))
            offset += 5
    save(folder / "durations.json", scenes)
    save(folder / "words.json", timings)
    (folder / "captions.srt").write_text("\n".join(
        f"{i}\n{stamp(a)} --> {stamp(b)}\n{line}\n" for i,(a,b,line) in enumerate(cues,1)))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("format", nargs="?", choices=["long","short"])
    parser.add_argument("--scene", type=int)
    args = parser.parse_args()
    for fmt in ([args.format] if args.format else ["long","short"]):
        build(fmt == "short", args.scene, os.environ.get("ELEVENLABS_API_KEY"))
