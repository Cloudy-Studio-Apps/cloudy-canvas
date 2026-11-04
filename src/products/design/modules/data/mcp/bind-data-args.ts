import type { ToolArgs } from "@canvas";

import { isText } from "../../text";
import type { DesignNode } from "../../core";
import {
  dataFieldsOf,
  type BindDataPatch,
  type DataBinding,
  type DataCondition,
} from "../bindings";

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** A template text with the layer's style: its first run's, when one spans the whole text. */
function templateFor(el: DesignNode, text: string): NonNullable<BindDataPatch["text"]> {
  const current = dataFieldsOf(el).dataText;
  if (current && current.text === text) return { text, runs: [...current.runs] };
  const runs = current?.runs ?? (isText(el) ? el.runs : []);
  const first = runs[0];
  const whole = first && first.start === 0 && first.end >= (current?.text.length ?? 0);
  if (!whole || text.length === 0) return { text, runs: [] };
  return { text, runs: [{ start: 0, end: text.length, style: { ...first.style } }] };
}

/** The `bindings` argument: field path to `{ path, format? }`, or `null` to unbind. */
function readBindings(value: unknown): BindDataPatch["bindings"] {
  if (!isObject(value)) throw new Error('"bindings" must be an object of field paths.');
  const out: Record<string, DataBinding | null> = {};
  for (const [key, b] of Object.entries(value)) {
    if (b === null) {
      out[key] = null;
      continue;
    }
    if (!isObject(b) || typeof b.path !== "string") {
      throw new Error(`bindings["${key}"] must be { path, format? } or null.`);
    }
    out[key] = {
      path: b.path,
      ...(b.format !== undefined ? { format: b.format } : {}),
    } as DataBinding;
  }
  return out;
}

function readCondition(value: unknown): DataCondition | null {
  if (value === null) return null;
  if (!isObject(value) || typeof value.path !== "string" || typeof value.op !== "string") {
    throw new Error('"visibleWhen" must be { path, op, value? } or null.');
  }
  return value as unknown as DataCondition;
}

/** What `bind_data` was asked to change, as a `BindDataPatch` (shapes only; `bindData` checks the rest). */
export function readBindPatch(el: DesignNode, args: ToolArgs): BindDataPatch {
  const patch: BindDataPatch = {};
  if (args.text !== undefined) {
    if (args.text !== null && typeof args.text !== "string") {
      throw new Error('"text" must be a template string or null.');
    }
    patch.text = args.text === null ? null : templateFor(el, args.text);
  }
  if (args.bindings !== undefined) patch.bindings = readBindings(args.bindings);
  if (args.visibleWhen !== undefined) patch.visible = readCondition(args.visibleWhen);
  if (args.hideWhenEmpty !== undefined) {
    if (typeof args.hideWhenEmpty !== "boolean") {
      throw new Error('"hideWhenEmpty" must be true or false.');
    }
    patch.hideWhenEmpty = args.hideWhenEmpty;
  }
  return patch;
}
