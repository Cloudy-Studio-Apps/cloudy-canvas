import type { CanvasDocument } from "@canvas";
import type { CanvasFileFormat } from "./canvas-file.types";

/** What `saveNewCanvasFile` writes, and where. */
export interface SaveNewCanvasFileInput {
  doc: CanvasDocument;
  format: CanvasFileFormat;
  /** The file's name without its extension. */
  name: string;
  /** The folder to write into without asking (numbered when the name is taken); `null` asks. */
  folder: string | null;
}
