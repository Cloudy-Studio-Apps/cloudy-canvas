import { generateKeyBetween } from "fractional-indexing";

import { createId } from "@shared/core";

import { DEFAULT_VALUE } from "../../default-value";
import type {
  CollectionRecord,
  ModeAxisRecord,
  StyleRecord,
  TokenRecord,
  TokenValue,
  VariableRecord,
} from "../../token.types";
import type { DtcgObject as Raw, DtcgOptions } from "../dtcg/dtcg.types";
import type { TokenReadResult } from "../exchange.types";
import { finishStyles, styleRefs } from "../finish-styles";
import { isExpression, STUDIO_TYPES, studioReference, studioValue } from "./studio-values";
import type { StudioSlot as Slot, StudioTheme, StudioToken } from "./tokens-studio.types";

/** Composite types and the DTCG types their codecs read (fields mapped first). */
const COMPOSITES: Record<string, string> = { typography: "typography", boxShadow: "shadow" };

/** Whether JSON looks like a Tokens Studio file (themes, metadata, or `value`/`type` tokens). */
export function isTokensStudio(json: unknown): boolean {
  if (typeof json !== "object" || json === null) return false;
  const root = json as Raw;
  if ("$themes" in root || "$metadata" in root) return true;
  let studio = false;
  const visit = (node: unknown, depth: number): void => {
    if (studio || depth > 6 || typeof node !== "object" || node === null) return;
    const raw = node as Raw;
    if ("$value" in raw) return;
    if ("value" in raw && typeof raw.type === "string") studio = true;
    else
      for (const [key, child] of Object.entries(raw))
        if (!key.startsWith("$")) visit(child, depth + 1);
  };
  visit(root, 0);
  return studio;
}

/**
 * A Tokens Studio file as token records. Each token set is a collection. With themes, each theme
 * group (or "Theme") is an axis whose modes are its themes: a token defined in sets some of its
 * themes turn on and others don't becomes one variable of a collection named after the group,
 * varying by it; sets every theme turns on stay collections. Aliases (`{path}`) find the token
 * across sets; worked-out values (`{space} * 2`) are left for later, reported in `warnings`.
 */
