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
import { t } from "../er.i18n";

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
  const ownerName = owner && "name" in owner ? owner.name : t("drop.theHierarchy");
  return {
    entity: action("entity", t("drop.entity"), true, () => edits.addEntity()),
    "weak-entity": action("weak-entity", t("drop.weakEntity"), true, () =>
      edits.addEntity(undefined, { weak: true }),
    ),
    relation: action(
      "relation",
      entity ? t("actions.relationFrom", { name: entity.name }) : t("drop.relation"),
      true,
      () => edits.addRelation(relationEnds(shapes, entity)),
    ),
    associative: action(
      "associative",
      entity ? t("actions.associativeFrom", { name: entity.name }) : t("drop.associative"),
      true,
      () => edits.addRelation(relationEnds(shapes, entity), { associative: true }),
    ),
    attribute: action(
      "attribute",
      owner ? t("actions.attributeOf", { name: ownerName }) : t("actions.attributeNeedsEntity"),
      !!owner,
      () => owner && edits.addAttribute(owner.id),
    ),
    "key-attribute": action(
      "key-attribute",
      owner
        ? t("actions.keyAttributeOf", { name: ownerName })
        : t("actions.keyAttributeNeedsEntity"),
      !!owner,
      () => owner && edits.addAttribute(owner.id, { key: "pk" }),
    ),
    isa: action(
      "isa",
      entity ? t("actions.isaUnder", { name: entity.name }) : t("actions.isaNeedsEntity"),
      !!entity,
      () => entity && edits.addIsa(entity.id),
    ),
    union: action(
      "union",
      entity ? t("actions.unionOf", { name: entity.name }) : t("actions.unionNeedsEntity"),
      !!entity,
      () => entity && edits.addUnion(entity.id),
    ),
    aggregate: action(
      "aggregate",
      relation
        ? t("actions.aggregationOf", { name: relation.name })
        : t("actions.aggregationNeedsRelation"),
      !!relation,
      () => relation && edits.addAggregate(relation.id),
    ),
    constraint: action(
      "constraint",
      otherRelation ? t("actions.constraintBetween") : t("actions.constraintNeedsTwo"),
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
    action(id, t("waiting", { label }), false, () => undefined);
  return {
    entity: action("entity", t("actions.entityNewDiagram"), true, () => er.newDiagram(center())),
    "weak-entity": action("weak-entity", t("actions.weakNewDiagram"), true, () =>
      er.newDiagram(center(), { weak: true }),
    ),
    relation: waiting("relation", t("drop.relation")),
    associative: waiting("associative", t("drop.associative")),
    attribute: waiting("attribute", t("drop.attribute")),
    "key-attribute": waiting("key-attribute", t("drop.keyAttribute")),
    isa: waiting("isa", t("kinds.isa.label")),
    union: waiting("union", t("kinds.union.label")),
    aggregate: waiting("aggregate", t("kinds.aggregate.label")),
    constraint: waiting("constraint", t("kinds.constraint.label")),
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
