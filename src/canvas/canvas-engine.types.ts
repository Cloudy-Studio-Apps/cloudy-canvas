import type { Clipboard } from "@shared/core";

import type { CanvasProduct } from "./canvas-product.types";
import type { CanvasDocument } from "./document";
import type { CanvasTheme } from "./render";

/**
 * Actions the host app implements (file dialogs, opening a panel), triggered by engine shortcuts:
 * `save`, `saveAs` and the product's `hostCommands`.
 */
export type HostAction = () => void;

/**
 * An element asked the host to do something the engine doesn't know about (e.g. play a video, open
 * a link), from a press on one of its buttons. The product decides the action names.
 */
export interface ElementAction {
  elementId: string;
  action: string;
}

export interface CanvasEngineOptions<O extends object = object> {
  /** The product being edited: its element kinds, tools, keymap and tool options. */
  product: CanvasProduct<O>;
  theme: CanvasTheme;
  /** Existing document to edit (read with `product.kinds`); a new empty one is created otherwise. */
  document?: CanvasDocument;
  /** The system clipboard for copy and paste; without one, copies only paste in this engine. */
  clipboard?: Clipboard;
}
