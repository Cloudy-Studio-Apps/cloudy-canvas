import { generateKeyBetween } from "fractional-indexing";

import { createId } from "@shared/core";

import { DEFAULT_VALUE } from "../../default-value";
import type {
  CollectionRecord,
  ModeAxisRecord,
  StyleRecord,
  TokenRecord,
  TokenScope,
  TokenValue,
  VariableRecord,
  VariableType,
} from "../../token.types";
import type { TokenReadResult } from "../exchange.types";
import { finishStyles, styleRefs } from "../finish-styles";
import type {
  DtcgFound as Found,
  DtcgObject as Raw,
  DtcgOptions,
  DtcgRefs,
  DtcgRootExtension,
  DtcgStyleExtension,
  DtcgTokenExtension,
} from "./dtcg.types";
import { DTCG_EXTENSION, readDimension, readDtcgColor, referenceOf } from "./dtcg-values";
import { readExchangeExpression } from "../read-exchange-expression";

const VARIABLE_TYPES: Record<string, VariableType> = {
  color: "color",
  number: "number",
  dimension: "number",
  duration: "number",
  fontWeight: "number",
  fontFamily: "string",
  string: "string",
  boolean: "boolean",
};

/**
 * W3C Design Tokens (DTCG) JSON as token records: each root group a collection (named after it),
 * groups as paths, `{references}` as aliases, `typography`/`shadow`… as styles through the
 * codecs. Cloudy's own extension, when there, gives back ids, modes, scopes and the exact styles.
 * What can't be read is skipped and reported in `warnings`.
 */
export function fromDtcg(json: unknown, options: DtcgOptions = {}): TokenReadResult {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("This isn't a design tokens file: its top level isn't a JSON object.");
  }
  const root = json as Raw;
  const ext = extensionOf<DtcgRootExtension>(root);
  const warnings = new Set<string>();
  const found: Found[] = [];
  walk(root, [], undefined, found);

  // Mode axes, from the extension (only Cloudy's files have them).
  const axes: ModeAxisRecord[] = [];
  let axisOrder: string | null = null;
  for (const a of ext?.axes ?? []) {
    axisOrder = generateKeyBetween(axisOrder, null);
    axes.push({
      kind: "axis",
      id: a.id,
      name: a.name,
      modes: a.modes.map((m) => ({ ...m })),
      order: axisOrder,
    });
  }

  const collections = new Map<string, CollectionRecord>();
  let collectionOrder: string | null = null;
  const collectionOf = (name: string): CollectionRecord => {
    const known = collections.get(name);
    if (known) return known;
    collectionOrder = generateKeyBetween(collectionOrder, null);
    const listed = ext?.collections.find((c) => (c.group ?? c.name) === name);
    const made: CollectionRecord = {
      kind: "collection",
      id: listed?.id ?? createId(),
      name: listed?.name ?? name,
      order: collectionOrder,
    };
    collections.set(name, made);
    return made;
  };

  // Ids first, so references resolve in any order.
  const variableTokens: { found: Found; type: VariableType; id: string }[] = [];
  const styleTokens: Found[] = [];
  const idByPath = new Map<string, string>();
  for (const item of found) {
    const own = extensionOf<DtcgTokenExtension & Partial<DtcgStyleExtension>>(item.token);
    const isStyle =
      (ext?.stylesGroup !== undefined && item.path[0] === ext.stylesGroup) ||
      // Composite types only: a color is a variable unless it's in the styles group.
      (!(item.type && item.type in VARIABLE_TYPES) &&
        options.styles?.some((c) => c.dtcgType === item.type) === true) ||
      typeof own?.styleType === "string";
    if (isStyle) {
      styleTokens.push(item);
      continue;
    }
    const type = item.type ? VARIABLE_TYPES[item.type] : undefined;
    if (!type) {
      warnings.add(
        item.type ? `${item.type} tokens were left out` : "tokens without a $type were left out",
      );
      continue;
    }
    if (item.path.length < 2) {
      warnings.add("tokens outside a group were left out");
      continue;
    }
    const id = typeof own?.id === "string" ? own.id : createId();
    idByPath.set(item.path.join("."), id);
    variableTokens.push({ found: item, type, id });
  }
  const refOf = (reference: string) => idByPath.get(reference) ?? null;

  const variables: VariableRecord[] = [];
  const orders = new Map<string, string | null>();
  for (const { found: item, type, id } of variableTokens) {
    const own = extensionOf<DtcgTokenExtension>(item.token);
    const collection = collectionOf(item.path[0] as string);
    const read = (value: unknown) => readValue(type, value, refOf, warnings);
    // Our own extension's expressions (in it, any text that reads is one: `2 * 8` too).
    const ownValue = (raw: unknown) =>
      type === "number" && typeof raw === "string" && referenceOf(raw) === null
        ? readExchangeExpression(raw, refOf)
        : null;
    const base = ownValue(own?.expr) ?? read(item.token.$value);
    if (!base) continue;
    const values: Record<string, TokenValue> = { [DEFAULT_VALUE]: base };
    const axis = own?.axis ? axes.find((a) => a.name === own.axis) : undefined;
    for (const [modeName, raw] of Object.entries(own?.modes ?? {})) {
      const mode = axis?.modes.find((m) => m.name === modeName);
      const value = ownValue(raw) ?? read(raw);
      if (mode && value) values[mode.id] = value;
    }
    const order = generateKeyBetween(orders.get(collection.id) ?? null, null);
    orders.set(collection.id, order);
    const contrastWith = (own?.contrastWith ?? []).flatMap((r) => {
      const target = refOf(referenceOf(r) ?? "");
      return target ? [target] : [];
    });
    variables.push({
      kind: "variable",
      id,
      collectionId: collection.id,
      name: typeof own?.name === "string" ? own.name : item.path.slice(1).join("/"),
      type,
      axisId: axis && Object.keys(values).length > 1 ? axis.id : null,
      values,
      scopes: own?.scopes ?? inferredScopes(item.type),
      description: typeof item.token.$description === "string" ? item.token.$description : "",
      codeSyntax: own?.codeSyntax ?? {},
      hidden: own?.hidden ?? false,
      order,
      ...(contrastWith.length > 0 ? { contrastWith } : {}),
    });
  }

  const refs = styleRefs([...collections.values(), ...variables], refOf);
  const styles: StyleRecord[] = [];
  const styleItems = [
    ...styleTokens.map((item) => ({ item, own: extensionOf<DtcgStyleExtension>(item.token) })),
    ...(ext?.styles ?? []).map((own) => ({ item: undefined, own })),
  ];
  for (const { item, own } of styleItems) {
    const style = readStyle(item, own, options, refs);
    if (style) styles.push(style);
    else warnings.add(`${item?.type ?? "unknown"} styles were left out`);
  }
  const styleOrders = new Map<string, string | null>();
  for (const style of styles) {
    const order = generateKeyBetween(styleOrders.get(style.styleType) ?? null, null);
    styleOrders.set(style.styleType, order);
    style.order = order;
  }

  const usedAxes = new Set(variables.flatMap((v) => (v.axisId ? [v.axisId] : [])));
  const records: TokenRecord[] = [
    ...axes.filter((a) => usedAxes.has(a.id) || a.modes.length > 1),
    ...collections.values(),
    ...variables,
  ];
  records.push(...finishStyles(records, styles));
  return { records, warnings: [...warnings] };
}

