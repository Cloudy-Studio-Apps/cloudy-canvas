import type { ToolArgs } from "@canvas";

import { parsePath } from "../table";

/** The schema of a source's `rowsPath` argument. */
export const ROWS_PATH_SCHEMA = {
  type: ["string", "null"],
  description:
    'Where the rows are in the data: a path such as "products" or "data.items" ("" the data ' +
    "itself), or null for the first list found (get_data_source lists the `lists` the last " +
    "Update found). Takes effect on the next update_data_source.",
};

/** `args.rowsPath`: `undefined` when not given, `null` for the first list, else a checked path. */
export function readRowsPath(args: ToolArgs): string | null | undefined {
  const value = args.rowsPath;
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") throw new Error('"rowsPath" must be text or null.');
  const path = value.trim();
  if (path === "") return "";
  try {
    parsePath(path);
  } catch {
    throw new Error(`"rowsPath" isn't a data path: ${value}`);
  }
  return path;
}
