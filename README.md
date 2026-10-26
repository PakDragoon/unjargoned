# Unjargoned

Source for the Unjargoned YouTube channel's videos, built with [Remotion](https://www.remotion.dev/).
Episode 1's original project was lost; everything from Episode 2 on lives here.

## Setup

Requires Node 18+ and Python 3.10+.

```bash
git clone https://github.com/PakDragoon/unjargoned.git
cd unjargoned
npm install

python3 -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r tools/requirements.txt
```

Voice model files (not committed, ~350 MB) go in `models/`:

```bash
mkdir -p models
curl -L -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

## Everyday commands

```bash
npm run studio                                   # live preview in the browser (free, use this a lot)

python3 tools/tts.py --test "Once upon a…" out/test.wav   # try a line
python3 tools/tts.py ep02                        # voice every scene
python3 tools/tts.py ep02 S4                     # re-voice one scene only

npx remotion still Ep02-S4 out/s4.png --frame=120   # one frame of one scene
npx remotion render Ep02-S4 out/ep02-s4.mp4         # one scene
npx remotion render Ep02-Full out/ep02.mp4          # the whole episode (once, at the end)

python3 tools/captions.py ep02                   # SRT → docs/ep02/ep02.en.srt
```

## Layout

```
src/shared/            brand tokens, font, SceneShell (+ Dot, captions, transitions as they're built)
src/episodes/ep02/     vo.json (voice script), timeline.ts, scenes/S1–S7.tsx, Ep02.tsx
public/episodes/ep02/  audio/S1.wav … (generated)
docs/ep01/, docs/ep02/ notes, launch handoffs, final SRTs
tools/                 tts.py, captions.py
```

Each scene is its own Remotion composition (`Ep02-S1` … `Ep02-S7`), and `Ep02-Full` stitches them.
A scene's length comes from its voice file, so changing a line and re-voicing that scene is all it takes.

## Episodes

| # | Title | Status |
|---|---|---|
| 1 | What Actually Happens When You Tap Your Card | Live (source lost; see `docs/ep01/`) |
| 2 | How ChatGPT Actually Works (Explained Simply) | Script locked, build starting |

Music: "Fade" by Snoozy Beats, CC BY 3.0 — credit in every description.
