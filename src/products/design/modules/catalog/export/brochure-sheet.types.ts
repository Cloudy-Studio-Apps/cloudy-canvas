export interface BrochureSheetOptions {
  /** The spreads to show (positions among the layout's spreads), in order. */
  spreads: readonly number[];
  /** The picture's longest side, in pixels, at most. */
  maxSide: number;
}

/** A side's place in the sheet, in world units from the sheet's corner. */
export interface SheetCell {
  x: number;
  y: number;
  w: number;
  h: number;
}
