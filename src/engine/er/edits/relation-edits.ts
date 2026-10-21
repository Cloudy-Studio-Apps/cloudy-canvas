import { createId } from "@core";

import { freeName } from "../../db/table-edits";
import type { ErParticipant } from "../../document";
import { createErRelation } from "../create-er-shapes";
import { relationSize } from "../er-size";
import type { ErShapes } from "../lang";
import { replaceIn, resized } from "./edit-helpers";
import type { ErEditResult, ErParticipantPatch, ErRelationPatch } from "./edits.types";

/** A new relation between the entities (or aggregations), each with a `(0,n)` cardinality. */
export function addRelation(shapes: ErShapes, entityIds: readonly string[]): ErEditResult {
  const relation = {
    ...createErRelation({ x: 0, y: 0 }, freeName(shapes.relations, "relation"), ""),
    participants: entityIds.map(participant),
  };
  return { shapes: { ...shapes, relations: [...shapes.relations, relation] }, id: relation.id };
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
      participants: relation.participants.map((p) =>
        p.id === participantId ? { ...p, ...patch } : p,
      ),
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
  return { id: createId(), entityId, min: "0", max: "n", role: "", arrow: false };
}
