import type { EditableShape } from "../document";
import type { Disposables } from "../utils";

export interface TextEditorHooks {
  onStart(id: string): void;
  onEnd(id: string): void;
  /** A draft (new) shape was committed with content and added to the document. */
  onCreate(id: string): void;
}

export interface Session {
  textarea: HTMLTextAreaElement;
  shape: EditableShape;
  /** New text that isn't in the document yet; only added on commit if non-empty (keeps undo clean). */
  isDraft: boolean;
  listeners: Disposables;
}
