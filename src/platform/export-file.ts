import { isTauri } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

import type { ExportFileType } from "./export-file.types";

/**
 * Asks where to save an exported file and writes it; in the browser, downloads it instead.
 * Returns whether it was saved.
 */
export async function exportFile(
  file: Blob,
  name: string,
  { extension, label }: ExportFileType,
): Promise<boolean> {
  if (!isTauri()) {
    download(file, `${name}.${extension}`);
    return true;
  }
  const path = await save({
    title: "Export",
    defaultPath: `${name}.${extension}`,
    filters: [{ name: label, extensions: [extension] }],
  });
  if (!path) return false;
  const target = path.toLowerCase().endsWith(`.${extension}`) ? path : `${path}.${extension}`;
  await writeFile(target, new Uint8Array(await file.arrayBuffer()));
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
