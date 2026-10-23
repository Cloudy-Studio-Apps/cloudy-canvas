import { createId } from "@shared/core";

import { freeName } from "../../../db";
import { createErEntity } from "../../entity/entity.factory";
import { createErRelation } from "../../relation/relation.factory";
import type { ErParticipant } from "../../relation/relation.types";
import type { ErShapes } from "../lang";
import type { ErEditResult } from "./edits.types";

/**
 * Turns a relation into an entity named after it, with one two-way relation per side it had
 * (`<relation>_<entity>`): the side keeps its cardinality, role and join attribute, the new
 * entity's is `(1,1)`, and the relation's attributes move to the entity. Relations that had it as
 * an associative participant now have the entity; constraints about it go. Refused (unchanged)
 * for a relation with fewer than two sides or that an aggregation holds.
 */
export function convertRelationToEntity(shapes: ErShapes, relationId: string): ErEditResult {
  const relation = shapes.relations.find((r) => r.id === relationId);
  if (!relation || relation.participants.length < 2) return { shapes };
  if (shapes.aggregates.some((a) => a.relationId === relationId)) return { shapes };

  const names = [...shapes.entities, ...shapes.aggregates];
  const center = { x: relation.x + relation.w / 2, y: relation.y + relation.h / 2 };
  const entity = createErEntity(center, freeName(names, relation.name), "");
  const nameOf = (id: string) =>
    [...shapes.entities, ...shapes.aggregates, ...shapes.relations].find((s) => s.id === id)
      ?.name ?? "side";
  const relationNames = shapes.relations.filter((r) => r.id !== relationId);
  const links = relation.participants.map((side) => {
    const link = createErRelation(
      { x: 0, y: 0 },
      freeName(relationNames, `${relation.name}_${nameOf(side.entityId)}`),
      "",
    );
    relationNames.push(link);
    const own: ErParticipant = { ...side, id: createId() };
    const theirs: ErParticipant = {
      id: createId(),
      entityId: entity.id,
      min: "1",
      max: "1",
      role: "",
      arrow: false,
      via: "",
    };
    return { ...link, participants: [own, theirs] };
  });

  return {
    shapes: {
      ...shapes,
      entities: [...shapes.entities, entity],
      relations: [
        ...shapes.relations
          .filter((r) => r.id !== relationId)
          .map((r) => ({
            ...r,
            participants: r.participants.map((p) =>
              p.entityId === relationId ? { ...p, entityId: entity.id, via: "" } : p,
            ),
          })),
        ...links,
      ],
      attributes: shapes.attributes.map((a) =>
        a.ownerId === relationId ? { ...a, ownerId: entity.id } : a,
      ),
      constraints: shapes.constraints.filter(
        (c) => c.fromId !== relationId && c.toId !== relationId,
      ),
    },
    id: entity.id,
  };
}
