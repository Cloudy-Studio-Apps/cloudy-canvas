import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

import type { TokenFilePick } from "./token-file.types";

const DESIGN_TOKEN_FILES: TokenFilePick = {
  title: "Import variables and styles",
  filters: [
    { name: "Designs and tokens", extensions: ["cdesign", "json"] },
    { name: "Cloudy Canvas designs", extensions: ["cdesign"] },
    { name: "Tokens JSON", extensions: ["json"] },
  ],
};

/**
 * Asks for a file to import variables and styles from (a design, or tokens JSON, unless `pick`
 * says otherwise) and reads it. `null` when cancelled. Desktop app only.
 */
export async function pickTokenFile(
  pick: TokenFilePick = DESIGN_TOKEN_FILES,
): Promise<{ name: string; bytes: Uint8Array } | null> {
  if (!isTauri()) {
    console.warn("[platform] Importing files is only available in the desktop app.");
    return null;
  }
  const path = await open({
    title: pick.title,
    multiple: false,
    directory: false,
    filters: pick.filters,
  });
  if (!path) return null;
  const name = path.split(/[\\/]/).pop() ?? path;
  return { name, bytes: await readFile(path) };
}
