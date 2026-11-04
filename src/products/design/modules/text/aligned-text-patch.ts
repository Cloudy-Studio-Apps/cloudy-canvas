import type { ElementPatch } from "@canvas";

import { textContentPatch } from "./text-rich-spec";
import type { TextNodeElement, TextNodeRun } from "./text.types";

/**
 * What writes `text` with `runs` from outside the editor (a template filled in): its new size,
 * and an auto-width text keeps its alignment's edge where it was (a right-aligned price grows to
 * the left, a centered one both ways). `null` when it already reads that.
 */
export function alignedTextPatch(
  el: TextNodeElement,
  text: string,
  runs: readonly TextNodeRun[],
): ElementPatch<TextNodeElement> | null {
  const patch = textContentPatch(el, text, runs);
  if (!patch) return null;
  const w = patch.w;
  if (w !== undefined && el.autoResize === "width") {
    if (el.textAlign === "right") patch.x = el.x + el.w - w;
    else if (el.textAlign === "center") patch.x = el.x + (el.w - w) / 2;
  }
  return patch;
}
