import { isTauri } from "@tauri-apps/api/core";
import { dirname, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { exists, mkdir, writeFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { strToU8, zipSync, type Zippable } from "fflate";

import { isAndroidPlatform } from "@shared/core";
import { exportFile } from "./export-file";
import type { ConfirmOverwrite, ExportedFile, ExportFilesOptions } from "./export-files.types";
import { t } from "./platform.i18n";

/**
 * Asks for a folder and writes the files under it, keeping their paths (creating folders, asking
 * before replacing files that exist), or saves them as `<name>.zip` with `as: "zip"`, as the
 * browser always does. Returns whether they were saved.
 */
export async function exportFiles(
  files: readonly ExportedFile[],
  name: string,
  confirm: ConfirmOverwrite,
  { as = "folder" }: ExportFilesOptions = {},
): Promise<boolean> {
  if (!canSaveToFolder() || as === "zip") {
    return exportFile(zipOf(files), name, { extension: "zip", label: t("zipFile") });
  }
  const folder = await open({ directory: true, multiple: false, title: t("exportToFolder") });
  if (typeof folder !== "string") return false;
  const targets = await Promise.all(files.map((file) => join(folder, ...file.path.split("/"))));
  const existing = (
    await Promise.all(
      targets.map(async (path, i) => ((await exists(path)) ? files[i]?.path : null)),
    )
  ).filter((path): path is string => path !== null && path !== undefined);
  if (existing.length > 0 && !(await confirm(existing))) return false;
  for (const [i, path] of targets.entries()) {
    const file = files[i];
    if (!file) continue;
    await mkdir(await dirname(path), { recursive: true });
    if (typeof file.content === "string") await writeTextFile(path, file.content);
    else await writeFile(path, file.content);
  }
  return true;
}

/** Whether files can go into a folder the user picks (the browser only downloads, Android zips). */
export function canSaveToFolder(): boolean {
  return isTauri() && !isAndroidPlatform();
}

/** The files as a zip. Pictures are stored as they are: they're compressed already. */
function zipOf(files: readonly ExportedFile[]): Blob {
  const entries: Zippable = {};
  for (const { path, content } of files) {
    entries[path] = typeof content === "string" ? strToU8(content) : [content, { level: 0 }];
  }
  return new Blob([zipSync(entries) as BlobPart], { type: "application/zip" });
}
