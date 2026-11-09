import type { CanvasDocument } from "@canvas";
import type { FileInfo } from "@shared/core";
import type { CanvasFileFormat } from "./canvas-file.types";

/** What `saveCanvasDocument` writes, and where. */
export interface SaveCanvasDocumentInput {
  /** The file's id (its key in the recent files). */
  id: string;
  doc: CanvasDocument;
  /** The file it was last saved in, `null` for one never saved. */
  info: FileInfo | null;
  format: CanvasFileFormat;
  /** The folder a never-saved file goes to (a project's, `?dir=`), `null` for its draft. */
  dir: string | null;
  /** Where to write instead of what `info` and `dir` give: a path (Save as), `null` for the draft. */
  path?: string | null;
}
