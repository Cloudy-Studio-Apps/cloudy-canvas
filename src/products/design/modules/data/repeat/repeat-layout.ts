import type { CanvasDocument, ElementKinds, ElementPatch } from "@canvas";

import { addAutoLayout, layoutPatch } from "../../auto-layout";
import { isDesignNode, layoutOf } from "../../core";

/**
 * Gives an iterator frame without an auto layout a wrapping row (`addAutoLayout`, then wrap on),
 * so its copies line up and wrap at the frame's width instead of stacking on the template: the
 * width stays fixed and the height hugs the rows. Inside the caller's undo step (it holds the
 * checkpoints `addAutoLayout` takes).
 */
export function addRepeatLayout(doc: CanvasDocument, frameId: string, kinds: ElementKinds): void {
  const frame = doc.get(frameId);
  if (!frame || !isDesignNode(frame) || layoutOf(frame)) return;
  const width = frame.w;
  addAutoLayout(doc, new Set([frameId]), doc.all(), kinds);
  const now = doc.get(frameId);
  if (!now || !isDesignNode(now)) return;
  const patch = layoutPatch(now, { direction: "horizontal", wrap: true });
  if (!patch) return;
  doc.update(frameId, {
    ...patch,
    sizing: { h: "fixed", v: "hug" },
    w: width,
  } as ElementPatch);
}
