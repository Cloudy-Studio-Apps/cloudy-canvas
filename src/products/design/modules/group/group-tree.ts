import type { CanvasElement } from "@canvas";

import { GROUP_TYPE } from "./group.constants";

/** Whether an element is a group. */
export function isGroup(el: CanvasElement | undefined): boolean {
  return el?.type === GROUP_TYPE;
}
