import type { SheetFrame } from "../../sheet/sheet.types";
import type { StyleguideOutlineEntry } from "../../model/design-styleguide.types";

export interface SourceFieldsProps {
  sheet: SheetFrame;
  outline: readonly StyleguideOutlineEntry[];
}

export interface SheetFieldsProps {
  sheet: SheetFrame;
  /** How many layers are selected (the source and template are edited for one). */
  count: number;
}
