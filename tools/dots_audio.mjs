// Audio-only render of a Dots composition (for remixes: no video frames rendered).
// usage: node tools/dots_audio.mjs <compId> <out.wav>
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [comp, out] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/dots/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER;
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
await renderMedia({ composition, serveUrl, codec: "wav", outputLocation: out, browserExecutable });
console.log(out);
