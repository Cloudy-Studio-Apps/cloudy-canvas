import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

const fromSrc = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

/**
 * The board's HTML viewer (`src/viewer/`) as one self-contained HTML file: scripts, styles, fonts
 * and pictures inlined. Built by `scripts/vite/viewer-runtime-plugin.ts` when the app needs it;
 * the project is the root so Tailwind finds the classes of every module the viewer draws with.
 */
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  // The app's public/ files (its favicon) aren't part of an exported board.
  publicDir: false,
  // The same aliases as vite.config.ts, plus the stubs.
  resolve: {
    alias: [
      // The viewer never offers the emoji stickers: their catalog is stubbed out (src/viewer/stubs/).
      { find: /^\.\/emoji-catalog$/, replacement: fromSrc("viewer/stubs/emoji-catalog.ts") },
      ...Object.entries({
        "@app": fromSrc("app"),
        "@pages": fromSrc("pages"),
        "@platform": fromSrc("platform"),
        "@shared": fromSrc("shared"),
        "@canvas-ui": fromSrc("canvas-ui"),
        "@canvas": fromSrc("canvas"),
        "@board": fromSrc("products/board"),
        "@design": fromSrc("products/design"),
      }).map(([find, replacement]) => ({ find, replacement })),
    ],
  },
  build: {
    rollupOptions: { input: fromSrc("viewer/index.html") },
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    chunkSizeWarningLimit: Number.MAX_SAFE_INTEGER,
    emptyOutDir: false,
  },
  logLevel: "warn",
});
