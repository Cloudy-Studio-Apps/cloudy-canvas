import { isDbEnum, isDbTable, type BoardDocument, type Shape } from "../document";
import type { SchemaShapes } from "./dbml";

/** Every shape that belongs to the schema: tables, enums and stickies linked to a DBML note. */
export function schemaShapes(doc: BoardDocument): SchemaShapes {
  const all = doc.all();
  return {
    tables: all.filter(isDbTable),
    enums: all.filter(isDbEnum),
    notes: all.filter(
      (shape) => shape.type === "sticky" && shape.noteName !== undefined,
    ) as SchemaShapes["notes"],
  };
}

export function isSchemaShape(shape: Shape | undefined): boolean {
  return (
    isDbTable(shape) ||
    isDbEnum(shape) ||
    (shape?.type === "sticky" && shape.noteName !== undefined)
  );
}

export const EMPTY_SCHEMA: SchemaShapes = { tables: [], enums: [], notes: [] };

/** Splits a schema into the shapes named in `names` (per kind) and the rest. */
export function splitByNames(
  shapes: SchemaShapes,
  names: { tables: Set<string>; enums: Set<string>; notes: Set<string> },
): { picked: SchemaShapes; rest: SchemaShapes } {
  return {
    picked: {
      tables: shapes.tables.filter((t) => names.tables.has(t.name)),
      enums: shapes.enums.filter((e) => names.enums.has(e.name)),
      notes: shapes.notes.filter((n) => names.notes.has(n.noteName ?? "")),
    },
    rest: {
      tables: shapes.tables.filter((t) => !names.tables.has(t.name)),
      enums: shapes.enums.filter((e) => !names.enums.has(e.name)),
      notes: shapes.notes.filter((n) => !names.notes.has(n.noteName ?? "")),
    },
  };
}
