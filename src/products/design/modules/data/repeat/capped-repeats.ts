import type { CanvasDocument } from "@canvas";

import { isFrame } from "../../frame";
import { childrenMap, walkDescendants } from "./descendants";
import { repeatOf } from "./repeat-fields";
import { documentScopes } from "./scope-at";

/**
 * Whether an iterator has rows its design cap leaves out (`designLimit`, 24 copies while unset),
 * so the document shows fewer copies than an export must: anywhere, or only under the layers
 * `within` (them included). An iterator whose list this device can't read doesn't count.
 */
export function cappedRepeats(doc: CanvasDocument, within?: readonly string[]): boolean {
  const layers = within
    ? [
        ...within.flatMap((id) => {
          const el = doc.get(id);
          return el ? [el] : [];
        }),
        ...walkDescendants(childrenMap(doc), within),
      ]
    : doc.all();
  const frames = layers.filter((el) => isFrame(el) && repeatOf(el) !== null);
  if (frames.length === 0) return false;
  const scopes = documentScopes(doc);
  return frames.some((frame) => {
    const it = isFrame(frame) ? scopes.iterator(frame) : null;
    return it !== null && !it.unreadable && it.rows.rows.length < it.rows.total;
  });
}
