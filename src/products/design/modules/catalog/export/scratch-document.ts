import type { DesignEngine } from "../../../design-engine.types";
import type { ScratchWorkspace } from "./scratch-document.types";

/**
 * A fork of the engine's document (`CanvasDocument.fork`) with a workspace over it, built as
 * agents' are, whose edits run the design's after-edit hook (data, brochure repeats, page items):
 * an export makes every repeated page and card copy there, leaving the user's file alone. The data
 * phase is the fork's own, so setting `"export"` on it never touches the open document.
 */
export function scratchWorkspace(engine: DesignEngine): ScratchWorkspace {
  const doc = engine.doc.fork();
  const workspace = engine.scratchWorkspace(doc);
  let disposed = false;
  return {
    workspace,
    doc,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      workspace.destroy();
      doc.setAfterEdit(null);
      doc.destroy();
    },
  };
}
