import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

const MARKER = "__SPLASH_STRIP__";
const STRIP = new URL("../../src/shared/ui/brand/foca-watona-strip.webp", import.meta.url);

/**
 * Writes the splash's frames into index.html as a data URL, in dev and in builds: the splash shows
 * while the app's code loads, and a file requested then may not draw until that has finished.
 */
export function inlineSplash(): Plugin {
  return {
    name: "cloudy:inline-splash",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(MARKER, `data:image/webp;base64,${readFileSync(STRIP).toString("base64")}`),
    },
  };
}
