import { columnAnchor, rowTop } from "../db";
import { DB_ROW_H, isDbTable, type Shape } from "../document";
import { unionRects } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import { shapeBounds } from "../hit-test";
import type { DropTarget, OverlayState } from "./overlay-state.types";

export function buildOverlayState(
  selected: Shape[],
  hover: Shape | undefined,
  marquee: Rect | null,
  dropTarget: DropTarget | null,
): OverlayState {
  const selection = selected.map(shapeBounds);
  const withHandles = hover && !selected.includes(hover) ? [...selected, hover] : selected;
  const handles: Point[] = [];
  for (const shape of withHandles) {
    if (!isDbTable(shape)) continue;
    shape.columns.forEach((_, row) => {
      handles.push(columnAnchor(shape, row, "left"), columnAnchor(shape, row, "right"));
    });
  }
  return {
    selection,
    selectionBounds: selection.length > 1 ? unionRects(selection) : null,
    hover: hover ? shapeBounds(hover) : null,
    marquee,
    handles,
    dropTarget: dropTarget && {
      x: dropTarget.table.x,
      y: dropTarget.table.y + rowTop(dropTarget.row),
      w: dropTarget.table.w,
      h: DB_ROW_H,
    },
  };
}
