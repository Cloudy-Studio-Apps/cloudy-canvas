import type { Point } from "@canvas";

import type { ErElement } from "../base/er.types";
import type { ErAddAction } from "./er-add-actions.types";
import type { ErPaletteItemId } from "./er-drop.types";
import type { ErEdits } from "./er-edits";
import type { ErModel } from "./er-model";
import type { ErShapes } from "./lang";
import { OPEN_GATE, type ErConstructGate } from "../base/constructs";
import { PALETTE_CONSTRUCTS } from "./palette-constructs";
import { gateOf } from "./standard-of";

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
  gate: ErConstructGate = OPEN_GATE,
): Record<ErPaletteItemId, ErAddAction> {
  return gated(choices(edits, shapes, selected), gate, (id) =>
    // An attribute of a relation is a relation attribute.
    (id === "attribute" || id === "key-attribute") &&
    attributeOwner(shapes, selected)?.type === "er-relation"
      ? "relation-attributes"
      : PALETTE_CONSTRUCTS[id],
  );
}

function choices(
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
    associative: action(
      "associative",
      `Associative entity${entity ? ` from ${entity.name}` : ""}`,
      true,
      () => edits.addRelation(relationEnds(shapes, entity), { associative: true }),
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
    union: action(
      "union",
      entity ? `Union type of ${entity.name}` : "Union type (add an entity first)",
      !!entity,
      () => entity && edits.addUnion(entity.id),
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
  gate: ErConstructGate = OPEN_GATE,
): Record<ErPaletteItemId, ErAddAction> {
  return gated(newDiagramChoices(er, center), gate, (id) => PALETTE_CONSTRUCTS[id]);
}

function newDiagramChoices(er: ErModel, center: () => Point): Record<ErPaletteItemId, ErAddAction> {
  const waiting = (id: ErPaletteItemId, label: string) =>
    action(id, `${label} (add an entity first)`, false, () => undefined);
  return {
    entity: action("entity", "Entity (a new diagram)", true, () => er.newDiagram(center())),
    "weak-entity": action("weak-entity", "Weak entity (a new diagram)", true, () =>
      er.newDiagram(center(), { weak: true }),
    ),
    relation: waiting("relation", "Relation"),
    associative: waiting("associative", "Associative entity"),
    attribute: waiting("attribute", "Attribute"),
    "key-attribute": waiting("key-attribute", "Key attribute"),
    isa: waiting("isa", "Hierarchy"),
    union: waiting("union", "Union type"),
    aggregate: waiting("aggregate", "Aggregation"),
    constraint: waiting("constraint", "Constraint"),
  };
}

/**
 * What a click (or the ER mode's key) adds now: from the diagram `diagramId` shown and the
 * selected shape, or, with no diagram shown (none yet, or all its shapes deleted), an entity that
 * starts one at `center()`.
 */
export function erClickActions(
  er: ErModel,
  diagramId: string | null,
  selectedId: string | null,
  center: () => Point,
): Record<ErPaletteItemId, ErAddAction> {
  const diagram = diagramId ? er.diagram(diagramId) : undefined;
  const shapes = diagram?.shapes();
  if (!diagram || !shapes || shapes.entities.length + shapes.relations.length === 0) {
    return erAddActionsWithoutDiagram(er, center);
  }
  const selected = selectedId ? er.shape(selectedId) : undefined;
  return erAddActions(diagram.edits, shapes, selected, gateOf(shapes));
}

/** The actions with what the standard forbids disabled, the reason as their label. */
function gated(
  actions: Record<ErPaletteItemId, ErAddAction>,
  gate: ErConstructGate,
  constructOf: (id: ErPaletteItemId) => string | undefined,
): Record<ErPaletteItemId, ErAddAction> {
  const result = { ...actions };
  for (const id of Object.keys(actions) as ErPaletteItemId[]) {
    const construct = constructOf(id);
    if (construct && !gate.allows(construct)) {
      result[id] = { ...actions[id], disabled: true, blocked: true, label: gate.reason(construct) };
    }
  }
  return result;
}

/** Who an attribute clicked in goes to: the selection unless it's a constraint, else the first entity. */
function attributeOwner(shapes: ErShapes, selected: ErElement | undefined): ErElement | undefined {
  return selected && selected.type !== "er-constraint" ? selected : shapes.entities[0];
}
