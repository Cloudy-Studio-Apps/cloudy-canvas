import type { DbEnumElement } from "../../enum";
import type { DbTableElement } from "../../table";
import type { StickyElement } from "../../../sticky";

/** Everything on the board that belongs to the schema. */
export interface SchemaShapes {
  tables: readonly DbTableElement[];
  enums: readonly DbEnumElement[];
  /** Stickies linked to a DBML sticky note (`noteName` set). */
  notes: readonly StickyElement[];
}
