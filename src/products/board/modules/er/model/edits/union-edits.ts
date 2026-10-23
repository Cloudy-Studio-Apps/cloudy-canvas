import { createErUnion } from "../../union/union.factory";
import type { ErShapes } from "../lang";
import { replaceIn } from "./edit-helpers";
import type { ErEditResult } from "./edits.types";

/** A union type for the category entity, with no superclasses yet. */
export function addUnion(shapes: ErShapes, categoryId: string): ErEditResult {
  const union = createErUnion({ x: 0, y: 0 }, categoryId, "");
  return { shapes: { ...shapes, unions: [...shapes.unions, union] }, id: union.id };
}

/** Adds a superclass (not the category, not twice). */
export function addUnionSuperclass(shapes: ErShapes, id: string, entityId: string): ErShapes {
  return {
    ...shapes,
    unions: replaceIn(shapes.unions, id, (union) =>
      union.categoryId === entityId || union.superclassIds.includes(entityId)
        ? union
        : { ...union, superclassIds: [...union.superclassIds, entityId] },
    ),
  };
}

export function removeUnionSuperclass(shapes: ErShapes, id: string, entityId: string): ErShapes {
  return {
    ...shapes,
    unions: replaceIn(shapes.unions, id, (union) => ({
      ...union,
      superclassIds: union.superclassIds.filter((s) => s !== entityId),
    })),
  };
}

/** Makes another entity the category (dropping it from the superclasses if it was one). */
export function setUnionCategory(shapes: ErShapes, id: string, categoryId: string): ErShapes {
  return {
    ...shapes,
    unions: replaceIn(shapes.unions, id, (union) => ({
      ...union,
      categoryId,
      superclassIds: union.superclassIds.filter((s) => s !== categoryId),
    })),
  };
}
