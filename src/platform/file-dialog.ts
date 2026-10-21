import { isTauri } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { ALL_FILE_EXTENSIONS, FILE_EXTENSIONS, withFileExtension, type FileType } from "@core";

/** Shows the native "open file" dialog filtered to Cloudy Canvas files. Returns the selected path, or `null`. */
export async function openCanvasFileDialog(): Promise<string | null> {
  if (!isTauri()) {
    console.warn("[platform] File dialog is only available in the desktop app.");
    return null;
  }
  return open({
    title: "Open file",
    multiple: false,
    directory: false,
    filters: [{ name: "Cloudy Canvas files", extensions: ALL_FILE_EXTENSIONS }],
  });
}

/** Shows the native "save file" dialog for a board or design. Returns the chosen path, or `null`. */
export async function saveCanvasFileDialog(type: FileType, name: string): Promise<string | null> {
  if (!isTauri()) {
    console.warn("[platform] File dialog is only available in the desktop app.");
    return null;
  }
  const ext = FILE_EXTENSIONS[type];
  const path = await save({
    title: type === "board" ? "Save board" : "Save design",
    defaultPath: `${name}.${ext}`,
    filters: [
      {
        name: type === "board" ? "Cloudy Canvas board" : "Cloudy Canvas design",
        extensions: [ext],
      },
    ],
  });
  return path && withFileExtension(path, type);
}
