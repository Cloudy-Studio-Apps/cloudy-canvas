import type { LayerDestination, LayerTree } from "@design";

import type { LayerRowItem } from "../visible-rows.types";
import type { LayerDrop, LayerDropInput } from "./layer-drop.types";

/** The share of a row's height at its top and bottom that drops next to it, not into it. */
const EDGE = 0.25;

/**
 * Where dragged layers would land with the pointer at (x, y), as Figma's layers panel does it:
 * the top or bottom quarter of a row drops above or below it, the middle into it when it holds
 * layers (otherwise the halves split above/below); below an open row it's its top child; below a
 * parent's last child, moving left takes the layers out to an outer level. `null` when they can't
 * go there.
 */
export function layerDrop(input: LayerDropInput): LayerDrop | null {
  const { rows, metrics } = input;
  if (rows.length === 0) {
    const destination = { parentId: null, position: 0 };
    return input.allowed(destination) ? { destination, line: null, inside: null } : null;
  }
  const at = Math.floor(input.y / metrics.rowHeight);
  const i = Math.max(0, Math.min(rows.length - 1, at));
  const row = rows[i]!;
  const fraction = at < 0 ? 0 : at >= rows.length ? 1 : input.y / metrics.rowHeight - at;
  const holds = input.holds(row.node) && !input.moving.has(row.node.id);

  if (holds && fraction >= EDGE && fraction <= 1 - EDGE) {
    const destination = { parentId: row.node.id, position: 0 };
    if (input.allowed(destination)) return { destination, line: null, inside: row.node.id };
  }
  const above = holds ? fraction < EDGE : fraction < 0.5;
  return above ? dropAbove(input, i) : dropBelow(input, i);
}

function dropAbove(input: LayerDropInput, i: number): LayerDrop | null {
  const row = input.rows[i]!;
  const destination = {
    parentId: row.parentId,
    position: positionIn(input.tree, row.parentId, row.node.id, input.moving, false),
  };
  return allowedDrop(input, destination, { boundary: i, depth: row.depth });
}

function dropBelow(input: LayerDropInput, i: number): LayerDrop | null {
  const { rows, tree, moving } = input;
  const row = rows[i]!;
  // Below an open parent: on top inside it.
  if (row.expanded && !moving.has(row.node.id)) {
    const destination = { parentId: row.node.id, position: 0 };
    return allowedDrop(input, destination, { boundary: i + 1, depth: row.depth + 1 });
  }
  // Its own level, then (while each is the last child) its ancestors' levels, deepest first.
  const levels: { destination: LayerDestination; depth: number }[] = [];
  for (let item: LayerRowItem | undefined = row, from = i; item;) {
    levels.push({
      destination: {
        parentId: item.parentId,
        position: positionIn(tree, item.parentId, item.node.id, moving, true),
      },
      depth: item.depth,
    });
    if (!item.last || item.parentId === null) break;
    from = parentRowIndex(rows, from);
    item = rows[from];
  }
  const { metrics } = input;
  const wanted = Math.floor((input.x - metrics.baseIndent) / metrics.indent);
  const level = levels.find((l) => l.depth <= wanted) ?? levels[levels.length - 1]!;
  return allowedDrop(input, level.destination, { boundary: i + 1, depth: level.depth });
}

function allowedDrop(
  input: LayerDropInput,
  destination: LayerDestination,
  line: { boundary: number; depth: number },
): LayerDrop | null {
  return input.allowed(destination) ? { destination, line, inside: null } : null;
}

/** The row of `rows[i]`'s parent (searching up from it). */
function parentRowIndex(rows: readonly LayerRowItem[], i: number): number {
  const parentId = rows[i]?.parentId;
  for (let j = i - 1; j >= 0; j--) if (rows[j]!.node.id === parentId) return j;
  return -1;
}

/**
 * The position just above (or, `after`, below) the layer `id` among `parentId`'s children
 * topmost first, not counting the moving layers (`LayerDestination.position`).
 */
function positionIn(
  tree: LayerTree,
  parentId: string | null,
  id: string,
  moving: ReadonlySet<string>,
  after: boolean,
): number {
  let count = 0;
  for (const child of tree.get(parentId) ?? []) {
    if (child.id === id) return after && !moving.has(id) ? count + 1 : count;
    if (!moving.has(child.id)) count++;
  }
  return count;
}
