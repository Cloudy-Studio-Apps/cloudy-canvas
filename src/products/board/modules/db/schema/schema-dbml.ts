import type { CanvasDocument } from "@canvas";

import { parseDbml } from "./dbml";
import { addMissingTables } from "./add-missing-tables";
import { applyPlan } from "./apply-plan";
import { renameEnumType } from "./enum-edits";
import { reconcile } from "./reconcile";
import { EMPTY_SCHEMA, schemaShapes, splitByNames } from "./schema-shapes";
import type { DbApplyOptions, DbApplyResult } from "./db-schema.types";

/** Replaces the whole schema: shapes are updated, created (placed next to the content) or removed. */
export function applySchemaText(
  doc: CanvasDocument,
  text: string,
  options: DbApplyOptions = {},
): DbApplyResult {
  const parsed = parseDbml(text);
  if (!parsed.ok) return parsed;
  const schema = options.createMissingTables ? addMissingTables(parsed.schema, []) : parsed.schema;
  const result = reconcile({ schema, replaced: schemaShapes(doc), others: EMPTY_SCHEMA });
  if (!result.ok) return result;
  applyPlan(doc, result.plan);
  return { ok: true, warnings: schema.warnings };
}

/**
 * Merges DBML into the board: anything with the same name is updated, the rest is added. Tables
 * that refs name but nothing defines are created.
 */
export function importSchemaText(doc: CanvasDocument, text: string): DbApplyResult {
  const parsed = parseDbml(text);
  if (!parsed.ok) return parsed;
  const { picked, rest } = splitByNames(schemaShapes(doc), {
    tables: new Set(parsed.schema.tables.map((t) => t.name)),
    enums: new Set(parsed.schema.enums.map((e) => e.name)),
    notes: new Set(parsed.schema.notes.map((n) => n.name)),
  });
  const schema = addMissingTables(parsed.schema, [...picked.tables, ...rest.tables]);
  const result = reconcile({ schema, replaced: picked, others: rest });
  if (!result.ok) return result;
  applyPlan(doc, result.plan);
  return { ok: true, warnings: schema.warnings };
}

/** Replaces one table from its DBML slice, which must define exactly that table. */
export function applyTableText(
  doc: CanvasDocument,
  id: string,
  text: string,
  options: DbApplyOptions = {},
): DbApplyResult {
  const shapes = schemaShapes(doc);
  const table = shapes.tables.find((t) => t.id === id);
  if (!table) return failure("This table no longer exists");
  const parsed = parseDbml(text);
  if (!parsed.ok) return parsed;
  const { tables, enums, notes } = parsed.schema;
  if (tables.length !== 1 || enums.length > 0 || notes.length > 0) {
    return failure(
      "Write exactly one Table here. Use the Schema view to add tables, enums or notes",
    );
  }
  const others = { ...shapes, tables: shapes.tables.filter((t) => t.id !== id) };
  const schema = options.createMissingTables
    ? addMissingTables(parsed.schema, others.tables)
    : parsed.schema;
  const result = reconcile({ schema, replaced: { ...EMPTY_SCHEMA, tables: [table] }, others });
  if (!result.ok) return result;
  applyPlan(doc, result.plan);
  return { ok: true, warnings: schema.warnings };
}

/** Replaces one enum from its DBML slice. A rename also renames the type of the columns using it. */
export function applyEnumText(doc: CanvasDocument, id: string, text: string): DbApplyResult {
  const shapes = schemaShapes(doc);
  const current = shapes.enums.find((e) => e.id === id);
  if (!current) return failure("This enum no longer exists");
  const parsed = parseDbml(text);
  if (!parsed.ok) return parsed;
  const { schema } = parsed;
  if (schema.enums.length !== 1 || schema.tables.length > 0 || schema.notes.length > 0) {
    return failure(
      "Write exactly one Enum here. Use the Schema view to add tables, enums or notes",
    );
  }
  const result = reconcile({
    schema,
    replaced: { ...EMPTY_SCHEMA, enums: [current] },
    others: { ...shapes, enums: shapes.enums.filter((e) => e.id !== id) },
  });
  if (!result.ok) return result;
  const renamed = schema.enums[0]!.name;
  applyPlan(doc, result.plan, () => {
    if (renamed !== current.name) renameEnumType(doc, current.name, renamed);
  });
  return { ok: true, warnings: schema.warnings };
}

function failure(message: string): DbApplyResult {
  return { ok: false, error: { message, line: 1, column: 1 } };
}
