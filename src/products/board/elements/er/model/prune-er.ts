import type { CanvasDocument } from "@canvas";

import { isErElement } from "../base/is-er-element";
import { erOrphans, withoutDeadLinks } from "./er-orphans";

/**
 * Cleans up after shapes were removed: ER elements that can't exist without a removed one go too
 * (see `erOrphans`), and participants and hierarchy children that point at removed shapes are
 * dropped. Call inside a batch, after removing shapes.
 */
export function pruneEr(doc: CanvasDocument): void {
  const shapes = doc.all().filter(isErElement);
  const alive = new Set(shapes.map((s) => s.id));
  const gone = erOrphans(shapes, (id) => !alive.has(id));
  if (gone.size) doc.remove(gone);

  const dead = (id: string) => !alive.has(id) || gone.has(id);
  for (const shape of shapes) {
    if (gone.has(shape.id)) continue;
    const patch = withoutDeadLinks(shape, dead);
    if (patch) doc.update(shape.id, patch);
  }
}
