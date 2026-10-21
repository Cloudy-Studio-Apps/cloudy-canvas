import { isErShape, type BoardDocument, type ErShape } from "../document";
import { freeName } from "../db/table-edits";
import type { Point } from "../geometry.types";
import { Emitter } from "../utils";
import { applyErPlan } from "./apply-er-plan";
import { createErEntity } from "./create-er-shapes";
import { erShapes, placedErShapes } from "./er-shapes";
import { parseEr, serializeEr } from "./lang";
import { layoutAll } from "./layout";
import { placeAt } from "./position-layout";
import { reconcileEr } from "./reconcile-er";
import type { ErApplyOptions, ErApplyResult } from "./reconcile-er.types";
import { addMissingEntities } from "./add-missing-entities";
import { ErEdits } from "./er-edits";
import { withErMembers } from "./er-members";
import { pruneEr } from "./prune-er";
import type { ErShapes } from "./lang";

/**
 * The board's ER diagram: every entity, relation and attribute together. Reads it as text and
 * applies edited text back to the document (one undo step each); the shapes are the source of
 * truth and the text is a view of them.
 */
export class ErModel {
  /** Edits from the visual editor. */
  readonly edits: ErEdits;
  private readonly emitter = new Emitter();
  private version = 0;
  private readonly unobserve: () => void;

  constructor(private readonly doc: BoardDocument) {
    this.edits = new ErEdits(doc);
    this.unobserve = doc.observe((change) => {
      const touched =
        change.removed.size > 0 || [...change.updated].some((id) => isErShape(doc.get(id)));
      if (!touched) return;
      this.version++;
      this.emitter.emit();
    });
  }

  /** Notifies when the diagram changes (works with React's `useSyncExternalStore`). */
  subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

  getVersion = (): number => this.version;

  destroy(): void {
    this.unobserve();
    this.emitter.clear();
  }

  text = (): string => serializeEr(erShapes(this.doc));

  /** Every ER shape by kind (a fresh read; cache it per version in UI hosts). */
  shapes = (): ErShapes => erShapes(this.doc);

  shape(id: string): ErShape | undefined {
    const shape = this.doc.get(id);
    return isErShape(shape) ? shape : undefined;
  }

  /** Removes a shape and what belongs to it (its attributes; a hierarchy's discriminator…). */
  remove = (id: string): void => {
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.doc.remove(withErMembers([id], this.doc.all(), false));
      pruneEr(this.doc);
    });
  };

  /**
   * Replaces the diagram with the text's content. New shapes are placed automatically. With
   * `createMissing`, entities that relations or hierarchies name but nothing defines are created
   * (for pasted or finished text, so half-typed names don't become entities).
   */
  applyText = (text: string, options: ErApplyOptions = {}): ErApplyResult => {
    const parsed = parseEr(text);
    if (!parsed.ok) return parsed;
    const model = options.createMissing ? addMissingEntities(parsed.model) : parsed.model;
    const result = reconcileEr(model, erShapes(this.doc));
    if (!result.ok) return result;
    applyErPlan(this.doc, result.plan);
    return { ok: true, warnings: model.warnings };
  };

  /** Lays the whole diagram out again, keeping its top-left corner where it is. One undo step. */
  relayout = (): void => {
    const shapes = erShapes(this.doc);
    const all = placedErShapes(shapes);
    if (all.length === 0) return;
    const origin = {
      x: Math.min(...all.map((s) => s.x)),
      y: Math.min(...all.map((s) => s.y)),
    };
    const positions = placeAt(all, layoutAll(shapes), origin);
    const byId = new Map(all.map((s) => [s.id, s]));
    const patches = new Map(
      [...positions].filter(([id, p]) => {
        const shape = byId.get(id);
        return shape !== undefined && (shape.x !== p.x || shape.y !== p.y);
      }),
    );
    if (patches.size === 0) return;
    this.doc.checkpoint();
    this.doc.updateMany(patches);
  };

  /** Adds an entity with a free name centered on `center`; returns its id. */
  addEntity(center: Point): string {
    const name = freeName(erShapes(this.doc).entities, "entity");
    const shape = createErEntity(center, name, this.doc.nextIndex());
    this.doc.checkpoint();
    this.doc.add(shape);
    return shape.id;
  }
}
