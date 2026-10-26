import type { CanvasElement, RulerGuide } from "@canvas";

/**
 * A page of a design: a record in the document (never drawn or hit) whose `index` orders the
 * pages. The nodes on it point at it with `pageId`; the canvas shows one page at a time.
 */
export interface PageElement extends CanvasElement {
  type: "page";
  name: string;
  /** The page's ruler guides (see `PAGE_GUIDES`); unset is none. */
  guides?: RulerGuide[];
  /**
   * A page a feature keeps for itself (the design system's): not listed with the user's pages
   * (`pagesOf`), never shown by the canvas on its own (a background scope) and never edited by
   * `DesignPages`. Unset on the user's pages.
   */
  hidden?: true;
}
