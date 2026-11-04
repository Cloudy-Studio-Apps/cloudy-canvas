import type { DesignNode } from "../../core";
import { alignedTextPatch, isText } from "../../text";
import { dataFieldsOf } from "./binding-fields";
import { bindingWrite, isImageBinding, writePatch } from "./binding-values";
import { evaluateCondition } from "./evaluate-condition";
import { readValue } from "./read-value";
import { resolveDataText } from "./resolve-data-text";
import { sameValue } from "./same-value";
import { readsUnreadable } from "./unreadable";
import type { BindingContext, PlannedBindings } from "./plan-bindings.types";
import type { DataScope } from "./scope.types";

/**
 * What a layer's data fields make of it in `scope`: its text from `dataText` (laid out again, an
 * auto-width text keeping its aligned edge), each `dataBindings` entry written the way its kind
 * writes a variable's value (`bindPatch`), `visible` from `dataVisible`, and with
 * `dataHideEmpty` hidden while its template came out empty or its image value is empty. Only the
 * fields that differ from the layer's (`sameValue`) are in the patch, so a sync that changes
 * nothing writes nothing. A part reading a source whose data can't be read here (`unreadable`)
 * is left as it is, never blanked.
 */
export function planBindings(
  el: DesignNode,
  scope: DataScope,
  ctx: BindingContext,
): PlannedBindings {
  const fields = dataFieldsOf(el);
  const missing = new Set<string>();
  const unreadable = new Set<string>();
  // Whether a text or picture couldn't be read: then nothing says the layer is empty.
  let unknownEmpty = false;
  let current: DesignNode = el;
  // Whether what the layer shows came out empty; `null` when it shows nothing from data.
  let empty: boolean | null = null;

  if (fields.dataText && isText(el)) {
    const resolved = resolveDataText(fields.dataText, scope, ctx.locale);
    if (resolved) {
      for (const expr of resolved.missing) missing.add(expr);
      empty = resolved.empty;
      current = { ...current, ...alignedTextPatch(el, resolved.text, resolved.runs) };
    } else {
      unreadable.add("text");
      unknownEmpty = true;
    }
  }

  for (const [path, binding] of Object.entries(fields.dataBindings ?? {})) {
    if (readsUnreadable(scope, binding.path)) {
      unreadable.add(binding.path);
      if (isImageBinding(path)) unknownEmpty = true;
      continue;
    }
    const found = readValue(scope, binding.path);
    if (!found) missing.add(binding.path);
    const write = bindingWrite(current, path, binding, found, ctx);
    // An empty image hides the layer; a filled one doesn't clear an empty text.
    if (write.emptyImage) empty = true;
    else if (isImageBinding(path) && empty === null) empty = false;
    const patch = writePatch(current, path, write, ctx);
    if (patch) current = { ...current, ...patch } as DesignNode;
  }

  const want = { ...current } as Record<string, unknown>;
  const condition = fields.dataVisible;
  const conditionUnreadable = !!condition && readsUnreadable(scope, condition.path);
  if (condition && conditionUnreadable) unreadable.add(condition.path);
  else if (condition && !readValue(scope, condition.path)) missing.add(condition.path);
  const hideEmpty = fields.dataHideEmpty === true && empty !== null && !unknownEmpty;
  if (!conditionUnreadable && (condition || hideEmpty)) {
    const shown = condition ? evaluateCondition(condition, scope) : true;
    want.visible = shown && !(hideEmpty && empty === true);
  }

  const original = el as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(want)) {
    if (key !== "id" && key !== "type" && !sameValue(original[key], value)) patch[key] = value;
  }
  return {
    patch: Object.keys(patch).length > 0 ? (patch as Partial<DesignNode>) : null,
    missing: [...missing],
    unreadable: [...unreadable],
  };
}
