import type { BookLayout } from "../../model/book-layout.types";
import type { BrochurePage } from "../../model/brochure-pages.types";
import type { BrochureSettings } from "../../brochure/brochure.types";
import type { DesignBrochure } from "../../model/design-brochure";
import type { DesignBrochures } from "../../model/design-brochures";

/** The open brochure of the design page on screen, as the Catalog mode's UI reads it. */
export interface BrochureView {
  /** The design's brochures (to make, open, rename and delete them). */
  brochures: DesignBrochures;
  /** The page's brochures, in order. */
  list: readonly DesignBrochure[];
  /** The page's open brochure, `null` when the page has none. */
  brochure: DesignBrochure | null;
  /** The design page on screen. */
  scope: string | null;
  /** Its pages (none without a brochure). */
  pages: readonly BrochurePage[];
  settings: BrochureSettings;
  /** How the pages print and are read (sides, spreads, numbers). */
  layout: BookLayout;
  /** A page's numbers as printed ("4", "6–7"). */
  label: (page: BrochurePage) => string;
  /** Changes with every document change (for effects that re-read the brochure). */
  version: number;
}
