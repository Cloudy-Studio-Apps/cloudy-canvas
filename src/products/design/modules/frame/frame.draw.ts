import { measureText, type ElementView } from "@canvas";

import { drawPaints, withoutLayerOpacity, type NodeGeometry, type NodeStroke } from "../core";
import { FRAME_DEFAULTS } from "./frame.defaults";
import { labelRect, showsLabel } from "./frame-label";
import type { FrameElement } from "./frame.types";

const LABEL_SLOT = "label";
const TAG_SLOT = "tag";

/**
 * The frame's fills and strokes (opaque: its opacity covers what it holds, so its scope applies
 * it), and its name above it when it's at the top of the page, followed by `tag` (lighter) when
 * another module adds words to it (`frameLabelTags`).
 */
export function drawFrame(
  view: ElementView,
  el: FrameElement,
  geometry: NodeGeometry,
  stroke: NodeStroke | null,
  tag: string | null = null,
): void {
  drawPaints(view, withoutLayerOpacity(el), geometry, stroke);

  if (!showsLabel(el)) return view.pruneTextSlots(new Set());
  const { fontSize, color, tagGap, tagColor } = FRAME_DEFAULTS.label;
  const rect = labelRect(el);
  const label = view.setTextSlot(LABEL_SLOT, el.name, { fontSize, color });
  // A mirrored frame's name still reads left to right from its corner.
  label.scale.x = el.mirrored ? -1 : 1;
  label.position.set(el.mirrored ? el.w : 0, rect.y - el.y);
  if (!tag) return view.pruneTextSlots(new Set([LABEL_SLOT]));
  const after = measureText(el.name, fontSize).w + tagGap;
  const words = view.setTextSlot(TAG_SLOT, tag, { fontSize, color: tagColor });
  words.scale.x = label.scale.x;
  words.position.set(el.mirrored ? el.w - after : after, rect.y - el.y);
}
