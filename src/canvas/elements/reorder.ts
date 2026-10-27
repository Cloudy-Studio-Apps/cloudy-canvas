import { rectsIntersect, unionRects } from "../geometry";
import type { CanvasElement } from "./element.types";
import type { ReorderInput } from "./reorder.types";
import { nKeysBetween } from "../utils";

/**
 * New indexes that move elements in the drawing order, keeping their order among themselves:
 * to the front or back of everything, or one step past the nearest element they overlap. Returns
 * an empty map when nothing would change.
 */
export function reorderIndexes({
  layer,
  moving,
  direction,
  bounds,
  above,
  below,
}: ReorderInput): Map<string, string> {
  const moved = layer.filter((el) => moving.has(el.id));
  const rest = layer.filter((el) => !moving.has(el.id));
  if (moved.length === 0) return new Map();
  const first = layer.indexOf(moved[0]!);
  const last = layer.indexOf(moved[moved.length - 1]!);

  let indexes: string[] | null = null;
  if (direction === "front") {
    if (last - first + 1 === moved.length && last === layer.length - 1) return new Map();
    indexes = above(moved.length);
  } else if (direction === "back") {
    if (last - first + 1 === moved.length && first === 0) return new Map();
    indexes = below(moved.length);
  } else {
    const area = unionRects(moved.map(bounds));
    const overlaps = (el: CanvasElement) => area !== null && rectsIntersect(bounds(el), area);
    if (direction === "forward") {
      const top = moved[moved.length - 1]!.index;
      const at = rest.findIndex((el) => el.index > top && overlaps(el));
      if (at < 0) return new Map();
      indexes = nKeysBetween(rest[at]!.index, rest[at + 1]?.index ?? null, moved.length);
    } else {
      const bottom = moved[0]!.index;
      let at = rest.length - 1;
      while (at >= 0 && !(rest[at]!.index < bottom && overlaps(rest[at]!))) at--;
      if (at < 0) return new Map();
      indexes = nKeysBetween(rest[at - 1]?.index ?? null, rest[at]!.index, moved.length);
    }
  }
  return new Map(moved.map((el, i) => [el.id, indexes[i]!]));
}
