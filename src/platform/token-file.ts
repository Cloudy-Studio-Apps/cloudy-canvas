import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

/**
 * Asks for a file to import variables and styles from (a design, or tokens JSON) and reads it.
 * `null` when cancelled. Desktop app only.
 */
export async function pickTokenFile(): Promise<{ name: string; bytes: Uint8Array } | null> {
  if (!isTauri()) {
    console.warn("[platform] Importing files is only available in the desktop app.");
    return null;
  }
  const path = await open({
    title: "Import variables and styles",
    multiple: false,
    directory: false,
    filters: [
      { name: "Designs and tokens", extensions: ["cdesign", "json"] },
      { name: "Cloudy Canvas designs", extensions: ["cdesign"] },
      { name: "Tokens JSON", extensions: ["json"] },
    ],
  });
  if (!path) return null;
  const name = path.split(/[\\/]/).pop() ?? path;
  return { name, bytes: await readFile(path) };
}
