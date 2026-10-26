import type { SheetGroup, StyleguideCategory } from "../styleguide.types";

/** A category as the Design system tab lists it. */
export interface StyleguideOutlineEntry {
  category: StyleguideCategory;
  groups: SheetGroup[];
  /** Its sheet on the system page, when it's shown. */
  sheetId?: string;
  hidden: boolean;
}
