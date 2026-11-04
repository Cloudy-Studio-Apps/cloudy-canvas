import { readPath, type ElementKinds } from "@canvas";

import type { DesignNode } from "../../core";
import { readFieldFormat } from "../source/read-field-format";
import { parsePath } from "../table";
import { isImageBinding } from "./binding-values";
import type { DataBinding, DataCondition, DataTemplate } from "./binding.types";
import { CONDITION_OPS } from "./condition-ops";
import { acceptedTypes, dataBindableFields } from "./data-bindable";
import { dataTypeOf } from "./data-type-of";
import { parseTokens } from "./parse-tokens";
import type { DataScope } from "./scope.types";

// `bindData`'s checks: each throws an English error naming what's wrong, before anything is written.

const FIELD_PATH = /^[A-Za-z_]\w*(?:\.\w+)*$/;

/** The variable binding a data binding at `key` replaces: the paint's for a picture. */
export function replacedPath(key: string): string {
  return isImageBinding(key) ? key.slice(0, -".image".length) : key;
}

/** Throws unless `expr` is a data expression starting with a name (`products[0].price`). */
export function checkExpression(expr: unknown, where: string): void {
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

/** A template's text, its tokens' paths and its style runs (sorted, apart, inside the text). */
export function checkTemplate(template: DataTemplate): void {
  if (typeof template.text !== "string" || !Array.isArray(template.runs)) {
    throw new Error("text: a template needs a text and its runs.");
  }
  for (const part of parseTokens(template.text)) {
    if (part.kind === "token") checkExpression(part.expr, `text {${part.expr}}`);
  }
  let end = 0;
  template.runs.forEach((run: unknown, i) => {
    const r = run as { start?: unknown; end?: unknown; style?: unknown } | null;
    const ok =
      r !== null &&
      typeof r === "object" &&
      Number.isInteger(r.start) &&
      Number.isInteger(r.end) &&
      (r.start as number) >= end &&
      (r.start as number) < (r.end as number) &&
      (r.end as number) <= template.text.length &&
      typeof r.style === "object" &&
      r.style !== null;
    if (!ok) {
      throw new Error(
        `text.runs[${i}]: a run is { start, end, style } inside the text, sorted and apart.`,
      );
    }
    end = r.end as number;
  });
}

/** The type of the layer's field at `key` as the kind offers it, `undefined` when it doesn't. */
function offeredType(el: DesignNode, key: string, kinds: ElementKinds): string | undefined {
  if (isImageBinding(key)) {
    return dataBindableFields(el, kinds).some((field) => field.path === key) ? "image" : undefined;
  }
  return kinds
    .kindOf(el)
    .bindable(el)
    .find((field) => field.path === key && field.type !== "style")?.type;
}

/**
 * One binding: its key a layer field (a picture's paint there), its format's shape, its path a
 * data expression; with `kinds` the key a field the kind offers and the data's type one that fits.
 */
export function checkBinding(
  el: DesignNode,
  key: string,
  binding: DataBinding,
  scope: DataScope,
  kinds?: ElementKinds,
): void {
  const where = `bindings["${key}"]`;
  if (!FIELD_PATH.test(key)) throw new Error(`bindings: "${key}" isn't a layer field.`);
  if (isImageBinding(key)) {
    const paint: unknown = readPath(el, replacedPath(key));
    if (typeof paint !== "object" || paint === null) {
      throw new Error(`bindings: this layer has no paint at "${replacedPath(key)}".`);
    }
  }
  checkExpression(binding.path, where);
  if (binding.format !== undefined) readFieldFormat(binding.format, where);
  if (!kinds) return;
  const type = offeredType(el, key, kinds);
  if (type === undefined)
    throw new Error(`bindings: this layer has no field "${key}" data can fill.`);
  const accepts = acceptedTypes(type, key);
  const dataType = dataTypeOf(scope, binding.path);
  if (accepts && dataType && !accepts.includes(dataType)) {
    throw new Error(
      `${where}: "${binding.path}" is ${dataType}; this field takes ${accepts.join(", ")}.`,
    );
  }
}

/** A show condition: its path, a known op and a text or number value. */
export function checkCondition(condition: DataCondition): void {
  checkExpression(condition.path, "visible");
  if (!CONDITION_OPS.includes(condition.op)) {
    throw new Error(`visible: "${String(condition.op)}" isn't a condition (${CONDITION_OPS}).`);
  }
  const value: unknown = condition.value;
  if (value !== undefined && typeof value !== "string" && typeof value !== "number") {
    throw new Error("visible: the value must be a text or a number.");
  }
}
