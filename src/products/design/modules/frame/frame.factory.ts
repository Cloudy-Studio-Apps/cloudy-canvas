import type { Rect } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { FRAME_DEFAULTS } from "./frame.defaults";
import type { FrameElement } from "./frame.types";

export function createFrame(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
): FrameElement {
  return {
    ...createNodeBase("frame", rect, index, {
      name,
      parentId,
      fills: [solidPaint(FRAME_DEFAULTS.fill)],
    }),
    cornerRadius: FRAME_DEFAULTS.cornerRadius,
    clipsContent: FRAME_DEFAULTS.clipsContent,
  };
}
