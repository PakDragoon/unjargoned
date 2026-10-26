import { Config } from "@remotion/cli/config";

// House render settings (see CLAUDE.md): 1920x1080, 30 fps, H.264.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(18);
Config.setOverwriteOutput(true);
