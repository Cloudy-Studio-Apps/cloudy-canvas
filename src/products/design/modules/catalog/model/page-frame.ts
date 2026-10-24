import type { CanvasElement } from "@canvas";

import { isFrame, type FrameElement } from "../../frame";

/** Whether an element can be a brochure page: a frame at the top of its page. */
export function isPageFrame(el: CanvasElement | undefined): el is FrameElement {
  return isFrame(el) && el.parentId === null;
}
