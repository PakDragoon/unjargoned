// Review stills for the Dots build from one bundle, tiled into a contact sheet.
// usage: node tools/dots_stills.mjs <compId> <outDir> <frame,frame,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
import { execFileSync } from "node:child_process";
const [comp, outDir, framesArg, scale = "0.4"] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/dots/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER;
const puppeteerInstance = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, puppeteerInstance });
const frames = framesArg.split(",").map(Number);
const files = [];
for (const f of frames) {
  const out = `${outDir}/${comp}-f${String(f).padStart(4, "0")}.png`;
  await renderStill({ composition, serveUrl, output: out, frame: f, scale: Number(scale), puppeteerInstance });
  files.push(out);
}
await puppeteerInstance.close({ silent: true });
execFileSync("python3", ["-c", `
import sys
from PIL import Image, ImageDraw
fs = sys.argv[2:]; ims = [Image.open(f) for f in fs]
w, h = ims[0].size; cols = 2; rows = (len(ims) + 1) // 2
sheet = Image.new("RGB", (w * cols, h * rows), "white")
for i, (im, f) in enumerate(zip(ims, fs)):
    sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    ImageDraw.Draw(sheet).text(((i % cols) * w + 6, (i // cols) * h + 4), f.split("-f")[-1][:-4], fill="red")
sheet.save(sys.argv[1])
`, `${outDir}/${comp}-sheet.png`, ...files]);
console.log(`${outDir}/${comp}-sheet.png`);
