import { rectCenter, type Rect } from "@canvas";

import { DEFAULT_AUTO_LAYOUT, type AutoLayout, type LayoutCounterAlign } from "../core";

/**
 * The auto layout that keeps layers about where they are, as Figma guesses it: the direction
 * they spread along, the usual gap between them, how they line up across it, and (inside a
 * frame, `frame`) the padding they leave.
 */
export function guessLayout(boxes: readonly Rect[], frame: Rect | null): AutoLayout {
  const centers = boxes.map(rectCenter);
  const spread = (axis: "x" | "y") =>
    Math.max(...centers.map((c) => c[axis])) - Math.min(...centers.map((c) => c[axis]));
  const horizontal = boxes.length < 2 || spread("x") >= spread("y");
  const [p, size] = horizontal ? (["x", "w"] as const) : (["y", "h"] as const);
  const sorted = [...boxes].sort((a, b) => a[p] - b[p]);
  const gaps = sorted.slice(1).map((box, i) => box[p] - (sorted[i]![p] + sorted[i]![size]));
  const gap = gaps.length > 0 ? Math.max(0, Math.round(median(gaps))) : DEFAULT_AUTO_LAYOUT.gap;
  return {
    ...DEFAULT_AUTO_LAYOUT,
    direction: horizontal ? "horizontal" : "vertical",
    gap,
    padding: frame ? paddingIn(boxes, frame) : { top: 0, right: 0, bottom: 0, left: 0 },
    counterAlign: counterAlignOf(boxes, horizontal),
  };
}

function paddingIn(boxes: readonly Rect[], frame: Rect): AutoLayout["padding"] {
  if (boxes.length === 0) return DEFAULT_AUTO_LAYOUT.padding;
  const side = (n: number) => Math.max(0, Math.round(n));
  return {
    top: side(Math.min(...boxes.map((b) => b.y)) - frame.y),
    right: side(frame.x + frame.w - Math.max(...boxes.map((b) => b.x + b.w))),
    bottom: side(frame.y + frame.h - Math.max(...boxes.map((b) => b.y + b.h))),
    left: side(Math.min(...boxes.map((b) => b.x)) - frame.x),
  };
}

/** Lined up by their middles or their ends across the direction; else their starts. */
function counterAlignOf(boxes: readonly Rect[], horizontal: boolean): LayoutCounterAlign {
  if (boxes.length < 2) return "start";
  const [c, size] = horizontal ? (["y", "h"] as const) : (["x", "w"] as const);
  const lined = (at: (box: Rect) => number) => {
    const values = boxes.map(at);
    return Math.max(...values) - Math.min(...values) < 1;
  };
  if (lined((box) => box[c])) return "start";
  if (lined((box) => box[c] + box[size] / 2)) return "center";
  if (lined((box) => box[c] + box[size])) return "end";
  return "start";
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
