import type { DbmlError } from "../../db/dbml";
import type { ErAttributeKey, ErAttributeLook, ErConstraintKind } from "../../document";

export interface ParsedErAttribute {
  name: string;
  key: ErAttributeKey;
  multivalued: boolean;
  derived: boolean;
  optional: boolean;
  /** Parts of a composite attribute. */
  children: ParsedErAttribute[];
  line: number;
}

export interface ParsedErEntity {
  name: string;
  weak: boolean;
  color: string | null;
  attributes: ParsedErAttribute[];
  line: number;
}

/** A `(min,max)` pair as written; both empty when none was given. */
export interface Cardinality {
  min: string;
  max: string;
}

export interface ParsedErParticipant extends Cardinality {
  /** Name of the entity (or aggregation) taking part. */
  entity: string;
  role: string;
  arrow: boolean;
  line: number;
}

export interface ParsedErRelation {
  name: string;
  identifying: boolean;
  idMark: boolean;
  color: string | null;
  participants: ParsedErParticipant[];
  attributes: ParsedErAttribute[];
  line: number;
}

export interface ParsedErIsaChild extends Cardinality {
  entity: string;
  line: number;
}

export interface ParsedErIsa {
  parent: string;
  parentMin: string;
  parentMax: string;
  exclusive: boolean;
  total: boolean;
  /** Name of the discriminator attribute (`[by: tipo]`), or null. */
  discriminator: string | null;
  children: ParsedErIsaChild[];
  line: number;
}

export interface ParsedErAggregate {
  name: string;
  relation: string;
  attributes: ParsedErAttribute[];
  line: number;
}

export interface ParsedErConstraint extends Cardinality {
  kind: ErConstraintKind;
  /** The entity, for exclusive and inclusive constraints; otherwise empty. */
  entity: string;
  from: string;
  to: string;
  line: number;
}

export interface ParsedEr {
  /** From a `Diagram [style: …]` line, or null when the text doesn't say. */
  style: ErAttributeLook | null;
  entities: ParsedErEntity[];
  relations: ParsedErRelation[];
  isas: ParsedErIsa[];
  aggregates: ParsedErAggregate[];
  constraints: ParsedErConstraint[];
  warnings: DbmlError[];
}

export type ErParseResult = { ok: true; model: ParsedEr } | { ok: false; error: DbmlError };

/** A line of a relation body before it's known to be a participant or an attribute. */
export interface RelationLine {
  attribute: ParsedErAttribute;
  cardinality: Cardinality | null;
  role: string;
  arrow: boolean;
  /** Written with the `attr` prefix, so it's an attribute whatever its name. */
  forcedAttribute: boolean;
}

/** A relation as written; its lines are sorted into participants and attributes once every name is known. */
export interface RawRelation {
  name: string;
  identifying: boolean;
  idMark: boolean;
  color: string | null;
  lines: RelationLine[];
  line: number;
}

/** An entity as written, with the parent of an inline `[isa: …]`. */
export interface RawEntity extends ParsedErEntity {
  isa: string | null;
}
