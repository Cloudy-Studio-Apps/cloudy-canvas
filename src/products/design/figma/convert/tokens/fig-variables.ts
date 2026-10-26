import { generateNKeysBetween } from "fractional-indexing";

import {
  migrateCollectionModes,
  rawValue,
  resolveVariable,
  TokenStore,
  type CollectionRecord,
  type TokenCodeSyntax,
  type TokenValue,
  type VariableRecord,
} from "@canvas";
import { guidKey, type FigImportContext, type FigNode } from "@canvas/figma";
import { createId } from "@shared/core";

import { figScopes } from "./fig-scopes";
import { figVariableType, figVariableValue } from "./fig-variable-value";

const PLATFORMS: Record<string, keyof TokenCodeSyntax> = {
  WEB: "web",
  iOS: "ios",
  ANDROID: "android",
};

/**
 * The file's variable collections and variables. Figma's modes belong to each collection, so
 * the collections keep them as files from before mode axes did, and the variables' values are
 * by mode: the variables module's migration then makes each collection with several modes an
 * axis. Ids are recorded in `ctx` for the layers' bindings.
 */
export function figVariables(
  nodes: readonly FigNode[],
  ctx: FigImportContext,
): (CollectionRecord | VariableRecord)[] {
  const live = nodes.filter((n) => n.phase !== "REMOVED");
  const sets = live.filter((n) => n.type === "VARIABLE_SET").sort(byPosition);
  const setOrders = generateNKeysBetween(null, null, sets.length);
  const modeIds = new Map<string, string>();
  const collections = new Map<string, CollectionRecord>();
  sets.forEach((set, i) => {
    const modes = [...(set.variableSetModes ?? [])].sort((a, b) =>
      (a.sortPosition ?? "").localeCompare(b.sortPosition ?? ""),
    );
    const collection: CollectionRecord = {
      kind: "collection",
      id: createId(),
      name: set.name || `Collection ${i + 1}`,
      modes: modes.map((mode, j) => {
        const id = createId();
        modeIds.set(guidKey(mode.id), id);
        ctx.setTokenId(mode.id, id);
        return { id, name: mode.name || `Mode ${j + 1}` };
      }),
      order: setOrders[i] ?? "a0",
    };
    collections.set(guidKey(set.guid), collection);
    ctx.setTokenId(set.guid, collection.id);
  });

  // Every variable's id first, so aliases resolve whatever the order.
  const variables = live
    .filter((n) => n.type === "VARIABLE" && collections.has(guidKey(n.variableSetID?.guid)))
    .sort(byPosition);
  for (const node of variables) ctx.setTokenId(node.guid, createId());

  const orders = new Map<string, string | null>();
  const out: VariableRecord[] = [];
  // Variables whose first mode had no value it could read: what's bound to them keeps its color.
  const unread = new Set<string>();
  for (const node of variables) {
    const collection = collections.get(guidKey(node.variableSetID?.guid)) as CollectionRecord;
    const type = figVariableType(node.variableResolvedType);
    const id = ctx.tokenId(node.guid);
    if (!type || !id) {
      ctx.warnings.add(
        `${(node.variableResolvedType ?? "unknown").toLowerCase()} variables were left out`,
      );
      continue;
    }
    const values: Record<string, TokenValue> = {};
    for (const entry of node.variableDataValues?.entries ?? []) {
      const mode = modeIds.get(guidKey(entry.modeID));
      const value = figVariableValue(entry.variableData, ctx);
      if (mode && value) values[mode] = value;
    }
    const first = collection.modes?.[0]?.id;
    if (first && !(first in values)) {
      values[first] = defaultValue(type);
      unread.add(id);
    }
    const codeSyntax: TokenCodeSyntax = {};
    for (const entry of node.codeSyntax?.entries ?? []) {
      const platform = entry.platform && PLATFORMS[entry.platform];
      if (platform && entry.value) codeSyntax[platform] = entry.value;
    }
    const [order] = generateNKeysBetween(orders.get(collection.id) ?? null, null, 1);
    orders.set(collection.id, order ?? null);
    out.push({
      kind: "variable",
      id,
      collectionId: collection.id,
      name: node.name || "Variable",
      type,
      values,
      scopes: figScopes(node.variableScopes),
      description: node.description ?? "",
      codeSyntax,
      hidden: node.isHiddenFromPublishing ?? false,
      order: order ?? "a0",
    });
  }
  const records = [...collections.values(), ...out];
  recordValues(records, variables, unread, ctx);
  return records;
}

/**
 * The value each variable shows whatever the modes, for the layers bound to it (instance
 * overrides keep a stale color beside the variable). Variables that differ by mode, or that
 * depend on one whose value couldn't be read, aren't recorded: layers keep their stored colors.
 */
function recordValues(
  records: readonly (CollectionRecord | VariableRecord)[],
  nodes: readonly FigNode[],
  unread: ReadonlySet<string>,
  ctx: FigImportContext,
): void {
  const migration = migrateCollectionModes(records);
  const migrated = new Map((migration?.records ?? []).map((r) => [r.id, r]));
  const store = new TokenStore([
    ...records.map((r) => migrated.get(r.id) ?? r),
    ...(migration?.records ?? []).filter((r) => r.kind === "axis"),
  ]);
  const base = Object.fromEntries(
    store.axes().flatMap((a) => (a.modes[0] ? [[a.id, a.modes[0].id]] : [])),
  );
  const contexts = [
    base,
    ...store.axes().flatMap((a) => a.modes.slice(1).map((m) => ({ ...base, [a.id]: m.id }))),
  ];
  const dependsOnUnread = (id: string, seen = new Set<string>()): boolean => {
    if (unread.has(id)) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return Object.values(store.variable(id)?.values ?? {}).some(
      (v) => "alias" in v && dependsOnUnread(v.alias, seen),
    );
  };
  for (const node of nodes) {
    const id = ctx.tokenId(node.guid);
    if (!id || dependsOnUnread(id)) continue;
    const values = contexts.map((modes) => rawValue(resolveVariable(store, id, modes)));
    const value = values[0];
    if (value !== undefined && values.every((v) => v === value))
      ctx.setTokenValue(node.guid, value);
  }
}

function defaultValue(type: VariableRecord["type"]): TokenValue {
  if (type === "color") return { color: "#000000FF" };
  if (type === "number") return { number: 0 };
  return type === "string" ? { string: "" } : { boolean: false };
}

function byPosition(a: FigNode, b: FigNode): number {
  const pa = a.sortPosition ?? a.parentIndex?.position ?? "";
  const pb = b.sortPosition ?? b.parentIndex?.position ?? "";
  return pa < pb ? -1 : pa > pb ? 1 : 0;
}
