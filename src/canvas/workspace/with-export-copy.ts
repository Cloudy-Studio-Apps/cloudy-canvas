import type { CanvasWorkspace } from "./workspace.types";

/**
 * Runs an export on the workspace, or on a copy of the document readied for it when the product
 * says the document as it is would export less than it should (`needsExportCopy`, e.g. a design's
 * repeats past their design caps), so the export has everything and the file never changes. The
 * copy is disposed however the export ends.
 */
export async function withExportCopy<O extends object, T>(
  workspace: CanvasWorkspace<O>,
  work: (workspace: CanvasWorkspace<O>) => Promise<T>,
): Promise<T> {
  if (!workspace.needsExportCopy()) return work(workspace);
  const copy = workspace.exportCopy();
  try {
    return await work(copy.workspace);
  } finally {
    copy.dispose();
  }
}
