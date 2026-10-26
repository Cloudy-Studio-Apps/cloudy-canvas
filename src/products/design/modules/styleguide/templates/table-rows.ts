import { label, SHEET_LOOK, stack } from "../sheet";
import type { GeneratedSpec } from "../styleguide.types";
import type { TableColumn } from "./table-rows.types";

/** A row of cells, each as wide as its column. */
function row(
  key: string,
  cells: readonly string[],
  columns: readonly TableColumn[],
  font: string,
  header: boolean,
): GeneratedSpec {
  return stack(
    key,
    "horizontal",
    columns.map((column, i) =>
      label(`cell:${i}`, cells[i] ?? "", {
        font,
        width: column.width,
        weight: header ? "600" : "400",
        color: header ? SHEET_LOOK.muted : SHEET_LOOK.ink,
      }),
    ),
    {
      gap: 16,
      padding: [10, 0],
      strokes: [{ type: "solid", color: SHEET_LOOK.line, opacity: 1 }],
      strokeWeights: { top: 0, right: 0, bottom: 1, left: 0 },
    },
  );
}

/** A table: its header row, then a row per entry, with a line under each. */
export function tableRows(
  columns: readonly TableColumn[],
  rows: readonly { key: string; cells: readonly string[] }[],
  font: string = SHEET_LOOK.font,
): GeneratedSpec {
  return stack(
    "table",
    "vertical",
    [
      row(
        "header",
        columns.map((column) => column.header),
        columns,
        font,
        true,
      ),
      ...rows.map((entry) => row(entry.key, entry.cells, columns, font, false)),
    ],
    { gap: 0 },
  );
}
