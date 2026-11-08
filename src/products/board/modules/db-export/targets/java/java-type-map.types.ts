/** What kind of value a Java type holds, for writing a default. */
export type JavaValueKind =
  | "int"
  | "long"
  | "short"
  | "float"
  | "double"
  | "decimal"
  | "boolean"
  | "string"
  | "uuid"
  | "temporal"
  | "json"
  | "bytes"
  | "enum";

/** A column's Java type. */
export interface JavaType {
  /** The class: `Long`, `String`, `LocalDateTime`. */
  boxed: string;
  /** The primitive used when the column can't be null: `long`, or `null` when there is none. */
  primitive: string | null;
  kind: JavaValueKind;
}
