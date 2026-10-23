import {
  MOVE_THRESHOLD_PX,
  type CanvasPointer,
  type ElementGesture,
  type Guide,
  type Point,
  type Rect,
  type ToolContext,
} from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import type { ErElement } from "../base/er.types";
import { isErParticipant } from "../base/is-er-element";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErUnionElement } from "../union/union.types";
import { ER_MODEL, gateOf, type ErEdits } from "../model";
import type { ErRelationElement } from "../relation/relation.types";
import type { ErConnectOutcome, ErConnectSource } from "./er-connect.types";
import { ER_QUICK_ADD } from "./er-quick-add";
import { ER_RELATION_PROMPT } from "./er-relation-ratios";

const LINE_WIDTH_PX = 1.5;

/**
 * Drags a line out of an entity's, relation's or hierarchy's connect dot. Dropped on another
 * entity (or an aggregation) it asks what kind of relation to make between them (the relation
 * prompt, `ER_RELATION_PROMPT`), or, from a relation, adds it as a
 * participant; an entity dropped on a relation joins it. A hierarchy and an entity linked either
 * way make the entity one of its children. Dropped on empty board it opens the quick-add menu
 * there, to pick what to create (`ErQuickAdd`). Linking a shape of another diagram joins the two diagrams.
 * The end follows the pointer's screen position, so auto-panning keeps it under the cursor.
 */
export class ErConnectGesture implements ElementGesture {
  private screen: Point;
  private readonly start: Point;

  constructor(
    private readonly ctx: ToolContext<BoardToolOptions>,
    private readonly source: ErConnectSource,
    private readonly from: Point,
    pointer: CanvasPointer,
  ) {
    this.screen = pointer.screen;
    this.start = pointer.screen;
    ctx.setSelection([]);
    this.update();
  }

  move(p: CanvasPointer): void {
    this.screen = p.screen;
    this.update();
    this.ctx.autoPan(p.screen, () => this.update());
  }

  finish(): void {
    const moved =
      Math.hypot(this.screen.x - this.start.x, this.screen.y - this.start.y) >= MOVE_THRESHOLD_PX;
    const end = this.world();
    const hit = this.hitAt(end);
    this.cancel();
    if (moved && hit === undefined) {
      // Empty board: the quick-add menu asks what to create there.
      this.ctx.setSelection([this.source.id]);
      this.ctx.service(ER_QUICK_ADD).open({ sourceId: this.source.id, at: end });
      return;
    }
    const outcome = moved ? this.outcome(hit, end) : null;
    const id = outcome?.run();
    this.ctx.setSelection([id ?? this.source.id]);
  }

  cancel(): void {
    this.ctx.autoPan(null);
    this.ctx.setGuide(null);
  }

  onCameraChange(): void {
    this.update();
  }

  private update(): void {
    const end = this.world();
    const hit = this.hitAt(end);
    const ok = this.outcome(hit, end) !== null;
    const target = ok && hit ? this.ctx.getElement(hit.id) : undefined;
    this.ctx.setGuide(this.guide(end, ok, target));
  }

  private guide(end: Point, ok: boolean, target: Rect | undefined): Guide {
    const { from } = this;
    return (g, { zoom, theme }) => {
      const width = LINE_WIDTH_PX / zoom;
      if (target) {
        g.rect(target.x, target.y, target.w, target.h)
          .fill({ color: theme.selection, alpha: 0.12 })
          .stroke({ color: theme.selection, width });
      }
      g.moveTo(from.x, from.y)
        .lineTo(end.x, end.y)
        .stroke({ color: theme.selection, width, alpha: ok ? 1 : 0.4 });
    };
  }

  /**
   * What dropping at `at` does, or `null` when nothing would happen (on the source itself, on an
   * element that can't be linked). `undefined` is empty board. Linking a shape of another diagram
   * first joins that diagram to the source's, in the same undo step.
   */
  private outcome(hit: ErElement | null | undefined, at: Point): ErConnectOutcome | null {
    const outcome = this.link(hit, at);
    const other = hit?.diagram;
    if (!outcome || outcome.prompts || !other || other === this.source.diagram) return outcome;
    const er = this.ctx.service(ER_MODEL);
    return { run: () => er.join(this.source.diagram, other, outcome.run) };
  }

