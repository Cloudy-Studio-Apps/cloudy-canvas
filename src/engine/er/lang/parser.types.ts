import type { DbmlError } from "../../db/dbml";
import type { ErAttributeKey } from "../../document";

export interface ParsedErAttribute {
  name: string;
  key: ErAttributeKey;
  multivalued: boolean;
  derived: boolean;
  /** Parts of a composite attribute. */
  children: ParsedErAttribute[];
  line: number;
}

export interface ParsedErEntity {
  name: string;
  weak: boolean;
  attributes: ParsedErAttribute[];
  line: number;
}

export interface ParsedErParticipant {
  /** Name of the entity taking part. */
  entity: string;
  min: string;
  max: string;
  role: string;
  line: number;
}

export interface ParsedErRelation {
  name: string;
  identifying: boolean;
  participants: ParsedErParticipant[];
  attributes: ParsedErAttribute[];
  line: number;
}

export interface ParsedEr {
  entities: ParsedErEntity[];
  relations: ParsedErRelation[];
  warnings: DbmlError[];
}

export type ErParseResult = { ok: true; model: ParsedEr } | { ok: false; error: DbmlError };

/** A line of a relation body before it's known to be a participant or an attribute. */
export interface RelationLine {
  attribute: ParsedErAttribute;
  /** `(min,max)` when written. */
  cardinality: { min: string; max: string } | null;
  role: string;
}

/** A relation as written; its lines are sorted into participants and attributes once every entity is known. */
export interface RawRelation {
  name: string;
  identifying: boolean;
  lines: RelationLine[];
  line: number;
}
