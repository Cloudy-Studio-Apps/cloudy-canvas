import { TABLE_DEFAULTS } from "./table.defaults";
import type { TableTypography } from "./table-typography.types";
import type { TableElement } from "./table.types";

/** The text size and cell insets of a table, grown or shrunk by its `textScale` (Scale tool). */
export function tableTypography(el: Pick<TableElement, "textScale">): TableTypography {
  const scale = el.textScale ?? 1;
  const { fontSize, padX, padY, minRowHeight } = TABLE_DEFAULTS;
  return {
    fontSize: fontSize * scale,
    padX: padX * scale,
    padY: padY * scale,
    minRowHeight: minRowHeight * scale,
  };
}
