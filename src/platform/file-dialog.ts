import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ALL_FILE_EXTENSIONS } from "@core";

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
