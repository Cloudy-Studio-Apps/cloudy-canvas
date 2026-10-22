import type { CanvasElement } from "@canvas";

/**
 * A page of a design: a record in the document (never drawn or hit) whose `index` orders the
 * pages. The nodes on it point at it with `pageId`; the canvas shows one page at a time.
 */
export interface PageElement extends CanvasElement {
  type: "page";
  name: string;
}
