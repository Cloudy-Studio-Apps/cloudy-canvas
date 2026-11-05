import type { CanvasDocument, Point } from "@canvas";

import { isDesignNode } from "../../../core";
import { ARRANGE_GAPS } from "../arrange/arrange.constants";

const size = (el: object, key: "w" | "h") => {
  const value = (el as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

/**
 * Where new copies of a brochure that isn't arranged go: one row below every layer on its design
 * page (`pageId`), from `left`, left to right a spread's gap apart, so they never land on a page or
 * anything else already there. Each call takes the next place for a frame `w` wide.
 */
export function copyShelf(doc: CanvasDocument, pageId: string, left: number): (w: number) => Point {
  let bottom: number | null = null;
  for (const el of doc.all()) {
    if (!isDesignNode(el) || el.parentId || el.pageId !== pageId) continue;
    const end = el.y + size(el, "h");
    if (bottom === null || end > bottom) bottom = end;
  }
  const y = (bottom ?? 0) + ARRANGE_GAPS.spread;
  let x = left;
  return (w) => {
    const at = { x, y };
    x += w + ARRANGE_GAPS.spread;
    return at;
  };
}
