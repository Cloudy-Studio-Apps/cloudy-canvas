import {
  DEFAULT_VALUE,
  modeFor,
  type CollectionRecord,
  type ModeAxisRecord,
  type TokenStore,
  type TokenValue,
  type VariableRecord,
} from "../../tokens";

/** A value as agents read it: a color, number, text or boolean, or `{ alias: "Collection/path" }`. */
function describeValue(store: TokenStore, value: TokenValue | undefined): unknown {
  if (!value) return null;
  if ("alias" in value) {
    const target = store.variable(value.alias);
    const collection = target && store.collection(target.collectionId);
    return { alias: target && collection ? `${collection.name}/${target.name}` : value.alias };
  }
  if ("color" in value) return value.color;
  if ("number" in value) return value.number;
  if ("string" in value) return value.string;
  return value.boolean;
}

/** A collection (a folder of variables), for agents. */
export function describeCollection(store: TokenStore, collection: CollectionRecord) {
  return {
    id: collection.id,
    name: collection.name,
    variables: store.variables(collection.id).length,
  };
}

/** A mode axis with its modes and the one the file shows, for agents. */
export function describeAxis(store: TokenStore, axis: ModeAxisRecord) {
  return {
    id: axis.id,
    name: axis.name,
    modes: axis.modes.map((mode, i) => ({
      id: mode.id,
      name: mode.name,
      ...(i === 0 ? { base: true } : {}),
    })),
    current: axis.modes.find((m) => m.id === modeFor(axis, {}))?.name,
    variables: store.variables().filter((v) => v.axisId === axis.id).length,
  };
}

/** A variable with its default value and its overrides by mode name, for agents. */
export function describeVariable(store: TokenStore, variable: VariableRecord, usage: number) {
  const collection = store.collection(variable.collectionId);
  const axis = variable.axisId ? store.axis(variable.axisId) : undefined;
  const overrides = Object.fromEntries(
    (axis?.modes ?? []).flatMap((mode) => {
      const value = variable.values[mode.id];
      return value ? [[mode.name, describeValue(store, value)]] : [];
    }),
  );
  return {
    id: variable.id,
    collection: collection?.name ?? variable.collectionId,
    name: variable.name,
    type: variable.type,
    value: describeValue(store, variable.values[DEFAULT_VALUE]),
    ...(axis ? { variesBy: axis.name, overrides } : {}),
    ...(variable.scopes.length > 0 ? { scopes: variable.scopes } : {}),
    ...(variable.description ? { description: variable.description } : {}),
    ...(Object.keys(variable.codeSyntax).length > 0 ? { codeSyntax: variable.codeSyntax } : {}),
    ...(variable.hidden ? { hidden: true } : {}),
    ...(variable.contrastWith?.length
      ? { contrastWith: variable.contrastWith.map((id) => store.variable(id)?.name ?? id) }
      : {}),
    usedBy: usage,
  };
}
