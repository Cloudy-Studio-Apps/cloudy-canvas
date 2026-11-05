import type { CanvasEngine } from "@canvas";
import { DESIGN_BROCHURES } from "../model/design-brochures";
import { selectedSlots } from "../model/selected-slots";
import { storedPosition } from "../model/stored-position";

/**
 * Moves the selected pages of the open brochure one place up (`-1`) or down (`1`), together and
 * in their order, in one undo step (Alt+↑/↓); a run of pending pages is passed in one step.
 * Nothing at the ends. Returns `false` when it's refused: a page a repeat made follows its
 * template and never moves by hand.
 */
export function moveSelectedPages(engine: CanvasEngine, by: -1 | 1): boolean {
  const brochure = engine.service(DESIGN_BROCHURES).current(engine.scope);
  if (!brochure) return true;
  const pages = brochure.pages();
  const ids = selectedSlots(pages, engine.selectedIds());
  const copy = new Set(pages.filter((page) => page.slot.generated).map((page) => page.slot.id));
  if (ids.some((id) => copy.has(id))) return false;
  const first = pages.findIndex((page) => page.slot.id === ids[0]);
  if (first < 0) return true;
  const last = pages.findIndex((page) => page.slot.id === ids.at(-1));
  const atEnd = by < 0 ? first === 0 : last === pages.length - 1;
  // Several pages apart are gathered at the first one's place when they move.
  const together = last - first + 1 === ids.length;
  if (atEnd && together) return true;
  const at = Math.max(0, first + (atEnd ? 0 : by));
  const slots = brochure.record()?.slots ?? [];
  brochure.moveMany(ids, storedPosition(slots, pages, ids, at, by < 0 ? "previous" : "next"));
  return true;
}
