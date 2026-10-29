import { isTauri } from "@tauri-apps/api/core";
import { dirname, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { exists, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";
import { strToU8, zipSync } from "fflate";

import type { ConfirmOverwrite, ExportTextFile } from "./export-files.types";
import { t } from "./platform.i18n";

/**
 * Asks for a folder and writes the files under it, keeping their paths (creating folders, asking
 * before replacing files that exist); in the browser, downloads them as `<name>.zip` instead.
 * Returns whether they were saved.
 */
export async function exportFiles(
  files: readonly ExportTextFile[],
  name: string,
  confirm: ConfirmOverwrite,
): Promise<boolean> {
  if (!isTauri()) {
    const zip = zipSync(
      Object.fromEntries(files.map((file) => [file.path, strToU8(file.content)])),
    );
    download(new Blob([zip], { type: "application/zip" }), `${name}.zip`);
    return true;
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
    await writeTextFile(path, file.content);
  }
  return true;
}

function download(file: Blob, fileName: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
