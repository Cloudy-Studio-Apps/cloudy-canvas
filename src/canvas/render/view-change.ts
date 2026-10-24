import type { CanvasElement } from "../elements";
import { deepEqual } from "../utils";
import type { ViewChange } from "./view-change.types";

/** The fields a view places itself by, rather than drawing them. */
const POSITION = new Set(["x", "y"]);

/**
 * What a view showing `prev` has to do to show `next` (see `ViewChange`). Kinds draw in the
 * element's own coordinates, so an element that only moved looks the same. Fields compare by
 * identity first (reads share what didn't change), then by contents.
 */
export function viewChange(prev: CanvasElement, next: CanvasElement): ViewChange {
  if (prev === next) return "same";
  const before = prev as unknown as Record<string, unknown>;
  const after = next as unknown as Record<string, unknown>;
  const keys = Object.keys(after);
  if (keys.length !== Object.keys(before).length) return "redraw";
  let moved = false;
  for (const key of keys) {
    const a = before[key];
    const b = after[key];
    if (Object.is(a, b)) continue;
    if (POSITION.has(key)) moved = true;
    else if (!(key in before) || !deepEqual(a, b)) return "redraw";
  }
  return moved ? "moved" : "same";
}
