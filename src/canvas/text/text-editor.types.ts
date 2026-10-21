import type { CanvasElement } from "../elements";
import type { Disposables } from "../utils";

export interface TextEditorHooks {
  /** An element as the scene sees it (derived geometry resolved), for placing the editor. */
  getElement(id: string): CanvasElement | undefined;
  onStart(id: string): void;
  onEnd(id: string): void;
}

export interface Session {
  textarea: HTMLTextAreaElement;
  /** The element being edited. */
  id: string;
  listeners: Disposables;
}
