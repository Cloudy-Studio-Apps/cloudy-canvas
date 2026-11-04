import { pathsOverlap, type CanvasDocument, type ElementKinds, type ElementPatch } from "@canvas";

import { isDesignNode } from "../../core";
import { isText } from "../../text";
import { readFieldFormat } from "../source/read-field-format";
import { dataFieldsOf } from "./binding-fields";
import type { BindDataPatch } from "./bind-data.types";
import { checkBinding, checkCondition, checkTemplate, replacedPath } from "./bind-data-checks";
import { isCatalogText } from "./is-catalog-text";
import type { DataScope } from "./scope.types";

/**
 * Binds a layer to data, the one edit the properties panel and agents share: its text's template
 * (`null` stops it, keeping the text shown now), its fields' bindings (`null` unbinds one), its
 * show condition and "hide when empty". Every path is checked first (throwing an English error
 * naming it, writing nothing); with `kinds`, binding keys must be fields the layer's kind offers
 * and the data's type must fit them (`acceptedTypes`, the Data section's table). `scope` is the
 * layer's (`scopeAt`, the repeat module's: bindings never read the iterators around a layer).
 * A field bound to data loses its variable binding: a field has one binding. One undo step; the
 * data sync then fills the layer.
 */
export function bindData(
  doc: CanvasDocument,
  id: string,
  patch: BindDataPatch,
  scope: DataScope,
  kinds?: ElementKinds,
): void {
  const el = doc.get(id);
  if (!el || !isDesignNode(el)) throw new Error(`No layer "${id}".`);
  if (patch.text && !isText(el)) throw new Error("text: only a text layer has a template.");
  if (patch.text && isCatalogText(el)) {
    throw new Error("text: this text holds a catalog template; the catalog fills it.");
  }
  if (patch.text) checkTemplate(patch.text);
  if (patch.bindings !== undefined && (typeof patch.bindings !== "object" || !patch.bindings)) {
    throw new Error("bindings must be an object of field paths.");
  }
  for (const [key, binding] of Object.entries(patch.bindings ?? {})) {
    if (binding) checkBinding(el, key, binding, scope, kinds);
  }
  if (patch.visible) checkCondition(patch.visible);
  if (patch.hideWhenEmpty !== undefined && typeof patch.hideWhenEmpty !== "boolean") {
    throw new Error("hideWhenEmpty must be true or false.");
  }

  const fields = dataFieldsOf(el);
  const out: Record<string, unknown> = {};
  const replaced: string[] = [];
  if (patch.text !== undefined) {
    out.dataText = patch.text ? { text: patch.text.text, runs: [...patch.text.runs] } : null;
    if (patch.text) replaced.push("text");
  }
  if (patch.bindings) {
    const bindings = { ...fields.dataBindings };
    for (const [key, binding] of Object.entries(patch.bindings)) {
      if (!binding) {
        delete bindings[key];
        continue;
      }
      const format = binding.format && readFieldFormat(binding.format, `bindings["${key}"]`);
      bindings[key] = { path: binding.path, ...(format ? { format } : {}) };
      replaced.push(replacedPath(key));
    }
    out.dataBindings = bindings;
  }
  if (patch.visible !== undefined) out.dataVisible = patch.visible ? { ...patch.visible } : null;
  if (patch.hideWhenEmpty !== undefined) out.dataHideEmpty = patch.hideWhenEmpty;
  // Data no longer decides whether it shows: a layer it hid comes back.
  const ruled = fields.dataVisible !== undefined || fields.dataHideEmpty === true;
  const rules =
    (patch.visible === undefined ? fields.dataVisible !== undefined : patch.visible !== null) ||
    (patch.hideWhenEmpty ?? fields.dataHideEmpty === true);
  if (ruled && !rules && !el.visible) out.visible = true;

  const variables = { ...el.bindings };
  let unbound = false;
  for (const key of Object.keys(variables)) {
    if (!replaced.some((path) => pathsOverlap(path, key))) continue;
    delete variables[key];
    unbound = true;
  }
  if (unbound) out.bindings = variables;

  if (Object.keys(out).length === 0) return;
  doc.checkpoint();
  doc.update(id, out as ElementPatch);
}
