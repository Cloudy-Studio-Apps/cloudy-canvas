import type { TableDefaults } from "./table.types";

/** Table grid, typography and handle sizes, in world units unless named `…Px`. */
export const TABLE_DEFAULTS = {
  size: { w: 480, h: 192 },
  fontSize: 14,
  columnCount: 3,
  rowCount: 4,
  columnWidth: 160,
  rowHeight: 48,
  padX: 12,
  padY: 10,
  minColumnWidth: 48,
  minRowHeight: 32,
  addBarPx: 18,
  addGapPx: 6,
  gripOffsetPx: 12,
  gripLengthPx: 16,
  gripThicknessPx: 5,
  lineReachPx: 4,
  /** Its header tint field and the option that picks it. */
  colorOptions: { color: "tableColor" },
} as const satisfies TableDefaults;
