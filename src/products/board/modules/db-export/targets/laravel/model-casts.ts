import type { CodeRelation, CodeTable } from "../../model";
import { castOf, TIMESTAMP_COLUMNS } from "./type-map";

/**
 * A model's casts (`column => cast`): every column but the primary key, the foreign keys and the
 * timestamps Eloquent casts itself.
 */
export function modelCasts(
  table: CodeTable,
  enumClass: (name: string) => string,
): [column: string, cast: string][] {
  const foreignKeys = new Set(table.outgoing.map((relation: CodeRelation) => relation.from.column));
  return table.columns.flatMap((column) => {
    if (column.pk || foreignKeys.has(column.name) || TIMESTAMP_COLUMNS.has(column.name)) return [];
    const cast = castOf(column, enumClass);
    return cast ? [[column.name, cast] as [string, string]] : [];
  });
}
