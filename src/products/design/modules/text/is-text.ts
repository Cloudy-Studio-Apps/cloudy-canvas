import type { CanvasElement } from "@canvas";

import type { TextNodeElement } from "./text.types";

export function isText(el: CanvasElement | undefined): el is TextNodeElement {
  return el?.type === "text";
}
