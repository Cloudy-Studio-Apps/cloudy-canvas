import type { CanvasDocument } from "@canvas";

import type { FrameElement } from "../../../frame";
import type { BrochureElement } from "../../brochure";
import { isPageFrame } from "../page-frame";
import { repeatCopyTag } from "./repeat-copy-tag";

/**
 * Every page frame on the brochure's design page that its repeats made (`repeatCopy` naming it),
 * listed by a slot or not, in sibling order (ties by id), so every client picks the same first.
 */
export function brochureCopies(
  doc: CanvasDocument,
  record: Pick<BrochureElement, "id" | "page">,
): FrameElement[] {
  const out: FrameElement[] = [];
  for (const id of doc.ids()) {
    if (doc.field(id, "repeatCopy") == null || doc.field(id, "parentId") != null) continue;
    const el = doc.get(id);
    if (isPageFrame(el) && el.pageId === record.page && repeatCopyTag(el)?.brochure === record.id) {
      out.push(el);
    }
  }
  return out.sort((a, b) =>
    a.index < b.index ? -1 : a.index > b.index ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
}
