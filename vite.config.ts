import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";
import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

const fromSrc = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],

  define: { __APP_VERSION__: JSON.stringify(version) },

  // Keep in sync with `paths` in tsconfig.json
  resolve: {
    alias: {
      "@app": fromSrc("app"),
      "@pages": fromSrc("pages"),
      "@platform": fromSrc("platform"),
      "@shared": fromSrc("shared"),
      "@canvas-ui": fromSrc("canvas-ui"),
      "@canvas": fromSrc("canvas"),
      "@board": fromSrc("products/board"),
      "@design": fromSrc("products/design"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
