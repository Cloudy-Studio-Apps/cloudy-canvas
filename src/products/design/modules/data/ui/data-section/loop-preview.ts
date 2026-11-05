import type { CanvasDocument } from "@canvas";

import type { DataLoopPreview, DataPreviewSetter } from "../../data.points.types";
import type { ScopeLayer } from "../../repeat";
import { cardLoopPreview } from "./card-loop-preview";
import type { CardLoopPreview } from "./card-loop-preview.types";

/**
 * One loop around a layer as In scope shows it: the first `dataPreviewSetters` answer (a
 * brochure's section or page), else the card repeater it is; a module that answers without a
 * `from` (a card on a page it made) leaves the name to the card. Unknown owners read as their
 * `label`, with no stepper. A list this device can't read is never stepped.
 */
export function loopPreview(
  doc: CanvasDocument,
  layer: ScopeLayer,
  nodeId: string,
  setters: readonly DataPreviewSetter[],
): CardLoopPreview {
  let answer: DataLoopPreview | null = null;
  for (const setter of setters) {
    answer = setter(doc, layer, nodeId);
    if (answer) break;
  }
  const card = answer?.from === undefined ? cardLoopPreview(doc, layer, nodeId) : null;
  const from = answer?.from ?? card?.from ?? layer.label;
  const step = answer ? answer.step : (card?.step ?? null);
  return { from, step: layer.unreadable ? null : step };
}
