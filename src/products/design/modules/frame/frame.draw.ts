import type { ElementView } from "@canvas";

import { drawPaints, type NodeGeometry, type NodeStroke } from "../core";
import { FRAME_DEFAULTS } from "./frame.defaults";
import { labelRect, showsLabel } from "./frame-label";
import type { FrameElement } from "./frame.types";

const LABEL_SLOT = "label";

/** The frame's fills and strokes, and its name above it when it's at the top of the page. */
export function drawFrame(
  view: ElementView,
  el: FrameElement,
  geometry: NodeGeometry,
  stroke: NodeStroke | null,
): void {
  drawPaints(view, el, geometry, stroke);

  if (!showsLabel(el)) return view.pruneTextSlots(new Set());
  const { fontSize, color } = FRAME_DEFAULTS.label;
  const rect = labelRect(el);
  const label = view.setTextSlot(LABEL_SLOT, el.name, { fontSize, color });
  label.position.set(0, rect.y - el.y);
}
