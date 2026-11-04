import type { Point, Rect } from "@canvas";

import type { FrameElement } from "../../../frame";
import type { BrochureMaster } from "../../brochure";
import type { BookLayout } from "../book-layout.types";
import type { BrochurePage } from "../brochure-pages.types";
import type { PageInfo } from "../numbering/page-numbers.types";

/** Where a page item goes on its page: the top or bottom margin, or the page's body. */
export type PageItemAnchor = "header" | "footer" | "body";

/**
 * Where across the page: `outer`, the edge away from the spine (left on a left page, right on a
 * right page), `center`, or `inner`, the spine's edge.
 */
export type PageItemAlign = "outer" | "center" | "inner";

/** A ready-made page item (page number, title, …): a text with a template, placed in the margin. */
export interface PageItemDefinition {
  id: string;
  label: string;
  /** Its text, with tokens (`{page}`, `{pages}`, …; see `resolveTemplate`). */
  template: string;
  anchor: PageItemAnchor;
  align: PageItemAlign;
  fontSize: number;
}

/** Where a page item is put: a frame, the page of it that it's on and that page's side. */
export interface PageItemTarget {
  frame: FrameElement;
  /** The page inside the frame (all of it, or half of a spread frame). */
  area: Rect;
  side: "left" | "right";
}

export interface PlacePageItemInput {
  item: PageItemDefinition;
  target: PageItemTarget;
  /** The page's margin, in world units. */
  margin: number;
  /** Its sibling index (on top of the frame's layers). */
  index: string;
  /** Where it's dropped (its center), else placed by `anchor` and `align` inside the margin. */
  at?: Point;
}

/** What finding a frame's pages for page items reads: the open brochure's view. */
export interface ItemTargetsInput {
  pages: readonly BrochurePage[];
  layout: BookLayout;
  /** Each side's number and parity (`pageNumbers`, indexed like `layout.sides`). */
  numbers: readonly PageInfo[];
  masters: readonly BrochureMaster[];
}
