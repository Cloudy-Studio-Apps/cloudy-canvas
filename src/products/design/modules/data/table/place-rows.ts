import type { DataRow } from "./data-table.types";
import { parsePath } from "./read-path";

/**
 * The pages' rows placed where `rowsPath` says (`data.items` gives `{ "data": { "items": rows } }`),
 * so reading the combined result with the same "Rows come from" path finds them and the path is
 * not applied to anything else. Without a path, the rows themselves.
 */
export function placeRows(rows: DataRow[], rowsPath: string | null): unknown {
  if (rowsPath === null || rowsPath === "") return rows;
  let value: unknown = rows;
  for (const step of parsePath(rowsPath).reverse()) {
    value = "index" in step ? Object.assign([], { [step.index]: value }) : { [step.key]: value };
  }
  return value;
}
