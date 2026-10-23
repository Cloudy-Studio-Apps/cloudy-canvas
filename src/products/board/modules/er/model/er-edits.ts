import type { CanvasDocument, Point } from "@canvas";

import type { ErAttributeLook } from "../attribute/attribute.types";
import type { ErConstraintRule } from "../constraint/constraint.types";
import { attributeSize } from "../base/er-size";
import { applyErPlan } from "./apply-er-plan";
import * as edit from "./edits";
import type {
  ErAddOptions,
  ErAggregatePatch,
  ErAttributeAddOptions,
  ErAttributePatch,
  ErConstraintPatch,
  ErEditResult,
  ErEntityAddOptions,
  ErEntityPatch,
  ErIsaChildPatch,
  ErIsaPatch,
  ErParticipantPatch,
  ErRelationAddOptions,
  ErRelationEnd,
  ErRelationPatch,
} from "./edits";
import { allErShapes, diagramScope, erShapes } from "./er-shapes";
import { splitErDiagrams } from "./split-er-diagrams";
import type { ErShapes } from "./lang";
import type { Centers } from "./layout";

/**
 * Edits from the visual editor to one diagram. Each one builds the next model and writes it like
 * applied text: one undo step, with new shapes placed automatically. Methods that create a shape
 * return its id.
 */
export class ErEdits {
  constructor(
    private readonly doc: CanvasDocument,
    private readonly diagram: string,
  ) {}

  addEntity = (name?: string, { at, weak }: ErEntityAddOptions = {}) =>
    this.run((s) => edit.addEntity(s, name, weak), at);
  updateEntity = (id: string, patch: ErEntityPatch) =>
    this.run((s) => edit.updateEntity(s, id, patch));

  addAttribute = (ownerId: string, { at, key }: ErAttributeAddOptions = {}) =>
    this.run((s) => edit.addAttribute(s, ownerId, key), at);
  updateAttribute = (id: string, patch: ErAttributePatch) =>
    this.run((s) => edit.updateAttribute(s, id, patch));
  removeAttribute = (id: string) => this.run((s) => edit.removeAttribute(s, id));
  moveAttribute = (id: string, by: -1 | 1) => this.run((s) => edit.moveAttribute(s, id, by));

  addRelation = (entityIds: readonly string[], { at, associative }: ErRelationAddOptions = {}) =>
    this.run((s) => edit.addRelation(s, entityIds, associative), at);
  updateRelation = (id: string, patch: ErRelationPatch) =>
    this.run((s) => edit.updateRelation(s, id, patch));
  /** A relation between the ends with their cardinalities and join attributes; returns its id. */
  addLinkedRelation = (ends: readonly ErRelationEnd[], { at }: ErAddOptions = {}) =>
    this.run((s) => edit.addLinkedRelation(s, ends), at);
  /**
   * Turns a relation into an entity with a two-way relation per side, in its place, one undo
   * step (see `convertRelationToEntity`); returns the entity's id.
   */
  convertToEntity = (relationId: string) => {
    const relation = erShapes(this.doc, this.diagram).relations.find((r) => r.id === relationId);
    const at = relation
      ? { x: relation.x + relation.w / 2, y: relation.y + relation.h / 2 }
      : undefined;
    return this.run((s) => edit.convertRelationToEntity(s, relationId), at);
  };
  /** A union type for the category entity; returns its id. */
  addUnion = (categoryId: string, { at }: ErAddOptions = {}) =>
    this.run((s) => edit.addUnion(s, categoryId), at);
  setUnionCategory = (id: string, categoryId: string) =>
    this.run((s) => edit.setUnionCategory(s, id, categoryId), undefined, true);
  addUnionSuperclass = (id: string, entityId: string) =>
    this.run((s) => edit.addUnionSuperclass(s, id, entityId));
  removeUnionSuperclass = (id: string, entityId: string) =>
    this.run((s) => edit.removeUnionSuperclass(s, id, entityId), undefined, true);
  /** A new entity at `at` as a superclass of the union, in one undo step; returns its id. */
  addUnionSuperclassEntity = (id: string, { at }: ErAddOptions = {}) =>
    this.run((s) => {
      const added = edit.addEntity(s);
      return {
        shapes: edit.addUnionSuperclass(added.shapes, id, added.id ?? ""),
        id: added.id,
      };
    }, at);
  addParticipant = (id: string, entityId: string) =>
    this.run((s) => edit.addParticipant(s, id, entityId));
  updateParticipant = (id: string, participantId: string, patch: ErParticipantPatch) =>
    this.run((s) => edit.updateParticipant(s, id, participantId, patch), undefined, true);
  removeParticipant = (id: string, participantId: string) =>
    this.run((s) => edit.removeParticipant(s, id, participantId), undefined, true);

