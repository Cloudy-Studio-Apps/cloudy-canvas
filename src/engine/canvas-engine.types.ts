import type { BoardDocument } from "./document";
import type { CanvasTheme } from "./render";

export interface CanvasEngineOptions {
  theme: CanvasTheme;
  /** Existing document to edit; a new empty one is created otherwise. */
  document?: BoardDocument;
}
