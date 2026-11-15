import { createId, FILE_EXTENSIONS, isReservedName, type FileInfo } from "@shared/core";
import { saveCanvasFileDialog } from "@platform";
import { freeFilePath } from "./free-file-path";
import { saveCanvasDocument } from "./save-canvas-document";
import type { SaveNewCanvasFileInput } from "./save-new-canvas-file.types";

/**
 * Writes a document as a new file under a new id: into `folder` without asking, else where the
 * Save dialog says. Resolves `null` when the dialog was cancelled; a failed write rejects.
 */
export async function saveNewCanvasFile(input: SaveNewCanvasFileInput): Promise<FileInfo | null> {
  const { doc, format, folder } = input;
  // A page named "Mobile / Home" or "Intro: v2" can't be a file name as it is.
  const stem = input.name.replace(/[<>:"/\\|?*]/g, "-").trim();
  const name = stem && !isReservedName(stem) ? stem : format.untitled;
  const path = folder
    ? await freeFilePath(folder, name, FILE_EXTENSIONS[format.type])
    : await saveCanvasFileDialog(format.type, name);
  if (!path) return null;
  return saveCanvasDocument({ id: createId(), doc, info: null, format, dir: null, path });
}
