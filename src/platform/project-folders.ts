import { documentDir, join } from "@tauri-apps/api/path";
import { mkdir, remove } from "@tauri-apps/plugin-fs";

/** Where new projects go by default: `Cloudy Canvas` in the user's documents folder. */
export async function defaultProjectsFolder(): Promise<string> {
  return join(await documentDir(), "Cloudy Canvas");
}

/** Creates the folder and the ones above it that are missing. */
export async function ensureFolder(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

/**
 * Deletes a folder the app has just made, to undo a creation that failed midway: with what's in
 * it (`withContents`, for a folder nothing else could have written to yet), or only when it's
 * empty. Never for the user's folders.
 */
export async function removeCreatedFolder(path: string, withContents: boolean): Promise<void> {
  await remove(path, { recursive: withContents });
}
