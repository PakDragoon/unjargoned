#!/usr/bin/env bash
# One-shot setup for a fresh Claude Code cloud container. Safe to re-run.
#   source tools/setup_cloud.sh
# (no set -e: this file is sourced into your shell)
cd "$(dirname "${BASH_SOURCE[0]}")/.."

[ -d node_modules ] || npm install --no-audit --no-fund

pip install -q --break-system-packages -r tools/requirements.txt

mkdir -p models
BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -s models/kokoro-v1.0.onnx ] || curl -sSL -o models/kokoro-v1.0.onnx "$BASE/kokoro-v1.0.onnx"
[ -s models/voices-v1.0.bin ] || curl -sSL -o models/voices-v1.0.bin "$BASE/voices-v1.0.bin"

# Use the preinstalled Playwright Chromium for Remotion renders.
REMOTION_BROWSER="$(node -e "try{console.log(require('playwright').chromium.executablePath())}catch(e){}")"
export REMOTION_BROWSER
echo "Setup done. REMOTION_BROWSER=${REMOTION_BROWSER:-<not found, Remotion will download its own>}"
