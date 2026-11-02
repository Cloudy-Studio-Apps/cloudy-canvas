import { isTauri } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import {
  ALL_FILE_EXTENSIONS,
  FIGMA_IMPORTS,
  FILE_EXTENSIONS,
  isAndroidPlatform,
  withFileExtension,
  type FileType,
} from "@shared/core";
import { importPickedFile, libraryPath } from "./app-library";
import { t } from "./platform.i18n";

/**
 * Shows the native "open file" dialog filtered to Cloudy Canvas files, and Figma files too with
 * `figma` (Figma files imported as designs, FigJam files as boards). Returns the selected path,
 * or `null`. On Android that's a copy in the app's files, the only place it keeps them.
 */
export async function openCanvasFileDialog({ figma = false } = {}): Promise<string | null> {
  if (isAndroidPlatform()) return importPickedFile();
  if (!isTauri()) {
    console.warn("[platform] File dialog is only available in the desktop app.");
    return null;
  }
  return open({
    title: t("openFile"),
    multiple: false,
    directory: false,
    filters: figma
      ? [
          {
            name: t("filters.all"),
            extensions: [...ALL_FILE_EXTENSIONS, ...Object.keys(FIGMA_IMPORTS)],
          },
          { name: t("filters.canvas"), extensions: ALL_FILE_EXTENSIONS },
          { name: t("filters.figma"), extensions: Object.keys(FIGMA_IMPORTS) },
        ]
      : [{ name: t("filters.canvas"), extensions: ALL_FILE_EXTENSIONS }],
  });
}

/**
 * Shows the native "save file" dialog for a board or design. Returns the chosen path, or `null`.
 * On Android there's nothing to ask: the file goes in the app's files.
 */
export async function saveCanvasFileDialog(type: FileType, name: string): Promise<string | null> {
  if (!isTauri()) {
    console.warn("[platform] File dialog is only available in the desktop app.");
    return null;
  }
  const ext = FILE_EXTENSIONS[type];
  if (isAndroidPlatform()) return libraryPath(name, ext);
  const path = await save({
    title: type === "board" ? t("saveBoard") : t("saveDesign"),
    defaultPath: `${name}.${ext}`,
    filters: [
      {
        name: type === "board" ? t("filters.board") : t("filters.design"),
        extensions: [ext],
      },
    ],
  });
  return path && withFileExtension(path, type);
}
