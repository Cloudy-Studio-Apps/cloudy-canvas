import {
  ELEMENT_DEFAULTS,
  type CanvasElement,
  type ElementKind,
  type ElementPatch,
} from "../elements";
import type { ToolArgs } from "./mcp-tool.types";

/**
 * An agent's patch with a new `w`/`h` turned into the kind's own resize, as dragging a handle
 * does: elements that keep their proportions get the other side from the one given, and the kind
 * applies its minimums and layout (e.g. a table scales its rows and columns).
 */
export function resizePatch(kind: ElementKind, el: CanvasElement, patch: ToolArgs): ElementPatch {
  const w = sizeArg(patch, "w");
  const h = sizeArg(patch, "h");
  if (w === undefined && h === undefined) return patch as ElementPatch;
  if (!kind.resizable) {
    throw new Error(`${el.type} elements can't be resized: they're sized to their content.`);
  }
  let width = w ?? el.w;
  let height = h ?? el.h;
  if (kind.keepsRatio && el.w > 0 && el.h > 0) {
    // The width wins when both are given.
    if (w !== undefined) height = (w * el.h) / el.w;
    else if (h !== undefined) width = (h * el.w) / el.h;
  }
  const x = typeof patch.x === "number" ? patch.x : el.x;
  const y = typeof patch.y === "number" ? patch.y : el.y;
  const rect = { x, y, w: Math.round(width), h: Math.round(height) };
  return { ...(patch as ElementPatch), ...kind.resize(el, rect) };
}

function sizeArg(patch: ToolArgs, key: "w" | "h"): number | undefined {
  const value = patch[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || value < ELEMENT_DEFAULTS.minSize) {
    throw new Error(`"${key}" must be a number of at least ${ELEMENT_DEFAULTS.minSize}.`);
  }
  return value;
}
