import type { RowDropTarget } from "./row-drag.types";

const TARGET = "[data-row-drop]";

/**
 * The target of list `scope` under a point: the innermost one `accepts` takes, so a row that can't
 * take a drop leaves it to the group around it.
 */
export function rowDropTarget(
  point: { x: number; y: number },
  scope: string,
  accepts: (id: string) => boolean,
): RowDropTarget | null {
  let element = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>(TARGET);
  while (element) {
    const id = element.dataset.rowDrop;
    if (id !== undefined && element.dataset.rowDropScope === scope && accepts(id)) {
      const box = element.getBoundingClientRect();
      return { id, side: point.y < box.top + box.height / 2 ? "before" : "after" };
    }
    element = element.parentElement?.closest<HTMLElement>(TARGET);
  }
  return null;
}
