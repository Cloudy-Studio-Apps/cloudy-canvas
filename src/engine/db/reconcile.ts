import type { Shape } from "../document";
import { pairByName } from "./pair-by-name";
import { buildEnum } from "./reconcile-enums";
import { checkNames, ReconcileError } from "./reconcile-error";
import { buildNote } from "./reconcile-notes";
import { applyRefs, buildTable } from "./reconcile-tables";
import type { ReconcileInput, ReconcileResult } from "./reconcile.types";

/**
 * Works out how the board's schema changes for a parsed DBML text. Tables, enums and sticky notes
 * are matched by name (then by position, for renames) so their ids, and the relations and indexes
 * that point at them, survive.
 */
export function reconcile({ schema, replaced, others }: ReconcileInput): ReconcileResult {
  try {
    checkNames(schema.tables, new Set(others.tables.map((t) => t.name)), "Table");
    checkNames(schema.enums, new Set(others.enums.map((e) => e.name)), "Enum");
    checkNames(schema.notes, new Set(others.notes.map((n) => n.noteName ?? "")), "Note");

    const added = new Set<string>();
    const track = <T extends Shape>(shape: T, existing: unknown): T => {
      if (!existing) added.add(shape.id);
      return shape;
    };

    const tablePairs = pairByName(schema.tables, replaced.tables);
    const tables = schema.tables.map((parsed, i) =>
      track(buildTable(parsed, tablePairs.get(i)), tablePairs.get(i)),
    );
    const enumPairs = pairByName(schema.enums, replaced.enums);
    const enums = schema.enums.map((parsed, i) =>
      track(buildEnum(parsed, enumPairs.get(i)), enumPairs.get(i)),
    );
    // Linked stickies are matched by their note name.
    const named = replaced.notes.map((sticky) => ({ sticky, name: sticky.noteName ?? "" }));
    const notePairs = pairByName(schema.notes, named);
    const notes = schema.notes.map((parsed, i) => {
      const existing = notePairs.get(i)?.sticky;
      return track(buildNote(parsed, existing), existing);
    });

    applyRefs(schema.refs, schema.tables, tables, others.tables);

    const shapes: Shape[] = [...tables, ...enums, ...notes];
    const kept = new Set(shapes.map((shape) => shape.id));
    const removed = [...replaced.tables, ...replaced.enums, ...replaced.notes]
      .filter((shape) => !kept.has(shape.id))
      .map((shape) => shape.id);
    return { ok: true, plan: { shapes, added, removed } };
  } catch (error) {
    if (error instanceof ReconcileError) return { ok: false, error: error.toDbmlError() };
    throw error;
  }
}
