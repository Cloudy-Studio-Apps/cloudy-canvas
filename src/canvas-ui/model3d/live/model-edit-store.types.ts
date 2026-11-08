import type { CanvasEngine, ModelData, ModelTextureSlot, ModelView } from "@canvas";

/** What an edit changes until it finishes: the view and the textures. */
export type ModelDraft = ModelView & { textures: ModelTextureSlot[] };

/** Whether a model is live: none, its 3D being prepared, or shown. */
export type ModelEditStatus = "idle" | "loading" | "live";

/** What an edit ended with, as `ModelLiveView`'s `onFinish` gets it. */
export interface ModelEditResult {
  id: string;
  draft: ModelDraft;
}

/**
 * The model being edited live (app UI state; one at a time across editors). The draft is the
 * only thing that changes while it's live: the document is written once, when it finishes.
 */
export interface ModelEditState {
  /** The editor the model is in (`null` when none is live). */
  engine: CanvasEngine<object> | null;
  id: string | null;
  /** The model's data when the edit started. */
  data: ModelData | null;
  status: ModelEditStatus;
  draft: ModelDraft | null;
  /**
   * Makes the model live (finishing the one that was). Refused with a toast when the document is
   * read-only or someone else edits it. Starting the one already live does nothing.
   */
  start(engine: CanvasEngine<object>, id: string, data: ModelData): void;
  /** Changes the draft (the zoom is kept in `ZOOM_RANGE`). */
  change(patch: Partial<ModelDraft>): void;
  /** The live view has the model ready. */
  ready(id: string): void;
  /**
   * Finishes the edit: releases the lock at once and writes the new picture and view as one undo
   * step (nothing when nothing changed). Resolves when it's written.
   */
  stop(): Promise<void>;
  /** Finishes the edit if it is in `engine` (an editor closing). */
  stopIn(engine: CanvasEngine<object>): Promise<void>;
}
