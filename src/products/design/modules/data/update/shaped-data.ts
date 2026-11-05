import { checkShape, fieldPaths, isPlainShape, normalizeRows, shapeRows } from "../table";
import type { DataShape } from "../table";
import { UPDATE_ERRORS } from "./update-errors";
import type { ShapedData } from "./shaped-data.types";

/**
 * Parsed data as a source with `rowsPath` and `shape` reads it: the rows found (`normalizeRows`,
 * failing with `No list at: <path>`), the shape step applied (`shapeRows`; refused by
 * `checkShape` when the data now has two fields for one name), and the rows as read to keep in
 * the snapshot when the step changes something.
 */
export function shapedData(
  parsed: unknown,
  rowsPath: string | null,
  shape: DataShape | null,
): ShapedData {
  const raw = normalizeRows(parsed, rowsPath);
  if (!raw) throw new Error(`${UPDATE_ERRORS.noList}${rowsPath ?? ""}`);
  if (isPlainShape(shape)) return { rows: shapeRows(raw, shape) };
  if (shape) checkShape(shape, fieldPaths(raw));
  return { rows: shapeRows(raw, shape), raw };
}
