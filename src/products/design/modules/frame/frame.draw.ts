import type { ElementView } from "@canvas";
import type { Graphics } from "pixi.js";

import { drawPaints, traceBox } from "../core";
import { FRAME_DEFAULTS } from "./frame.defaults";
import { labelRect, showsLabel } from "./frame-label";
import type { FrameElement } from "./frame.types";

const LABEL_SLOT = "label";

/** The frame's (rounded) outline, in local coordinates. */
export function frameOutline(el: FrameElement): (g: Graphics) => void {
  return (g) => traceBox(g, el.w, el.h, el.cornerRadius);
}

/** The frame's fills and strokes, and its name above it when it's at the top of the page. */
export function drawFrame(view: ElementView, el: FrameElement): void {
  drawPaints(view, el, frameOutline(el));

  if (!showsLabel(el)) return view.pruneTextSlots(new Set());
  const { fontSize, color } = FRAME_DEFAULTS.label;
  const rect = labelRect(el);
  const label = view.setTextSlot(LABEL_SLOT, el.name, { fontSize, color });
  label.position.set(0, rect.y - el.y);
}
