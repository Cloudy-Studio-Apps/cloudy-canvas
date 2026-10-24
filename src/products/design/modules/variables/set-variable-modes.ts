import type { CanvasDocument, ElementPatch } from "@canvas";

/**
 * Sets which mode of an axis pages or layers (and what they hold) use, `null` to inherit it again
 * (from what holds them, then the file), in one undo step. The token sync then gives their layers
 * that mode's values.
 */
export function setVariableModes(
  doc: CanvasDocument,
  ids: readonly string[],
  axisId: string,
  modeId: string | null,
): void {
  const patches = new Map<string, ElementPatch>();
  for (const id of ids) {
    const el = doc.get(id);
    if (!el) continue;
    const modes = { ...el.variableModes };
    if (modeId === null) delete modes[axisId];
    else modes[axisId] = modeId;
    patches.set(id, { variableModes: modes });
  }
  if (patches.size === 0) return;
  doc.checkpoint();
  doc.updateMany(patches);
}
