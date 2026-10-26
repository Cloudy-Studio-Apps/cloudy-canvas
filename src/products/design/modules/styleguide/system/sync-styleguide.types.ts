import type { DesignToolOptions } from "../../../design-options.types";
import type { StyleguideCategory, StyleguideTemplate } from "../styleguide.types";

/** What the sync reads from the modules (the categories and templates contributed). */
export interface StyleguideSources {
  categories(): readonly StyleguideCategory[];
  template(id: string): StyleguideTemplate | undefined;
  options(): DesignToolOptions;
}
