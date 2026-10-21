import type { CanvasProduct } from "./canvas-product.types";
import type { CanvasDocument } from "./document";
import type { CanvasTheme } from "./render";

/** Actions the host app implements (e.g. file dialogs), triggered by engine shortcuts. */
export interface HostActions {
  save?: () => void;
  saveAs?: () => void;
}

export interface CanvasEngineOptions<O extends object = object> {
  /** The product being edited: its element kinds, tools, keymap and tool options. */
  product: CanvasProduct<O>;
  theme: CanvasTheme;
  /** Existing document to edit (read with `product.kinds`); a new empty one is created otherwise. */
  document?: CanvasDocument;
}
