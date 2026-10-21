import type { CanvasElement } from "../elements";
import type { Disposables } from "../utils";

export interface TextEditorHooks {
  /** An element as the scene sees it (derived geometry resolved), for placing the editor. */
  getElement(id: string): CanvasElement | undefined;
  onStart(id: string): void;
  onEnd(id: string): void;
  /** A new element typed with `startDraft` was added to the document. */
  onCreate(id: string): void;
  /** Deletes an element whose text was emptied (see `ElementText.removeWhenEmpty`). */
  remove(id: string): void;
}

export interface Session {
  textarea: HTMLTextAreaElement;
  /** The element being edited. */
  id: string;
  /** A new element that isn't in the document yet; it's added on commit. */
  draft: CanvasElement | null;
  listeners: Disposables;
}
