// Many stills from one bundle (much faster than one `npx remotion still` per frame). Needs REMOTION_BROWSER.
// usage: node tools/stills.mjs <compId> <outDir> <frame,frame,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [comp, outDir, framesArg, scale = "0.5"] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER;
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
for (const f of framesArg.split(",").map(Number)) {
  await renderStill({ composition, serveUrl, output: `${outDir}/f${String(f).padStart(4, "0")}.png`, frame: f, scale: Number(scale), browserExecutable });
}
console.log("done");
