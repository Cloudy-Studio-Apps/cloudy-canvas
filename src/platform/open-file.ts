import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

import type { OpenedFile, OpenFilePick } from "./open-file.types";

/** Asks for one file of the kinds `pick` offers and reads it. `null` when cancelled. Desktop app only. */
export async function openFile(pick: OpenFilePick): Promise<OpenedFile | null> {
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
