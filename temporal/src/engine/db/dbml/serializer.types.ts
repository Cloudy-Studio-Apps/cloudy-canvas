import type { DbEnumShape, DbTableShape, StickyShape } from "../../document";

/** Everything on the board that belongs to the schema. */
export interface SchemaShapes {
  tables: readonly DbTableShape[];
  enums: readonly DbEnumShape[];
  /** Stickies linked to a DBML sticky note (`noteName` set). */
  notes: readonly StickyShape[];
}
