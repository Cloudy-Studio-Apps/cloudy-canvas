import type { ToolArgs } from "@canvas";

import { checkShape, fieldPaths, readShape, type DataRow, type DataShape } from "../table";

/** The schema of a source's `shape` argument. */
export const SHAPE_SCHEMA = {
  type: ["object", "null"],
  description:
    "An optional step that renames and picks fields once the rows are found (after rowsPath), " +
    "applied to the saved rows at once, without fetching: `rename` (a field's path as read → " +
    'its new path, e.g. {"attributes.title": "name"}) and `include` (only these fields, by ' +
    "their path after renaming; left out, all). Bindings, conditions and repeats reading a " +
    "renamed field follow it; one left out shows as a field not found. null removes the step. " +
    "get_data_source shows `rawFields`, the fields as read, once a source has a shape (without " +
    "one they are its `fields`).",
  properties: {
    rename: { type: "object", additionalProperties: { type: "string" } },
    include: { type: "array", items: { type: "string" } },
  },
};

/**
 * `args.shape`: `undefined` when not given, `null` to remove the step, else the shape checked
 * against the fields the saved rows have as read (`raw`), so nothing is written when it's refused.
 */
export function readShapeArg(
  args: ToolArgs,
  raw: readonly DataRow[],
): DataShape | null | undefined {
  if (args.shape === undefined) return undefined;
  const shape = readShape(args.shape);
  if (!shape) return shape;
  const paths = fieldPaths(raw);
  if (paths.length > 0) {
    const unknown = Object.keys(shape.rename).filter((path) => !paths.includes(path));
    if (unknown.length > 0) {
      throw new Error(`Not fields of the data as read: ${unknown.join(", ")} (see rawFields).`);
    }
  }
  checkShape(shape, paths);
  return shape;
}
