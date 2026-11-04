import type { CanvasDocument, ElementPatch } from "@canvas";

import { dataFieldsOf } from "./binding-fields";
import { renamePath } from "./rename-path";
import { renameTemplate } from "./rename-template";

/**
 * Renames a data source in everything that names it: the `{expr}` tokens of every `dataText`,
 * `dataBindings[*].path` and `dataVisible.path`, by parsing each expression and replacing its
 * first name (never a text replace). One `updateMany`; the caller owns the undo step.
 *
 * Phase 3: a repeat's `as` name shadows sources inside it, so expressions whose first name is a
 * nearer row name must be skipped, and `repeat.source` joins the list.
 */
export function renameReferences(doc: CanvasDocument, from: string, to: string): void {
  if (from === to) return;
  const patches = new Map<string, ElementPatch>();
  for (const el of doc.all()) {
    const fields = dataFieldsOf(el);
    const patch: Record<string, unknown> = {};
    if (fields.dataText) {
      const next = renameTemplate(fields.dataText, from, to);
      if (next) patch.dataText = next;
    }
    if (fields.dataBindings) {
      const bindings = { ...fields.dataBindings };
      let changed = false;
      for (const [key, binding] of Object.entries(bindings)) {
        const path = renamePath(binding.path, from, to);
        if (path === null) continue;
        bindings[key] = { ...binding, path };
        changed = true;
      }
      if (changed) patch.dataBindings = bindings;
    }
    if (fields.dataVisible) {
      const path = renamePath(fields.dataVisible.path, from, to);
      if (path !== null) patch.dataVisible = { ...fields.dataVisible, path };
    }
    if (Object.keys(patch).length > 0) patches.set(el.id, patch as ElementPatch);
  }
  if (patches.size > 0) doc.updateMany(patches);
}
