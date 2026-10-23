import type { CanvasElement } from "@canvas";

import type { ErRelationElement } from "../relation/relation.types";
import type { ErElement, ErNamedElement, ErParticipantElement } from "./er.types";

export function isErElement(el: CanvasElement | undefined): el is ErElement {
  return el?.type.startsWith("er-") ?? false;
}

/** ER elements whose name is edited in place. */
export function isErNamed(el: CanvasElement | undefined): el is ErNamedElement {
  return (
    el?.type === "er-entity" ||
    el?.type === "er-relation" ||
    el?.type === "er-attribute" ||
    el?.type === "er-aggregate"
  );
}

/**
 * What takes part in a relation: an entity, an aggregation or an associative entity (a relation
 * that is also an entity).
 */
export function isErParticipant(el: CanvasElement | undefined): el is ErParticipantElement {
  return (
    el?.type === "er-entity" ||
    el?.type === "er-aggregate" ||
    (el?.type === "er-relation" && (el as ErRelationElement).associative === true)
  );
}
