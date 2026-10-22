import type { Point } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { TEXT_DEFAULTS } from "./text.defaults";
import { textSize } from "./text-layout";
import type { TextAutoResize, TextNodeElement, TextTypography } from "./text.types";

/**
 * An empty text at `at` (its top-left corner) in `typography`: auto width, or auto height `width`
 * wide when given. Named after its text until renamed (`name` is empty).
 */
export function createText(
  at: Point,
  index: string,
  parentId: string | null,
  typography: TextTypography,
  width?: number,
): TextNodeElement {
  const autoResize: TextAutoResize = width === undefined ? "width" : "height";
  const el: TextNodeElement = {
    ...createNodeBase("text", { x: at.x, y: at.y, w: width ?? 1, h: 1 }, index, {
      name: "",
      parentId,
      fills: [solidPaint(TEXT_DEFAULTS.color)],
    }),
    ...typography,
    text: "",
    textAlign: "left",
    verticalAlign: "top",
    autoResize,
  };
  return { ...el, ...textSize(el) };
}
