import type { CanvasDocument, CanvasElement, ElementPatch } from "@canvas";

import { dataFieldsOf, renamePath, renameTemplate } from "../bindings";
import { descendants } from "./descendants";
import { repeatOf } from "./repeat-fields";
import { renameRepeatPaths } from "./rename-repeat-paths";
import type { RenameView } from "./rename-references.types";

/** A layer's data fields with `from` renamed to `to`, `{}` when none names it. */
function renamedFields(el: CanvasElement, from: string, to: string): Record<string, unknown> {
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
  return patch;
}

/**
 * The patches renaming a name in everything that reads it, by parsing each expression and
 * replacing its first name (never a text replace): the `{expr}` tokens of every `dataText`,
 * `dataBindings[*].path`, `dataVisible.path`, and iterators' `repeat.source` and row paths (`key`,
 * `filter`, `sort`). A nearer iterator whose row name (`as`) is `from` hides it: what's inside it
 * (and its own row paths) is left alone. `view.under` is what's looked at; with `within`, it's
 * an iterator's row name in the layers under that frame (the frame's own repeat is the caller's).
 * Reads only, through `view`, so pasted layers not yet in the document can be renamed too.
 */
export function renamedReferences(
  view: RenameView,
  from: string,
  to: string,
  within?: string,
): Map<string, ElementPatch> {
  const patches = new Map<string, ElementPatch>();
  if (from === to) return patches;
  const hidesAt = new Map<string, boolean>();
  /** Whether `id` is an iterator (other than `within`) whose row name is `from`. */
  const hides = (id: string): boolean => {
    if (id === within) return false;
    const el = view.get(id);
    return (el ? repeatOf(el)?.as : undefined) === from;
  };
  /** Whether an iterator above `id` (and below `within`) hides `from`. */
  const hidden = (id: string): boolean => {
    const chain: string[] = [];
    let result = false;
    for (let p = view.parentOf(id); p !== null && p !== within;) {
      const known = hidesAt.get(p);
      if (known !== undefined) {
        result = known;
        break;
      }
      if (chain.includes(p)) break;
      chain.push(p);
      if (hides(p)) {
        result = true;
        break;
      }
      p = view.parentOf(p);
    }
    // Every ancestor walked sees what `id` sees from it up (none of them hid it below).
    for (const p of chain) hidesAt.set(p, result);
    return result;
  };

  for (const el of view.under) {
    if (hidden(el.id)) continue;
    const patch = renamedFields(el, from, to);
    const repeat = (el as unknown as Record<string, unknown>).repeat;
    if (repeat != null) {
      const next = renameRepeatPaths(repeat, from, to, { source: true, row: !hides(el.id) });
      if (next) patch.repeat = next;
    }
    if (Object.keys(patch).length > 0) patches.set(el.id, patch as ElementPatch);
  }
  return patches;
}

/**
 * Renames a name in everything that reads it (`renamedReferences`) in the document. Without
 * `within` it renames a source across the document; with it, an iterator's row name in the
 * layers under that frame. One `updateMany`; the caller owns the undo step.
 */
export function renameReferences(
  doc: CanvasDocument,
  from: string,
  to: string,
  within?: string,
): void {
  if (from === to) return;
  const view: RenameView = {
    parentOf: (id) => {
      const parentId = doc.field(id, "parentId");
      return typeof parentId === "string" ? parentId : null;
    },
    // Only a layer holding a repeat is read whole.
    get: (id) => (doc.field(id, "repeat") == null ? undefined : doc.get(id)),
    under: within ? descendants(doc, within) : doc.all(),
  };
  const patches = renamedReferences(view, from, to, within);
  if (patches.size > 0) doc.updateMany(patches);
}
