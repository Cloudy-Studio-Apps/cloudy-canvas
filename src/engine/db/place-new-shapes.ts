import type { BoardDocument } from "../document";
import { unionRects } from "../geometry";
import type { Point, Size } from "../geometry.types";
import { shapeBounds } from "../hit-test";

const GAP = 80;
const PER_ROW = 4;

/** Grid positions for new schema shapes, starting to the right of everything else on the board. */
export function placeNewShapes(
  doc: BoardDocument,
  sizes: readonly Size[],
  ignore: ReadonlySet<string>,
): Point[] {
  const bounds = unionRects(
    doc
      .all()
      .filter((shape) => !ignore.has(shape.id))
      .map(shapeBounds),
  );
  const startX = bounds ? bounds.x + bounds.w + GAP * 2 : 0;
  let x = startX;
  let y = bounds?.y ?? 0;
  let rowHeight = 0;
  return sizes.map((size, i) => {
    if (i > 0 && i % PER_ROW === 0) {
      x = startX;
      y += rowHeight + GAP;
      rowHeight = 0;
    }
    const position = { x: Math.round(x), y: Math.round(y) };
    x += size.w + GAP;
    rowHeight = Math.max(rowHeight, size.h);
    return position;
  });
}
