import type { Point } from "@canvas";

import type { ErElement } from "../base/er.types";
import type { ErAddAction } from "./er-add-actions.types";
import type { ErPaletteItemId } from "./er-drop.types";
import type { ErEdits } from "./er-edits";
import type { ErModel } from "./er-model";
import type { ErShapes } from "./lang";

/**
 * What a click adds for each ER element type, starting from the selected element where it makes
 * sense (a relation from the selected entity, a hierarchy under it, an attribute of it, an
 * aggregation round the selected relation), else from the diagram's first entity or relation.
 * Shared by the ER panel's Add menu and the palette.
 */
export function erAddActions(
  edits: ErEdits,
  shapes: ErShapes,
  selected: ErElement | undefined,
): Record<ErPaletteItemId, ErAddAction> {
  const entity = pick(selected, "er-entity") ?? shapes.entities[0];
  const relation = pick(selected, "er-relation") ?? shapes.relations[0];
  const otherRelation = shapes.relations.find((r) => r.id !== relation?.id);
  const owner = selected && selected.type !== "er-constraint" ? selected : entity;
  const ownerName = owner && "name" in owner ? owner.name : "the hierarchy";
  return {
    entity: action("entity", "Entity", true, () => edits.addEntity()),
    "weak-entity": action("weak-entity", "Weak entity", true, () =>
      edits.addEntity(undefined, { weak: true }),
    ),
    relation: action("relation", `Relation${entity ? ` from ${entity.name}` : ""}`, true, () =>
      edits.addRelation(relationEnds(shapes, entity)),
    ),
    attribute: action(
      "attribute",
      owner ? `Attribute of ${ownerName}` : "Attribute (add an entity first)",
      !!owner,
      () => owner && edits.addAttribute(owner.id),
    ),
    "key-attribute": action(
      "key-attribute",
      owner ? `Key attribute of ${ownerName}` : "Key attribute (add an entity first)",
      !!owner,
      () => owner && edits.addAttribute(owner.id, { key: "pk" }),
    ),
    isa: action(
      "isa",
      entity ? `Hierarchy under ${entity.name}` : "Hierarchy (add an entity first)",
      !!entity,
      () => entity && edits.addIsa(entity.id),
    ),
    aggregate: action(
      "aggregate",
      relation ? `Aggregation of ${relation.name}` : "Aggregation (add a relation first)",
      !!relation,
      () => relation && edits.addAggregate(relation.id),
    ),
    constraint: action(
      "constraint",
      otherRelation ? "Constraint between relations" : "Constraint (needs two relations)",
      !!relation && !!otherRelation,
      () =>
        relation && otherRelation
          ? edits.addConstraint("exclusion", relation.id, otherRelation.id)
          : undefined,
    ),
  };
}

function action(
  id: ErPaletteItemId,
  label: string,
  enabled: boolean,
  run: () => string | undefined,
): ErAddAction {
  return { id, label, disabled: !enabled, run };
}

function pick<T extends ErElement["type"]>(
  shape: ErElement | undefined,
  type: T,
): Extract<ErElement, { type: T }> | undefined {
  return shape?.type === type ? (shape as Extract<ErElement, { type: T }>) : undefined;
}

/** A new relation joins the chosen entity and the next one (or just it, on a one-entity board). */
function relationEnds(shapes: ErShapes, entity: ErElement | undefined): string[] {
  if (!entity) return [];
  const other = shapes.entities.find((e) => e.id !== entity.id);
  return other ? [entity.id, other.id] : [entity.id];
}

/**
 * What a click adds while no diagram is shown (an ER mode entered on a board without one): an
 * entity, or a weak one, starts a new diagram at `center()`; the rest wait for an entity.
 */
export function erAddActionsWithoutDiagram(
  er: ErModel,
  center: () => Point,
): Record<ErPaletteItemId, ErAddAction> {
  const waiting = (id: ErPaletteItemId, label: string) =>
    action(id, `${label} (add an entity first)`, false, () => undefined);
  return {
    entity: action("entity", "Entity (a new diagram)", true, () => er.newDiagram(center())),
    "weak-entity": action("weak-entity", "Weak entity (a new diagram)", true, () =>
      er.newDiagram(center(), { weak: true }),
    ),
    relation: waiting("relation", "Relation"),
    attribute: waiting("attribute", "Attribute"),
    "key-attribute": waiting("key-attribute", "Key attribute"),
    isa: waiting("isa", "Hierarchy"),
    aggregate: waiting("aggregate", "Aggregation"),
    constraint: waiting("constraint", "Constraint"),
  };
}
