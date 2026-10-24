import type { BookLayout, BrochurePage, BrochureSettings, DesignBrochure } from "@design";

/** The brochure as the Catalog mode's UI reads it. */
export interface BrochureView {
  brochure: DesignBrochure;
  pages: readonly BrochurePage[];
  settings: BrochureSettings;
  /** How the pages print and are read (sides, spreads, numbers). */
  layout: BookLayout;
  /** A page's numbers as printed ("4", "6–7"). */
  label: (page: BrochurePage) => string;
  /** Changes with every document change (for effects that re-read the brochure). */
  version: number;
}
