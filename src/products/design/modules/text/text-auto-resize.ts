import type { LayoutAxis, LayoutSizing } from "../core";
import type { TextAutoResize } from "./text.types";

/**
 * A text's auto size once one side is sized `sizing`: hugging the width is auto width; a width
 * set from outside (fixed or filling) wraps it (auto height); hugging the height keeps auto
 * width or becomes auto height; a height set from outside fixes the box.
 */
export function autoResizeFor(
  auto: TextAutoResize,
  axis: LayoutAxis,
  sizing: LayoutSizing,
): TextAutoResize {
  if (axis === "h") return sizing === "hug" ? "width" : auto === "width" ? "height" : auto;
  if (sizing === "hug") return auto === "width" ? "width" : "height";
  return "none";
}
