import type { DbTableShape } from "../document";
import type { DbmlError, ParsedSchema } from "./dbml";

export interface ReconcileInput {
  schema: ParsedSchema;
  /** Tables the text describes: they take the text's content, and any left out are removed. */
  replaced: readonly DbTableShape[];
  /** The rest of the board's tables. Refs may point at them, but they aren't changed. */
  others: readonly DbTableShape[];
}

export interface ReconcilePlan {
  /** Final content of every table in the text. New tables still need a position and an index. */
  tables: DbTableShape[];
  /** Ids in `tables` that don't exist on the board yet. */
  added: Set<string>;
  /** Ids of replaced tables that are no longer in the text. */
  removed: string[];
}

export type ReconcileResult = { ok: true; plan: ReconcilePlan } | { ok: false; error: DbmlError };
