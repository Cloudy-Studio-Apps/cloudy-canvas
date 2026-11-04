import type { TextNodeElement } from "../../text";
import type { FrameElement } from "../../frame";
import { pageItemTag, type BookLayout } from "../model";

/**
 * The layout side a text on a printed frame reads its page items for: the frame's one side, or
 * on a spread frame the half it's on (a master copy's `half`, else the half its middle is in, as
 * the sync reads it); `null` for a frame the layout doesn't print.
 */
export function textSide(
  el: TextNodeElement,
  frame: FrameElement,
  layout: BookLayout,
): number | null {
  let whole: number | null = null;
  let left: number | null = null;
  let right: number | null = null;
  layout.sides.forEach((side, i) => {
    if (side.kind !== "page" || side.page.frame.id !== frame.id) return;
    if (side.part === "left") left ??= i;
    else if (side.part === "right") right ??= i;
    else whole ??= i;
  });
  if (left === null || right === null) return whole ?? left ?? right;
  const half = pageItemTag(el)?.half;
  if (half) return half === "left" ? left : right;
  return el.x + el.w / 2 < frame.x + frame.w / 2 ? left : right;
}
