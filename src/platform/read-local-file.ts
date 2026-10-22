import { isTauri } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";

/** Reads a file from an absolute path without asking (agents' images). Desktop app only. */
export async function readLocalFile(path: string): Promise<Uint8Array> {
  if (!isTauri()) throw new Error("Reading a file from a path needs the desktop app.");
  return readFile(path);
}