  addIsa = (parentId: string, { at }: ErAddOptions = {}) =>
    this.run((s) => edit.addIsa(s, parentId), at);
  /** A new entity as a child of the hierarchy, in one undo step; returns the entity's id. */
  addIsaChildEntity = (id: string, { at }: ErAddOptions = {}) =>
    this.run((s) => {
      const added = edit.addEntity(s);
      return added.id
        ? { shapes: edit.addIsaChild(added.shapes, id, added.id), id: added.id }
        : added;
    }, at);
  /**
   * A new entity at `at` and a relation between it and `entityId` (halfway), in one undo step;
   * returns the new entity's id.
   */
  addRelatedEntity = (entityId: string, { at }: ErAddOptions = {}) =>
    this.run((s) => {
      const added = edit.addEntity(s);
      const linked = edit.addRelation(added.shapes, [entityId, added.id ?? ""]);
      return { shapes: linked.shapes, id: added.id, pinned: halfway(s, entityId, at, linked.id) };
    }, at);
  /** A new entity at `at` taking part in the relation, in one undo step; returns its id. */
  addParticipantEntity = (relationId: string, { at }: ErAddOptions = {}) =>
    this.run((s) => {
      const added = edit.addEntity(s);
      return {
        shapes: edit.addParticipant(added.shapes, relationId, added.id ?? ""),
        id: added.id,
      };
    }, at);
  /**
   * A new entity at `at` specializing `parentId` through a new hierarchy (halfway), in one undo
   * step; returns the new entity's id.
   */
  addSubtype = (parentId: string, { at }: ErAddOptions = {}) =>
    this.run((s) => {
      const isa = edit.addIsa(s, parentId);
      const added = edit.addEntity(isa.shapes);
      const shapes = edit.addIsaChild(added.shapes, isa.id ?? "", added.id ?? "");
      return { shapes, id: added.id, pinned: halfway(s, parentId, at, isa.id) };
    }, at);
  updateIsa = (id: string, patch: ErIsaPatch) =>
    this.run((s) => edit.updateIsa(s, id, patch), undefined, true);
  addIsaChild = (id: string, entityId: string) =>
    this.run((s) => edit.addIsaChild(s, id, entityId));
  updateIsaChild = (id: string, childId: string, patch: ErIsaChildPatch) =>
    this.run((s) => edit.updateIsaChild(s, id, childId, patch), undefined, true);
  removeIsaChild = (id: string, childId: string) =>
    this.run((s) => edit.removeIsaChild(s, id, childId), undefined, true);
  setDiscriminator = (id: string, name: string) =>
    this.run((s) => edit.setDiscriminator(s, id, name));

  addAggregate = (relationId: string) => this.run((s) => edit.addAggregate(s, relationId));
  updateAggregate = (id: string, patch: ErAggregatePatch) =>
    this.run((s) => edit.updateAggregate(s, id, patch), undefined, true);

  addConstraint = (rule: ErConstraintRule, fromId: string, toId: string, entityId = "") =>
    this.run((s) => edit.addConstraint(s, rule, fromId, toId, entityId));
  updateConstraint = (id: string, patch: ErConstraintPatch) =>
    this.run((s) => edit.updateConstraint(s, id, patch), undefined, true);

  /** Switches every attribute to the Chen (ellipse) or lollipop look. */
  setStyle = (look: ErAttributeLook) =>
    this.run((s) => ({
      ...s,
      attributes: s.attributes.map((a) => {
        const size = attributeSize(a.name, look);
        const cx = a.x + a.w / 2;
        const cy = a.y + a.h / 2;
        return {
          ...a,
          look,
          ...size,
          x: Math.round(cx - size.w / 2),
          y: Math.round(cy - size.h / 2),
        };
      }),
    }));

  /**
   * `at` centers the shape the edit creates there instead of placing it automatically; `unlinks`
   * (edits that can cut a link: removing a participant, changing a hierarchy's parent) splits off
   * what's no longer linked to the rest, in the same undo step (`splitErDiagrams`).
   */
  private run(
    fn: (shapes: ErShapes) => ErEditResult | ErShapes,
    at?: Point,
    unlinks = false,
  ): string | undefined {
    const elementsBefore = unlinks ? this.doc.all() : [];
    const current = erShapes(this.doc, this.diagram);
    const result = fn(current);
    const next = "shapes" in result ? result.shapes : result;
    const before = new Set(allErShapes(current).map((s) => s.id));
    const after = allErShapes(next);
    const kept = new Set(after.map((s) => s.id));
    const id = "shapes" in result ? result.id : undefined;
    const pinned = new Map("shapes" in result ? result.pinned : undefined);
    if (id && at && !pinned.has(id)) pinned.set(id, at);
    applyErPlan(
      this.doc,
      {
        shapes: next,
        added: new Set(after.filter((s) => !before.has(s.id)).map((s) => s.id)),
        removed: [...before].filter((id) => !kept.has(id)),
      },
      diagramScope(current, this.diagram),
      pinned,
      unlinks ? () => splitErDiagrams(this.doc, elementsBefore, [this.diagram]) : undefined,
    );
    return id;
  }
}

/** Pins `id` halfway between the shape `fromId` and `at` (nothing without `at`). */
function halfway(
  shapes: ErShapes,
  fromId: string,
  at: Point | undefined,
  id: string | undefined,
): Centers {
  const from = allErShapes(shapes).find((shape) => shape.id === fromId);
  if (!from || !at || !id) return new Map();
  const center = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
  return new Map([[id, { x: (center.x + at.x) / 2, y: (center.y + at.y) / 2 }]]);
}
