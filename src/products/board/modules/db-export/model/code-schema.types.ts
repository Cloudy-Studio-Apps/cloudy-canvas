/** A column's default value, read from its raw DBML default. */
export type CodeDefault =
  | { kind: "number" | "string" | "boolean" | "null"; value: string }
  /** A DBML backtick expression, e.g. `now()`. */
  | { kind: "expr"; value: string };

export interface CodeColumn {
  name: string;
  /** Canonical type name (`canonicalTypeName`), without `[]`. */
  type: string;
  array: boolean;
  /** Parsed type arguments: `varchar(255)` → [255]; `decimal(10, 2)` → [10, 2]; non-numeric → []. */
  args: number[];
  /** Also true for a column of a composite primary key. */
  pk: boolean;
  increment: boolean;
  /** Primary key columns count as not null. */
  notNull: boolean;
  unique: boolean;
  default: CodeDefault | null;
  note: string;
  /** Name of the schema enum this column's type names, or `null`. */
  enum: string | null;
}

/** A relation, always written from the foreign key side: `from` holds the foreign key column. */
export interface CodeRelation {
  from: { table: string; column: string };
  to: { table: string; column: string };
  kind: "many-to-one" | "one-to-one" | "many-to-many";
  /** The other end is a table that isn't exported. */
  external: boolean;
}

export interface CodeIndex {
  /** `""` when unnamed. */
  name: string;
  columns: string[];
  exprs: string[];
  unique: boolean;
  pk: boolean;
  /** `""` for the database default. */
  method: string;
}

export interface CodeTable {
  name: string;
  note: string;
  columns: CodeColumn[];
  indexes: CodeIndex[];
  /** `[]` when the table has none. */
  primaryKey: string[];
  /** Many-to-one and one-to-one relations whose `from.table` is this table. */
  outgoing: CodeRelation[];
  /** Many-to-one and one-to-one relations whose `to.table` is this table. */
  incoming: CodeRelation[];
}

export interface CodeEnum {
  name: string;
  values: { name: string; note: string }[];
}

/** The exported part of a board's database schema, framework-free: what code targets read. */
export interface CodeSchema {
  /** In foreign key order: a table after the tables it references (self-references ignored). */
  tables: CodeTable[];
  enums: CodeEnum[];
  /** Foreign keys that close a cycle: written after every table. */
  deferred: CodeRelation[];
  manyToMany: CodeRelation[];
  /** Tables named by relations but not exported. */
  missing: string[];
}
