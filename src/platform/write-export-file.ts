import { isTauri } from "@tauri-apps/api/core";
import { writeFile } from "@tauri-apps/plugin-fs";

/** Writes an exported file to a path without asking (agents' exports). Desktop app only. */
export async function writeExportFile(path: string, file: Blob): Promise<void> {
  if (!isTauri()) throw new Error("Exporting to a file needs the desktop app.");
  await writeFile(path, new Uint8Array(await file.arrayBuffer()));
}
