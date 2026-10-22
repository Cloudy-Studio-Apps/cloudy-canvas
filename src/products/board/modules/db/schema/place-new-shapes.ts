import { unionRects, type CanvasDocument, type Point, type Size } from "@canvas";

const GAP = 80;
const PER_ROW = 4;

/** Grid positions for new schema shapes, starting to the right of everything else on the board. */
export function placeNewShapes(
  doc: CanvasDocument,
  sizes: readonly Size[],
  ignore: ReadonlySet<string>,
): Point[] {
  const bounds = unionRects(
    doc
      .all()
      .filter((shape) => !ignore.has(shape.id))
      .map(({ x, y, w, h }) => ({ x, y, w, h })),
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