function walk(group: Raw, path: string[], inherited: string | undefined, out: Found[]): void {
  const type = typeof group.$type === "string" ? group.$type : inherited;
  // A token may also hold tokens (`brand` and `brand/500`), so its children are read too.
  if ("$value" in group) out.push({ path, type, token: group });
  for (const [key, child] of Object.entries(group)) {
    if (
      key.startsWith("$") ||
      typeof child !== "object" ||
      child === null ||
      Array.isArray(child)
    ) {
      continue;
    }
    walk(child as Raw, [...path, key], type, out);
  }
}

function readValue(
  type: VariableType,
  value: unknown,
  refOf: (reference: string) => string | null,
  warnings: Set<string>,
): TokenValue | null {
  const reference = referenceOf(value);
  if (reference !== null) {
    const target = refOf(reference);
    if (target) return { alias: target };
    warnings.add("references to tokens not in the file were left out");
    return null;
  }
  if (type === "number" && typeof value === "string" && value.includes("{")) {
    const expression = readExchangeExpression(value, refOf);
    if (expression) return expression;
    warnings.add("worked-out values it couldn't read were left out");
    return null;
  }
  if (type === "color") {
    const color = readDtcgColor(value);
    if (color) return { color };
  } else if (type === "number") {
    const n = readDimension(value);
    if (n !== null) return { number: n };
  } else if (type === "string") {
    const text = Array.isArray(value) ? value[0] : value;
    if (typeof text === "string") return { string: text };
  } else if (typeof value === "boolean") return { boolean: value };
  warnings.add(`${type} tokens with values it couldn't read were left out`);
  return null;
}

function readStyle(
  item: Found | undefined,
  own: DtcgStyleExtension | undefined,
  options: DtcgOptions,
  refs: DtcgRefs,
): StyleRecord | null {
  if (own && typeof own.styleType === "string" && typeof own.value === "object") {
    const bindings: Record<string, string> = {};
    for (const [path, reference] of Object.entries(own.bindings ?? {})) {
      const id = refs.id(referenceOf(reference) ?? "");
      if (id) bindings[path] = id;
    }
    return {
      kind: "style",
      id: own.id,
      styleType: own.styleType,
      name: own.name,
      value: structuredClone(own.value),
      ...(Object.keys(bindings).length > 0 ? { bindings } : {}),
      description: own.description ?? "",
      order: "a0",
    };
  }
  if (!item) return null;
  const codec = options.styles?.find((c) => c.dtcgType === item.type);
  const read = codec?.read?.(item.token.$value, refs);
  if (!codec || !read) return null;
  // Under `Styles/<group>/…` its name drops those two levels; elsewhere it keeps its path.
  const group = item.path[1] === codec.group ? 2 : 0;
  return {
    kind: "style",
    id: createId(),
    styleType: codec.styleType,
    name: item.path.slice(group).join("/") || codec.group,
    value: read.value,
    ...(Object.keys(read.bindings).length > 0 ? { bindings: read.bindings } : {}),
    description: typeof item.token.$description === "string" ? item.token.$description : "",
    order: "a0",
  };
}

function inferredScopes(type: string | undefined): TokenScope[] {
  if (type === "fontFamily") return ["font-family"];
  if (type === "fontWeight") return ["font-weight"];
  return [];
}

function extensionOf<T>(node: Raw): T | undefined {
  const all = node.$extensions;
  if (typeof all !== "object" || all === null) return undefined;
  const own = (all as Raw)[DTCG_EXTENSION];
  return typeof own === "object" && own !== null ? (own as T) : undefined;
}
