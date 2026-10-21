import { createId } from "@core";

import {
  NO_ER_DIAGRAM,
  ER_ENTITY_COLOR,
  type ErAggregateShape,
  type ErConstraintKind,
  type ErConstraintShape,
  type ErIsaShape,
  ER_RELATION_COLOR,
  type ErAttributeLook,
  type ErAttributeShape,
  type ErEntityShape,
  type ErRelationShape,
} from "../document";
import type { Point } from "../geometry.types";
import { attributeSize, entitySize, ISA_SIZE, relationSize } from "./er-size";

/** A new entity centered on `center`. */
export function createErEntity(center: Point, name: string, index: string): ErEntityShape {
  const size = entitySize(name);
  return {
    id: createId(),
    type: "er-entity",
    ...NO_ER_DIAGRAM,
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
    ...NO_ER_DIAGRAM,
    index,
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
    name,
    identifying: false,
    idMark: false,
    color: ER_RELATION_COLOR,
    participants: [],
  };
}

export function createErAttribute(
  center: Point,
  ownerId: string,
  name: string,
  index: string,
  look: ErAttributeLook = "ellipse",
): ErAttributeShape {
  const size = attributeSize(name, look);
  return {
    id: createId(),
    type: "er-attribute",
    ...NO_ER_DIAGRAM,
    index,
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
    ownerId,
    name,
    key: "none",
    multivalued: false,
    derived: false,
    optional: false,
    look,
    order: 0,
  };
}

export function createErIsa(center: Point, parentId: string, index: string): ErIsaShape {
  return {
    id: createId(),
    type: "er-isa",
    ...NO_ER_DIAGRAM,
    index,
    x: Math.round(center.x - ISA_SIZE.w / 2),
    y: Math.round(center.y - ISA_SIZE.h / 2),
    ...ISA_SIZE,
    parentId,
    parentMin: "",
    parentMax: "",
    exclusive: false,
    total: false,
    children: [],
  };
}

/** Bounds and points are derived by the scene, so a new aggregation or constraint starts empty. */
export function createErAggregate(
  name: string,
  relationId: string,
  index: string,
): ErAggregateShape {
  return {
    id: createId(),
    type: "er-aggregate",
    ...NO_ER_DIAGRAM,
    index,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    name,
    relationId,
  };
}

export function createErConstraint(
  rule: ErConstraintKind,
  fromId: string,
  toId: string,
  entityId: string,
  index: string,
): ErConstraintShape {
  return {
    id: createId(),
    type: "er-constraint",
    ...NO_ER_DIAGRAM,
    index,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    rule,
    entityId,
    fromId,
    toId,
    min: rule === "inclusive" ? "1" : "",
    max: rule === "inclusive" ? "n" : "",
    points: [],
  };
}
