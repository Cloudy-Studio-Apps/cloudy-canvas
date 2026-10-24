import type { CanvasDocument } from "@canvas";

import { BROCHURE_TYPE, type BrochureElement } from "../brochure";

/** The brochure record's id per document, so finding it doesn't read every element each time. */
const known = new WeakMap<CanvasDocument, string>();

/** The design's brochure record, or `null` before it has one. */
export function brochureOf(doc: CanvasDocument): BrochureElement | null {
  const cached = known.get(doc);
  const id =
    cached !== undefined && doc.field(cached, "type") === BROCHURE_TYPE
      ? cached
      : doc.ids().find((other) => doc.field(other, "type") === BROCHURE_TYPE);
  if (id === undefined) return null;
  known.set(doc, id);
  return (doc.get(id) as BrochureElement | undefined) ?? null;
}
