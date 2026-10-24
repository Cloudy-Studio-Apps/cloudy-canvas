import { setBindings, type CanvasDocument } from "@canvas";

/**
 * Binds a field of layers to a variable (`null` detaches it, keeping its value) in one undo step;
 * the token sync gives them its value in the same step.
 */
export function bindNodes(
  doc: CanvasDocument,
  ids: readonly string[],
  path: string,
  variableId: string | null,
): void {
  doc.checkpoint();
  doc.batch(() => setBindings(doc, ids, path, variableId));
}
