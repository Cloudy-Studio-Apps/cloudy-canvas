import { generateKeyBetween } from "fractional-indexing";

import { DEFAULT_VALUE } from "../default-value";
import type { TokenStore } from "../token-store";
import type { GeneratorRecord } from "../shade-generator.types";
import type { ScaleRecord } from "../scale-generator.types";
import type {
  CollectionRecord,
  ModeAxisRecord,
  StyleRecord,
  TokenRecord,
  TokenValue,
  VariableRecord,
} from "../token.types";
import type { ImportChoice, ImportConflict, TokenImportPlan } from "./exchange.types";
import type { ImportMatches } from "./import-plan.types";
import { matchImport, ofKind } from "./match-import";

/** The incoming variables and styles named like the file's, with other ids. */
export function importConflicts(
  store: TokenStore,
  incoming: readonly TokenRecord[],
): ImportConflict[] {
  const { tokens, ids } = matchImport(store, incoming);
  const out: ImportConflict[] = [];
  for (const record of incoming) {
    const match = tokens.get(record.id);
    if (match?.kind !== "conflict") continue;
    if (record.kind === "variable") {
      const collection = store.collection(ids.get(record.collectionId) ?? record.collectionId);
      const name = `${collection?.name ?? "?"}/${record.name}`;
      out.push({ incomingId: record.id, existingId: match.existingId, kind: "variable", name });
    } else if (record.kind === "style") {
      out.push({
        incomingId: record.id,
        existingId: match.existingId,
        kind: "style",
        name: record.name,
      });
    }
  }
  return out;
}

/**
 * The records importing `incoming` writes into the file. Ids are kept, so importing the same
 * source again updates what the first import added. Axes and collections named like the file's
 * merge into them (modes by name); a variable or style named like one of the file's with another
 * id is added under a free name (`keep-both`), written over it (`replace`, keeping the file's id)
 * or left out (`skip`); either way what refers to it then refers to the file's.
 */
