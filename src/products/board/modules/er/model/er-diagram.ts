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
import { erStandard } from "../base/er-notation";
import { erStandards } from "../base/standards";
import { checkErDiagram, type ErIssue } from "./check";
import { standardTextWarnings } from "./check/standard-text-warnings";
import { standardOf } from "./standard-of";
import { importSchemaText, schemaShapes, type DbApplyResult, formatColumnType } from "../../db";
import { erToTables, type ErTableOptions, type ErTablesResult } from "./to-tables";

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
    // What the standard forbids is applied all the same, and reported on its lines.
    const shapes = this.shapes();
    const forbidden = standardTextWarnings(text, shapes, standardOf(shapes));
    return { ok: true, warnings: [...model.warnings, ...forbidden] };
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

  /** What breaks the rules of the ER model and of the standard the diagram follows (errors first). */
  check = (): ErIssue[] => {
    const shapes = this.shapes();
    const { entities, relations, attributes } = shapes;
    const first = [...entities, ...relations, ...attributes][0];
    const issues = checkErDiagram(shapes, erStandard(first?.notation));
    const named = first?.notation.standard;
    if (first && named && !erStandards.get(named)) {
      issues.push({
        rule: "standard-missing",
        severity: "info",
        shapeId: first.id,
        message: `The standard "${named}" isn't installed; the diagram is drawn with the default.`,
      });
    }
    return issues;
  };

  /**
   * The diagram as tables (see `erToTables`), keeping the column types of tables that already
   * exist; nothing is written.
   */
  tablesPreview = (options: ErTableOptions = {}): ErTablesResult =>
    erToTables(this.shapes(), { existingType: existingColumnType(this.doc), ...options });

  /**
   * Writes the diagram's tables into the board's database schema, one undo step: tables with the
   * same names are updated, the rest added.
   */
  createTables = (options: ErTableOptions = {}): ErTablesResult & { applied: DbApplyResult } => {
    const result = this.tablesPreview(options);
    return { ...result, applied: importSchemaText(this.doc, result.dbml) };
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

/** The type a column of an existing table has, to keep it when the tables are made again. */
function existingColumnType(doc: CanvasDocument): ErTableOptions["existingType"] {
  const tables = schemaShapes(doc).tables;
  return (table, column) => {
    const found = tables.find((t) => t.name === table)?.columns.find((c) => c.name === column);
    return found ? formatColumnType(found) : undefined;
  };
}
