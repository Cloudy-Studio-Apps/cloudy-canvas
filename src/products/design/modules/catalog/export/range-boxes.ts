import type { Rect, RichTextLayout } from "@canvas";

/**
 * Where characters `start` to `end` of a laid-out text show: a box per line they're on, around
 * the words they touch (spaces left out), in the text box's own units from its top-left.
 */
export function rangeBoxes(layout: RichTextLayout, start: number, end: number): Rect[] {
  return layout.lines.flatMap((line) => {
    let left = Infinity;
    let right = -Infinity;
    for (const fragment of line.fragments) {
      if (fragment.space || fragment.end <= start || fragment.start >= end) continue;
      left = Math.min(left, fragment.x);
      right = Math.max(right, fragment.x + fragment.w);
    }
    return right > left ? [{ x: left, y: line.top, w: right - left, h: line.height }] : [];
  });
}
