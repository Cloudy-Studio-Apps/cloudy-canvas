import { pathRoot, readPath } from "@canvas";

import type { DesignNode } from "../../core";
import {
  bindingWrite,
  dataFieldsOf,
  readValue,
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
