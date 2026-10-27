import { isTauri } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { t } from "./platform.i18n";

const DBML_FILTER = { name: t("dbmlFilter"), extensions: ["dbml"] };

/** Asks where to save and writes the DBML text. Returns whether it was saved. */
export async function exportDbmlFile(text: string, name: string): Promise<boolean> {
  if (!isTauri()) {
    console.warn("[platform] Exporting files is only available in the desktop app.");
    return false;
  }
  const path = await save({
    title: t("exportDbml"),
    defaultPath: `${name}.dbml`,
    filters: [DBML_FILTER],
  });
  if (!path) return false;
  await writeTextFile(path.toLowerCase().endsWith(".dbml") ? path : `${path}.dbml`, text);
  return true;
}

/** Asks for a .dbml file and returns its text, or `null` when cancelled. */
export async function importDbmlFile(): Promise<string | null> {
  if (!isTauri()) {
    console.warn("[platform] Importing files is only available in the desktop app.");
    return null;
  }
  const path = await open({
    title: t("importDbml"),
    multiple: false,
    directory: false,
    filters: [DBML_FILTER],
  });
  return path ? readTextFile(path) : null;
}
