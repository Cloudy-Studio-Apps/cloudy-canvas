import { createId } from "@core";

import {
  ER_ENTITY_COLOR,
  ER_RELATION_COLOR,
  type ErAttributeShape,
  type ErEntityShape,
  type ErRelationShape,
} from "../document";
import type { Point } from "../geometry.types";
import { attributeSize, entitySize, relationSize } from "./er-size";

/** A new entity centered on `center`. */
export function createErEntity(center: Point, name: string, index: string): ErEntityShape {
  const size = entitySize(name);
  return {
    id: createId(),
    type: "er-entity",
    index,
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
    name,
    weak: false,
    color: ER_ENTITY_COLOR,
  };
}

export function createErRelation(center: Point, name: string, index: string): ErRelationShape {
  const size = relationSize(name);
  return {
    id: createId(),
    type: "er-relation",
    index,
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
    name,
    identifying: false,
    color: ER_RELATION_COLOR,
    participants: [],
  };
}

export function createErAttribute(
  center: Point,
  ownerId: string,
  name: string,
  index: string,
): ErAttributeShape {
  const size = attributeSize(name);
  return {
    id: createId(),
    type: "er-attribute",
    index,
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
    ownerId,
    name,
    key: "none",
    multivalued: false,
    derived: false,
    order: 0,
  };
}
