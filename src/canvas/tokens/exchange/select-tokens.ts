import { inTokenGroup } from "../token-path";
import { TokenStore } from "../token-store";
import type { TokenRecord } from "../token.types";
import type { SelectedTokens, TokenPick } from "./exchange.types";

/**
 * The variables and styles `pick` names, plus what they need to resolve in another file: the
 * variables they alias (all the way) and their styles' bound variables, the collections and axes
 * of all of them, and the shade generators and scales of whole picked collections.
 */
export function selectTokens(records: readonly TokenRecord[], pick: TokenPick): SelectedTokens {
  const store = new TokenStore(records);
  const collections = new Set(pick.collections);
  const picked = new Set<string>();
  for (const v of store.variables()) {
    const inGroup = pick.groups.some(
      (g) => g.collectionId === v.collectionId && inTokenGroup(v.name, g.group),
    );
    if (collections.has(v.collectionId) || inGroup) picked.add(v.id);
  }
  const types = new Set(pick.styleTypes);
  const styleIds = new Set(pick.styles);
  for (const s of store.styles())
    if (types.has(s.styleType) || styleIds.has(s.id)) picked.add(s.id);

  const needed = new Set(picked);
  const queue = [...picked];
  while (queue.length > 0) {
    const id = queue.pop() as string;
    const refs = [
      ...Object.values(store.variable(id)?.values ?? {}).flatMap((value) =>
        "alias" in value ? [value.alias] : [],
      ),
      ...Object.values(store.style(id)?.bindings ?? {}),
    ];
    for (const ref of refs) {
      if (needed.has(ref) || !store.variable(ref)) continue;
      needed.add(ref);
      queue.push(ref);
    }
  }

  const out: TokenRecord[] = [];
  const usedCollections = new Set<string>();
  const usedAxes = new Set<string>();
  for (const id of needed) {
    const record = store.variable(id) ?? store.style(id);
    if (!record) continue;
    out.push(record);
    if (record.kind === "variable") {
      usedCollections.add(record.collectionId);
      if (record.axisId) usedAxes.add(record.axisId);
    }
  }
  for (const g of [...store.generators(), ...store.scales()]) {
    if (!collections.has(g.collectionId)) continue;
    out.push(g);
    if (g.kind === "generator" && g.axisId) usedAxes.add(g.axisId);
  }
  for (const id of usedCollections) {
    const collection = store.collection(id);
    if (collection) out.push(collection);
  }
  for (const id of usedAxes) {
    const axis = store.axis(id);
    if (axis) out.push(axis);
  }
  return { records: out, extra: needed.size - picked.size };
}
