import type * as Y from "yjs";

/** An undo history someone can step through: the user's, or a collaborator's. */
export interface UndoHistory {
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  /** Ends the current step so the next change starts a new one. */
  checkpoint(): void;
  /** The label of the step `undo` would undo, `null` when it has none or there is none. */
  undoLabel(): string | null;
  redoLabel(): string | null;
  /** Fires when the undo/redo stacks change (after document observers have run). */
  onChange(listener: (change: HistoryChange) => void): () => void;
}

/** How a history changed: a step added, undone or redone (with its label), or cleared. */
export interface HistoryChange {
  kind: "added" | "undone" | "redone" | "cleared";
  label: string | null;
}

/** What a history records changes of: the document's Yjs types. */
export type HistoryScope = ConstructorParameters<typeof Y.UndoManager>[0];

/** One step of a `Y.UndoManager` (Yjs doesn't export the class). */
export type HistoryStep = Y.UndoManager["undoStack"][number];

/** A `Y.UndoManager` stack event: the step, and the stack it was added to or taken from. */
export interface HistoryStepEvent {
  stackItem: HistoryStep;
  type: "undo" | "redo";
}
