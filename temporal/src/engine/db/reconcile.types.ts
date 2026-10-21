import type { Shape } from "../document";
import type { DbmlError, ParsedSchema, SchemaShapes } from "./dbml";

export interface ReconcileInput {
  schema: ParsedSchema;
  /** Schema shapes the text describes: they take the text's content, and any left out are removed. */
  replaced: SchemaShapes;
  /** The rest of the board's schema. Refs and names may point at it, but it isn't changed. */
  others: SchemaShapes;
}

export interface ReconcilePlan {
  /** Final content of every table, enum and note in the text. New ones still need a position and an index. */
  shapes: Shape[];
  /** Ids in `shapes` that don't exist on the board yet. */
  added: Set<string>;
  /** Ids of replaced shapes that are no longer in the text. */
  removed: string[];
}

export type ReconcileResult = { ok: true; plan: ReconcilePlan } | { ok: false; error: DbmlError };