export function fromTokensStudio(json: unknown, options: DtcgOptions = {}): TokenReadResult {
  if (typeof json !== "object" || json === null)
    throw new Error("This isn't a Tokens Studio file.");
  const root = json as Raw;
  const warnings = new Set<string>();
  const order = setOrder(root);
  const tokens: StudioToken[] = [];
  for (const set of order) walk(root[set], set, [], undefined, tokens);
  const themes = Array.isArray(root.$themes) ? (root.$themes as StudioTheme[]) : [];

  // Axes from the theme groups, and which sets each makes vary.
  const axes: ModeAxisRecord[] = [];
  const themedSets = new Map<string, ModeAxisRecord>();
  const groups = new Map<string, StudioTheme[]>();
  for (const theme of themes) {
    const group = theme.group || "Theme";
    groups.set(group, [...(groups.get(group) ?? []), theme]);
  }
  let axisOrder: string | null = null;
  const modeOf = new Map<StudioTheme, string>();
  for (const [name, members] of groups) {
    if (members.length < 2) continue;
    axisOrder = generateKeyBetween(axisOrder, null);
    const axis: ModeAxisRecord = {
      kind: "axis",
      id: createId(),
      name,
      modes: [],
      order: axisOrder,
    };
    for (const theme of members) {
      const id = createId();
      axis.modes.push({ id, name: theme.name });
      modeOf.set(theme, id);
    }
    axes.push(axis);
    for (const set of order) {
      const on = members.filter((t) => t.selectedTokenSets?.[set] === "enabled").length;
      if (on > 0 && on < members.length && !themedSets.has(set)) themedSets.set(set, axis);
    }
  }

  // Collections, and the variable each (collection, path) becomes.
  const collections = new Map<string, CollectionRecord>();
  let collectionOrder: string | null = null;
  const collectionNamed = (name: string) => {
    let c = collections.get(name);
    if (!c) {
      collectionOrder = generateKeyBetween(collectionOrder, null);
      c = { kind: "collection", id: createId(), name, order: collectionOrder };
      collections.set(name, c);
    }
    return c;
  };
  const slots = new Map<string, Slot>();
  const byPath = new Map<string, Slot>();
  const styleTokens: StudioToken[] = [];
  for (const token of tokens) {
    if (token.type in COMPOSITES) {
      styleTokens.push(token);
      continue;
    }
    if (!STUDIO_TYPES[token.type]) {
      warnings.add(`${token.type} tokens were left out`);
      continue;
    }
    const axis = themedSets.get(token.set);
    const collection = collectionNamed(axis ? axis.name : token.set);
    const key = `${collection.id}:${token.path.join("/")}`;
    const slot = slots.get(key) ?? { collection, axis, tokens: [] };
    slot.tokens.push(token);
    slots.set(key, slot);
    const dotted = token.path.join(".");
    // A themed token wins over a plain one of the same path; otherwise the first set in order.
    if (!byPath.has(dotted) || axis) byPath.set(dotted, slot);
  }
  const ids = new Map<Slot, string>([...slots.values()].map((s) => [s, createId()]));
  const refOf = (reference: string) => {
    const slot = byPath.get(reference);
    return slot ? (ids.get(slot) ?? null) : null;
  };
  const read = (token: StudioToken): TokenValue | null => {
    const reference = studioReference(token.value);
    if (reference !== null) {
      const target = refOf(reference);
      if (!target) warnings.add("references to tokens not in the file were left out");
      return target ? { alias: target } : null;
    }
    if (isExpression(token.value)) {
      warnings.add("worked-out values (math, rgba of a reference) were left out");
      return null;
    }
    const value = studioValue(token.type, token.value);
    if (!value) warnings.add(`${token.type} values it couldn't read were left out`);
    return value;
  };

  const variables: VariableRecord[] = [];
  const orders = new Map<string, string | null>();
  for (const [slot, id] of ids) {
    const first = slot.tokens[0] as StudioToken;
    const values: Record<string, TokenValue> = {};
    if (slot.axis) {
      const members = groups.get(slot.axis.name) ?? [];
      members.forEach((theme, i) => {
        // The last set in order this theme turns on that defines it.
        const token = [...slot.tokens]
          .reverse()
          .find((t) => theme.selectedTokenSets?.[t.set] === "enabled");
        const value = token && read(token);
        const mode = modeOf.get(theme);
        if (value && mode) values[i === 0 ? DEFAULT_VALUE : mode] = value;
      });
    } else {
      const value = read(first);
      if (value) values[DEFAULT_VALUE] = value;
    }
    if (!(DEFAULT_VALUE in values)) continue;
    const studioType = STUDIO_TYPES[first.type];
    if (!studioType) continue;
    const order = generateKeyBetween(orders.get(slot.collection.id) ?? null, null);
    orders.set(slot.collection.id, order);
    variables.push({
      kind: "variable",
      id,
      collectionId: slot.collection.id,
      name: first.path.join("/"),
      type: studioType.type,
      axisId: slot.axis && Object.keys(values).length > 1 ? slot.axis.id : null,
      values,
      scopes: [...studioType.scopes],
      description: first.description,
      codeSyntax: {},
      hidden: false,
      order,
    });
  }

  const refs = styleRefs([...collections.values(), ...variables], refOf);
  const styles: StyleRecord[] = [];
  const styleOrders = new Map<string, string | null>();
  for (const token of styleTokens) {
    const codec = options.styles?.find((c) => c.dtcgType === COMPOSITES[token.type]);
    const value = token.type === "boxShadow" ? shadowFields(token.value) : token.value;
    const read = codec?.read?.(value, refs);
    if (!codec || !read) {
      warnings.add(`${token.type} tokens were left out`);
      continue;
    }
    const styleOrder = generateKeyBetween(styleOrders.get(codec.styleType) ?? null, null);
    styleOrders.set(codec.styleType, styleOrder);
    styles.push({
      kind: "style",
      id: createId(),
      styleType: codec.styleType,
      name: token.path.join("/"),
      value: read.value,
      ...(Object.keys(read.bindings).length > 0 ? { bindings: read.bindings } : {}),
      description: token.description,
      order: styleOrder,
    });
  }

  const records: TokenRecord[] = [...axes, ...collections.values(), ...variables];
  records.push(...finishStyles(records, styles));
  return { records, warnings: [...warnings] };
}

/** The sets in order: `$metadata.tokenSetOrder`, then any other top-level groups. */
function setOrder(root: Raw): string[] {
  const listed = (root.$metadata as { tokenSetOrder?: unknown } | undefined)?.tokenSetOrder;
  const named = Array.isArray(listed)
    ? listed.filter((s): s is string => typeof s === "string")
    : [];
  const rest = Object.keys(root).filter(
    (key) => !key.startsWith("$") && !named.includes(key) && typeof root[key] === "object",
  );
  return [...named.filter((s) => typeof root[s] === "object"), ...rest];
}

function walk(
  node: unknown,
  set: string,
  path: string[],
  inherited: string | undefined,
  out: StudioToken[],
): void {
  if (typeof node !== "object" || node === null || Array.isArray(node)) return;
  const raw = node as Raw;
  const type =
    typeof (raw.type ?? raw.$type) === "string" ? ((raw.type ?? raw.$type) as string) : inherited;
  const value = "value" in raw ? raw.value : raw.$value;
  if ("value" in raw || "$value" in raw) {
    if (path.length > 0 && type) {
      const description = raw.description ?? raw.$description;
      out.push({
        set,
        path,
        type,
        value,
        description: typeof description === "string" ? description : "",
      });
    }
    return;
  }
  for (const [key, child] of Object.entries(raw)) {
    if (!key.startsWith("$")) walk(child, set, [...path, key], type, out);
  }
}

/** Tokens Studio's shadow fields as DTCG's (`x` → `offsetX`, `type: innerShadow` → `inset`). */
function shadowFields(value: unknown): unknown {
  const one = (raw: unknown) => {
    if (typeof raw !== "object" || raw === null) return raw;
    const s = raw as Raw;
    const color = typeof s.color === "string" ? studioValue("color", s.color) : null;
    return {
      color: color && "color" in color ? color.color : s.color,
      offsetX: s.x,
      offsetY: s.y,
      blur: s.blur,
      spread: s.spread,
      inset: s.type === "innerShadow",
    };
  };
  return Array.isArray(value) ? value.map(one) : one(value);
}
