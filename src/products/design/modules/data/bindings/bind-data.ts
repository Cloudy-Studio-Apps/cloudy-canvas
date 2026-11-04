import {
  pathsOverlap,
  readPath,
  type CanvasDocument,
  type ElementKinds,
  type ElementPatch,
} from "@canvas";

import { isDesignNode, type DesignNode } from "../../core";
import { isText } from "../../text";
import { parsePath } from "../table";
import { isImageBinding } from "./binding-values";
import { dataFieldsOf } from "./binding-fields";
import type { DataBinding, DataCondition, DataTemplate } from "./binding.types";
import type { BindDataPatch } from "./bind-data.types";
import { CONDITION_OPS } from "./condition-ops";
import { dataBindableFields } from "./data-bindable";
import { parseTokens } from "./parse-tokens";

const FIELD_PATH = /^[A-Za-z_]\w*(?:\.\w+)*$/;

/** Throws unless `expr` is a data expression starting with a name (`products[0].price`). */
function checkExpression(expr: unknown, where: string): void {
  if (typeof expr !== "string" || !expr) throw new Error(`${where}: the data path is empty.`);
  let first;
  try {
    first = parsePath(expr)[0];
  } catch {
    throw new Error(`${where}: "${expr}" isn't a data path.`);
  }
  if (!first || !("key" in first)) {
    throw new Error(`${where}: "${expr}" must start with a source's name.`);
  }
}

function checkTemplate(template: DataTemplate): void {
  if (typeof template.text !== "string" || !Array.isArray(template.runs)) {
    throw new Error("text: a template needs a text and its runs.");
  }
  for (const part of parseTokens(template.text)) {
    if (part.kind === "token") checkExpression(part.expr, `text {${part.expr}}`);
  }
}

function checkBinding(el: DesignNode, key: string, binding: DataBinding, kinds?: ElementKinds) {
  if (!FIELD_PATH.test(key)) throw new Error(`bindings: "${key}" isn't a layer field.`);
  if (isImageBinding(key)) {
    const paint: unknown = readPath(el, replacedPath(key));
    if (typeof paint !== "object" || paint === null) {
      throw new Error(`bindings: this layer has no paint at "${replacedPath(key)}".`);
    }
  }
  if (kinds) {
    const offered =
      dataBindableFields(el, kinds).some((field) => field.path === key) ||
      kinds
        .kindOf(el)
        .bindable(el)
        .some((field) => field.path === key && field.type !== "style");
    if (!offered) throw new Error(`bindings: this layer has no field "${key}" data can fill.`);
  }
  checkExpression(binding.path, `bindings["${key}"]`);
}

function checkCondition(condition: DataCondition): void {
  checkExpression(condition.path, "visible");
  if (!CONDITION_OPS.includes(condition.op)) {
    throw new Error(`visible: "${String(condition.op)}" isn't a condition (${CONDITION_OPS}).`);
  }
  const value: unknown = condition.value;
  if (value !== undefined && typeof value !== "string" && typeof value !== "number") {
    throw new Error("visible: the value must be a text or a number.");
  }
}

/** The variable binding a data binding at `key` replaces: the paint's for a picture. */
function replacedPath(key: string): string {
  return isImageBinding(key) ? key.slice(0, -".image".length) : key;
}

/**
 * Binds a layer to data, the one edit the properties panel and agents share: its text's template
 * (`null` stops it, keeping the text shown now), its fields' bindings (`null` unbinds one), its
 * show condition and "hide when empty". Every path is checked first (throwing an English error
 * naming it, writing nothing); with `kinds`, binding keys must be fields the layer's kind offers.
 * A field bound to data loses its variable binding: a field has one binding. One undo step; the
 * data sync then fills the layer.
 */
export function bindData(
  doc: CanvasDocument,
  id: string,
  patch: BindDataPatch,
  kinds?: ElementKinds,
): void {
  const el = doc.get(id);
  if (!el || !isDesignNode(el)) throw new Error(`No layer "${id}".`);
  if (patch.text && !isText(el)) throw new Error("text: only a text layer has a template.");
  if (patch.text) checkTemplate(patch.text);
  for (const [key, binding] of Object.entries(patch.bindings ?? {})) {
    if (binding) checkBinding(el, key, binding, kinds);
  }
  if (patch.visible) checkCondition(patch.visible);

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
      bindings[key] = { path: binding.path, ...(binding.format ? { format: binding.format } : {}) };
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
