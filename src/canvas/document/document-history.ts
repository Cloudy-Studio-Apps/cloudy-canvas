import * as Y from "yjs";

import type {
  HistoryChange,
  HistoryScope,
  HistoryStep,
  HistoryStepEvent,
  UndoHistory,
} from "./document-history.types";

/** Merges changes made this close together into one undo step. */
const CAPTURE_TIMEOUT_MS = 400;
const LABEL = "label";

/**
 * The undo history of the edits made with one transaction origin (the user's, an agent's): a
 * `Y.UndoManager` over the document's maps that records only that origin, so each collaborator
 * undoes only their own changes. Steps can carry a label (`setNextLabel`), which follows them
 * between the undo and redo stacks.
 */
export class DocumentHistory implements UndoHistory {
  private readonly manager: Y.UndoManager;
  /** The label of the next step recorded. */
  private nextLabel: string | null = null;
  /** The label of the step being undone or redone, given to the step that replaces it. */
  private moving: string | null = null;

  constructor(scope: HistoryScope, origin: symbol) {
    this.manager = new Y.UndoManager(scope, {
      trackedOrigins: new Set([origin]),
      captureTimeout: CAPTURE_TIMEOUT_MS,
    });
    this.manager.on("stack-item-added", ({ stackItem }) => {
      const label = this.manager.undoing || this.manager.redoing ? this.moving : this.nextLabel;
      if (label !== null && !stackItem.meta.has(LABEL)) stackItem.meta.set(LABEL, label);
    });
  }

  /** Labels the steps recorded from now on (e.g. "Created shapes"); `null` stops labelling. */
  setNextLabel(label: string | null): void {
    this.nextLabel = label;
  }

  checkpoint(): void {
    this.manager.stopCapturing();
  }

  undo(): void {
    this.move(this.undoLabel(), () => this.manager.undo());
  }

  redo(): void {
    this.move(this.redoLabel(), () => this.manager.redo());
  }

  canUndo(): boolean {
    return this.manager.canUndo();
  }

  canRedo(): boolean {
    return this.manager.canRedo();
  }

  undoLabel(): string | null {
    return labelOf(this.manager.undoStack.at(-1));
  }

  redoLabel(): string | null {
    return labelOf(this.manager.redoStack.at(-1));
  }

  onChange(listener: (change: HistoryChange) => void): () => void {
    const added = ({ stackItem, type }: HistoryStepEvent) => {
      // Undoing a step adds it to the redo stack (and redoing back): `popped` reports those.
      if (this.manager.undoing || this.manager.redoing) return;
      if (type === "undo") listener({ kind: "added", label: labelOf(stackItem) });
    };
    const popped = ({ stackItem, type }: HistoryStepEvent) =>
      listener({ kind: type === "undo" ? "undone" : "redone", label: labelOf(stackItem) });
    const cleared = () => listener({ kind: "cleared", label: null });
    this.manager.on("stack-item-added", added);
    this.manager.on("stack-item-popped", popped);
    this.manager.on("stack-cleared", cleared);
    return () => {
      this.manager.off("stack-item-added", added);
      this.manager.off("stack-item-popped", popped);
      this.manager.off("stack-cleared", cleared);
    };
  }

  destroy(): void {
    this.manager.destroy();
  }

  private move(label: string | null, step: () => void): void {
    this.moving = label;
    try {
      step();
    } finally {
      this.moving = null;
    }
  }
}

function labelOf(step: HistoryStep | undefined): string | null {
  const label: unknown = step?.meta.get(LABEL);
  return typeof label === "string" ? label : null;
}
