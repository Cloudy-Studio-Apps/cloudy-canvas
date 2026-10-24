import type { Rect } from "@canvas";

import type { BrochurePage } from "../brochure-pages.types";

/**
 * One spread of the arranged layout: the page left of the spine, the one right of it, or one page
 * across it (a spread frame). The single layout's pages are each a block with a `right` page.
 */
export interface ArrangeBlock {
  left?: BrochurePage;
  right?: BrochurePage;
  across?: BrochurePage;
}

/** How the arranged pages' other options are laid out: under each page, or beside it. */
export type ArrangeMode = "below" | "beside";

/** A layer in the way of the arranged layout, by the area it shows in. */
export interface ArrangeObstacle {
  id: string;
  rect: Rect;
}
