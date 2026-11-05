import type { CanvasDocument, CanvasElement, ElementPatch } from "@canvas";

import { dataFieldsOf, hasDataFields, rewriteTemplate, rootScope } from "../bindings";
import type { DataScope } from "../bindings";
import { dataPhase } from "../model/data-phase";
import { dataSourcesIn, type DataField, type DataSourceElement } from "../source";
import { normalizePath, parsePath } from "../table";
import { readSnapshot } from "../update";
import { dataAround } from "./data-around";
import { dataScopes } from "./data-scopes";
import { fieldRenamer } from "./field-renamer";
import type { DataFieldRenamer, FieldMove } from "./field-renamer.types";
import { repeatOf } from "./repeat-fields";

/** A layer's data fields and repeat with the renamer applied in its scope, `{}` when none changed. */
function layerPatch(
  el: CanvasElement,
  scope: DataScope,
  renamer: DataFieldRenamer,
): Record<string, unknown> {
  const fields = dataFieldsOf(el);
  const patch: Record<string, unknown> = {};
  const rename = (expr: string) => renamer.expr(scope, expr);
  if (fields.dataText) {
    const next = rewriteTemplate(fields.dataText, rename);
    if (next) patch.dataText = next;
  }
  if (fields.dataBindings) {
    const bindings = { ...fields.dataBindings };
    let changed = false;
    for (const [key, binding] of Object.entries(bindings)) {
      const path = rename(binding.path);
      if (path === null) continue;
      bindings[key] = { ...binding, path };
      changed = true;
    }
    if (changed) patch.dataBindings = bindings;
  }
  if (fields.dataVisible) {
    const path = rename(fields.dataVisible.path);
    if (path !== null) patch.dataVisible = { ...fields.dataVisible, path };
  }
  const repeat = (el as unknown as Record<string, unknown>).repeat;
  if (repeat != null) {
    const next = renamer.repeat(scope, repeat, repeatOf(el)?.as);
    if (next) patch.repeat = next;
  }
  return patch;
}

/**
 * Rewrites everything that reads `source`'s fields renamed in `renames` (old path → new path,
 * as the source's `fields` have them now), each expression read in its own scope (`fieldRenamer`):
 * the `{expr}` tokens of every `dataText`, `dataBindings[*].path`, `dataVisible.path`, and each
 * iterator's `repeat.source` and row paths (`key`, `filter`, `sort`), in one `updateMany`; then
 * each module's `dataFieldRenames` hook rewrites its own (a brochure's repeats). Call it before
 * the source's record changes (it reads the sources as they are); the caller owns the undo step.
 */
export function renameFieldReferences(
  doc: CanvasDocument,
  source: DataSourceElement,
  renames: ReadonlyMap<string, string>,
): void {
  if (renames.size === 0) return;
  const moves = new Map<DataField, FieldMove>();
  // Copies of the source's fields: found by identity in any scope, they say "this source's".
  const fields = source.fields.map((field) => {
    const copy = { ...field };
    const to = renames.get(normalizePath(field.path));
    if (to === undefined) return copy;
    try {
      moves.set(copy, { length: parsePath(field.path).length, to: parsePath(to) });
    } catch {
      // A path that doesn't parse can't be read by any expression.
    }
    return copy;
  });
  if (moves.size === 0) return;
  const sources = dataSourcesIn(doc).map((s) => (s.id === source.id ? { ...s, fields } : s));
  const byId = new Map(sources.map((s) => [s.id, s]));
  const root = rootScope(sources, (id) => readSnapshot(doc, byId.get(id)?.snapshot ?? null));
  const renamer = fieldRenamer(root, moves);
  const scopes = dataScopes(doc, root, dataPhase(doc));

  const patches = new Map<string, ElementPatch>();
  for (const el of doc.all()) {
    // Only a layer that reads data is given its scope.
    if (!hasDataFields(el) && (el as unknown as Record<string, unknown>).repeat == null) continue;
    const patch = layerPatch(el, scopes.scopeFor(el), renamer);
    if (Object.keys(patch).length > 0) patches.set(el.id, patch as ElementPatch);
  }
  if (patches.size > 0) doc.updateMany(patches);
  for (const hook of dataAround().fieldRenames) hook(doc, renamer);
}
