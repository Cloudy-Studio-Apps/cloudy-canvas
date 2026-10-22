import { createId } from "@shared/core";

import { freeName } from "../../../../modules/db";
import type { ErConstraintRule } from "../../constraint/constraint.types";
import { createErAggregate } from "../../aggregate/aggregate.factory";
import { createErAttribute } from "../../attribute/attribute.factory";
import { createErConstraint } from "../../constraint/constraint.factory";
import { createErIsa } from "../../isa/isa.factory";
import type { ErShapes } from "../lang";
import { removeAttribute } from "./attribute-edits";
import { replaceIn } from "./edit-helpers";
import type {
  ErAggregatePatch,
  ErConstraintPatch,
  ErEditResult,
  ErIsaChildPatch,
  ErIsaPatch,
} from "./edits.types";

export function addIsa(shapes: ErShapes, parentId: string): ErEditResult {
  const isa = createErIsa({ x: 0, y: 0 }, parentId, "");
  return { shapes: { ...shapes, isas: [...shapes.isas, isa] }, id: isa.id };
}

export function updateIsa(shapes: ErShapes, id: string, patch: ErIsaPatch): ErShapes {
  return { ...shapes, isas: replaceIn(shapes.isas, id, (isa) => ({ ...isa, ...patch })) };
}

export function addIsaChild(shapes: ErShapes, id: string, entityId: string): ErShapes {
  return {
    ...shapes,
    isas: replaceIn(shapes.isas, id, (isa) => ({
      ...isa,
      children: [...isa.children, { id: createId(), entityId, min: "", max: "" }],
    })),
  };
}

export function updateIsaChild(
  shapes: ErShapes,
  id: string,
  childId: string,
  patch: ErIsaChildPatch,
): ErShapes {
  return {
    ...shapes,
    isas: replaceIn(shapes.isas, id, (isa) => ({
      ...isa,
      children: isa.children.map((c) => (c.id === childId ? { ...c, ...patch } : c)),
    })),
  };
}

export function removeIsaChild(shapes: ErShapes, id: string, childId: string): ErShapes {
  return {
    ...shapes,
    isas: replaceIn(shapes.isas, id, (isa) => ({
      ...isa,
      children: isa.children.filter((c) => c.id !== childId),
    })),
  };
}

/** Sets (or, with an empty name, removes) the discriminator attribute on the triangle. */
export function setDiscriminator(shapes: ErShapes, id: string, name: string): ErShapes {
  const current = shapes.attributes.find((a) => a.ownerId === id);
  if (!name.trim()) return current ? removeAttribute(shapes, current.id) : shapes;
  if (current) {
    return {
      ...shapes,
      attributes: replaceIn(shapes.attributes, current.id, (a) => ({ ...a, name })),
    };
  }
  const look = shapes.attributes[0]?.look ?? "ellipse";
  const attribute = createErAttribute({ x: 0, y: 0 }, id, name, "", look);
  return { ...shapes, attributes: [...shapes.attributes, attribute] };
}

export function addAggregate(shapes: ErShapes, relationId: string): ErEditResult {
  const aggregate = createErAggregate(freeName(shapes.aggregates, "aggregation"), relationId, "");
  return { shapes: { ...shapes, aggregates: [...shapes.aggregates, aggregate] }, id: aggregate.id };
}

export function updateAggregate(shapes: ErShapes, id: string, patch: ErAggregatePatch): ErShapes {
  return { ...shapes, aggregates: replaceIn(shapes.aggregates, id, (a) => ({ ...a, ...patch })) };
}

export function addConstraint(
  shapes: ErShapes,
  rule: ErConstraintRule,
  fromId: string,
  toId: string,
  entityId: string,
): ErEditResult {
  const constraint = createErConstraint(rule, fromId, toId, entityId, "");
  return {
    shapes: { ...shapes, constraints: [...shapes.constraints, constraint] },
    id: constraint.id,
  };
}

export function updateConstraint(shapes: ErShapes, id: string, patch: ErConstraintPatch): ErShapes {
  return {
    ...shapes,
    constraints: replaceIn(shapes.constraints, id, (c) => ({ ...c, ...patch })),
  };
}
