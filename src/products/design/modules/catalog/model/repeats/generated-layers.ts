import type { CanvasDocument } from "@canvas";

import { childrenByParent } from "../../../core";
import type { BrochureSlot } from "../../brochure";
import { repeatCopyTag } from "./repeat-copy-tag";

/**
 * The layers of the pages these generated slots hold: each of their frames the brochure's
 * repeats made (`repeatCopy` of `brochure`) and everything it holds, parents first. A frame
 * that isn't a copy (no longer tagged) is left alone.
 */
export function generatedLayers(
  doc: CanvasDocument,
  brochure: string,
  slots: readonly BrochureSlot[],
): string[] {
  const roots = slots
    .flatMap((slot) => slot.frames)
    .filter((id) => repeatCopyTag(doc.get(id))?.brochure === brochure);
  if (roots.length === 0) return [];
  const children = childrenByParent(doc.all());
  const out: string[] = [];
  const seen = new Set<string>();
  const queue = [...roots];
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (seen.has(next)) continue;
    seen.add(next);
    out.push(next);
    queue.push(...(children.get(next) ?? []));
  }
  return out;
}
