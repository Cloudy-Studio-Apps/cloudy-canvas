import type { Point } from "@canvas";

import type { ErAggregateElement } from "../../aggregate/aggregate.types";
import type { ErAttributeElement, ErAttributeKey } from "../../attribute/attribute.types";
import type { ErConstraintElement } from "../../constraint/constraint.types";
import type { ErEntityElement } from "../../entity/entity.types";
import type { ErIsaChild, ErIsaElement } from "../../isa/isa.types";
import type { ErParticipant, ErRelationElement } from "../../relation/relation.types";
import type { ErShapes } from "../lang";
import type { Centers } from "../layout";

/** Where a new shape goes: centered on `at` (where it was dropped), or placed automatically. */
export interface ErAddOptions {
  at?: Point;
}

export interface ErEntityAddOptions extends ErAddOptions {
  weak?: boolean;
}

export interface ErAttributeAddOptions extends ErAddOptions {
  key?: ErAttributeKey;
}

/** What a new relation's participant joins through: nothing, an attribute, or a new key. */
export type ErJoin =
  { kind: "none" } | { kind: "attribute"; id: string } | { kind: "new-key"; name: string };

/** One participant of a relation made in one go (`addLinkedRelation`). */
export interface ErRelationEnd {
  entityId: string;
  min: string;
  max: string;
  join: ErJoin;
}

/** The next model after an edit, and the id of the shape it created (if any). */
export interface ErEditResult {
  shapes: ErShapes;
  id?: string;
  /** Centers for new shapes besides `id`'s (which the edit's `at` places). */
  pinned?: Centers;
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
