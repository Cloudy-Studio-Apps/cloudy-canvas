import type { Rect } from "@canvas";

import type { FrameElement } from "../../frame";
import type { DesignWorkspace } from "../../../design-engine.types";
import type { SidePart } from "../model";
import type { FrameDrawSize } from "./draw-frame.types";

/**
 * A JPEG of a frame exactly (no padding) with what it holds, or of one half of a spread frame, on
 * whichever design page it is: the workspace switches to that page and stays there (callers that
 * care put it back).
 */
export async function drawFrame(
  workspace: DesignWorkspace,
  frame: FrameElement,
  size: FrameDrawSize,
  part: SidePart = "whole",
): Promise<Blob> {
  if (workspace.scope !== frame.pageId) workspace.setScope(frame.pageId);
  const rect = partRect(frame, part);
  return workspace.exportElements({
    format: "jpg",
    background: "solid",
    area: "board",
    ids: [frame.id],
    rect,
    scale: "scale" in size ? size.scale : size.maxSide / Math.max(rect.w, rect.h),
  });
}

/** The area of a frame a side shows: all of it, or its left or right half. */
export function partRect({ x, y, w, h }: Rect, part: SidePart): Rect {
  if (part === "whole") return { x, y, w, h };
  return { x: part === "left" ? x : x + w / 2, y, w: w / 2, h };
}
