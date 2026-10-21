import type { BoardDocument, ErAttributeLook, ErConstraintKind } from "../document";
import { applyErPlan } from "./apply-er-plan";
import * as edit from "./edits";
import type {
  ErAggregatePatch,
  ErAttributePatch,
  ErConstraintPatch,
  ErEditResult,
  ErEntityPatch,
  ErIsaChildPatch,
  ErIsaPatch,
  ErParticipantPatch,
  ErRelationPatch,
} from "./edits";
import { allErShapes, erShapes } from "./er-shapes";
import { attributeSize } from "./er-size";
import type { ErShapes } from "./lang";

/**
 * Edits from the visual editor. Each one builds the next model and writes it like applied text:
 * one undo step, with new shapes placed automatically. Methods that create a shape return its id.
 */
export class ErEdits {
  constructor(private readonly doc: BoardDocument) {}

  addEntity = (name?: string) => this.run((s) => edit.addEntity(s, name));
  updateEntity = (id: string, patch: ErEntityPatch) =>
    this.run((s) => edit.updateEntity(s, id, patch));

  addAttribute = (ownerId: string) => this.run((s) => edit.addAttribute(s, ownerId));
  updateAttribute = (id: string, patch: ErAttributePatch) =>
    this.run((s) => edit.updateAttribute(s, id, patch));
  removeAttribute = (id: string) => this.run((s) => edit.removeAttribute(s, id));
  moveAttribute = (id: string, by: -1 | 1) => this.run((s) => edit.moveAttribute(s, id, by));

  addRelation = (entityIds: readonly string[]) => this.run((s) => edit.addRelation(s, entityIds));
  updateRelation = (id: string, patch: ErRelationPatch) =>
    this.run((s) => edit.updateRelation(s, id, patch));
  addParticipant = (id: string, entityId: string) =>
    this.run((s) => edit.addParticipant(s, id, entityId));
  updateParticipant = (id: string, participantId: string, patch: ErParticipantPatch) =>
    this.run((s) => edit.updateParticipant(s, id, participantId, patch));
  removeParticipant = (id: string, participantId: string) =>
    this.run((s) => edit.removeParticipant(s, id, participantId));

  addIsa = (parentId: string) => this.run((s) => edit.addIsa(s, parentId));
  updateIsa = (id: string, patch: ErIsaPatch) => this.run((s) => edit.updateIsa(s, id, patch));
  addIsaChild = (id: string, entityId: string) =>
    this.run((s) => edit.addIsaChild(s, id, entityId));
  updateIsaChild = (id: string, childId: string, patch: ErIsaChildPatch) =>
    this.run((s) => edit.updateIsaChild(s, id, childId, patch));
  removeIsaChild = (id: string, childId: string) =>
    this.run((s) => edit.removeIsaChild(s, id, childId));
  setDiscriminator = (id: string, name: string) =>
    this.run((s) => edit.setDiscriminator(s, id, name));

  addAggregate = (relationId: string) => this.run((s) => edit.addAggregate(s, relationId));
  updateAggregate = (id: string, patch: ErAggregatePatch) =>
    this.run((s) => edit.updateAggregate(s, id, patch));

  addConstraint = (rule: ErConstraintKind, fromId: string, toId: string, entityId = "") =>
    this.run((s) => edit.addConstraint(s, rule, fromId, toId, entityId));
  updateConstraint = (id: string, patch: ErConstraintPatch) =>
    this.run((s) => edit.updateConstraint(s, id, patch));

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

  private run(fn: (shapes: ErShapes) => ErEditResult | ErShapes): string | undefined {
    const current = erShapes(this.doc);
    const result = fn(current);
    const next = "shapes" in result ? result.shapes : result;
    const before = new Set(allErShapes(current).map((s) => s.id));
    const after = allErShapes(next);
    const kept = new Set(after.map((s) => s.id));
    applyErPlan(this.doc, {
      shapes: next,
      added: new Set(after.filter((s) => !before.has(s.id)).map((s) => s.id)),
      removed: [...before].filter((id) => !kept.has(id)),
    });
    return "shapes" in result ? result.id : undefined;
  }
}
