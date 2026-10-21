import { freeName } from "../../../db";
import { createErEntity } from "../../entity/entity.factory";
import { entitySize } from "../../base/er-size";
import type { ErShapes } from "../lang";
import { replaceIn, resized } from "./edit-helpers";
import type { ErEditResult, ErEntityPatch } from "./edits.types";

export function addEntity(shapes: ErShapes, name?: string): ErEditResult {
  const entity = createErEntity({ x: 0, y: 0 }, name ?? freeName(shapes.entities, "entity"), "");
  return { shapes: { ...shapes, entities: [...shapes.entities, entity] }, id: entity.id };
}

export function updateEntity(shapes: ErShapes, id: string, patch: ErEntityPatch): ErShapes {
  return {
    ...shapes,
    entities: replaceIn(shapes.entities, id, (entity) => {
      const next = { ...entity, ...patch };
      return patch.name !== undefined ? resized(next, entitySize(next.name)) : next;
    }),
  };
}