export function planTokenImport(
  store: TokenStore,
  incoming: readonly TokenRecord[],
  choice: ImportChoice,
): TokenImportPlan {
  const matches = matchImport(store, incoming);
  const ids = new Map(matches.ids);
  const out: TokenRecord[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  // Which incoming tokens become which of the file's.
  const written = new Map<string, "add" | "update" | "rename">();
  for (const [id, match] of matches.tokens) {
    if (match.kind === "same-id") written.set(id, "update");
    else if (match.kind === "new") written.set(id, "add");
    else if (choice === "keep-both") written.set(id, "rename");
    else {
      ids.set(id, match.existingId);
      if (choice === "replace") written.set(id, "update");
      else skipped++;
    }
  }
  const idOf = (id: string) => ids.get(id) ?? id;
  const orders = new Orders(store);
  const incomingBases = new Map(
    ofKind<ModeAxisRecord>(incoming, "axis").map((a) => [a.id, a.modes[0]?.id]),
  );

  for (const axis of ofKind<ModeAxisRecord>(incoming, "axis")) {
    const target = store.axis(idOf(axis.id));
    if (!target) {
      out.push({ ...axis, order: orders.next("axes", null) });
      continue;
    }
    const known = new Set(target.modes.map((m) => m.id));
    const extra = axis.modes.filter((m) => !known.has(matches.modes.get(m.id) ?? m.id));
    if (extra.length > 0) out.push({ ...target, modes: [...target.modes, ...extra] });
  }
  for (const c of ofKind<CollectionRecord>(incoming, "collection")) {
    const target = store.collection(idOf(c.id));
    const folder: CollectionRecord = { ...c };
    delete folder.modes;
    if (!target) out.push({ ...folder, order: orders.next("collections", null) });
    else if (target.id === c.id && target.name !== c.name) out.push({ ...target, name: c.name });
  }

  const taken = new Map<string, Set<string>>();
  const freeName = (scope: string, name: string, existing: () => readonly string[]) => {
    const used = taken.get(scope) ?? new Set(existing());
    taken.set(scope, used);
    let candidate = name;
    for (let n = 2; used.has(candidate); n++) candidate = `${name} ${n}`;
    used.add(candidate);
    return candidate;
  };

  for (const v of ofKind<VariableRecord>(incoming, "variable")) {
    const action = written.get(v.id);
    if (!action) continue;
    const collectionId = idOf(v.collectionId);
    if (!store.collection(collectionId) && !incoming.some((r) => r.id === collectionId)) continue;
    const id = idOf(v.id);
    const own = store.variable(id);
    const record: VariableRecord = {
      ...v,
      id,
      collectionId,
      ...remapValues(v, store, matches, incomingBases.get(v.axisId ?? ""), idOf),
      contrastWith: v.contrastWith?.map(idOf),
      generatorId: v.generatorId ? idOf(v.generatorId) : (v.generatorId ?? null),
      name:
        action === "rename"
          ? freeName(collectionId, v.name, () => store.variables(collectionId).map((o) => o.name))
          : keptName(v.name, own, store.variables(collectionId)),
      order: own?.order ?? orders.next("variables", collectionId),
    };
    if (!record.contrastWith) delete record.contrastWith;
    out.push(record);
    if (own) updated++;
    else added++;
  }
  for (const s of ofKind<StyleRecord>(incoming, "style")) {
    const action = written.get(s.id);
    if (!action) continue;
    const id = idOf(s.id);
    const own = store.style(id);
    const bindings = s.bindings
      ? Object.fromEntries(Object.entries(s.bindings).map(([path, ref]) => [path, idOf(ref)]))
      : undefined;
    out.push({
      ...s,
      id,
      ...(bindings ? { bindings } : {}),
      name:
        action === "rename"
          ? freeName(`style:${s.styleType}`, s.name, () =>
              store.styles(s.styleType).map((o) => o.name),
            )
          : keptName(s.name, own, store.styles(s.styleType)),
      order: own?.order ?? orders.next("styles", s.styleType),
    });
    if (own) updated++;
    else added++;
  }
  // A generator or scale comes only when its variables came under their own names (otherwise
  // it would take over the file's, or follow renamed copies); shades it can't follow leave it.
  const follows = (generatorId: string) =>
    store.generator(generatorId) !== undefined ||
    store.scale(generatorId) !== undefined ||
    ofKind<VariableRecord>(incoming, "variable")
      .filter((v) => v.generatorId === generatorId)
      .every((v) => matches.tokens.get(v.id)?.kind !== "conflict");
  const kept = new Set(
    [...ofKind<GeneratorRecord>(incoming, "generator"), ...ofKind<ScaleRecord>(incoming, "scale")]
      .filter((g) => follows(g.id))
      .map((g) => g.id),
  );
  for (const record of out) {
    if (record.kind !== "variable" || !record.generatorId) continue;
    const known =
      kept.has(record.generatorId) ||
      store.generator(record.generatorId) ||
      store.scale(record.generatorId);
    if (!known) record.generatorId = null;
  }
  for (const g of ofKind<GeneratorRecord>(incoming, "generator")) {
    if (!kept.has(g.id)) continue;
    out.push({
      ...g,
      collectionId: idOf(g.collectionId),
      baseVar: g.baseVar && idOf(g.baseVar),
      axisId: g.axisId && idOf(g.axisId),
      order: store.generator(g.id)?.order ?? orders.next("generators", null),
    });
  }
  for (const s of ofKind<ScaleRecord>(incoming, "scale")) {
    if (!kept.has(s.id)) continue;
    out.push({
      ...s,
      collectionId: idOf(s.collectionId),
      baseVar: s.baseVar && idOf(s.baseVar),
      order: store.scale(s.id)?.order ?? orders.next("scales", null),
    });
  }
  return { records: out, added, updated, skipped };
}

/**
 * A variable's axis and values in the file's terms: aliases remapped, mode keys turned into the
 * file's mode ids (the incoming default is its axis's first mode's value), and the value of the
 * file's base mode as the default.
 */
function remapValues(
  v: VariableRecord,
  store: TokenStore,
  matches: ImportMatches,
  incomingBase: string | undefined,
  idOf: (id: string) => string,
): Pick<VariableRecord, "axisId" | "values"> {
  const remap = (value: TokenValue): TokenValue =>
    "alias" in value ? { alias: idOf(value.alias) } : value;
  const base = v.values[DEFAULT_VALUE];
  if (!v.axisId) return { axisId: null, values: base ? { [DEFAULT_VALUE]: remap(base) } : {} };
  const axisId = idOf(v.axisId);
  // A new axis's base is the incoming one's (its first mode, as the file will have it).
  const targetBase =
    store.axis(axisId)?.modes[0]?.id ??
    (incomingBase === undefined ? undefined : (matches.modes.get(incomingBase) ?? incomingBase));
  const values: Record<string, TokenValue> = {};
  // The default first, so an override landing on the file's base mode wins over it.
  const entries = Object.entries(v.values).sort(([a]) => (a === DEFAULT_VALUE ? -1 : 1));
  for (const [key, value] of entries) {
    const from = key === DEFAULT_VALUE ? incomingBase : key;
    const mode = from === undefined ? DEFAULT_VALUE : (matches.modes.get(from) ?? from);
    values[mode === targetBase ? DEFAULT_VALUE : mode] = remap(value);
  }
  if (base && !(DEFAULT_VALUE in values)) values[DEFAULT_VALUE] = remap(base);
  return { axisId, values };
}

/**
 * The incoming name, unless another of the file's records there has it (one renamed by an
 * earlier "keep both"): then the record keeps its own.
 */
function keptName(
  name: string,
  own: { id: string; name: string } | undefined,
  siblings: readonly { id: string; name: string }[],
): string {
  if (!own) return name;
  return siblings.some((o) => o.id !== own.id && o.name === name) ? own.name : name;
}

/** Fractional order keys after the file's last, per list (variables of a collection, …). */
class Orders {
  private readonly last = new Map<string, string | null>();

  constructor(private readonly store: TokenStore) {}

  next(
    list: "axes" | "collections" | "variables" | "styles" | "generators" | "scales",
    scope: string | null,
  ): string {
    const key = `${list}:${scope ?? ""}`;
    const last = this.last.has(key) ? (this.last.get(key) ?? null) : this.lastOf(list, scope);
    const order = generateKeyBetween(last, null);
    this.last.set(key, order);
    return order;
  }

  private lastOf(list: string, scope: string | null): string | null {
    const s = this.store;
    const records =
      list === "axes"
        ? s.axes()
        : list === "collections"
          ? s.collections()
          : list === "variables"
            ? s.variables(scope ?? undefined)
            : list === "styles"
              ? s.styles(scope ?? undefined)
              : list === "generators"
                ? s.generators()
                : s.scales();
    return records.at(-1)?.order ?? null;
  }
}
