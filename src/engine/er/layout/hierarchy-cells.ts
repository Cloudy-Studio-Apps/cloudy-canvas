import type { ErShapes } from "../lang";
import type { Cell, Hierarchy } from "./layout.types";

export function hierarchyOf({ isas }: ErShapes): Hierarchy {
  const parentOf = new Map<string, string>();
  const childrenOf = new Map<string, string[]>();
  for (const isa of isas) {
    const children = isa.children.map((c) => c.entityId);
    childrenOf.set(isa.parentId, [...(childrenOf.get(isa.parentId) ?? []), ...children]);
    for (const child of children) parentOf.set(child, isa.parentId);
  }
  return { parentOf, childrenOf };
}

/**
 * The cell for an entity in a hierarchy: a child goes in the row under its parent, the children
 * spread round the parent's column; a parent goes above its first placed child. Null when the
 * entity's hierarchy neighbours aren't placed yet.
 */
export function hierarchyCell(
  id: string,
  hierarchy: Hierarchy,
  cells: ReadonlyMap<string, Cell>,
  taken: ReadonlySet<string>,
): Cell | null {
  const parent = hierarchy.parentOf.get(id);
  const parentCell = parent ? cells.get(parent) : undefined;
  if (parent && parentCell) {
    const siblings = hierarchy.childrenOf.get(parent) ?? [id];
    const offset = siblings.indexOf(id) - (siblings.length - 1) / 2;
    return nearestFree({ c: Math.round(parentCell.c + offset), r: parentCell.r + 1 }, taken);
  }
  const child = (hierarchy.childrenOf.get(id) ?? []).find((c) => cells.has(c));
  const childCell = child ? cells.get(child) : undefined;
  return childCell ? nearestFree({ c: childCell.c, r: childCell.r - 1 }, taken) : null;
}

/** The free cell in the same row closest to `target`. */
function nearestFree(target: Cell, taken: ReadonlySet<string>): Cell {
  for (let d = 0; ; d++) {
    for (const c of d === 0 ? [target.c] : [target.c + d, target.c - d]) {
      if (!taken.has(`${c},${target.r}`)) return { c, r: target.r };
    }
  }
}
