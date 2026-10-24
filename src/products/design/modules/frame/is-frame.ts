import type { CanvasElement } from "@canvas";

import type { FrameElement } from "./frame.types";

export function isFrame(el: CanvasElement | undefined): el is FrameElement {
  return el?.type === "frame";
}
