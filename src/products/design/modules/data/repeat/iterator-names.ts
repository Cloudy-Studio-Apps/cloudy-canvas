import type { CanvasDocument } from "@canvas";

import { repeatOf } from "./repeat-fields";

/** Every iterator's row name (`as`) in the document, which a source can't be named. */
export function iteratorNames(doc: CanvasDocument): string[] {
  const names = new Set<string>();
  for (const el of doc.all()) {
    const repeat = (el as unknown as Record<string, unknown>).repeat;
    if (repeat == null) continue;
    const as = repeatOf(el)?.as;
    if (as) names.add(as);
  }
  return [...names];
}
