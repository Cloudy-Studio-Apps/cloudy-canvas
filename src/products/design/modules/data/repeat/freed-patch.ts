import type { CanvasElement, ElementPatch } from "@canvas";

/**
 * What a layer of a copy that stops being one drops (detached, moved out, its iterator gone): its
 * tag, its lock, and what data wrote into it (`dataText`, `dataBindings`, `dataVisible`,
 * `dataHideEmpty`, an iterator's `repeat`), so it keeps what it shows. `null` when nothing changes.
 */
export function freedPatch(el: CanvasElement): ElementPatch | null {
  const raw = el as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (raw.dataCopy != null) patch.dataCopy = null;
  if (raw.locked === true) patch.locked = false;
  for (const field of ["dataText", "dataBindings", "dataVisible", "repeat"]) {
    if (raw[field] != null) patch[field] = null;
  }
  if (raw.dataHideEmpty === true) patch.dataHideEmpty = false;
  return Object.keys(patch).length > 0 ? (patch as ElementPatch) : null;
}
