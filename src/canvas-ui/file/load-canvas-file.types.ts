import type { CanvasDocument } from "@canvas";
import type { FileInfo } from "@shared/core";

/** A file's document and its stored info (`null` for a new file or a live session's). */
export interface LoadedCanvasFile {
  document: CanvasDocument;
  info: FileInfo | null;
}
