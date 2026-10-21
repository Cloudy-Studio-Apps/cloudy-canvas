import type { BoardDocument, DbTableShape } from "../document";
import { unionRects } from "../geometry";
import type { Point } from "../geometry.types";
import { shapeBounds } from "../hit-test";

const GAP = 80;
const PER_ROW = 4;

/** Grid positions for new tables, starting to the right of everything else on the board. */
export function placeNewTables(
  doc: BoardDocument,
  tables: readonly DbTableShape[],
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
  return tables.map((table, i) => {
    if (i > 0 && i % PER_ROW === 0) {
      x = startX;
      y += rowHeight + GAP;
      rowHeight = 0;
    }
    const position = { x: Math.round(x), y: Math.round(y) };
    x += table.w + GAP;
    rowHeight = Math.max(rowHeight, table.h);
    return position;
  });
}
