import type { BrochurePage, BrochureSettings, DesignBrochure } from "@design";

/** The brochure as the Catalog mode's UI reads it. */
export interface BrochureView {
  brochure: DesignBrochure;
  pages: readonly BrochurePage[];
  settings: BrochureSettings;
  /** Changes with every document change (for effects that re-read the brochure). */
  version: number;
}
