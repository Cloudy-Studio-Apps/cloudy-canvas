import { createElementBase, ELEMENT_DEFAULTS, type Point } from "@canvas";

import type { TextElement } from "./text.types";

/**
 * Empty text whose first line is vertically centered on `at`. It's a draft: the text editor gives
 * it its index and size when it's added to the document.
 */
export function createTextDraft(at: Point, color: string, fontSize: number): TextElement {
  const lineHeight = Math.ceil(fontSize * ELEMENT_DEFAULTS.lineHeight);
  const rect = { x: Math.round(at.x), y: Math.round(at.y - lineHeight / 2), w: 2, h: lineHeight };
  return { ...createElementBase("text", rect, ""), color, text: "", fontSize };
}
