import { setPathsPatch } from "@canvas";

import type { DesignNode } from "../../core";
import { alignedTextPatch, isText } from "../../text";
import { dataFieldsOf } from "./binding-fields";
import { bindingWrite } from "./binding-values";
import { evaluateCondition } from "./evaluate-condition";
import { formatValue } from "./format-value";
import { resolveRichTemplate } from "./resolve-template";
import { lookup } from "./scope";
import type { BindingContext, PlannedBindings } from "./plan-bindings.types";
import type { DataScope, LookupResult } from "./scope.types";

/** A paint's picture (`fills.<i>.image`). */
const IMAGE_BINDING = /\.image$/;

function same(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/** What an expression reads, `null` when nothing is there (no such name, or no such field). */
function read(scope: DataScope, expr: string): LookupResult | null {
  const found = lookup(scope, expr);
  return found && found.value !== undefined ? found : null;
}

/**
 * What a layer's data fields make of it in `scope`: its text from `dataText` (laid out again, an
 * auto-width text keeping its aligned edge), each `dataBindings` entry in its field, `visible`
 * from `dataVisible`, and with `dataHideEmpty` hidden while its template came out empty or its
 * image value is empty. Only the fields that differ from the layer's are in the patch, so a
 * sync that changes nothing writes nothing.
 */
export function planBindings(
  el: DesignNode,
  scope: DataScope,
  ctx: BindingContext,
): PlannedBindings {
  const fields = dataFieldsOf(el);
  const missing = new Set<string>();
  let want: Record<string, unknown> = {};
  // Whether what the layer shows came out empty; `null` when it shows nothing from data.
  let empty: boolean | null = null;

  if (fields.dataText && isText(el)) {
    const resolved = resolveRichTemplate(fields.dataText, (expr) => {
      const found = read(scope, expr);
      return found ? formatValue(found.value, found.field, undefined, ctx.locale) : null;
    });
    for (const expr of resolved.missing) missing.add(expr);
    empty = resolved.empty;
    want = { ...alignedTextPatch(el, resolved.text, resolved.runs) };
  }

  for (const [path, binding] of Object.entries(fields.dataBindings ?? {})) {
    const found = read(scope, binding.path);
    const isImage = IMAGE_BINDING.test(path);
    if (!found) {
      missing.add(binding.path);
      // A field that reads nothing keeps its value; an image then counts as empty.
      if (!isImage) continue;
    }
    const write = bindingWrite(
      { ...el, ...want } as DesignNode,
      path,
      binding,
      found ?? { value: undefined, field: null },
      ctx,
    );
    if (write.emptyImage) empty = true;
    else if (isImage && empty === null) empty = false;
    if (!write.values) continue;
    const patch = setPathsPatch({ ...el, ...want }, write.values);
    if (patch) want = { ...want, ...patch };
  }

  const condition = fields.dataVisible;
  if (condition && lookup(scope, condition.path) === null) missing.add(condition.path);
  const hideEmpty = fields.dataHideEmpty === true && empty !== null;
  if (condition || hideEmpty) {
    const shown = condition ? evaluateCondition(condition, scope) : true;
    want.visible = shown && !(hideEmpty && empty === true);
  }

  const current = el as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(want)) {
    if (!same(current[key], value)) patch[key] = value;
  }
  return {
    patch: Object.keys(patch).length > 0 ? (patch as Partial<DesignNode>) : null,
    missing: [...missing],
  };
}
