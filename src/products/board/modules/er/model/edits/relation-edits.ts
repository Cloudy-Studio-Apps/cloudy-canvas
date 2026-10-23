import { createId } from "@shared/core";

import { freeName } from "../../../db";
import type { ErParticipant } from "../../relation/relation.types";
import { createErRelation } from "../../relation/relation.factory";
import { relationSize } from "../../base/er-size";
import type { ErShapes } from "../lang";
import { replaceIn, resized } from "./edit-helpers";
import { addAttribute, updateAttribute } from "./attribute-edits";
import type {
  ErEditResult,
  ErParticipantPatch,
  ErRelationEnd,
  ErRelationPatch,
} from "./edits.types";

/** A new relation between the entities (or aggregations), each with a `(0,n)` cardinality. */
export function addRelation(shapes: ErShapes, entityIds: readonly string[]): ErEditResult {
  const relation = {
    ...createErRelation({ x: 0, y: 0 }, freeName(shapes.relations, "relation"), ""),
    participants: entityIds.map(participant),
  };
  return { shapes: { ...shapes, relations: [...shapes.relations, relation] }, id: relation.id };
}

/**
 * A new relation between the ends, each with its cardinality and the attribute it joins through
 * (a new key attribute is added to its entity first).
 */
export function addLinkedRelation(shapes: ErShapes, ends: readonly ErRelationEnd[]): ErEditResult {
  let next = shapes;
  const vias = ends.map((end) => {
    if (end.join.kind === "attribute") return end.join.id;
    if (end.join.kind === "none") return "";
    const added = addAttribute(next, end.entityId, "pk");
    const id = added.id ?? "";
    next = updateAttribute(added.shapes, id, { name: end.join.name });
    return id;
  });
  const relation = addRelation(next, []);
  return {
    shapes: {
      ...relation.shapes,
      relations: replaceIn(relation.shapes.relations, relation.id ?? "", (r) => ({
        ...r,
        participants: ends.map((end, i) => ({
          ...participant(end.entityId),
          min: end.min,
          max: end.max,
          via: vias[i] ?? "",
        })),
      })),
    },
    id: relation.id,
  };
}

export function updateRelation(shapes: ErShapes, id: string, patch: ErRelationPatch): ErShapes {
  return {
    ...shapes,
    relations: replaceIn(shapes.relations, id, (relation) => {
      const next = { ...relation, ...patch };
      return patch.name !== undefined ? resized(next, relationSize(next.name)) : next;
    }),
  };
}

export function addParticipant(shapes: ErShapes, id: string, entityId: string): ErShapes {
  return {
    ...shapes,
    relations: replaceIn(shapes.relations, id, (relation) => ({
      ...relation,
      participants: [...relation.participants, participant(entityId)],
    })),
  };
}

export function updateParticipant(
  shapes: ErShapes,
  id: string,
  participantId: string,
  patch: ErParticipantPatch,
): ErShapes {
  return {
    ...shapes,
    relations: replaceIn(shapes.relations, id, (relation) => ({
      ...relation,
      participants: relation.participants.map((p) => {
        if (p.id !== participantId) return p;
        // Another entity's attribute can't be the join attribute.
        const moved = patch.entityId !== undefined && patch.entityId !== p.entityId;
        return { ...p, ...(moved ? { via: "" } : {}), ...patch };
      }),
    })),
  };
}

export function removeParticipant(shapes: ErShapes, id: string, participantId: string): ErShapes {
  return {
    ...shapes,
    relations: replaceIn(shapes.relations, id, (relation) => ({
      ...relation,
      participants: relation.participants.filter((p) => p.id !== participantId),
    })),
  };
}

function participant(entityId: string): ErParticipant {
  return { id: createId(), entityId, min: "0", max: "n", role: "", arrow: false, via: "" };
}
