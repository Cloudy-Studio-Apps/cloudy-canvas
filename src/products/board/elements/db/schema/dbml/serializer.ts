import { serializeEnum } from "./serialize-enum";
import { serializeNote } from "./serialize-note";
import { serializeTable } from "./serialize-table";
import type { SchemaShapes } from "./serializer.types";

/** The whole board schema: enums, then tables, then sticky notes. */
export function serializeSchema({ tables, enums, notes }: SchemaShapes): string {
  const byId = new Map(tables.map((table) => [table.id, table]));
  const blocks = [
    ...enums.map(serializeEnum),
    ...tables.map((table) => serializeTable(table, byId)),
    ...notes.map(serializeNote),
  ];
  return blocks.length ? `${blocks.join("\n\n")}\n` : "";
}
