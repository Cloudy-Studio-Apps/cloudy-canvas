import type { FrameElement } from "../../frame";
import type { DesignWorkspace } from "../../../design-engine.types";
import type { FrameDrawSize } from "./draw-frame.types";

/**
 * A JPEG of a frame exactly (no padding) with what it holds, on whichever design page it is: the
 * workspace switches to that page and stays there (callers that care put it back).
 */
export async function drawFrame(
  workspace: DesignWorkspace,
  frame: FrameElement,
  size: FrameDrawSize,
): Promise<Blob> {
  if (workspace.scope !== frame.pageId) workspace.setScope(frame.pageId);
  const { x, y, w, h } = frame;
  return workspace.exportElements({
    format: "jpg",
    background: "solid",
    area: "board",
    ids: [frame.id],
    rect: { x, y, w, h },
    ...("scale" in size ? { scale: size.scale } : { scale: size.maxSide / Math.max(w, h) }),
  });
}
