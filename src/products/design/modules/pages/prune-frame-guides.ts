import type { CanvasDocument, ElementPatch } from "@canvas";

import { pagesOf } from "./pages-of";
import type { PageElement } from "./page";

/** Removes the guides of deleted frames from their page, in the deletion's undo step. */
export function pruneFrameGuides(doc: CanvasDocument, removed: ReadonlySet<string>): void {
  for (const page of pagesOf(doc)) {
    const guides = page.guides ?? [];
    const kept = guides.filter((guide) => !guide.frame || !removed.has(guide.frame));
    if (kept.length === guides.length) continue;
    const patch: ElementPatch<PageElement> = { guides: kept };
    doc.update(page.id, patch);
  }
}
