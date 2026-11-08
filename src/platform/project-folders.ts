import { documentDir, join } from "@tauri-apps/api/path";
import { mkdir } from "@tauri-apps/plugin-fs";

/** Where new projects go by default: `Cloudy Canvas` in the user's documents folder. */
export async function defaultProjectsFolder(): Promise<string> {
  return join(await documentDir(), "Cloudy Canvas");
}

/** Creates the folder and the ones above it that are missing. */
export async function ensureFolder(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}
