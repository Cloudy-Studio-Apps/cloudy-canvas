import {
  DOCUMENT_TOKENS,
  pickedBindings,
  requireVariable,
  resolveStyle,
  type StyleRecord,
  type TokenStore,
  type ToolArgs,
} from "@canvas";

import {
  EFFECT_STYLE,
  effectBindingsOf,
  effectStyleOfNode,
  effectStyleSummary,
  isDesignNode,
  PAINT_STYLE,
  paintBindingsOf,
  paintStyleOfNode,
  paintStyleSummary,
  readNodeEffects,
  readPaints,
  readStrokeStyle,
  STROKE_STYLE,
  strokeBindingsOf,
  strokeStyleOfNode,
  strokeStyleSummary,
} from "../../core";
import type { DesignWorkspace } from "../../../design-engine.types";
import {
  readTextStyle,
  TEXT_DEFAULTS,
  TEXT_STYLE,
  textStyleOfNode,
  textStyleSummary,
  isText,
} from "../../text";

/** The style types agents name, as `type`. */
export const STYLE_TYPES = [TEXT_STYLE, PAINT_STYLE, EFFECT_STYLE, STROKE_STYLE] as const;

const STROKE_FIELDS = [
  "strokeWeight",
  "strokeWeights",
  "strokeAlign",
  "strokeCap",
  "strokeJoin",
  "strokeMiterAngle",
  "strokeDashes",
];

/** What each style type's `value` holds, for the tools' schemas and descriptions. */
export const STYLE_VALUE_HELP =
  'text: { fontFamily, fontSize, fontWeight ("100"…"900"), fontStyle, lineHeight (a multiple), ' +
  "letterSpacing, textDecoration }; paint: { paints: [paints as in create_nodes' fills] }; " +
  "effect: { effects: [effects as in create_nodes] }; stroke: { strokeWeight, strokeWeights?, " +
  "strokeAlign, strokeCap, strokeJoin, strokeMiterAngle, strokeDashes }.";

/** A style by id or a name unique among styles; throws when unknown. */
export function requireStyle(store: TokenStore, ref: string): StyleRecord {
  const style = store.findStyle(ref);
  if (!style) throw new Error(`No style "${ref}". Call list_styles for the names and ids.`);
  return style;
}

/** The fields of `raw` an agent named that the reader dropped (they were invalid). */
function checkFields(type: string, given: Record<string, unknown>, valid: object): void {
  const bad = Object.keys(given).filter((key) => !(key in valid));
  if (bad.length > 0) throw new Error(`Invalid ${type} style fields: ${bad.join(", ")}.`);
}

/** A style value an agent gave for `type`, checked (paints and effects with the node readers). */
export function readStyleValue(type: string, raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(`"value" is an object. ${STYLE_VALUE_HELP}`);
  }
  const given = raw as Record<string, unknown>;
  if (type === TEXT_STYLE) {
    const valid = readTextStyle(given);
    checkFields(type, given, valid);
    return { ...valid };
  }
  if (type === PAINT_STYLE) return { paints: readPaints(given.paints, "value.paints", true) };
  if (type === EFFECT_STYLE) return { effects: readNodeEffects(given.effects, "value.effects") };
  const stroke = Object.fromEntries(
    STROKE_FIELDS.filter((k) => k in given).map((k) => [k, given[k]]),
  );
  const valid = readStrokeStyle(stroke);
  checkFields(type, stroke, valid);
  return { ...valid };
}

/** A new style's value: the layer's look (`fromNode`), else defaults, with `value` over it. */
export function newStyleValue(
  engine: DesignWorkspace,
  type: string,
  item: ToolArgs,
): Record<string, unknown> {
  const from = typeof item.fromNode === "string" ? engine.getElement(item.fromNode) : undefined;
  if (item.fromNode !== undefined && (!from || !isDesignNode(from))) {
    throw new Error(`No layer "${String(item.fromNode)}" to take the style from.`);
  }
  const node = from && isDesignNode(from) ? from : undefined;
  let base: Record<string, unknown>;
  if (type === TEXT_STYLE) {
    base =
      node && isText(node)
        ? { ...textStyleOfNode(node) }
        : { ...TEXT_DEFAULTS.typography, textDecoration: "none" };
  } else if (type === PAINT_STYLE)
    base = node ? { ...paintStyleOfNode(node, "fills") } : { paints: [] };
  else if (type === EFFECT_STYLE) base = node ? { ...effectStyleOfNode(node) } : { effects: [] };
  else base = node ? { ...strokeStyleOfNode(node) } : { strokeWeight: 1, strokeWeights: null };
  return item.value === undefined ? base : { ...base, ...readStyleValue(type, item.value) };
}

/** The variables a `fromNode` layer uses for what the style takes from it (none without one). */
export function fromNodeBindings(
  engine: DesignWorkspace,
  type: string,
  item: ToolArgs,
): Record<string, string> | undefined {
  const node = typeof item.fromNode === "string" ? engine.getElement(item.fromNode) : undefined;
  if (!node || !isDesignNode(node)) return undefined;
  if (type === PAINT_STYLE) return paintBindingsOf(node, "fills");
  if (type === EFFECT_STYLE) return effectBindingsOf(node);
  if (type === STROKE_STYLE) return strokeBindingsOf(node);
  return pickedBindings(node.bindings, ["fontSize", "lineHeight", "letterSpacing", "fontFamily"]);
}

/** A style type an agent named; throws otherwise. */
export function readStyleType(raw: unknown): string {
  if (typeof raw === "string" && (STYLE_TYPES as readonly string[]).includes(raw)) return raw;
  throw new Error(`"type" is one of: ${STYLE_TYPES.join(", ")}.`);
}

/** `{ path: variable ref | null }` → variable ids by path (null unlinks). */
export function readStyleBindings(store: TokenStore, raw: unknown): Map<string, string | null> {
  const out = new Map<string, string | null>();
  if (raw === undefined) return out;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error('"bindings" maps paths in the value ("paints.0.color") to variables.');
  }
  for (const [path, ref] of Object.entries(raw)) {
    if (ref === null) out.set(path, null);
    else if (typeof ref === "string") out.set(path, requireVariable(store, ref).id);
    else throw new Error(`"bindings.${path}" is a variable's id or name, or null.`);
  }
  return out;
}

const SUMMARIES: Readonly<Record<string, (style: StyleRecord) => string>> = {
  [TEXT_STYLE]: textStyleSummary,
  [PAINT_STYLE]: paintStyleSummary,
  [EFFECT_STYLE]: effectStyleSummary,
  [STROKE_STYLE]: strokeStyleSummary,
};

/** A style as agents read it: its value, summary, the variables it uses and its usage. */
export function describeStyle(engine: DesignWorkspace, style: StyleRecord) {
  const tokens = engine.service(DOCUMENT_TOKENS);
  const store = tokens.store();
  // Its value with its variables' current values (the stored one keeps those from binding).
  const shown = { ...style, value: resolveStyle(store, style, {}) };
  const bindings = Object.entries(style.bindings ?? {}).map(([path, id]) => {
    const variable = store.variable(id);
    const collection = variable && store.collection(variable.collectionId);
    return [path, variable && collection ? `${collection.name}/${variable.name}` : id];
  });
  return {
    id: style.id,
    type: style.styleType,
    name: style.name,
    summary: SUMMARIES[style.styleType]?.(shown),
    value: shown.value,
    ...(bindings.length > 0 ? { bindings: Object.fromEntries(bindings) } : {}),
    ...(style.description ? { description: style.description } : {}),
    usedBy: tokens.usage(style.id).length,
  };
}
