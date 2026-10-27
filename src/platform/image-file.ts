import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

import { extensionOf, fileNameFromPath, IMAGE_FILE_TYPES, type ImageFile } from "@shared/core";
import type { PickImageFilesOptions } from "./image-file.types";
import { t } from "./platform.i18n";

/** Asks for image files (PNG, JPG, GIF, WebP, SVG, …) and reads them; empty when cancelled. */
export async function pickImageFiles({
  title,
  multiple,
}: PickImageFilesOptions): Promise<ImageFile[]> {
  if (!isTauri()) return pickInBrowser(multiple);
  const picked = await open({
    title,
    multiple,
    directory: false,
    filters: [{ name: t("filters.images"), extensions: Object.keys(IMAGE_FILE_TYPES) }],
  });
  if (!picked) return [];
  const paths = Array.isArray(picked) ? picked : [picked];
  return Promise.all(
    paths.map(async (path) => ({
      name: fileNameFromPath(path),
      type: IMAGE_FILE_TYPES[extensionOf(path)] ?? "application/octet-stream",
      data: await readFile(path),
    })),
  );
}

/** The browser build picks files with a file input. */
function pickInBrowser(multiple: boolean): Promise<ImageFile[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.accept = Object.values(IMAGE_FILE_TYPES).join(",");
    input.addEventListener("change", () => {
      const files = [...(input.files ?? [])];
      void Promise.all(
        files.map(async (file) => ({
          name: fileNameFromPath(file.name),
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
