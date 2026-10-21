import type { BoardDocument } from "./document";
import type { CanvasTheme } from "./render";

/** Actions the host app implements (e.g. file dialogs), triggered by engine shortcuts. */
export interface HostActions {
  save?: () => void;
  saveAs?: () => void;
}

export interface CanvasEngineOptions {
  theme: CanvasTheme;
  /** Existing document to edit; a new empty one is created otherwise. */
  document?: BoardDocument;
}
