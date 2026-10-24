import type { UndoHistory } from "@canvas";

/** A collaborator's undo history as the user can step through it, with what each step is. */
export interface CollaboratorHistory {
  history: UndoHistory;
  canUndo: boolean;
  canRedo: boolean;
  /** "Created shapes (3)": the step Undo would undo, when it has a label. */
  undoLabel: string | null;
  redoLabel: string | null;
  undo(): void;
  redo(): void;
}
