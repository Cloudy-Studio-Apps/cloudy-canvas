import type { TokenRecord } from "./token.types";

/** What `migrateCollectionModes` makes of an older file's tokens. */
export interface CollectionModesMigration {
  /** The records to write (axes made, collections without modes, variables with defaults). */
  records: TokenRecord[];
  /** Collection id → the axis its modes became (to rename layers' `variableModes` keys). */
  axisOf: Map<string, string>;
}
