import type { CanvasDocument, ElementPatch } from "@canvas";

import type { ErElementBase, ErNotation } from "../base/er.types";
import { addMissingEntities } from "./add-missing-entities";
import { applyErPlan } from "./apply-er-plan";
import { blockRange } from "./block-range";
import { ErEdits } from "./er-edits";
import { allErShapes, erShapes, placedErShapes } from "./er-shapes";
import { parseEr, serializeEr, serializeErBlocks, type ErShapes, type TextRange } from "./lang";
import { layoutAll } from "./layout";
import { placeAt } from "./position-layout";
import { reconcileEr } from "./reconcile-er";
import type { ErApplyOptions, ErApplyResult } from "./reconcile-er.types";

/**
 * One ER diagram of the board: its entities, relations, attributes and the rest. Reads it as text
 * and applies edited text back (one undo step each); the shapes are the source of truth and the
 * text is a view of them. Names only have to be unique within the diagram.
 */
export class ErDiagram {
  /** Edits from the visual editor. */
  readonly edits: ErEdits;

  constructor(
    private readonly doc: CanvasDocument,
    readonly id: string,
  ) {
    this.edits = new ErEdits(doc, id);
  }

  /** The diagram's shapes by kind (a fresh read; cache it per version in UI hosts). */
  shapes = (): ErShapes => erShapes(this.doc, this.id);

  text = (): string => serializeEr(this.shapes());

  /** Where the shape (or, for an attribute, its owner) is written in `text()`. */
  textRange = (shapeId: string): TextRange | null => {
    const shapes = this.shapes();
    return blockRange(serializeErBlocks(shapes), shapes.attributes, shapeId);
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
    const result = reconcileEr(model, this.shapes());
    if (!result.ok) return result;
    applyErPlan(this.doc, result.plan, {
      diagram: this.id,
      diagramName: model.name ?? "",
      notation: model.notation,
    });
    return { ok: true, warnings: model.warnings };
  };

  /** Names the diagram (as the text's `Diagram <name>` line does). One undo step. */
  rename = (name: string): void => {
    const shapes = allErShapes(this.shapes());
    const diagramName = name.trim();
    if (shapes.every((shape) => shape.diagramName === diagramName)) return;
    this.doc.checkpoint();
    const patch: ElementPatch<ErElementBase> = { diagramName };
    this.doc.updateMany(new Map(shapes.map((shape) => [shape.id, patch])));
  };

  /** Changes how the diagram is drawn (`undefined` drops a setting back to the preset's). One undo step. */
  setNotation = (patch: ErNotation): void => {
    const shapes = allErShapes(this.shapes());
    const current = shapes[0]?.notation ?? {};
    const notation: ErNotation = Object.fromEntries(
      Object.entries({ ...current, ...patch }).filter(([, value]) => value !== undefined),
    );
    if (JSON.stringify(notation) === JSON.stringify(current)) return;
    this.doc.checkpoint();
    const update: ElementPatch<ErElementBase> = { notation };
    this.doc.updateMany(new Map(shapes.map((shape) => [shape.id, update])));
  };

  /** Lays the diagram out again, keeping its top-left corner where it is. One undo step. */
  relayout = (): void => {
    const shapes = this.shapes();
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
}
