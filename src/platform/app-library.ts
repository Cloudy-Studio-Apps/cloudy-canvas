import { appCacheDir, appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, writeFile } from "@tauri-apps/plugin-fs";

import { extensionOf, fileNameFromPath, fileTypeFromPath, isOpenablePath } from "@shared/core";
import { pickWithFileInput } from "./pick-with-file-input";
import { t } from "./platform.i18n";

/** Folder in the app data that holds a user's files on Android, where the app keeps them. */
const FOLDER = "files";
/** What can't be in a file's name. */
const UNSAFE_NAME = /[/\\:*?"<>|]/g;

/** A free path in the app's files for `name`: a file already there gets ` (2)`, ` (3)`, … */
export async function libraryPath(name: string, extension: string): Promise<string> {
  const folder = await join(await appDataDir(), FOLDER);
  await mkdir(folder, { recursive: true });
  const base = name.replace(UNSAFE_NAME, "-").trim() || "file";
  for (let copy = 1; ; copy += 1) {
    const suffix = copy === 1 ? "" : ` (${copy})`;
    const path = await join(folder, `${base}${suffix}.${extension}`);
    if (!(await exists(path))) return path;
  }
}

/**
 * Asks for a Cloudy Canvas or Figma file and copies it in, as the app can't keep reaching a file
 * outside it. Returns the copy's path, or `null` when cancelled. A Figma file only needs to last
 * for its import, so it goes in the cache.
 */
export async function importPickedFile(): Promise<string | null> {
  const [file] = await pickWithFileInput({ multiple: false });
  if (!file) return null;
  if (!isOpenablePath(file.name)) throw new Error(t("notOpenable", { name: file.name }));
  const path = fileTypeFromPath(file.name)
    ? await libraryPath(fileNameFromPath(file.name), extensionOf(file.name))
    : await cachePath(file.name);
  await writeFile(path, new Uint8Array(await file.arrayBuffer()));
  return path;
}

async function cachePath(name: string): Promise<string> {
  const folder = await appCacheDir();
  await mkdir(folder, { recursive: true });
  return join(folder, name.replace(UNSAFE_NAME, "-"));
}
