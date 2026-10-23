import type { ErAggregateElement } from "../../aggregate/aggregate.types";
import type { ErAttributeElement } from "../../attribute/attribute.types";
import type { ErConstraintElement } from "../../constraint/constraint.types";
import type { ErEntityElement } from "../../entity/entity.types";
import type { ErIsaElement } from "../../isa/isa.types";
import type { ErRelationElement } from "../../relation/relation.types";
import type { ErUnionElement } from "../../union/union.types";

/** Every ER shape on the board, by kind. */
export interface ErShapes {
  entities: ErEntityElement[];
  relations: ErRelationElement[];
  attributes: ErAttributeElement[];
  isas: ErIsaElement[];
  aggregates: ErAggregateElement[];
  constraints: ErConstraintElement[];
  unions: ErUnionElement[];
}

/** A span of text, as character offsets (`to` is exclusive). */
export interface TextRange {
  from: number;
  to: number;
}

/** The ER text and where each top-level shape (not attributes) is written in it. */
export interface ErText {
  text: string;
  ranges: Map<string, TextRange>;
}
