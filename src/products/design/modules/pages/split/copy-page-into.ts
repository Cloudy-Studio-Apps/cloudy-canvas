import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDesignNode } from "../../core";

/**
 * Adds a page and every layer on it to another document, untracked and with the same ids (a new
 * file has none of them, so references between them keep working). Returns the layers copied.
 */
export function copyPageInto(
  source: CanvasDocument,
  target: CanvasDocument,
  pageId: string,
): CanvasElement[] {
  const page = source.get(pageId);
  if (!page) throw new Error(`No page ${pageId}`);
  const nodes = source.all().filter((el) => isDesignNode(el) && el.pageId === pageId);
  target.addAllUntracked([page, ...nodes]);
  return nodes;
}
