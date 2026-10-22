import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDbEnum } from "../enum";
import { isDbTable } from "../table";
import type { StickyElement } from "../../sticky";
import type { SchemaShapes } from "./dbml";

/** Every shape that belongs to the schema: tables, enums and stickies linked to a DBML note. */
export function schemaShapes(doc: CanvasDocument): SchemaShapes {
  const all = doc.all();
  return {
    tables: all.filter(isDbTable),
    enums: all.filter(isDbEnum),
    notes: all.filter(isDbmlNote),
  };
}

export function isSchemaShape(shape: CanvasElement | undefined): boolean {
  return isDbTable(shape) || isDbEnum(shape) || isDbmlNote(shape);
}

/** A sticky linked to a DBML note (`Note name { … }`). */
export function isDbmlNote(
  el: CanvasElement | undefined,
): el is StickyElement & { noteName: string } {
  return el?.type === "sticky" && (el as StickyElement).noteName !== undefined;
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
