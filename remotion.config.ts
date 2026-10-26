import { Config } from "@remotion/cli/config";

// House render settings (see CLAUDE.md): 1920x1080, 30 fps, H.264.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(18);
Config.setOverwriteOutput(true);

// Cloud sessions: Remotion can't always download its own headless Chrome there,
// so tools/setup_cloud.sh exports REMOTION_BROWSER pointing at the preinstalled Chromium.
// Falls back to auto-detecting Playwright's Chromium so a fresh shell works too.
const findBrowser = (): string | null => {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("playwright").chromium.executablePath() as string;
  } catch {
    return null; // on a normal PC Remotion downloads its own headless Chrome
  }
};
const browser = findBrowser();
if (browser) {
  Config.setBrowserExecutable(browser);
}
