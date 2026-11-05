import type { CanvasDocument } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";

/**
 * A throwaway copy of the design to work on (an export's repeated pages and card copies): edits
 * through `workspace` reach only `doc`, never the user's document or file.
 */
export interface ScratchWorkspace {
  /** A headless workspace over the fork, on the page the user shows; syncs run on its edits. */
  readonly workspace: DesignWorkspace;
  /** The fork itself (the data phase is set on it, see `setDataPhase`). */
  readonly doc: CanvasDocument;
  /** Drops the workspace, then destroys the fork and its Y.Doc. Call it once the work is done. */
  dispose(): void;
}
