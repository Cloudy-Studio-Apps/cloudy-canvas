import type { SheetFrame, StyleguideOutlineEntry } from "@design";

export interface SourceFieldsProps {
  sheet: SheetFrame;
  outline: readonly StyleguideOutlineEntry[];
}

export interface SheetFieldsProps {
  sheet: SheetFrame;
  /** How many layers are selected (the source and template are edited for one). */
  count: number;
}
