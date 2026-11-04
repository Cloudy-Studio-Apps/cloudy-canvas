import type { CanvasEngine } from "@canvas";
import { DESIGN_BROCHURES } from "../model/design-brochures";
import { selectedSlots } from "../model/selected-slots";

/**
 * Moves the selected pages of the open brochure one place up (`-1`) or down (`1`), together and
 * in their order, in one undo step (Alt+↑/↓). Nothing at the ends.
 */
export function moveSelectedPages(engine: CanvasEngine, by: -1 | 1): void {
  const brochure = engine.service(DESIGN_BROCHURES).current(engine.scope);
  if (!brochure) return;
  const pages = brochure.pages();
  const ids = selectedSlots(pages, engine.selectedIds());
  const first = pages.findIndex((page) => page.slot.id === ids[0]);
  if (first < 0) return;
  const last = pages.findIndex((page) => page.slot.id === ids.at(-1));
  const atEnd = by < 0 ? first === 0 : last === pages.length - 1;
  // Several pages apart are gathered at the first one's place when they move.
  const together = last - first + 1 === ids.length;
  if (atEnd && together) return;
  brochure.moveMany(ids, Math.max(0, first + (atEnd ? 0 : by)));
}
