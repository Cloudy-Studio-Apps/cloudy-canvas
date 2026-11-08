import type { CanvasDocument } from "../document";
import type { CanvasElement } from "../elements";
import type { Rect } from "../geometry.types";
import type { ImportFile } from "../model3d/model3d.types";

/** What a product's `importFiles` hook gets: the dropped files nobody claimed yet. */
export interface FileImportRequest {
  files: readonly ImportFile[];
  /** The view centered on the drop point; what it makes is fit and centered in it. */
  view: Rect;
  doc: CanvasDocument;
  /** The next z-order index above everything, unique across the drop. */
  nextIndex(): string;
}

/** What an `importFiles` hook made. */
export interface FileImportResult {
  /** Elements to add (their assets are already in the document). */
  elements: CanvasElement[];
  /** Names of the files it took, cancelled ones and files it used (textures, `.mtl`) included. */
  claimed: string[];
}

/** See `CanvasProduct.importFiles`; hooks run in order and each claims files from the rest. */
export type ImportFilesHook = (request: FileImportRequest) => Promise<FileImportResult>;