  /** The edit, written to the source's diagram (which by then holds `hit` too). */
  private link(hit: ErElement | null | undefined, at: Point): ErConnectOutcome | null {
    const outcome = this.linkAnyStandard(hit, at);
    if (!outcome?.construct) return outcome;
    // What the diagram's standard forbids isn't linked: the line stays faded.
    const shapes = this.ctx.service(ER_MODEL).diagram(this.source.diagram).shapes();
    return gateOf(shapes).allows(outcome.construct) ? outcome : null;
  }

  private linkAnyStandard(hit: ErElement | null | undefined, at: Point): ErConnectOutcome | null {
    const { source } = this;
    const edits = this.ctx.service(ER_MODEL).diagram(source.diagram).edits;
    if (source.type === "er-isa") {
      // Empty board opens the quick-add menu (gated there); an entity becomes a child.
      if (hit === undefined) return { run: () => edits.addIsaChildEntity(source.id, { at }) };
      return hit?.type === "er-entity" ? childLink(edits, source, hit.id) : null;
    }
    if (source.type === "er-union") {
      if (hit === undefined)
        return { run: () => edits.addUnionSuperclassEntity(source.id, { at }) };
      return hit?.type === "er-entity" ? superclassLink(edits, source, hit.id) : null;
    }
    if (hit === undefined) return { run: () => edits.addAttribute(source.id, { at }) };
    if (hit === null || hit.id === source.id) return null;
    if (source.type === "er-entity") {
      if (hit.type === "er-isa") return childLink(edits, hit, source.id);
      if (hit.type === "er-union") return superclassLink(edits, hit, source.id);
      if (isParticipant(hit)) {
        // The relation prompt asks what kind of relation it is (and joins the diagrams).
        const target = this.ctx.getElement(hit.id) ?? hit;
        const prompt = this.ctx.service(ER_RELATION_PROMPT);
        const request = { fromId: source.id, toId: hit.id, at: midpoint(source, target) };
        return {
          prompts: true,
          run: () => {
            prompt.open(request);
            return undefined;
          },
        };
      }
      if (hit.type === "er-relation") {
        return {
          ...joinConstruct(hit, source.id),
          run: () => {
            edits.addParticipant(hit.id, source.id);
            return hit.id;
          },
        };
      }
      return null;
    }
    if (isParticipant(hit) && source.type === "er-relation") {
      return {
        ...joinConstruct(source, hit.id),
        run: () => {
          edits.addParticipant(source.id, hit.id);
          return source.id;
        },
      };
    }
    return null;
  }

  /** The ER element under `world`; `null` for anything else there, `undefined` for nothing. */
  private hitAt(world: Point): ErElement | null | undefined {
    const el = this.ctx.elementAt(world);
    if (!el) return undefined;
    return this.ctx.service(ER_MODEL).shape(el.id) ?? null;
  }

  private world(): Point {
    return this.ctx.camera.screenToWorld(this.screen);
  }
}

/** Makes the entity a child of the hierarchy, unless it's its parent or a child already. */
function childLink(edits: ErEdits, isa: ErIsaElement, entityId: string): ErConnectOutcome | null {
  if (isa.parentId === entityId || isa.children.some((c) => c.entityId === entityId)) return null;
  return {
    construct: "hierarchies",
    run: () => {
      edits.addIsaChild(isa.id, entityId);
      return isa.id;
    },
  };
}

/** Makes the entity a superclass of the union, unless it's its category or one already. */
function superclassLink(
  edits: ErEdits,
  union: ErUnionElement,
  entityId: string,
): ErConnectOutcome | null {
  if (union.categoryId === entityId || union.superclassIds.includes(entityId)) return null;
  return {
    construct: "unions",
    run: () => {
      edits.addUnionSuperclass(union.id, entityId);
      return union.id;
    },
  };
}

/**
 * What adding `entityId` to the relation would make a standard may forbid: an entity on both
 * sides (a self-relation), or a third side.
 */
function joinConstruct(relation: ErRelationElement, entityId: string): { construct?: string } {
  if (relation.participants.some((p) => p.entityId === entityId)) {
    return { construct: "self-relations" };
  }
  return relation.participants.length >= 2 ? { construct: "nary-relations" } : {};
}

/** Whether it can take part in a relation (not a type guard: a plain relation stays a relation). */
const isParticipant = (el: ErElement): boolean => isErParticipant(el);

function midpoint(a: Rect, b: Rect): Point {
  return { x: (a.x + a.w / 2 + b.x + b.w / 2) / 2, y: (a.y + a.h / 2 + b.y + b.h / 2) / 2 };
}
