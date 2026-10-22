import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, dirname, join } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readFile,
  readTextFile,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import type { FontCache } from "./font-cache.types";

/** Where downloaded fonts live, inside the app data folder. */
const FOLDER = "fonts";

/** Font files in `<appData>/fonts/`; in the browser nothing is kept. */
export const fontCache: FontCache = isTauri()
  ? {
      readText: async (name) => {
        const path = await pathOf(name);
        return (await exists(path)) ? readTextFile(path) : null;
      },
      writeText: async (name, text) => writeTextFile(await prepare(name), text),
      readBytes: async (name) => {
        const path = await pathOf(name);
        return (await exists(path)) ? readFile(path) : null;
      },
      writeBytes: async (name, data) => writeFile(await prepare(name), data),
    }
  : {
      readText: () => Promise.resolve(null),
      writeText: () => Promise.resolve(),
      readBytes: () => Promise.resolve(null),
      writeBytes: () => Promise.resolve(),
    };

async function pathOf(name: string): Promise<string> {
  return join(await appDataDir(), FOLDER, name);
}

/** The file's path, with its folder created. */
async function prepare(name: string): Promise<string> {
  const path = await pathOf(name);
  await mkdir(await dirname(path), { recursive: true });
  return path;
}
