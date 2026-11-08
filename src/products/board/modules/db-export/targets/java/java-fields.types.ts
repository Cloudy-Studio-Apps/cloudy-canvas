import type { RelationProps } from "../../code";
import type { CodeColumn } from "../../model";
import type { JavaType } from "./java-type-map.types";

/** One field of a class: a column, or a relation's object or list. */
export interface JavaField {
  name: string;
  /** `String`, `List<Order>`. */
  type: string;
  /** `" = new Post()"`, or `""`. */
  init: string;
  /** A trailing comment (the column's note, a default Java can't hold), or `""`. */
  comment: string;
  /** The column this field holds (a relation's foreign key column, when it replaces it). */
  column: CodeColumn | null;
  /** Set on a column field. */
  javaType: JavaType | null;
  /** Set on a relation field: the relation, and whether this class holds its foreign key. */
  relation: { props: RelationProps; owner: boolean } | null;
}

export interface JavaFieldsOptions {
  /** Plain Java: references start as `new Other()` (when that doesn't loop). */
  initObjects: boolean;
  /** JPA's `EnumType.STRING`: enum constants keep the database values. */
  keepEnumValues: boolean;
  /** For warnings, e.g. "Java". */
  target: string;
}
