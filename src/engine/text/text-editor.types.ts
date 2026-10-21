import type { Disposables } from "../utils";

export interface TextEditorHooks {
  onStart(id: string): void;
  onEnd(id: string): void;
}

export interface Session {
  textarea: HTMLTextAreaElement;
  /** The element being edited. */
  id: string;
  listeners: Disposables;
}
