import { pathRoot, pathsOverlap, readPath } from "@canvas";

import type { DesignNode } from "../../core";
import {
  bindingWrite,
  dataFieldsOf,
  readValue,
  replacedPath,
  sameValue,
  writtenFields,
  type BindingContext,
  type DataBinding,
  type DataScope,
} from "../bindings";

type Before = Readonly<Record<string, unknown>>;

/**
 * The bindings a hand edit unlinks, as variables do (`syncTokens`' detach rule): a bound field the
 * edit wrote with anything but what its data gives (a drag, the color picker, an agent) keeps
 * what was written and loses its binding. The sync's own writes hold the data's value, so they
 * never unlink. Returns the `dataBindings` patch, `null` when every binding stays.
 */
export function droppedBindings(
  el: DesignNode,
  before: Before,
  scope: DataScope,
  ctx: BindingContext,
): Record<string, unknown> | null {
  const bindings = dataFieldsOf(el).dataBindings;
  if (!bindings) return null;
  const kept: Record<string, DataBinding> = {};
  let dropped = false;
  for (const [path, binding] of Object.entries(bindings)) {
    kept[path] = binding;
    const write = bindingWrite(el, path, binding, readValue(scope, binding.path), ctx);
    const expected = writtenFields(el, path, write, ctx);
    if (!expected) continue;
    if (!Object.keys(expected).some((leaf) => pathRoot(leaf) in before)) continue;
    const holds = Object.entries(expected).every(([leaf, v]) => sameValue(readPath(el, leaf), v));
    if (holds) continue;
    delete kept[path];
    dropped = true;
  }
  return dropped ? { dataBindings: kept } : null;
}

/**
 * The show rules a hand edit of `visible` drops (the eye in the layers panel): when the edit
 * wrote `visible` and the data would set it back, `dataVisible` and `dataHideEmpty` go and the
 * layer keeps what was chosen. `null` when they stay.
 */
export function droppedVisibility(
  el: DesignNode,
  before: Before,
  planned: Readonly<Record<string, unknown>> | null,
): Record<string, unknown> | null {
  if (!("visible" in before) || !planned || !("visible" in planned)) return null;
  const fields = dataFieldsOf(el);
  if (!fields.dataVisible && !fields.dataHideEmpty) return null;
  return {
    ...(fields.dataVisible ? { dataVisible: null } : {}),
    ...(fields.dataHideEmpty ? { dataHideEmpty: false } : {}),
  };
}

/**
 * The data bindings a variable bound in this edit replaces: one field has one binding, from
 * either side (`bindData` drops a field's variable binding the same way). A variable newly at a
 * path overlapping a `dataBindings` key (`pathsOverlap`; a picture's paint for an image key)
 * drops that key, and one at `text` drops the text's template, which keeps what it shows.
 * `null` when the edit bound no variable over data.
 */
export function replacedByVariables(
  el: DesignNode,
  before: Before,
): Record<string, unknown> | null {
  if (!("bindings" in before)) return null;
  const was = (before.bindings ?? {}) as Readonly<Record<string, string>>;
  const now = el.bindings ?? {};
  const fresh = Object.keys(now).filter((path) => was[path] !== now[path]);
  if (fresh.length === 0) return null;
  const fields = dataFieldsOf(el);
  const out: Record<string, unknown> = {};
  if (fields.dataBindings) {
    const kept = { ...fields.dataBindings };
    let dropped = false;
    for (const key of Object.keys(kept)) {
      if (!fresh.some((path) => pathsOverlap(path, replacedPath(key)))) continue;
      delete kept[key];
      dropped = true;
    }
    if (dropped) out.dataBindings = kept;
  }
  if (fields.dataText && fresh.some((path) => pathsOverlap(path, "text"))) out.dataText = null;
  return Object.keys(out).length > 0 ? out : null;
}
