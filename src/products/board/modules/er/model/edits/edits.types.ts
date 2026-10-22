import type { ErAggregateElement } from "../../aggregate/aggregate.types";
import type { ErAttributeElement } from "../../attribute/attribute.types";
import type { ErConstraintElement } from "../../constraint/constraint.types";
import type { ErEntityElement } from "../../entity/entity.types";
import type { ErIsaChild, ErIsaElement } from "../../isa/isa.types";
import type { ErParticipant, ErRelationElement } from "../../relation/relation.types";
import type { ErShapes } from "../lang";

/** The next model after an edit, and the id of the shape it created (if any). */
export interface ErEditResult {
  shapes: ErShapes;
  id?: string;
}

export type ErEntityPatch = Partial<Pick<ErEntityElement, "name" | "weak" | "color">>;
export type ErRelationPatch = Partial<
  Pick<ErRelationElement, "name" | "identifying" | "idMark" | "color">
>;
export type ErParticipantPatch = Partial<Omit<ErParticipant, "id">>;
export type ErAttributePatch = Partial<
  Pick<ErAttributeElement, "name" | "key" | "multivalued" | "derived" | "optional">
>;
export type ErIsaPatch = Partial<
  Pick<ErIsaElement, "parentId" | "parentMin" | "parentMax" | "exclusive" | "total">
>;
export type ErIsaChildPatch = Partial<Omit<ErIsaChild, "id">>;
export type ErAggregatePatch = Partial<Pick<ErAggregateElement, "name" | "relationId">>;
export type ErConstraintPatch = Partial<
  Pick<ErConstraintElement, "rule" | "entityId" | "fromId" | "toId" | "min" | "max">
>;
