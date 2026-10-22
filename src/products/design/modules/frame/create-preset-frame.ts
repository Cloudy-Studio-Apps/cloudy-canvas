import type { CanvasDocument, CanvasElement } from "@canvas";

import { nextLayerName } from "../core";
import { createFrame } from "./frame.factory";
import { presetFrameRect } from "./preset-frame-rect";
import type { FrameElement, FramePreset } from "./frame.types";

/**
 * A frame of a preset's size, named after it, next to the page's content (`presetFrameRect`;
 * `elements` are the scene's), at the top of the drawing order. The caller adds it.
 */
export function createPresetFrame(
  preset: FramePreset,
  doc: CanvasDocument,
  elements: readonly CanvasElement[],
): FrameElement {
  const rect = presetFrameRect(preset.size, elements);
  return createFrame(rect, nextLayerName(doc.all(), preset.label), doc.nextIndex(), null);
}
