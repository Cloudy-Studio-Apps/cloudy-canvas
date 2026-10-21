import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

import { extensionOf, fileNameFromPath, IMAGE_FILE_TYPES, type StickerImage } from "@shared/core";

/** Asks for image files to import as stickers; empty when cancelled. */
export async function importStickerFiles(): Promise<StickerImage[]> {
  if (!isTauri()) return pickInBrowser();
  const picked = await open({
    title: "Import stickers",
    multiple: true,
    directory: false,
    filters: [{ name: "Images", extensions: Object.keys(IMAGE_FILE_TYPES) }],
  });
  if (!picked) return [];
  return Promise.all(
    picked.map(async (path) => ({
      name: fileNameFromPath(path),
      type: IMAGE_FILE_TYPES[extensionOf(path)] ?? "application/octet-stream",
      data: await readFile(path),
    })),
  );
}

/** The browser build picks files with a file input. */
function pickInBrowser(): Promise<StickerImage[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = Object.values(IMAGE_FILE_TYPES).join(",");
    input.addEventListener("change", () => {
      const files = [...(input.files ?? [])];
      void Promise.all(
        files.map(async (file) => ({
          name: stickerName(file.name),
          type:
            file.type || (IMAGE_FILE_TYPES[extensionOf(file.name)] ?? "application/octet-stream"),
          data: new Uint8Array(await file.arrayBuffer()),
        })),
      ).then(resolve);
    });
    input.addEventListener("cancel", () => resolve([]));
    input.click();
  });
}

/** A file name without its extension. */
function stickerName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}
