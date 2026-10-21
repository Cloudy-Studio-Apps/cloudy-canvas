// The board's database schema: every table, enum and DBML sticky note together, read and written
// as DBML (`dbml/`) or through visual edits. `DbSchema` is the facade the editor and agents use.
export type * from "./db-schema.types";
export type * from "./column-types.types";
export type { DbmlError } from "./dbml";
export { DbSchema } from "./db-schema";
export { COLUMN_TYPES, INDEX_TYPES, TYPE_ARGS } from "./column-types";
export { pruneRefs } from "./prune-refs";
export { freeName } from "./table-edits";
export { prepareDbCopies } from "./prepare-db-copies";
