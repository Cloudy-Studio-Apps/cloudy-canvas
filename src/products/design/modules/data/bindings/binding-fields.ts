import type { CanvasElement } from "@canvas";
import type { DataBinding, DataCondition, DataTemplate, NodeDataFields } from "./binding.types";

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** The data fields of a layer, read defensively (older files and other kinds have none). */
export function dataFieldsOf(el: CanvasElement): NodeDataFields {
  const raw = el as unknown as Record<string, unknown>;
  const out: NodeDataFields = {};
  const text = raw.dataText;
  if (isObject(text) && typeof text.text === "string") {
    const runs = Array.isArray(text.runs) ? (text.runs as DataTemplate["runs"]) : [];
    out.dataText = { text: text.text, runs };
  }
  const bindings = raw.dataBindings;
  if (isObject(bindings)) {
    const kept: Record<string, DataBinding> = {};
    for (const [key, b] of Object.entries(bindings)) {
      if (isObject(b) && typeof b.path === "string") kept[key] = b as unknown as DataBinding;
    }
    if (Object.keys(kept).length > 0) out.dataBindings = kept;
  }
  const visible = raw.dataVisible;
  if (isObject(visible) && typeof visible.path === "string" && typeof visible.op === "string") {
    out.dataVisible = visible as unknown as DataCondition;
  }
  if (raw.dataHideEmpty === true) out.dataHideEmpty = true;
  return out;
}

/** Whether a layer carries any data field. */
export function hasDataFields(el: CanvasElement): boolean {
  return Object.keys(dataFieldsOf(el)).length > 0;
}
