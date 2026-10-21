import type {
  ErAggregateShape,
  ErAttributeShape,
  ErConstraintShape,
  ErEntityShape,
  ErIsaChild,
  ErIsaShape,
  ErParticipant,
  ErRelationShape,
} from "../../document";
import type { ErShapes } from "../lang";

/** The next model after an edit, and the id of the shape it created (if any). */
export interface ErEditResult {
  shapes: ErShapes;
  id?: string;
}

export type ErEntityPatch = Partial<Pick<ErEntityShape, "name" | "weak" | "color">>;
export type ErRelationPatch = Partial<
  Pick<ErRelationShape, "name" | "identifying" | "idMark" | "color">
>;
export type ErParticipantPatch = Partial<Omit<ErParticipant, "id">>;
export type ErAttributePatch = Partial<
  Pick<ErAttributeShape, "name" | "key" | "multivalued" | "derived" | "optional">
>;
export type ErIsaPatch = Partial<
  Pick<ErIsaShape, "parentId" | "parentMin" | "parentMax" | "exclusive" | "total">
>;
export type ErIsaChildPatch = Partial<Omit<ErIsaChild, "id">>;
export type ErAggregatePatch = Partial<Pick<ErAggregateShape, "name" | "relationId">>;
export type ErConstraintPatch = Partial<
  Pick<ErConstraintShape, "rule" | "entityId" | "fromId" | "toId" | "min" | "max">
>;
