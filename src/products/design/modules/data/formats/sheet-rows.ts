import { columnNames } from "./column-names";
import type { Cell } from "./sheet-rows.types";

function plain(cell: Cell): string | number | boolean | null {
  if (cell instanceof Date) return Number.isNaN(cell.getTime()) ? null : cell.toISOString();
  if (typeof cell === "string") return cell === "" ? null : cell;
  if (typeof cell === "number" || typeof cell === "boolean") return cell;
  return null;
}

const isEmpty = (row: readonly Cell[]) => row.every((c) => plain(c) === null);

/**
 * A sheet's rows as objects. The header is row `headerRow` (1-based, counting every row), or the
 * first row with something in it; its cells are the keys: empty ones (a merged cell is empty after
 * its first column) `column_N`, repeated ones `name_2`, `name_3`. Empty rows below it are dropped.
 */
export function sheetRows(
  data: readonly (readonly Cell[])[],
  headerRow: number,
): Record<string, string | number | boolean | null>[] {
  const at = headerRow >= 1 ? headerRow - 1 : data.findIndex((row) => !isEmpty(row));
  const header = data[at];
  if (at < 0 || !header) return [];
  const body = data.slice(at + 1).filter((row) => !isEmpty(row));
  const width = body.reduce((max, row) => Math.max(max, row.length), header.length);
  const names = columnNames(
    Array.from({ length: width }, (_, i) => String(plain(header[i]) ?? "")),
    width,
  );
  return body.map((row) => {
    const out: Record<string, string | number | boolean | null> = {};
    names.forEach((name, i) => {
      out[name] = plain(row[i]);
    });
    return out;
  });
}
